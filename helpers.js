// Function to get a user by email from the database
export const getUserByEmail = (email, database) => {
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
  
  for (let url in urlDatabase) {
    
    if (urlDatabase[url].userId === userId) {
      userUrls[url] = urlDatabase[url];
    }
  }

  return userUrls;
};

export const generateRandomString = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};
