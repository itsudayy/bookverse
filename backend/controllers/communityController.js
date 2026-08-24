const admin = require("../lib/firebaseAdmin");
const {
  db,
  COLLECTIONS,
  POINTS_PER_CONTRIBUTION,
} = require("../lib/firestore");

const { FieldValue } = admin.firestore;

// Shipping details the library needs to parcel a book to someone's home.
function readShipping(body) {
  const name = (body.shippingName || "").trim();
  const idNumber = (body.shippingIdNumber || "").trim();
  const address = (body.shippingAddress || "").trim();
  if (!name || !idNumber || !address) return null;
  return { name, idNumber, address };
}

async function notify(userUid, payload) {
  await db.collection(COLLECTIONS.notifications).add({
    userUid,
    read: false,
    createdAt: FieldValue.serverTimestamp(),
    ...payload,
  });
}

// GET /api/community/books — public browse of the community shelf
async function listUsedBooks(req, res, next) {
  try {
    const { search, author, category } = req.query;
    const snap = await db
      .collection(COLLECTIONS.usedBooks)
      .orderBy("createdAt", "desc")
      .get();

    let books = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    // Firestore has no case-insensitive contains, and the community shelf is
    // small, so the text filters are applied here rather than as queries.
    if (search) {
      const q = search.toLowerCase();
      books = books.filter((b) => b.title?.toLowerCase().includes(q));
    }
    if (author) {
      const q = author.toLowerCase();
      books = books.filter((b) => b.author?.toLowerCase().includes(q));
    }
    if (category && category !== "All") {
      books = books.filter((b) => b.category === category);
    }

    res.json(books);
  } catch (err) {
    next(err);
  }
}

// GET /api/community/books/:id
async function getUsedBook(req, res, next) {
  try {
    const doc = await db.collection(COLLECTIONS.usedBooks).doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ message: "Book not found" });
    res.json({ id: doc.id, ...doc.data() });
  } catch (err) {
    next(err);
  }
}

// POST /api/community/books — contribute a used book, and earn points for it
async function addUsedBook(req, res, next) {
  try {
    const { title, author, description, category, coverImage, condition } = req.body;
    if (!title || !author || !coverImage) {
      return res
        .status(400)
        .json({ message: "Title, author and cover image are required" });
    }

    const book = {
      title: title.trim(),
      author: author.trim(),
      description: (description || "").trim(),
      category: category || "Fiction",
      coverImage: coverImage.trim(),
      condition: condition || "Good",
      ownerUid: req.user.firebaseUid,
      ownerName: req.user.name,
      available: true,
      createdAt: FieldValue.serverTimestamp(),
    };

    const ref = await db.collection(COLLECTIONS.usedBooks).add(book);

    // The award is applied server-side; clients cannot write their own points.
    await db
      .collection(COLLECTIONS.users)
      .doc(req.user.firebaseUid)
      .set(
        {
          points: FieldValue.increment(POINTS_PER_CONTRIBUTION),
          name: req.user.name,
          email: req.user.email,
        },
        { merge: true }
      );

    res.status(201).json({
      id: ref.id,
      ...book,
      pointsAwarded: POINTS_PER_CONTRIBUTION,
    });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/community/books/:id — owner may withdraw their own book
async function deleteUsedBook(req, res, next) {
  try {
    const ref = db.collection(COLLECTIONS.usedBooks).doc(req.params.id);
    const doc = await ref.get();
    if (!doc.exists) return res.status(404).json({ message: "Book not found" });
    if (doc.data().ownerUid !== req.user.firebaseUid) {
      return res.status(403).json({ message: "You can only remove your own books" });
    }
    await ref.delete();
    res.json({ message: "Book removed" });
  } catch (err) {
    next(err);
  }
}

// GET /api/community/books/mine — the signed-in user's contributions
async function listMyUsedBooks(req, res, next) {
  try {
    const snap = await db
      .collection(COLLECTIONS.usedBooks)
      .where("ownerUid", "==", req.user.firebaseUid)
      .get();
    const books = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
    res.json(books);
  } catch (err) {
    next(err);
  }
}

// POST /api/community/books/:id/request — ask the owner to lend it
async function requestBorrow(req, res, next) {
  try {
    const shipping = readShipping(req.body);
    if (!shipping) {
      return res
        .status(400)
        .json({ message: "Name, ID and home address are required to borrow" });
    }

    const bookRef = db.collection(COLLECTIONS.usedBooks).doc(req.params.id);
    const bookDoc = await bookRef.get();
    if (!bookDoc.exists) return res.status(404).json({ message: "Book not found" });

    const book = bookDoc.data();
    if (book.ownerUid === req.user.firebaseUid) {
      return res.status(400).json({ message: "This is your own book" });
    }
    if (!book.available) {
      return res.status(400).json({ message: "This book is currently unavailable" });
    }

    const existing = await db
      .collection(COLLECTIONS.borrowRequests)
      .where("bookId", "==", req.params.id)
      .where("requesterUid", "==", req.user.firebaseUid)
      .where("status", "==", "pending")
      .get();
    if (!existing.empty) {
      return res
        .status(400)
        .json({ message: "You already have a pending request for this book" });
    }

    const request = {
      bookId: req.params.id,
      bookTitle: book.title,
      bookCover: book.coverImage,
      ownerUid: book.ownerUid,
      requesterUid: req.user.firebaseUid,
      requesterName: req.user.name,
      shipping,
      status: "pending",
      createdAt: FieldValue.serverTimestamp(),
    };
    const ref = await db.collection(COLLECTIONS.borrowRequests).add(request);

    await notify(book.ownerUid, {
      type: "borrow_request",
      title: "New borrow request",
      body: `${req.user.name} would like to borrow "${book.title}".`,
      requestId: ref.id,
    });

    res.status(201).json({ id: ref.id, ...request });
  } catch (err) {
    next(err);
  }
}

// GET /api/community/requests — requests the user owns, and ones they sent
async function listRequests(req, res, next) {
  try {
    const [incomingSnap, outgoingSnap] = await Promise.all([
      db
        .collection(COLLECTIONS.borrowRequests)
        .where("ownerUid", "==", req.user.firebaseUid)
        .get(),
      db
        .collection(COLLECTIONS.borrowRequests)
        .where("requesterUid", "==", req.user.firebaseUid)
        .get(),
    ]);

    const map = (snap) =>
      snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort(
          (a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0)
        );

    res.json({ incoming: map(incomingSnap), outgoing: map(outgoingSnap) });
  } catch (err) {
    next(err);
  }
}

// POST /api/community/requests/:id/respond — owner approves or declines
async function respondToRequest(req, res, next) {
  try {
    const { action } = req.body;
    if (!["approve", "decline"].includes(action)) {
      return res.status(400).json({ message: "Action must be approve or decline" });
    }

    const ref = db.collection(COLLECTIONS.borrowRequests).doc(req.params.id);
    const doc = await ref.get();
    if (!doc.exists) return res.status(404).json({ message: "Request not found" });

    const request = doc.data();
    if (request.ownerUid !== req.user.firebaseUid) {
      return res
        .status(403)
        .json({ message: "Only the book's owner can answer this request" });
    }
    if (request.status !== "pending") {
      return res.status(400).json({ message: "This request was already answered" });
    }

    const status = action === "approve" ? "approved" : "declined";
    await ref.update({ status, respondedAt: FieldValue.serverTimestamp() });

    if (status === "approved") {
      await db
        .collection(COLLECTIONS.usedBooks)
        .doc(request.bookId)
        .update({ available: false });
    }

    await notify(request.requesterUid, {
      type: "request_" + status,
      title: status === "approved" ? "Borrow request approved" : "Borrow request declined",
      body:
        status === "approved"
          ? `${req.user.name} approved your request for "${request.bookTitle}". It will be parcelled to you.`
          : `${req.user.name} declined your request for "${request.bookTitle}".`,
      requestId: req.params.id,
    });

    res.json({ id: req.params.id, ...request, status });
  } catch (err) {
    next(err);
  }
}

// POST /api/community/requests/:id/return — borrower returns the book
async function returnUsedBook(req, res, next) {
  try {
    const ref = db.collection(COLLECTIONS.borrowRequests).doc(req.params.id);
    const doc = await ref.get();
    if (!doc.exists) return res.status(404).json({ message: "Request not found" });

    const request = doc.data();
    if (request.requesterUid !== req.user.firebaseUid) {
      return res.status(403).json({ message: "This is not your borrow record" });
    }
    if (request.status !== "approved") {
      return res.status(400).json({ message: "This book is not currently on loan to you" });
    }

    await ref.update({ status: "returned", returnedAt: FieldValue.serverTimestamp() });
    await db.collection(COLLECTIONS.usedBooks).doc(request.bookId).update({ available: true });

    await notify(request.ownerUid, {
      type: "book_returned",
      title: "Book returned",
      body: `${req.user.name} has returned "${request.bookTitle}".`,
      requestId: req.params.id,
    });

    res.json({ id: req.params.id, ...request, status: "returned" });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listUsedBooks,
  getUsedBook,
  addUsedBook,
  deleteUsedBook,
  listMyUsedBooks,
  requestBorrow,
  listRequests,
  respondToRequest,
  returnUsedBook,
};
