const mongoose = require('mongoose');
require('dotenv').config();
const { MembersDataSchema } = require('../Model/membersModule/memberDataMd'); // Import MembersDataSchema

// --- Global Database Connection (for tenant management) ---

const globalDbURI = process.env.GLOBAL_DB_URI;
if (!globalDbURI) {
  throw new Error('GLOBAL_DB_URI environment variable is not set.');
}

// Create a single, shared connection to the global database
const globalConnection = mongoose.createConnection(globalDbURI);

globalConnection.on('connected', () => {
  console.log(`- Global connection for tenant management established.`);
});

globalConnection.on('error', (err) => {
  console.error(`❌ Global DB connection error:`, err);
  process.exit(1); // Exit if the global connection fails
});

globalConnection.on('disconnected', () => {
  console.log(`- Global connection disconnected.`);
});

// --- Tenant (College) Database Connections ---

const tenantConnections = {}; // Object to hold tenant connections

/**
 * Establishes a connection to a specific tenant's database.
 * Caches connections to avoid reconnecting on every request.
 * @param {string} dbName - The name of the tenant database (e.g., 'college_a').
 * @param {string} clusterURI - The MongoDB connection string for the tenant's cluster.
 * @returns {Promise<mongoose.Connection>} A Mongoose connection object for the tenant DB.
 */
const connectCollegeDB = async (dbName, clusterURI) => {
  // Check if a connection already exists and is active (readyState 1 is 'connected')
  if (tenantConnections[dbName] && tenantConnections[dbName].readyState === 1) {
    console.log(`Using existing connection to ${dbName} database`);
    return tenantConnections[dbName];
  }

  try {
    if (!clusterURI) {
      throw new Error('Cluster URI is required to connect to a tenant database.');
    }
    // The dbName from the tenant document is the database name.
    const dbURI = clusterURI.replace('{dbname}', dbName);

    console.log(`Attempting to connect to ${dbName} database...`);
    const connection = await mongoose.createConnection(dbURI).asPromise();

    // Register MembersDataSchema on this specific connection
    connection.model('MembersData', MembersDataSchema);

    // Check if the database has any collections. This is a good health check.
    const collections = await connection.db.listCollections().toArray();
    if (collections.length === 0) {
      // It's better to close the just-opened connection if the DB is invalid.
      await connection.close();
      const errorMessage = `Database '${dbName}' does not exist or is empty.`;
      console.warn(errorMessage);
      throw new Error(errorMessage);
    }

    console.log(`- Connected to ${dbName} database.`);
    tenantConnections[dbName] = connection;
    return connection;
  } catch (error) {
    console.error(`Error connecting to ${dbName} database:`, error);
    // Re-throw the error to be handled by the middleware
    throw new Error(`Failed to connect to ${dbName} database. Reason: ${error.message}`);
  }
};

module.exports = {
  globalConnection,
  connectCollegeDB,
};
