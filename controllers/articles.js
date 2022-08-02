const { fetchArticlesById } = require("../models/articles");

exports.getArticlesAndId = (req, res, next) => {
  const { article_id } = req.params;
  fetchArticlesById(article_id)
    .then((article) => res.status(200).send({ article: article[0] }))
    .catch(next);
};
