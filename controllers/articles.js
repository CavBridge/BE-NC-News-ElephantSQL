const {
  fetchArticlesById,
  patchArticleVotes,
  fetchArticles,
  fetchArticleCommentsById,
} = require("../models/articles");

exports.getArticlesAndId = (req, res, next) => {
  const { article_id } = req.params;
  fetchArticlesById(article_id)
    .then((article) => {
      res.status(200).send({ article: article[0] });
    })
    .catch(next);
};

exports.updateArticleVotes = (req, res, next) => {
  const { article_id } = req.params;
  const { inc_votes } = req.body;
  patchArticleVotes(article_id, inc_votes)
    .then((article) => {
      res.status(200).send({ article: article[0] });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getArticles = (req, res, next) => {
  fetchArticles()
    .then((articles) => res.status(200).send({ articles }))
    .catch(next);
};

exports.getArticleCommentsById = (req, res, next) => {
  const { article_id } = req.params;
  fetchArticlesById(article_id)
    .then(() => {
      return fetchArticleCommentsById(article_id);
    })
    .then((comments) => {
      res.status(200).send({ comments });
    })
    .catch(next);
};
