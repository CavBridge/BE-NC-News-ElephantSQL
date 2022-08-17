const express = require("express");
const {
  getArticlesAndId,
  updateArticleVotes,
  getArticles,
  getArticleCommentsById,
  addComment,
  deleteCommentById,
} = require("./controllers/articles");
const { getTopics } = require("./controllers/topics");
const { getUsers } = require("./controllers/users");
const { getApi } = require("./controllers/api");
const app = express();
app.use(express.json());
app.get("/api", getApi);
app.get("/api/topics", getTopics);
app.get("/api/articles/:article_id", getArticlesAndId);
app.patch("/api/articles/:article_id", updateArticleVotes);
app.get("/api/articles", getArticles);
app.get("/api/articles/:article_id/comments", getArticleCommentsById);
app.post("/api/articles/:article_id/comments", addComment);
app.get("/api/users", getUsers);
app.delete("/api/comments/:comment_id", deleteCommentById);

////////////////////////////
app.use((err, req, res, next) => {
  if (err.status && err.msg) {
    res.status(err.status).send({ msg: err.msg });
  } else {
    next(err);
  }
});
app.use((err, req, res, next) => {
  if (err.code === "22P02") {
    res.status(400).send({ msg: "invalid input" });
  } else if (err.code === "23502") {
    res.status(400).send({ msg: "bad request" });
  } else {
    next(err);
  }
});
app.all("/*", (req, res, next) => {
  res.status(404).send({ msg: "path not found" });
});

module.exports = app;
