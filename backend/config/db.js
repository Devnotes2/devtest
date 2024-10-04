const mongoose = require('mongoose');

const connections = {}; // Object to hold connections

const connectCollegeDB = async (collegeName) => {
  try {
    if (!connections[collegeName] || connections[collegeName].readyState !== 1) {
      const dbURI = process.env.COLLEGE_DB_URI.replace('{dbname}', collegeName);
      const connection = await mongoose.createConnection(dbURI).asPromise();

      // Check if the database has any collections
      const collections = await connection.db.listCollections().toArray();
      if (collections.length === 0) {
        console.log(`Database '${collegeName}' does not exist or is empty`);
        throw new Error(`Database '${collegeName}' does not exist or is empty`);
      }

      console.log(`Connected to ${collegeName} database`);
      connections[collegeName] = connection;
    } else {
      console.log(`Using existing connection to ${collegeName} database`);
    }

    return connections[collegeName];
  } catch (error) {
    console.error(`Error connecting to ${collegeName} database:`, error);
    throw new Error(`Failed to connect to ${collegeName} database`);
  }
};

const connectGlobalDB = async () => {
  try {
    if (!connections.global || connections.global.readyState !== 1) {
      const dbURI = process.env.GLOBAL_DB_URI;
      const connection = await mongoose.createConnection(dbURI).asPromise();

      console.log('Connected to global database');
      connections.global = connection;
    } else {
      console.log('Using existing connection to global database');
    }

    return connections.global;
  } catch (error) {
    console.error('Error connecting to global database:', error);
    throw new Error('Failed to connect to global database');
  }
};

module.exports = { connectCollegeDB, connectGlobalDB };
