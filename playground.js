/* global use, db */
// MongoDB Playground
// Use Ctrl+Space inside a snippet or a string literal to trigger completions.

const db = 'dbmongo';
const collection = 'users';

// The current database to use.
use(db);

// Create a new collection.
db.createCollection(collection);

// The prototype form to create a collection:
db.createCollection("Users",
  {
    username: string,
    password: string,
  }
)

// More information on the `createCollection` command can be found at:
// https://www.mongodb.com/docs/manual/reference/method/db.createCollection/
