const db = require("../db/connection");
const articles = require("../db/data/development-data/articles");

exports.fetchArticlesById = (article_id) => {
  return db
    .query("SELECT * FROM articles WHERE article_id = $1", [article_id])
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "article not found" });
      }
      return rows;
    });
};

exports.patchArticleVotes = (article_id, newVotes = 0) => {
  return db
    .query("UPDATE articles SET votes = $1 WHERE article_id = $2 RETURNING *", [
      newVotes,
      article_id,
    ])
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "article not found" });
      }
      return rows;
    });
};
