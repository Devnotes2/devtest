// Utilities/filterSortUtils.js
// Utility for building MongoDB match conditions and sort objects from query params
const { ObjectId } = require('mongoose').Types;

function buildMatchConditions(query) {
  const {
    filterField, operator, value, ...filters
  } = query;
  const matchConditions = {};
  // Standard filters with ObjectId conversion
  const objectIdFields = [
    'instituteId', 'gradeId', 'gradeBatchesId', 'gradeSectionId', 'gradeSectionBatchId',
    'memberType', 'gender', 'bloodGroup', 'department'
  ];
  objectIdFields.forEach(field => {
    if (filters[field]) matchConditions[field] = new ObjectId(filters[field]);
  });
  if (filters.email) matchConditions.email = filters.email;

  // Dynamic filterField/operator/value logic
  if (filterField && operator) {
    let cond = {};
    switch (operator) {
      // String operators
      case 'contains':
        cond[filterField] = { $regex: value, $options: 'i' };
        break;
      case 'equals':
        cond[filterField] = value;
        break;
      case 'startsWith':
        cond[filterField] = { $regex: `^${value}`, $options: 'i' };
        break;
      case 'endsWith':
        cond[filterField] = { $regex: `${value}$`, $options: 'i' };
        break;
      case 'isEmpty':
        cond[filterField] = { $in: [null, ''] };
        break;
      case 'isNotEmpty':
        cond[filterField] = { $nin: [null, ''] };
        break;
      case 'isAnyOf':
        cond[filterField] = { $in: Array.isArray(value) ? value : [value] };
        break;
      // Number operators
      case '=':
        cond[filterField] = Number(value);
        break;
      case '!=':
        cond[filterField] = { $ne: Number(value) };
        break;
      case '>':
        cond[filterField] = { $gt: Number(value) };
        break;
      case '<':
        cond[filterField] = { $lt: Number(value) };
        break;
      case '>=':
        cond[filterField] = { $gte: Number(value) };
        break;
      case '<=':
        cond[filterField] = { $lte: Number(value) };
        break;
      // Date operators
      case 'is':
        cond[filterField] = new Date(value);
        break;
      case 'not':
        cond[filterField] = { $ne: new Date(value) };
        break;
      case 'after':
        cond[filterField] = { $gt: new Date(value) };
        break;
      case 'onOrAfter':
        cond[filterField] = { $gte: new Date(value) };
        break;
      case 'before':
        cond[filterField] = { $lt: new Date(value) };
        break;
      case 'onOrBefore':
        cond[filterField] = { $lte: new Date(value) };
        break;
      default:
        break;
    }
    Object.assign(matchConditions, cond);
  }
  return matchConditions;
}

function buildSortObject(query) {
  const { sortField, sort } = query;
  if (sortField && sort) {
    return { [sortField]: sort === 'asc' ? 1 : -1 };
  }
  return { createdAt: -1 };
}

/**
 * Utility to validate if a value for a field is unique in a collection.
 * @param {MongooseModel} Model - The Mongoose model to check against.
 * @param {string} field - The field name to check (e.g., 'memberId').
 * @param {string|number} value - The value to check for uniqueness.
 * @returns {Promise<boolean>} - Resolves true if exists, false otherwise.
 */
async function validateUniqueField(Model, field, value) {
  if (!field || typeof value === 'undefined') return false;
  const exists = await Model.exists({ [field]: value });
  return !!exists;
}

module.exports = {
  buildMatchConditions,
  buildSortObject,
  validateUniqueField
};
