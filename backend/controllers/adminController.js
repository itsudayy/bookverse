const User = require("../models/User");
const Borrow = require("../models/Borrow");

// GET /api/admin/members — every registered user with their borrow status, so
// the admin can see who currently has which book without cross-referencing
// the Borrow collection by hand.
async function listMembers(req, res, next) {
  try {
    const [users, borrows] = await Promise.all([
      User.find({}).sort({ createdAt: -1 }).lean(),
      Borrow.find({}).populate("bookId", "title author coverImage").lean(),
    ]);

    const byUser = {};
    for (const b of borrows) {
      const key = String(b.userId);
      (byUser[key] ||= []).push(b);
    }

    const describe = (b) => ({
      // populate() yields null once a book is bought with points and deleted;
      // bookSnapshot is what the borrow route stores for exactly that case.
      title: b.bookId?.title || b.bookSnapshot?.title || "Untitled",
      author: b.bookId?.author || b.bookSnapshot?.author || "",
      coverImage: b.bookId?.coverImage || b.bookSnapshot?.coverImage || "",
      borrowedAt: b.borrowedAt,
      returnedAt: b.returnedAt,
    });

    const members = users.map((u) => {
      const own = byUser[String(u._id)] || [];
      const active = own.filter((b) => b.status === "borrowed");
      const returned = own.filter((b) => b.status === "returned");
      return {
        _id: u._id,
        name: u.name,
        email: u.email,
        role: u.role,
        createdAt: u.createdAt,
        activeBorrowCount: active.length,
        returnedCount: returned.length,
        totalBorrowCount: own.length,
        activeBorrows: active.map(describe).sort((a, b) => new Date(b.borrowedAt) - new Date(a.borrowedAt)),
        borrowHistory: returned.map(describe).sort((a, b) => new Date(b.returnedAt) - new Date(a.returnedAt)),
      };
    });

    res.json(members);
  } catch (err) {
    next(err);
  }
}

module.exports = { listMembers };
