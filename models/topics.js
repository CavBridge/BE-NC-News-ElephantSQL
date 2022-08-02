const db = require("../db/connection");
const topics = require("../db/data/development-data/topics");

exports.fetchTopics = () => {
  return db.query("SELECT * FROM topics").then((topics) => {
    return topics.rows;
  });
};
