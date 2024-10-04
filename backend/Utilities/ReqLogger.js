const fs = require('fs');
const { promisify } = require('util');

// Function to log requests with IP and MAC (if possible)
async function requestLogger(req, res, next) {
  try {
    const clientIp = req.ip || req.connection.remoteAddress;
    // Note: Obtaining the MAC address directly from an HTTP request is not possible in Node.js.
    const logMessage = `${new Date()} - IP: ${clientIp} - ${req.method} - ${req.url} - ${JSON.stringify(req.body)}\n`;

    await promisify(fs.appendFile)('./logs/RequestLogger.log', logMessage);
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = requestLogger;
