const users = {};

const createUser = (email, password) => {
  const id = generateUserId();
  const hashedPassword = bcrypt.hashSync(password, 10); // Hash the password using bcrypt
  users[id] = { id, email, password: hashedPassword }; // Store the user in memory
  return users[id];
};

const findUserByEmail = (email) => {
  return Object.values(users).find(user => user.email === email);
};

let userIdCounter = 1;
const generateUserId = () => {
  return userIdCounter++;
};

module.exports = { createUser, findUserByEmail, users };

