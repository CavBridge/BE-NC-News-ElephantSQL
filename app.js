const e = require("express");
const express = require("express");
const { getArticlesAndId } = require("./controllers/articles");
const { getTopics } = require("./controllers/topics");
const app = express();

app.get("/api/topics", getTopics);
app.get("/api/articles/:article_id", getArticlesAndId);

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
  } else {
    next(err);
  }
});
app.all("/*", (req, res, next) => {
  res.status(404).send({ msg: "path not found" });
});

module.exports = app;
