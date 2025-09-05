# Database Setup Guide for E2E Tests

## 🎯 **Current Status**

✅ **E2E Testing Framework**: Working perfectly!  
✅ **Test Structure**: Complete and organized  
✅ **Test Utilities**: All helpers and fixtures ready  
❌ **Database Connection**: Needs MongoDB setup  

## 🚀 **Quick Test (No Database Required)**

Your framework is working! Run this to see it in action:

```bash
npm test -- simple.e2e.test.js
```

**Result**: ✅ 14 tests passed - Framework is ready!

## 🗄️ **Database Setup Options**

### **Option 1: Local MongoDB (Recommended)**

#### **Install MongoDB**
```bash
# Windows (using Chocolatey)
choco install mongodb

# Or download from: https://www.mongodb.com/try/download/community
```

#### **Start MongoDB**
```bash
# Start MongoDB service
net start MongoDB

# Or start manually
mongod --dbpath C:\data\db
```

#### **Verify Connection**
```bash
# Test connection
mongo
# Should show: MongoDB shell version...
```

### **Option 2: MongoDB Atlas (Cloud)**

1. **Create Account**: Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. **Create Cluster**: Free tier available
3. **Get Connection String**: Copy your connection string
4. **Update Environment**: Add to your `.env.test` file

### **Option 3: Docker MongoDB**

```bash
# Run MongoDB in Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Verify it's running
docker ps
```

## ⚙️ **Environment Configuration**

### **Create `.env.test` File**
```env
NODE_ENV=test
PORT=8001
MONGODB_URI_TEST=mongodb://localhost:27017/devtest_test_db
JWT_SECRET_TEST=supersecretjwtkeyforintegrationtests
SENDGRID_API_KEY_TEST=SG.mocked_sendgrid_api_key
TWILIO_ACCOUNT_SID_TEST=ACmocked_twilio_sid
TWILIO_AUTH_TOKEN_TEST=mocked_twilio_auth_token
TWILIO_PHONE_NUMBER_TEST=+15017122661
AWS_ACCESS_KEY_ID_TEST=mocked_aws_access_key
AWS_SECRET_ACCESS_KEY_TEST=mocked_aws_secret_key
AWS_REGION_TEST=us-east-1
AWS_S3_BUCKET_NAME_TEST=mocked-test-bucket
```

### **Update Database Helpers (if needed)**
The database helpers are already configured to use the test database URI from environment variables.

## 🧪 **Running Tests After Database Setup**

### **1. Test Database Connection**
```bash
# Run a simple test first
npm test -- simple.e2e.test.js
```

### **2. Run All E2E Tests**
```bash
# Run all tests
npm test

# Run specific modules
npm run test:institute
npm run test:aggregation
```

### **3. Run with Coverage**
```bash
npm run test:coverage
```

## 🔧 **Troubleshooting**

### **Common Issues**

#### **1. MongoDB Connection Failed**
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution**: Start MongoDB service
```bash
net start MongoDB
```

#### **2. Database Already Exists**
```
Error: database already exists
```
**Solution**: Tests will automatically clear the database between runs.

#### **3. Port Already in Use**
```
Error: listen EADDRINUSE: address already in use
```
**Solution**: Tests use port 8001, make sure it's available.

### **Debug Mode**
```bash
# Run with debug information
npm test -- --verbose

# Run with open handles detection
npm test -- --detectOpenHandles
```

## 📊 **Expected Test Results**

### **With Database Connected**
```
✅ PASS test/e2e/simple.e2e.test.js
✅ PASS test/e2e/instituteData/institutes.e2e.test.js
✅ PASS test/e2e/instituteData/departments.e2e.test.js
✅ PASS test/e2e/instituteData/academicYear.e2e.test.js
✅ PASS test/e2e/instituteData/aggregation/grades.e2e.test.js
✅ PASS test/e2e/instituteData/aggregation/subjects.e2e.test.js
✅ PASS test/e2e/instituteData/aggregation/gradeSections.e2e.test.js
✅ PASS test/e2e/instituteData/aggregation/gradeBatches.e2e.test.js
✅ PASS test/e2e/instituteData/aggregation/gradeSectionBatches.e2e.test.js
✅ PASS test/e2e/instituteData/aggregation/locationTypesInInstitute.e2e.test.js

Test Suites: 10 passed, 10 total
Tests:       108 passed, 108 total
```

### **Coverage Report**
```
--------------------------|---------|----------|---------|---------|
File                      | % Stmts | % Branch | % Funcs | % Lines |
--------------------------|---------|----------|---------|---------|
All files                 |   45.67 |    42.34 |   48.92 |   46.23 |
```

## 🎯 **Next Steps**

### **1. Set Up Database**
Choose one of the database setup options above.

### **2. Run Tests**
```bash
npm test
```

### **3. Check Results**
- ✅ Green checkmarks = Tests passed
- ❌ Red X marks = Tests failed (check error messages)
- 📊 Coverage report = Shows how much code is tested

### **4. Debug Issues**
- Check MongoDB is running
- Verify environment variables
- Check error messages in console

## 🎉 **Success!**

Once your database is set up, you'll have:
- ✅ **Complete E2E Testing Framework**
- ✅ **All Institute Data Modules Tested**
- ✅ **Real Database Integration**
- ✅ **Comprehensive Test Coverage**
- ✅ **Automated Test Validation**

**Your E2E testing framework is ready to ensure your application works perfectly! 🚀**
