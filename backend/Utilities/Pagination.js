/* eslint-disable radix */
/**
 * A utility function to handle pagination, sorting, and filtering.
 * @param {Object} model - The Mongoose model to query.
 * @param {Object} queryParams - The query parameters from the request (req.query).
 * @param {Object} filters - An object containing the specific filters to apply.
 * @param {Array} selectedFields - An array of fields to return in the results.
 * @returns {Promise<Object>} - The paginated, sorted, and filtered data.
 */
const paginate = async (
  model,
  queryParams,
  filters = {},
  selectedFields = [],
) => {
  const {
    pageID = 1,
    pageLen = 10,
    sortField = '_id',
    sortOrder = 'asc',
  } = queryParams;

  try {
    const pageNumber = parseInt(pageID);
    const limitNumber = parseInt(pageLen);
    const sortDirection = sortOrder === 'asc' ? 1 : -1;

    const results = await model
      .find(filters)
      .sort({ [sortField]: sortDirection })
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber)
      .select(selectedFields.join(' '));

    return results;
  } catch (err) {
    throw new Error(err.message);
  }
};

module.exports = paginate;
