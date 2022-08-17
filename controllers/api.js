const { fetchApi } = require("../models/api");

exports.getApi = (req, res, next) => {
  fetchApi()
    .then((data) => {
      res.status(200).send({ endpoints: data });
    })
    .catch(next);
};
