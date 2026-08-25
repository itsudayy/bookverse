const admin = require("../lib/firebaseAdmin");
const { db, COLLECTIONS } = require("../lib/firestore");

const { FieldValue } = admin.firestore;

// GET /api/store/books
// Filters: category, minRating (4 => "4 stars & up"), search
// Sort: price-asc | price-desc | rating | newest
async function listStoreBooks(req, res, next) {
  try {
    const { category, minRating, search, sort } = req.query;

    const snap = await db.collection(COLLECTIONS.storeBooks).get();
    let books = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    // The catalogue is small and Firestore can't combine a range filter with
    // arbitrary ordering without composite indexes, so filtering happens here.
    if (category && category !== "All") {
      books = books.filter((b) => b.category === category);
    }
    if (minRating) {
      const min = Number(minRating);
      books = books.filter((b) => (b.rating || 0) >= min);
    }
    if (search) {
      const q = search.toLowerCase();
      books = books.filter(
        (b) =>
          b.title?.toLowerCase().includes(q) || b.author?.toLowerCase().includes(q)
      );
    }

    const sorters = {
      "price-asc": (a, b) => a.price - b.price,
      "price-desc": (a, b) => b.price - a.price,
      rating: (a, b) => (b.rating || 0) - (a.rating || 0),
      newest: (a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0),
    };
    books.sort(sorters[sort] || sorters.newest);

    res.json(books);
  } catch (err) {
    next(err);
  }
}

// GET /api/store/books/:id
async function getStoreBook(req, res, next) {
  try {
    const doc = await db.collection(COLLECTIONS.storeBooks).doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ message: "Book not found" });
    res.json({ id: doc.id, ...doc.data() });
  } catch (err) {
    next(err);
  }
}

// GET /api/store/categories — drives the "Shop by category" filter, so the list
// always reflects what is actually for sale.
async function listCategories(req, res, next) {
  try {
    const snap = await db.collection(COLLECTIONS.storeBooks).get();
    const counts = {};
    snap.docs.forEach((d) => {
      const c = d.data().category;
      if (c) counts[c] = (counts[c] || 0) + 1;
    });
    const categories = Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name));
    res.json({ categories, total: snap.size });
  } catch (err) {
    next(err);
  }
}

const REQUIRED_FIELDS = ["title", "author", "category", "price", "coverImage"];

function validateBody(body) {
  for (const f of REQUIRED_FIELDS) {
    if (body[f] === undefined || body[f] === null || body[f] === "") {
      return `${f} is required`;
    }
  }
  if (Number.isNaN(Number(body.price)) || Number(body.price) <= 0) {
    return "price must be a positive number";
  }
  return null;
}

// POST /api/store/books — admin only. Store stock is separate from the
// library's lending copies, so this never touches the Collection.
async function createStoreBook(req, res, next) {
  try {
    const err = validateBody(req.body);
    if (err) return res.status(400).json({ message: err });

    const book = {
      title: req.body.title.trim(),
      author: req.body.author.trim(),
      description: (req.body.description || "").trim(),
      category: req.body.category,
      price: Number(req.body.price),
      rating: req.body.rating !== undefined ? Number(req.body.rating) : 4,
      coverImage: req.body.coverImage.trim(),
      currency: "BDT",
      createdAt: FieldValue.serverTimestamp(),
    };
    const ref = await db.collection(COLLECTIONS.storeBooks).add(book);
    res.status(201).json({ id: ref.id, ...book });
  } catch (err) {
    next(err);
  }
}

// PUT /api/store/books/:id — admin only
async function updateStoreBook(req, res, next) {
  try {
    const ref = db.collection(COLLECTIONS.storeBooks).doc(req.params.id);
    const doc = await ref.get();
    if (!doc.exists) return res.status(404).json({ message: "Book not found" });

    const err = validateBody({ ...doc.data(), ...req.body });
    if (err) return res.status(400).json({ message: err });

    const update = {
      title: req.body.title.trim(),
      author: req.body.author.trim(),
      description: (req.body.description || "").trim(),
      category: req.body.category,
      price: Number(req.body.price),
      rating: req.body.rating !== undefined ? Number(req.body.rating) : doc.data().rating,
      coverImage: req.body.coverImage.trim(),
    };
    await ref.update(update);
    res.json({ id: ref.id, ...doc.data(), ...update });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/store/books/:id — admin only
async function deleteStoreBook(req, res, next) {
  try {
    const ref = db.collection(COLLECTIONS.storeBooks).doc(req.params.id);
    const doc = await ref.get();
    if (!doc.exists) return res.status(404).json({ message: "Book not found" });
    await ref.delete();
    res.json({ message: "Book removed from the Store" });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listStoreBooks,
  getStoreBook,
  listCategories,
  createStoreBook,
  updateStoreBook,
  deleteStoreBook,
};
