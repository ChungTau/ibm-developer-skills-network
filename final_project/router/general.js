const express = require('express');
const books = require('./booksdb.js');
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({message: "Username and password are required"});
  }
  if(!isValid(username)){
    return res.status(400).json({message: "Invalid username"});
  }
  const userExists = users.find(user => user.username === username);
  if (userExists) {
    return res.status(409).json({message: "Username already exists"});
  }
  users.push({ username, password });
  return res.status(201).json({message: "Customer successfully registered. Now you can login"});
});

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
  try {
    let booksPromise = await new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(books);
      }, 1000);
    });
    res.status(200).json(booksPromise);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
  const isbn = req.params.isbn;
  const bookPromise = await new Promise((resolve, reject) => {{
    setTimeout(() => {
      resolve(books[isbn]);
      }, 1000);
    }});
  if (bookPromise) {
    res.status(200).json(bookPromise);
  } else {
    res.status(404).json({message: "Book not found"});
  }
});
  
// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
  const authorName = req.params.author;
  
  try {
    const booksByAuthor = await new Promise((resolve, reject) => {
      setTimeout(() => {
        const filteredBooks = Object.entries(books).filter(([isbn, book]) => book.author === authorName).map(([isbn, book]) => ({
          isbn,
          title: book.title,
          reviews: book.reviews
        }));
        if (filteredBooks.length > 0) {
          resolve(filteredBooks);
        } else {
          reject(new Error("No books found by this author"));
        }
      }, 1000);
    });

    res.status(200).json({"booksbyauthor": booksByAuthor});
  } catch (error) {
    res.status(404).json({message: error.message});
  }
});

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
  const title = req.params.title;
  try{
    const booksByTitle = await new Promise((resolve, reject) => {
      setTimeout(() => {
        const filteredBooks = Object.entries(books).filter(([isbn, book]) => book.title.toLowerCase().includes(title.toLowerCase())).map(([isbn, book]) => ({
          isbn,
          author: book.author,
          reviews: book.reviews
          }));
        if (filteredBooks.length > 0) {
          resolve(filteredBooks);
        } else {
          reject(new Error("No books found by this title"));
        }
      }, 1000);

    });
    res.status(200).json({"booksbytitle": booksByTitle});
  } catch (error) {
    res.status(404).json({message: error.message});
  }
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (book) {
    const reviews = book.reviews;
    if (Object.keys(reviews).length > 0) {
      res.status(200).json({"reviews": reviews});
    } else {
      res.status(404).json({});
    }
  } else {
    res.status(404).json({message: "Book not found"});
  }
});

module.exports.general = public_users;
