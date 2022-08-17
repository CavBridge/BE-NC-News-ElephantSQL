const { json } = require("express");
const fs = require("fs/promises");

exports.fetchApi = () => {
  return fs.readFile("./endpoints.json", "utf-8").then((content) => {
    return JSON.parse(content);
  });
};
