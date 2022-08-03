const db = require("../db/connection");
const users = require("../db/data/development-data/users");

exports.fetchUsers = () => {
  return db.query("SELECT * FROM users").then((users) => {
    return users.rows;
  });
};
