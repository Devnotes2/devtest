const express = require('express');
// eslint-disable-next-line import/no-extraneous-dependencies
const cors = require('cors');
const multiTenantMiddleware = require('./config/multiTenantMiddleware');
// eslint-disable-next-line import/no-extraneous-dependencies
// const myReqLogger = require('./Utilities/ReqLogger');
const compression = require('compression');
require('dotenv').config();
const cookieParser = require('cookie-parser');
const route = require('./routes/routes');

const app = express();
const allowedOrigins = [
  'http://svb.local:3000',
  'https://devtest-7wh6.onrender.com',
  'http://yet-another-frontend.local'
];
if (process.env.NODE_ENV === 'production') {
  // app.use(helmet()); // Security headers
  app.use(compression()); // Gzip compression
  // app.use(morgan('combined')); // Less verbose logging
} else {
  app.use(morgan('dev'));  // More verbose logging in development
}
app.use(cors({
  origin: function (origin, callback) {
    // If the origin is in the allowedOrigins array or if it's undefined (for non-browser requests), allow it
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true // Allow cookies to be sent with requests
}));
// app.use(myReqLogger);
app.use(multiTenantMiddleware);
app.use(express.json());
app.use(cookieParser());
app.use('/', route);
const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
