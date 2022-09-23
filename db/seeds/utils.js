const format = require("pg-format");
const db = require("../connection");

exports.convertTimestampToDate = ({ created_at, ...otherProperties }) => {
  if (!created_at) return { ...otherProperties };
  return { created_at: new Date(created_at), ...otherProperties };
};

exports.createRef = (arr, key, value) => {
  return arr.reduce((ref, element) => {
    ref[element[key]] = element[value];
    return ref;
  }, {});
};

exports.formatComments = (comments, idLookup) => {
  return comments.map(({ created_by, belongs_to, ...restOfComment }) => {
    const article_id = idLookup[belongs_to];
    return {
      article_id,
      author: created_by,
      ...this.convertTimestampToDate(restOfComment),
    };
  });
};

exports.validateSortBy = (sort_by) => {
  const columns = ["created_at", "votes", "title", "comment_count", "author"];
  const isValidSortByColumn = columns.includes(sort_by);
  return isValidSortByColumn
    ? sort_by
    : Promise.reject({ status: 400, msg: "Invalid sort by query" });
};

exports.validateOrder = (order) => {
  const lowerCaseOrder = order.toLowerCase();
  const isValidOrder = ["asc", "desc"].includes(lowerCaseOrder);
  return isValidOrder
    ? lowerCaseOrder
    : Promise.reject({ status: 400, msg: "Invalid order query" });
};

exports.checkExists = (table, column, value) => {
  const queryStr = format("SELECT * FROM %I WHERE %I = $1", table, column);
  return db.query(queryStr, [value]).then((dbOutput) => {
    if (!dbOutput.rowCount) {
      return Promise.reject({ status: 404, msg: "Topic not found" });
    }
  });
};
