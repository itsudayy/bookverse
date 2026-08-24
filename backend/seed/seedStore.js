require("dotenv").config();
const { db, COLLECTIONS } = require("../lib/firestore");
const admin = require("../lib/firebaseAdmin");

const { FieldValue } = admin.firestore;
const cover = (isbn) => `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;

// Prices are Bangladeshi Taka, in the range a real Dhaka bookshop charges for
// English paperbacks.
const books = [
  { title: "The Great Gatsby", author: "F. Scott Fitzgerald", category: "Fiction", rating: 4.4, price: 420, isbn: "9780743273565", description: "A dazzling portrait of the Jazz Age and one man's obsessive hope." },
  { title: "To Kill a Mockingbird", author: "Harper Lee", category: "Fiction", rating: 4.8, price: 550, isbn: "9780061120084", description: "A coming-of-age story about racial injustice in the Depression-era South." },
  { title: "1984", author: "George Orwell", category: "Fiction", rating: 4.7, price: 480, isbn: "9780451524935", description: "A chilling vision of a totalitarian future where Big Brother watches everything." },
  { title: "The Alchemist", author: "Paulo Coelho", category: "Fiction", rating: 4.5, price: 390, isbn: "9780062315007", description: "A shepherd's journey to find his personal legend." },
  { title: "Pride and Prejudice", author: "Jane Austen", category: "Fiction", rating: 4.6, price: 360, isbn: "9780141439518", description: "Wit, misjudgement and romance in Regency England." },

  { title: "A Brief History of Time", author: "Stephen Hawking", category: "Science", rating: 4.6, price: 690, isbn: "9780553380163", description: "The universe's biggest questions, for the curious non-scientist." },
  { title: "Cosmos", author: "Carl Sagan", category: "Science", rating: 4.8, price: 780, isbn: "9780345539434", description: "A breathtaking journey through space and time." },
  { title: "The Selfish Gene", author: "Richard Dawkins", category: "Science", rating: 4.3, price: 640, isbn: "9780198788607", description: "Evolution retold from the gene's point of view." },

  { title: "Clean Code", author: "Robert C. Martin", category: "Technology", rating: 4.6, price: 1250, isbn: "9780132350884", description: "Practical principles for writing readable, maintainable software." },
  { title: "The Pragmatic Programmer", author: "Andrew Hunt", category: "Technology", rating: 4.7, price: 1350, isbn: "9780201616224", description: "Timeless advice on craftsmanship and building software that lasts." },
  { title: "Designing Data-Intensive Applications", author: "Martin Kleppmann", category: "Technology", rating: 4.9, price: 1890, isbn: "9781449373320", description: "The ideas behind reliable, scalable and maintainable systems." },

  { title: "Sapiens", author: "Yuval Noah Harari", category: "History", rating: 4.7, price: 850, isbn: "9780062316097", description: "A sweeping narrative of humankind, from foragers to the present." },
  { title: "Guns, Germs, and Steel", author: "Jared Diamond", category: "History", rating: 4.4, price: 720, isbn: "9780393317558", description: "Why some civilizations conquered others." },

  { title: "Steve Jobs", author: "Walter Isaacson", category: "Biography", rating: 4.6, price: 950, isbn: "9781451648539", description: "The definitive biography of Apple's visionary co-founder." },
  { title: "Educated", author: "Tara Westover", category: "Biography", rating: 4.8, price: 680, isbn: "9780399590504", description: "From a survivalist childhood in Idaho to a Cambridge PhD." },

  { title: "Atomic Habits", author: "James Clear", category: "Self Development", rating: 4.9, price: 620, isbn: "9780735211292", description: "Small changes that deliver remarkable results." },
  { title: "Thinking, Fast and Slow", author: "Daniel Kahneman", category: "Self Development", rating: 4.6, price: 810, isbn: "9780374533557", description: "The two systems that drive how we think and decide." },
  { title: "Deep Work", author: "Cal Newport", category: "Self Development", rating: 4.5, price: 590, isbn: "9781455586691", description: "Rules for focused success in a distracted world." },

  { title: "The Hobbit", author: "J.R.R. Tolkien", category: "Fantasy", rating: 4.8, price: 640, isbn: "9780547928227", description: "Bilbo Baggins is swept into an epic quest to reclaim a lost kingdom." },
  { title: "Harry Potter and the Sorcerer's Stone", author: "J.K. Rowling", category: "Fantasy", rating: 4.9, price: 700, isbn: "9780590353427", description: "An orphaned boy discovers he's a wizard." },
  { title: "A Game of Thrones", author: "George R.R. Martin", category: "Fantasy", rating: 4.5, price: 890, isbn: "9780553593716", description: "Noble houses war for the Iron Throne." },

  { title: "Gone Girl", author: "Gillian Flynn", category: "Mystery", rating: 4.3, price: 520, isbn: "9780307588371", description: "A wife vanishes on her fifth wedding anniversary." },
  { title: "The Girl with the Dragon Tattoo", author: "Stieg Larsson", category: "Mystery", rating: 4.5, price: 610, isbn: "9780307949486", description: "A journalist and a hacker investigate a decades-old disappearance." },
  { title: "The Silent Patient", author: "Alex Michaelides", category: "Mystery", rating: 4.2, price: 560, isbn: "9781250301697", description: "A woman shoots her husband, then never speaks again." },
];

const seed = async () => {
  const existing = await db.collection(COLLECTIONS.storeBooks).get();
  const batch = db.batch();
  existing.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
  if (existing.size) console.log(`cleared ${existing.size} existing store books`);

  for (const b of books) {
    const { isbn, ...rest } = b;
    await db.collection(COLLECTIONS.storeBooks).add({
      ...rest,
      coverImage: cover(isbn),
      currency: "BDT",
      createdAt: FieldValue.serverTimestamp(),
    });
  }

  console.log(`Seeded ${books.length} store books`);
  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
