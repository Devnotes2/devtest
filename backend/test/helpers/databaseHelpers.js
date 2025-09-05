const mongoose = require('mongoose');

/**
 * Database helper utilities for testing
 */
class DatabaseHelpers {
  /**
   * Connect to test database
   * @param {string} testDbUri - Test database URI
   */
  static async connectToTestDatabase(testDbUri = 'mongodb://localhost:27017/test_db') {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(testDbUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
    }
  }

  /**
   * Disconnect from test database
   */
  static async disconnectFromTestDatabase() {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
  }

  /**
   * Clear all collections in test database
   */
  static async clearTestDatabase() {
    if (mongoose.connection.readyState === 1) {
      const collections = await mongoose.connection.db.listCollections().toArray();
      
      for (const collection of collections) {
        await mongoose.connection.db.collection(collection.name).deleteMany({});
      }
    }
  }

  /**
   * Clear specific collections
   * @param {Array} collectionNames - Array of collection names to clear
   */
  static async clearCollections(collectionNames) {
    if (mongoose.connection.readyState === 1) {
      for (const collectionName of collectionNames) {
        await mongoose.connection.db.collection(collectionName).deleteMany({});
      }
    }
  }

  /**
   * Create test data in bulk
   * @param {Object} model - Mongoose model
   * @param {Array} dataArray - Array of data objects
   * @returns {Array} - Array of created documents
   */
  static async createBulkTestData(model, dataArray) {
    return await model.insertMany(dataArray);
  }

  /**
   * Get collection count
   * @param {string} collectionName - Name of collection
   * @returns {number} - Document count
   */
  static async getCollectionCount(collectionName) {
    if (mongoose.connection.readyState === 1) {
      return await mongoose.connection.db.collection(collectionName).countDocuments();
    }
    return 0;
  }

  /**
   * Drop test database
   */
  static async dropTestDatabase() {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.db.dropDatabase();
    }
  }

  /**
   * Create indexes for test collections
   * @param {string} collectionName - Name of collection
   * @param {Array} indexes - Array of index specifications
   */
  static async createIndexes(collectionName, indexes) {
    if (mongoose.connection.readyState === 1) {
      const collection = mongoose.connection.db.collection(collectionName);
      for (const index of indexes) {
        await collection.createIndex(index.keys, index.options || {});
      }
    }
  }

  /**
   * Seed test database with initial data
   * @param {Object} seedData - Object containing seed data for different collections
   */
  static async seedTestDatabase(seedData) {
    if (mongoose.connection.readyState === 1) {
      for (const [collectionName, data] of Object.entries(seedData)) {
        if (Array.isArray(data) && data.length > 0) {
          await mongoose.connection.db.collection(collectionName).insertMany(data);
        }
      }
    }
  }

  /**
   * Get all documents from a collection
   * @param {string} collectionName - Name of collection
   * @returns {Array} - Array of documents
   */
  static async getAllDocuments(collectionName) {
    if (mongoose.connection.readyState === 1) {
      return await mongoose.connection.db.collection(collectionName).find({}).toArray();
    }
    return [];
  }

  /**
   * Find documents by query
   * @param {string} collectionName - Name of collection
   * @param {Object} query - MongoDB query
   * @returns {Array} - Array of matching documents
   */
  static async findDocuments(collectionName, query) {
    if (mongoose.connection.readyState === 1) {
      return await mongoose.connection.db.collection(collectionName).find(query).toArray();
    }
    return [];
  }

  /**
   * Update documents
   * @param {string} collectionName - Name of collection
   * @param {Object} query - MongoDB query
   * @param {Object} update - MongoDB update object
   * @returns {Object} - Update result
   */
  static async updateDocuments(collectionName, query, update) {
    if (mongoose.connection.readyState === 1) {
      return await mongoose.connection.db.collection(collectionName).updateMany(query, update);
    }
    return { modifiedCount: 0 };
  }

  /**
   * Delete documents
   * @param {string} collectionName - Name of collection
   * @param {Object} query - MongoDB query
   * @returns {Object} - Delete result
   */
  static async deleteDocuments(collectionName, query) {
    if (mongoose.connection.readyState === 1) {
      return await mongoose.connection.db.collection(collectionName).deleteMany(query);
    }
    return { deletedCount: 0 };
  }
}

module.exports = DatabaseHelpers;
