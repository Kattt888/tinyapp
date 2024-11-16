const express = require("express");
const session = require('express-session');
const bcrypt = require("bcryptjs");
const { getUserByEmail } = require('./helpers.js');
import { generateRandomString } from './helpers.js';
const app = express();
const PORT = 8080;

app.use(express.urlencoded({ extended: true }));

// Session middleware setup
app.use(session({
  secret: 'some-secret-key',
  resave: false,
  saveUninitialized: true
}));

app.set("view engine", "ejs");

const urlDatabase = {
  b2xVn2: {
    longURL: "http://www.lighthouselabs.ca",
    userID: "aJ48lW",
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "aJ48lW",
  },
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

// Middleware for session-based user management
app.use((req, res, next) => {
  if (req.session.user) {
    res.locals.user = req.session.user;
  }
  next();
});

// Helper function to filter URLs for a specific user
function urlsForUser(id) {
  const filteredURLs = {};
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      filteredURLs[shortURL] = urlDatabase[shortURL];
    }
  }
  return filteredURLs;
}

// GET routes
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/register", (req, res) => {
  if (req.session.user) {
    return res.redirect("/urls");
  }
  res.render("register");
});

app.get("/urls", (req, res) => {
  const user = res.locals.user;
  if (!user) {
    return res.status(401).send("Please log in or register to view your URLs.");
  }
  const userURLs = urlsForUser(user.id);
  const templateVars = { 
    urls: userURLs, 
    user 
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];
  const templateVars = { 
    id: id, 
    longURL: longURL, 
    user: res.locals.user
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL];

  if (!longURL) {
    return res.status(404).send("Short URL not found.");
  }

  res.redirect(longURL.longURL);
});

app.get("/login", (req, res) => {
  const templateVars = {
    error: null
  };
  res.render("login", templateVars);
});

// POST routes

app.post("/urls", (req, res) => {
  if (!req.session.user) {
    return res.status(403).send("You must be logged in to shorten URLs.");
  }
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = { longURL: req.body.longURL, userID: req.session.user.id };
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  urlDatabase[id].longURL = req.body.longURL;
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = getUserByEmail(email, users);

  if (!user) {
    const templateVars = { error: "Email not found" };
    return res.status(403).render("login", templateVars);
  }

  if (!bcrypt.compareSync(password, user.password)) {
    const templateVars = { error: "Invalid password" };
    return res.status(403).render("login", templateVars);
  }

  req.session.user = user;
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/login');
});

app.post("/register", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send("Email and password cannot be blank");
  }

  if (getUserByEmail(email, users)) {
    return res.status(400).send("Email already exists");
  }

  const userID = generateRandomString();

  const hashedPassword = bcrypt.hashSync(password, 10);

  users[userID] = {
    id: userID,
    email,
    password: hashedPassword,
  };

  req.session.user = users[userID];

  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
