exports.handleCRUD = async (Model, operation, query = {}, data = {}) => {
  try {
    switch (operation) {
      case 'find':
        return await Model.find(query);
      case 'findOne':
        return await Model.findOne(query);
      case 'create':
        return await Model.create(data);
      case 'update':
        return await Model.updateOne(query, data);
      case 'delete':
        return await Model.deleteMany(query);
      default:
        throw new Error('Invalid operation');
    }
  } catch (error) {
    throw error;
  }
};