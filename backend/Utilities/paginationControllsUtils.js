// utils/aggregations/addPaginationAndSort.js
function addPaginationAndSort(pipeline, { page = 1, limit = 10, sort = {} }) {
  const skip = (page - 1) * limit;
  if (Object.keys(sort).length > 0) pipeline.push({ $sort: sort });
  pipeline.push({ $skip: skip }, { $limit: Number(limit) });
}

module.exports = addPaginationAndSort;
