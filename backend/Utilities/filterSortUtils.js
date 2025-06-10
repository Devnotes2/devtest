// Utilities/filterSortUtils.js
// Utility for building MongoDB match conditions and sort objects from query params
const { ObjectId } = require('mongoose').Types;

function buildMatchConditions(query) {
  let {
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

  // Only process the first filterField/operator/value if arrays
  if (Array.isArray(filterField)) filterField = filterField[0];
  if (Array.isArray(operator)) operator = operator[0];
  if (Array.isArray(value)) value = value[0];

  // Default operator to 'eq' if filterField and value are present but operator is missing
  if (filterField && value && !operator) operator = 'eq';

  // Dynamic filterField/operator/value logic
  if (filterField && operator) {
    let cond = {};
    // Special handling for value-based filtering on joined fields (e.g. gender)
    const valueBasedFields = ['gender', 'bloodGroup', 'memberType', 'department'];
    if (valueBasedFields.includes(filterField) && typeof value === 'string' && !ObjectId.isValid(value)) {
      // This will be handled in the aggregation pipeline, not here
      cond['__valueBasedField'] = { filterField, operator, value };
    } else {
      switch (operator) {
        // String operators
        case 'contains':
          cond[filterField] = { $regex: value, $options: 'i' };
          break;
        case 'equals':
        case 'eq':
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

// Helper to build a $match stage for value-based filtering on joined fields
function buildValueBasedMatchStage(__valueBasedField, joinedFieldMap) {
  if (!__valueBasedField) return null;
  const { filterField, operator, value } = __valueBasedField;
  const joinedField = joinedFieldMap[filterField];
  if (!joinedField) return null;
  let matchStage = {};
  switch (operator) {
    case 'contains':
      matchStage[joinedField] = { $regex: value, $options: 'i' };
      break;
    case 'equals':
    case 'eq':
      if (typeof value === 'string') {
        matchStage[joinedField] = { $regex: `^${value}$`, $options: 'i' };
      } else {
        matchStage[joinedField] = value;
      }
      break;
    case 'startsWith':
      matchStage[joinedField] = { $regex: `^${value}`, $options: 'i' };
      break;
    case 'endsWith':
      matchStage[joinedField] = { $regex: `${value}$`, $options: 'i' };
      break;
    case 'isEmpty':
      matchStage[joinedField] = { $in: [null, ''] };
      break;
    case 'isNotEmpty':
      matchStage[joinedField] = { $nin: [null, ''] };
      break;
    case 'isAnyOf':
      matchStage[joinedField] = { $in: Array.isArray(value) ? value : [value] };
      break;
    default:
      matchStage[joinedField] = value;
  }
  return { $match: matchStage };
}

module.exports = {
  buildMatchConditions,
  buildSortObject,
  buildValueBasedMatchStage,
  validateUniqueField
};
