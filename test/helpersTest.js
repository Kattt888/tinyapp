import { assert } from 'chai';
import { getUserByEmail } from '../helpers.js'

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "[email protected]", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "[email protected]", 
    password: "dishwasher-funk"
  }
};

describe("getUserByEmail", () => {
  const testUsers = {
    "user1": { id: "user1", email: "user1@example.com" },
    "user2": { id: "user2", email: "user2@example.com" }
  };

  it("should return a user with valid email", () => {
    const user = getUserByEmail("user1@example.com", testUsers);
    assert.deepEqual(user, { id: "user1", email: "user1@example.com" });
  });

  it("should return undefined for an email that does not exist", () => {
    const user = getUserByEmail("nonexistent@example.com", testUsers);
    assert.strictEqual(user, undefined);
  });
});

