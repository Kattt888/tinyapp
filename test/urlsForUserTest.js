// Import required modules
import { assert } from 'chai';
import { urlsForUser } from '../helpers.js';

describe('urlsForUser', function() {

  // Test case 1: The function will return urls that belong to the specified user
  it('should return urls that belong to the specified user', function() {
    // Define test data
    const urlDatabase = {
      "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userId: "user1" },
      "9sm5xK": { longURL: "http://www.google.com", userId: "user2" },
      "a1b2c3": { longURL: "http://www.example.com", userId: "user1" }
    };

    // Define expected output for user1
    const expectedOutput = {
      "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userId: "user1" },
      "a1b2c3": { longURL: "http://www.example.com", userId: "user1" }
    };

    // Call the function with userId 'user1'
    const result = urlsForUser('user1', urlDatabase);

    // Assert that the result matches the expected output
    assert.deepEqual(result, expectedOutput);
  });

  // Test case 2: The function will return an empty object if the user has no urls
  it('should return an empty object if the user has no urls', function() {
    // Define test data
    const urlDatabase = {
      "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userId: "user1" },
      "9sm5xK": { longURL: "http://www.google.com", userId: "user2" },
      "a1b2c3": { longURL: "http://www.example.com", userId: "user3" }
    };

    // Call the function with a userId that doesn't own any URLs (e.g., 'user4')
    const result = urlsForUser('user4', urlDatabase);

    // Assert that the result is an empty object
    assert.deepEqual(result, {});
  });

  // Test case 3: The function will return an empty object if there are no urls in the urlDatabase
  it('should return an empty object if there are no urls in the urlDatabase', function() {
    // Define test data (empty database)
    const urlDatabase = {};

    // Call the function with any userId (e.g., 'user1')
    const result = urlsForUser('user1', urlDatabase);

    // Assert that the result is an empty object
    assert.deepEqual(result, {});
  });

  // Test case 4: The function should not return urls that don't belong to the specified user
  it('should not return urls that do not belong to the specified user', function() {
    // Define test data
    const urlDatabase = {
      "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userId: "user1" },
      "9sm5xK": { longURL: "http://www.google.com", userId: "user2" },
      "a1b2c3": { longURL: "http://www.example.com", userId: "user1" }
    };

    // Define expected output for user1
    const expectedOutput = {
      "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userId: "user1" },
      "a1b2c3": { longURL: "http://www.example.com", userId: "user1" }
    };

    // Call the function with userId 'user1'
    const result = urlsForUser('user1', urlDatabase);

    // Assert that 'user2' URL ('9sm5xK') is not included in the result
    assert.deepEqual(result, expectedOutput);
  });
});
