const express = require("express");
const cookieSession = require("cookie-session");
const { generateRandomString } = require('./helpers');
const bcrypt = require("bcryptjs");

const app = express();
const PORT = 8080;

// Middleware
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(
  cookieSession({
    name: "session",
    keys: ["secretKey"], 
  })
);

// Database
const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};
const users = {};


// GET Routes

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

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

  const userUrls = {};
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userId === userId) {
      userUrls[shortURL] = urlDatabase[shortURL];
    }
  }

  const templateVars = {
    urls: userUrls,
    user: users[userId],
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const userId = req.session.userId;
  if (!userId) {
    return res.redirect("/login");
  }

  const templateVars = { user: users[userId] };
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

app.get("/login", (req, res) => {
  const userId = req.session.userId;
  if (userId) {
    return res.redirect("/urls");
  }
  const templateVars = { user: null };
  res.render("login", templateVars);
});

app.get("/register", (req, res) => {
  const userId = req.session.userId;
  if (userId) {
    return res.redirect("/urls");
  }
  const templateVars = { user: null };
  res.render("register", templateVars);
});


// POST Routes
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
    return res.status(403).send("Invalid email or password.");
  }

  req.session.userId = user.id;
  res.redirect("/urls");
});

app.post("/register", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send("Email and password cannot be empty.");
  }
  if (getUserByEmail(email, users)) {
    return res.status(400).send("Email already registered.");
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
