const { db, COLLECTIONS } = require("../lib/firestore");

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

module.exports = { listStoreBooks, getStoreBook, listCategories };
