// utils/aggregations/buildGenericAggregation.js

function buildGenericAggregation({ filters = {}, lookups = [], extraStages = [] }) {
  const pipeline = [];

  // 1. Match stage from filters
  const matchConditions = {};
  for (const key in filters) {
    if (filters[key] !== undefined && filters[key] !== '') {
      matchConditions[key] = filters[key];
    }
  }

  if (Object.keys(matchConditions).length > 0) {
    pipeline.push({ $match: matchConditions });
  }

  // 2. Handle lookups - FIXED: Properly handle arrays of stages
  lookups.forEach((lookup) => {
    // If the lookup is an array (like from generalDataLookup), spread it
    if (Array.isArray(lookup)) {
      pipeline.push(...lookup);
    }
    // If it's a single aggregation stage (has keys like $lookup, $unwind, etc.)
    else if (typeof lookup === 'object' && lookup !== null) {
      pipeline.push(lookup);
    }
  });

  // 3. Append any extra stages (e.g. $project, $sort)
  pipeline.push(...extraStages);

  return pipeline;
}

module.exports = buildGenericAggregation;