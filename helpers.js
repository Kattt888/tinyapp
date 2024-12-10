// Function to find a user by email
const getUserByEmail = (email, database) => {
  
  if (typeof email !== "string" || !email.trim()) return undefined;
  if (typeof database !== "object" || database === null) return undefined;

  
  for (const userId in database) {
    const user = database[userId];
    if (user && user.email === email) {
      return user;
    }
  }
  return undefined;
};

// Function to return URLs associated with a specific user
const urlsForUser = (userId, urlDatabase) => {
  const userUrls = {};
  if (typeof userId !== "string" || !userId.trim()) return userUrls;
  if (typeof urlDatabase !== "object" || urlDatabase === null) return userUrls;

  for (const url in urlDatabase) {
    if (urlDatabase[url].userId === userId) {
      userUrls[url] = urlDatabase[url].longURL;
    }
  }
  return userUrls;
};

// Function to generate a random 6-character string
const generateRandomString = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

// Export the functions
module.exports = { getUserByEmail, urlsForUser, generateRandomString };


