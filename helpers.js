// Function to find a user by email
export const getUserByEmail = (email, database) => {
  if (!email || typeof email !== "string") return undefined;
  if (!database || typeof database !== "object") return undefined;

  for (let userId in database) {
    if (database[userId].email === email) {
      return database[userId];
    }
  }
  return undefined;
};

// Function to return URLs associated with a specific user
export const urlsForUser = (userId, urlDatabase) => {
  const userUrls = {};
  if (!userId || typeof userId !== "string") return userUrls;

  for (let url in urlDatabase) {
    if (urlDatabase[url].userId === userId) {
      userUrls[url] = urlDatabase[url];
    }
  }
  return userUrls;
};

// Function to generate a random 6-character string
export const generateRandomString = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

