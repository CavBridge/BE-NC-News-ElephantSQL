const db = require("../db/connection");
const articles = require("../db/data/development-data/articles");
const comments = require("../db/data/development-data/comments");

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

exports.fetchArticles = (
  topic = "",
  sort_by = "created_at",
  order = "DESC"
) => {
  const queryValue = [];
  let queryStr = `SELECT articles.article_id, articles.title, articles.topic, articles.author, articles.created_at, articles.votes, COUNT(comment_id)::INT AS comment_count
FROM articles
LEFT JOIN comments ON articles.article_id = comments.article_id`;
  if (topic.length > 0) {
    queryValue.push(topic);
    queryStr += ` WHERE articles.topic = $1`;
  }
  queryStr += ` GROUP BY articles.article_id ORDER BY ${sort_by} ${order}`;
  return db.query(queryStr, queryValue).then((articles) => {
    return articles.rows;
  });
};

exports.fetchArticleCommentsById = (article_id) => {
  return db
    .query(
      `SELECT comment_id, body, author, votes, created_at
     FROM comments WHERE article_id = $1`,
      [article_id]
    )
    .then(({ rows }) => {
      return rows;
    });
};

exports.insertComment = (article_id, newComment = 0) => {
  const { body, username } = newComment;
  return db
    .query(
      "INSERT INTO comments (article_id, body, author) VALUES ($1, $2, $3) RETURNING *;",
      [article_id, body, username]
    )
    .then(({ rows }) => {
      return rows[0];
    });
};

exports.removeCommentById = (comment_id) => {
  return db
    .query(`DELETE FROM comments WHERE comment_id = $1`, [comment_id])
    .then((rows) => {
      if (rows.rowCount === 0) {
        return Promise.reject({ status: 404, msg: "not found" });
      } else if (rows.rowCount > 0) {
        return Promise.reject({ status: 204, msg: "no content" });
      }
    });
};
