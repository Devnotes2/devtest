require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectTenantDBMiddleware = require('./config/connectTenantDBMiddleware');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const route = require('./routes/routes');
const memberDataCt = require('./Controller/membersModule/memberDataCt');
const authCt = require('./Controller/authentication/authCt');

// 🆕 ADD THIS LINE - Swagger documentation setup
const swaggerSetup = require('./api-docs/swagger');

const app = express();
const allowedOrigins = [
  'http://svb.local:8000',
  'http://localhost:8000',
  'https://devtest-7wh6.onrender.com',
  'https://devtest2.onrender.com',
  'http://yet-another-frontend.local',
  'http://localhost:19000', // React Native Expo
  'http://localhost:8081',  // React Native Metro
  '10.0.2.2:19000',  // Android emulator
  '10.0.2.2:8081',   // Android emulator
  '127.0.0.1:19000', // iOS simulator
  '127.0.0.1:8081',  // iOS simulator
  '192.168.1.7:8081',
  'exp://192.168.1.7:8081',
  '192.168.1.3:8081',
  'exp://192.168.1.3:8081',
  'exp+devtestmbl://expo-development-client/?url=http%3A%2F%2F192.168.1.7%3A8081'
];
if (process.env.NODE_ENV === 'production') {
  app.use(compression());
}

app.use(cors({
  origin: '*', // Allow all origins
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// Public routes for authentication
// These routes use middleware that connects to the tenant DB
app.post('/auth/register', connectTenantDBMiddleware, memberDataCt.createMember);
app.post('/auth/login', connectTenantDBMiddleware, authCt.login);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Backend server is running' });
});

// S3 routes with JWT authentication
app.use('/s3', require('./routes/s3Module/s3Rt'));

// All other API routes
app.use('/', route);

// 🆕 ADD THIS LINE - Setup Swagger documentation
swaggerSetup(app);

const port = process.env.PORT || 8000;
app.listen(port,'0.0.0.0', () => {
  console.log(`App running on port ${port}...`);
  console.log(`📚 Swagger documentation available at: http://localhost:${port}/docs`);
});