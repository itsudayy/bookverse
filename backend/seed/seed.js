require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Book = require("../models/Book");

const cover = (isbn) => `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;

const books = [
  {
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    description:
      "A dazzling portrait of the Jazz Age, following the mysterious millionaire Jay Gatsby and his obsessive love for Daisy Buchanan amid the glittering excess of 1920s New York.",
    category: "Fiction",
    publishedYear: 1925,
    pages: 180,
    coverImage: cover("9780743273565"),
    rating: 4.4,
    available: true,
  },
  {
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    description:
      "A powerful coming-of-age story set in the Depression-era South, exploring racial injustice and moral growth through the eyes of young Scout Finch.",
    category: "Fiction",
    publishedYear: 1960,
    pages: 336,
    coverImage: cover("9780061120084"),
    rating: 4.8,
    available: true,
  },
  {
    title: "1984",
    author: "George Orwell",
    description:
      "A chilling vision of a totalitarian future where Big Brother watches everything, and one man dares to think for himself.",
    category: "Fiction",
    publishedYear: 1949,
    pages: 328,
    coverImage: cover("9780451524935"),
    rating: 4.7,
    available: false,
  },
  {
    title: "The Alchemist",
    author: "Paulo Coelho",
    description:
      "A poetic fable about a young shepherd's journey to find his personal legend, discovering that the treasure he seeks was within him all along.",
    category: "Fiction",
    publishedYear: 1988,
    pages: 208,
    coverImage: cover("9780062315007"),
    rating: 4.5,
    available: true,
  },
  {
    title: "A Brief History of Time",
    author: "Stephen Hawking",
    description:
      "A landmark exploration of the universe's biggest questions, from the Big Bang to black holes, written for the curious non-scientist.",
    category: "Science",
    publishedYear: 1988,
    pages: 256,
    coverImage: cover("9780553380163"),
    rating: 4.6,
    available: true,
  },
  {
    title: "Cosmos",
    author: "Carl Sagan",
    description:
      "A breathtaking journey through space and time, blending science and wonder to explain our place in the universe.",
    category: "Science",
    publishedYear: 1980,
    pages: 396,
    coverImage: cover("9780345539434"),
    rating: 4.8,
    available: true,
  },
  {
    title: "Brief Answers to the Big Questions",
    author: "Stephen Hawking",
    description:
      "Hawking's final work, tackling humanity's most profound questions about time travel, artificial intelligence, and the fate of the cosmos.",
    category: "Science",
    publishedYear: 2018,
    pages: 256,
    coverImage: cover("9781984819192"),
    rating: 4.5,
    available: false,
  },
  {
    title: "Clean Code",
    author: "Robert C. Martin",
    description:
      "A hands-on guide to writing readable, maintainable software, packed with practical principles every developer should know.",
    category: "Technology",
    publishedYear: 2008,
    pages: 464,
    coverImage: cover("9780132350884"),
    rating: 4.6,
    available: true,
  },
  {
    title: "The Pragmatic Programmer",
    author: "Andrew Hunt",
    description:
      "Timeless advice for software developers on craftsmanship, career growth, and building software that lasts.",
    category: "Technology",
    publishedYear: 1999,
    pages: 352,
    coverImage: cover("9780201616224"),
    rating: 4.7,
    available: true,
  },
  {
    title: "Sapiens",
    author: "Yuval Noah Harari",
    description:
      "A sweeping narrative of humankind's history, from the emergence of Homo sapiens to the cognitive, agricultural, and scientific revolutions that shaped our world.",
    category: "History",
    publishedYear: 2011,
    pages: 443,
    coverImage: cover("9780062316097"),
    rating: 4.7,
    available: true,
  },
  {
    title: "Guns, Germs, and Steel",
    author: "Jared Diamond",
    description:
      "A Pulitzer Prize-winning exploration of why some civilizations conquered others, tracing the deep roots of global inequality.",
    category: "History",
    publishedYear: 1997,
    pages: 480,
    coverImage: cover("9780393317558"),
    rating: 4.4,
    available: false,
  },
  {
    title: "Steve Jobs",
    author: "Walter Isaacson",
    description:
      "The definitive biography of Apple's visionary co-founder, based on exclusive interviews revealing the man behind the innovation.",
    category: "Biography",
    publishedYear: 2011,
    pages: 656,
    coverImage: cover("9781451648539"),
    rating: 4.6,
    available: true,
  },
  {
    title: "Educated",
    author: "Tara Westover",
    description:
      "A remarkable memoir of a woman who grew up in a survivalist family in rural Idaho and went on to earn a PhD from Cambridge.",
    category: "Biography",
    publishedYear: 2018,
    pages: 334,
    coverImage: cover("9780399590504"),
    rating: 4.8,
    available: true,
  },
  {
    title: "Atomic Habits",
    author: "James Clear",
    description:
      "A proven framework for building good habits and breaking bad ones, using small changes that deliver remarkable results.",
    category: "Self Development",
    publishedYear: 2018,
    pages: 320,
    coverImage: cover("9780735211292"),
    rating: 4.9,
    available: true,
  },
  {
    title: "The 7 Habits of Highly Effective People",
    author: "Stephen Covey",
    description:
      "A classic guide to personal and professional effectiveness, built on principles of character and integrity rather than quick fixes.",
    category: "Self Development",
    publishedYear: 1989,
    pages: 372,
    coverImage: cover("9780743269513"),
    rating: 4.5,
    available: false,
  },
  {
    title: "Thinking, Fast and Slow",
    author: "Daniel Kahneman",
    description:
      "A Nobel laureate's groundbreaking look at the two systems that drive the way we think, decide, and judge.",
    category: "Self Development",
    publishedYear: 2011,
    pages: 499,
    coverImage: cover("9780374533557"),
    rating: 4.6,
    available: true,
  },
  {
    title: "The Hobbit",
    author: "J.R.R. Tolkien",
    description:
      "Bilbo Baggins is swept into an epic quest to reclaim a lost dwarven kingdom, encountering trolls, elves, and a dragon along the way.",
    category: "Fantasy",
    publishedYear: 1937,
    pages: 310,
    coverImage: cover("9780547928227"),
    rating: 4.8,
    available: true,
  },
  {
    title: "Harry Potter and the Sorcerer's Stone",
    author: "J.K. Rowling",
    description:
      "An orphaned boy discovers he's a wizard and enters a hidden magical world of spells, friendship, and adventure at Hogwarts.",
    category: "Fantasy",
    publishedYear: 1997,
    pages: 309,
    coverImage: cover("9780590353427"),
    rating: 4.9,
    available: true,
  },
  {
    title: "Gone Girl",
    author: "Gillian Flynn",
    description:
      "A gripping psychological thriller about a marriage gone terribly wrong when a wife vanishes on her fifth wedding anniversary.",
    category: "Mystery",
    publishedYear: 2012,
    pages: 419,
    coverImage: cover("9780307588371"),
    rating: 4.3,
    available: true,
  },
  {
    title: "The Girl with the Dragon Tattoo",
    author: "Stieg Larsson",
    description:
      "A disgraced journalist and a brilliant hacker team up to investigate a decades-old disappearance in this dark Swedish thriller.",
    category: "Mystery",
    publishedYear: 2005,
    pages: 465,
    coverImage: cover("9780307949486"),
    rating: 4.5,
    available: false,
  },
];

const seed = async () => {
  await connectDB();
  await Book.deleteMany({});
  await Book.insertMany(books);
  console.log(`Seeded ${books.length} books`);
  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
