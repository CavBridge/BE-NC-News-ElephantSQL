const express = require("express");
const {
  getArticlesAndId,
  updateArticleVotes,
} = require("./controllers/articles");
const { getTopics } = require("./controllers/topics");
const app = express();
app.use(express.json());
app.get("/api/topics", getTopics);
app.get("/api/articles/:article_id", getArticlesAndId);
app.patch("/api/articles/:article_id", updateArticleVotes);
////////////////////////////
app.use((err, req, res, next) => {
  if (err.status && err.msg) {
    res.status(err.status).send({ msg: err.msg });
  } else {
    next(err);
  }
});
app.use((err, req, res, next) => {
  if (err.code === "22P02" || err.code === "23502") {
    res.status(400).send({ msg: "invalid input" });
  } else {
    next(err);
  }
});
app.all("/*", (req, res, next) => {
  res.status(404).send({ msg: "path not found" });
});

module.exports = app;
