const express = require("express");
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");
const { getUserByEmail, urlsForUser, generateRandomString } = require('./helpers');
const { createUser, findUserByEmail, users } = require('./models/user');
const { urlDatabase } = require('./models/urls');

const app = express();
const PORT = 8080;

// Middleware
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(
  cookieSession({
    name: "session",
    keys: ["your-secret-key"],
    maxAge: 24 * 60 * 60 * 1000
  }));


// GET Routes
app.get("/", (req, res) => {
  const userId = req.session.userId;
  if (userId) {
    return res.redirect("/urls");
  }
  res.redirect("/login");
});

app.get("/urls", (req, res) => {
  const userId = req.session.userId;
  if (!userId) {
    return res.status(401).send("You must be logged in to view this page.");
  }

  const templateVars = {
    urls: urlsForUser(userId, urlDatabase),
    user: users[userId],
    error: null,
  };

  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const userId = req.session.userId;
  if (!userId) {
    return res.redirect("/login");
  }

  const templateVars = { user: users[userId], error: null };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const userId = req.session.userId;
  const urlData = urlDatabase[req.params.id];

  if (!urlData) {
    return res.status(404).send("URL not found.");
  }
  if (!userId) {
    return res.status(401).send("You must be logged in to view this URL.");
  }
  if (urlData.userId !== userId) {
    return res.status(403).send("You do not have permission to access this URL.");
  }

  const templateVars = {
    id: req.params.id,
    longURL: urlData.longURL,
    user: users[userId],
  };
  
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const urlData = urlDatabase[req.params.id];
  if (!urlData) {
    return res.status(404).send("URL not found.");
  }
  res.redirect(urlData.longURL);
});

app.get('/login', (req, res) => {
  if (req.session.userId) {
    return res.redirect('/urls');
  }

  const templateVars = {
    error: null,
    user: null
  }
  res.render('login', templateVars);
});

app.get('/register', (req, res) => {
  if (req.session.user_id) {
    return res.redirect('/urls');
  }

  const templateVars = {
    error: null,
    user: null
  }

  res.render('register', templateVars);
});



// POST Routes

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = getUserByEmail(email, users);
  
  if (!user || !bcrypt.compareSync(password, user.password,)) {
    return res.render('login', { error: 'Invalid email or password', user: null });
  }

  req.session.userId = user.id;
  res.redirect('/urls');
});

app.post('/register', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.render('register', { error: 'Email and password are required', user: null  });
  }

  const existingUser = getUserByEmail(email, users);
  if (existingUser) {
    return res.render('register', { error: 'Email is already registered', user: null  });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  const userId = generateRandomString();
  users[userId] = { id: userId, email, password: hashedPassword };

  req.session.userId = userId;

  res.redirect('/urls');
});

app.post("/urls", (req, res) => {
  const userId = req.session.userId;
  if (!userId) {
    return res.status(401).send("You must be logged in to create URLs.");
  }

  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userId: userId,
  };

  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:id", (req, res) => {
  const userId = req.session.userId;
  const urlData = urlDatabase[req.params.id];

  if (!urlData) {
    return res.status(404).send("URL not found.");
  }
  if (!userId || urlData.userId !== userId) {
    return res.status(403).send("You do not have permission to edit this URL.");
  }

  urlDatabase[req.params.id].longURL = req.body.longURL;
  res.redirect("/urls");
});

app.post("/urls/:id/delete", (req, res) => {
  const userId = req.session.userId;
  const urlData = urlDatabase[req.params.id];

  if (!urlData) {
    return res.status(404).send("URL not found.");
  }
  if (!userId || urlData.userId !== userId) {
    return res.status(403).send("You do not have permission to delete this URL.");
  }

  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = getUserByEmail(email, users);

  if (!user || !bcrypt.compareSync(password, user.password)) {
    const templateVars = { error: "Invalid email or password" };
    return res.render("login", templateVars);
  }

  req.session.userId = user.id;
  res.redirect("/urls");
});

app.post("/register", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    const templateVars = { error: "Email and password cannot be empty." };
    return res.render("register", templateVars);
  }

  if (getUserByEmail(email, users)) {
    const templateVars = { error: "Email is already in use." };
    return res.render("register", templateVars);
  }

  const userId = generateRandomString();

  const hashedPassword = bcrypt.hashSync(password, 10);

  users[userId] = {
    id: userId,
    email: email,
    password: hashedPassword,
  };

  req.session.userId = userId;

  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});


app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});
