# 🧪 Standalone API Test Suite

## 🎯 Purpose
This is a **standalone test suite** that can run **independently** of the backend server. Perfect for:
- **CI/CD pipelines**
- **Monitoring services**
- **Separate test deployments**
- **Production health monitoring**

## 🚀 Quick Start

### **Option 1: Run from Backend Directory**
```bash
# From backend/ directory
yarn test          # Test production APIs
npm run test:dev   # Test development APIs
```

### **Option 2: Run as Standalone**
```bash
# Navigate to test directory
cd test/

# Install dependencies (first time only)
npm run install-deps

# Run tests
npm test           # Test production APIs
npm run test:dev   # Test development APIs
```

## 📊 What It Tests

### **Health Check Tests**
- ✅ **API Availability** - Server responding
- ✅ **Response Time** - Performance monitoring
- ✅ **JSON Validation** - Response format
- ✅ **Status Codes** - HTTP status validation

### **Test Configuration**
- **Production**: 2 iterations, 1-minute delays
- **Development**: 2 iterations, 5-second delays
- **Reports**: Timestamped HTML reports with HTMLExtra

## 🎯 Use Cases

### **1. Render Deployment Testing**
```bash
# In your Render build command
yarn test
```

### **2. CI/CD Pipeline**
```bash
# In your GitHub Actions, etc.
npm run test:prod
```

### **3. Monitoring Service**
```bash
# Cron job or monitoring service
node test/standalone-test-runner.js health-check prod
```

### **4. Local Development**
```bash
# Test against your local server
npm run test:dev
```

## 📁 Structure
```
test/
├── standalone-test-runner.js    # Main test runner
├── package.json                 # Standalone dependencies
├── collections/                 # Test collections
├── environments/               # Environment configs
├── reports/                    # Generated reports
└── README.md                   # This file
```

## 🔧 Configuration

### **Production Environment**
- **URL**: `https://devtest2.onrender.com`
- **Iterations**: 2
- **Delay**: 1 minute

### **Development Environment**
- **URL**: `http://svb.local:8000`
- **Iterations**: 2
- **Delay**: 5 seconds

## 📊 Reports
Reports are automatically timestamped:
- `health-check-prod-standalone-1-2025-09-06-18-30-15.html`
- `health-check-prod-standalone-2-2025-09-06-18-31-15.html`

## 🎉 Benefits
- ✅ **Independent** - No backend server needed
- ✅ **Lightweight** - Minimal dependencies
- ✅ **Flexible** - Works in any environment
- ✅ **Reliable** - Proper error handling
- ✅ **Scalable** - Easy to add more tests