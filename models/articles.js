const db = require("../db/connection");
const articles = require("../db/data/development-data/articles");

exports.fetchArticlesById = (article_id) => {
  return db
    .query(
      `SELECT articles.*, COUNT(comment_id)::INT AS comment_count
    FROM articles
    LEFT JOIN comments ON articles.article_id = comments.article_id
    WHERE articles.article_id = $1
    GROUP BY articles.article_id;`,
      [article_id]
    )
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

exports.fetchArticles = () => {
  return db
    .query(
      `SELECT articles.article_id, articles.title, articles.topic, articles.author, articles.created_at, articles.votes, COUNT(comment_id)::INT AS comment_count
    FROM articles
    LEFT JOIN comments ON articles.article_id = comments.article_id
    GROUP BY articles.article_id ORDER BY created_at DESC`
    )
    .then((articles) => {
      return articles.rows;
    });
};
