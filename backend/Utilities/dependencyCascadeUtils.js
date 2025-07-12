const { ObjectId } = require('mongoose').Types;

/**
 * Count dependents for a list of parent IDs across specified collections.
 * @param {Object} db - The mongoose connection (tenant DB).
 * @param {Array<string>} parentIds - Array of parent (institute) IDs.
 * @param {Array<{model: string, field: string, name?: string}>} dependents - Array of dependent collection configs.
 * @returns {Promise<Object>} - Map of parentId to dependent counts per collection.
 */
async function countDependents(db, parentIds, dependents) {
  const ids = parentIds.map(id => new ObjectId(id));
  const results = {};
  for (const id of ids) {
    const counts = {};
    await Promise.all(dependents.map(async dep => {
      const Model = db.model(dep.model);
      counts[dep.name || dep.model] = await Model.countDocuments({ [dep.field]: id });
    }));
    results[id.toString()] = counts;
  }
  return results;
}

/**
 * Delete a parent and all dependents in a transaction (configurable).
 * @param {Object} db - The mongoose connection (tenant DB).
 * @param {string} parentId - The parent ID to delete.
 * @param {Array<{model: string, field: string}>} dependents - Array of dependent collection configs.
 * @param {string} parentModel - The parent model name.
 * @returns {Promise<Object>} - Result summary.
 */
async function deleteWithDependents(db, parentId, dependents, parentModel) {
  const session = await db.startSession();
  session.startTransaction();
  try {
    const id = new ObjectId(parentId);
    const deletedCounts = {};
    for (const dep of dependents) {
      const Model = db.model(dep.model);
      const res = await Model.deleteMany({ [dep.field]: id }, { session });
      deletedCounts[dep.model] = res.deletedCount;
    }
    const Parent = db.model(parentModel);
    const parentRes = await Parent.deleteOne({ _id: id }, { session });
    deletedCounts[parentModel] = parentRes.deletedCount;
    await session.commitTransaction();
    session.endSession();
    return { deleted: true, deletedCounts };
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    return { deleted: false, error: err.message };
  }
}

/**
 * Transfer all dependents to another parent (configurable).
 * @param {Object} db - The mongoose connection (tenant DB).
 * @param {string} fromId - The parent to transfer from.
 * @param {string} toId - The parent to transfer to.
 * @param {Array<{model: string, field: string}>} dependents - Array of dependent collection configs.
 * @returns {Promise<Object>} - Result summary.
 */
async function transferDependents(db, fromId, toId, dependents) {
  const from = new ObjectId(fromId);
  const to = new ObjectId(toId);
  const results = {};
  await Promise.all(dependents.map(async dep => {
    const Model = db.model(dep.model);
    const res = await Model.updateMany({ [dep.field]: from }, { $set: { [dep.field]: to } });
    results[dep.model] = res.modifiedCount;
  }));
  return results;
}

/**
 * Archive/unarchive parent records instead of deleting.
 * Sets archive: true/false for the given parent IDs in the specified model.
 * @param {Object} db - The mongoose connection (tenant DB).
 * @param {Array<string>} parentIds - Array of parent IDs to archive/unarchive.
 * @param {string} parentModel - The parent model name.
 * @param {boolean} [archive=true] - Whether to archive (true) or unarchive (false).
 * @returns {Promise<Object>} - Result summary.
 */
async function archiveParents(db, parentIds, parentModel, archive = true) {
  const ids = parentIds.map(id => new ObjectId(id));
  const Parent = db.model(parentModel);
  // Set both 'archived' and 'archive' fields for compatibility
  const res = await Parent.updateMany(
    { _id: { $in: ids } },
    { $set: { archive: archive } }
  );
  return { archivedCount: res.modifiedCount, archived: archive };
}

// Remove all hardcoded configs and wrappers below. Only export the generic functions.

module.exports = {
  countDependents,
  deleteWithDependents,
  transferDependents,
  archiveParents
};
