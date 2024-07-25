const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
return typeof username === 'string' && username.trim() !== '';
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
return users.find(u => u.username === username && u.password === password) ? true : false;
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({message: "Username and password are required"});
  }
  if(!isValid(username)){
    return res.status(400).json({message: "Invalid username"});
  }
  
  if (!authenticatedUser()) {
    return res.status(401).json({message: "Invalid credentials"});
  }
  const token = jwt.sign({ username: username }, "your_secret_key", { expiresIn: '1h' });
  return res.status(200).send("Customer successfully logged in");
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const { review } = req.query;
  const isbn = req.params.isbn; 
  const username = req.username;
  

  if (!username) {
    return res.status(401).json({message: "Unauthorized"});
  }

  const book = books[isbn];
  if (!book) {
    return res.status(404).json({message: "Book not found"});
  }

  if (!book.reviews) {
    book.reviews = {};
  }

  book.reviews[username] = review;

  return res.status(200).send("The review for the book with ISBN "+isbn+" has been added/updated.");
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.username;

  if (!username) {
    return res.status(401).json({message: "Unauthorized"});
  }

  const book = books[isbn];
  if (!book) {
    return res.status(404).json({message: "Book not found"});
  }

  if (!book.reviews || !book.reviews[username]) {
    return res.status(404).json({message: "Review not found"});
  }

  delete book.reviews[username];

  return res.status(200).send("Reviews for the ISBN "+isbn+" posted by the user "+ username +" deleted.");
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
