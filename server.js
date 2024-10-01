const express = require('express');
const fs = require('fs');
const app = express();
const port = 3000;

app.use(express.json()); // To parse incoming JSON data

// Path to the JSON file that will store the book data
const dataFilePath = './books.json';

// Initialize the books.json file with an empty array if it doesn't exist
if (!fs.existsSync(dataFilePath)) {
  fs.writeFileSync(dataFilePath, JSON.stringify([]));
}

// Helper function to read the book directory from the JSON file
const readBooks = () => {
  const data = fs.readFileSync(dataFilePath, 'utf8');
  return JSON.parse(data);
};

// Helper function to write updated book data to the JSON file
const writeBooks = (books) => {
  fs.writeFileSync(dataFilePath, JSON.stringify(books, null, 2));
};

// GET /books - Retrieve a list of all books
app.get('/books', (req, res) => {
  const books = readBooks();
  res.status(200).json(books);
});

// GET /books/:isbn - Retrieve a specific book by ISBN
app.get('/books/:isbn', (req, res) => {
  const books = readBooks();
  const book = books.find((b) => b.isbn === req.params.isbn);

  if (book) {
    res.status(200).json(book);
  } else {
    res.status(404).json({ message: 'Book not found' });
  }
});

// POST /books - Add a new book to the directory
app.post('/books', (req, res) => {
  const { title, author, publisher, publishedDate, isbn } = req.body;

  // Validation
  if (!title || !author || !publisher || !publishedDate || !isbn) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  if (isNaN(isbn)) {
    return res.status(400).json({ message: 'ISBN must be a valid number' });
  }

  const books = readBooks();

  // Check for duplicate ISBN
  const duplicate = books.find((b) => b.isbn === isbn);
  if (duplicate) {
    return res.status(409).json({ message: 'ISBN already exists' });
  }

  const newBook = { title, author, publisher, publishedDate, isbn };
  books.push(newBook);
  writeBooks(books);

  res.status(201).json({ message: 'Book added', book: newBook });
});

// PUT /books/:isbn - Update details of an existing book
app.put('/books/:isbn', (req, res) => {
  const { title, author, publisher, publishedDate } = req.body;
  const isbn = req.params.isbn;

  // Validation
  if (!title || !author || !publisher || !publishedDate) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const books = readBooks();
  const bookIndex = books.findIndex((b) => b.isbn === isbn);

  if (bookIndex === -1) {
    return res.status(404).json({ message: 'Book not found' });
  }

  // Update book details
  books[bookIndex] = { ...books[bookIndex], title, author, publisher, publishedDate };
  writeBooks(books);

  res.status(200).json({ message: 'Book updated', book: books[bookIndex] });
});

// DELETE /books/:isbn - Remove a book by ISBN
app.delete('/books/:isbn', (req, res) => {
  const books = readBooks();
  const isbn = req.params.isbn;
  const bookIndex = books.findIndex((b) => b.isbn === isbn);

  if (bookIndex === -1) {
    return res.status(404).json({ message: 'Book not found' });
  }

  // Remove the book from the list
  const deletedBook = books.splice(bookIndex, 1);
  writeBooks(books);

  res.status(200).json({ message: 'Book deleted', book: deletedBook });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
