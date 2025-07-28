const express = require('express');
// eslint-disable-next-line import/no-extraneous-dependencies
const cors = require('cors');
const multiTenantMiddleware = require('./config/multiTenantMiddleware');
// eslint-disable-next-line import/no-extraneous-dependencies
const compression = require('compression');
require('dotenv').config();
const cookieParser = require('cookie-parser');
const route = require('./routes/routes');

const app = express();
const allowedOrigins = [
  'http://svb.local:8000',
  'https://devtest-7wh6.onrender.com',
  'https://devtest2.onrender.com',
  'http://yet-another-frontend.local',
  'http://localhost:19000', // React Native Expo
  'http://localhost:8081',  // React Native Metro
  'http://10.0.2.2:19000',  // Android emulator
  'http://10.0.2.2:8081',   // Android emulator
  'http://127.0.0.1:19000', // iOS simulator
  'http://127.0.0.1:8081',  // iOS simulator
];
if (process.env.NODE_ENV === 'production') {
  // app.use(helmet()); // Security headers
  app.use(compression()); // Gzip compression
  // app.use(morgan('combined')); // Less verbose logging
} else {
  // app.use(morgan('dev'));  // More verbose logging in development
}
app.use(cors({
  // origin: function (origin, callback) {
  //   // Allow requests from allowedOrigins, undefined (mobile fetch), or React Native (no origin)
  //   if (!origin || allowedOrigins.includes(origin)) {
  //     callback(null, true);
  //   } else {
  //     callback(new Error('Not allowed by CORS'));
  //   }
  // },
  // credentials: true // Allow cookies to be sent with requests
}));
// app.use(myReqLogger);
app.use(multiTenantMiddleware);
app.use(express.json());
app.use(cookieParser());
app.use('/', route);
const port = process.env.PORT || 8000;
app.listen(port,'0.0.0.0', () => {
  console.log(`App running on port ${port}...`);
});
