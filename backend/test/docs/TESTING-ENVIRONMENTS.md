# 🧪 Testing Environments Guide

## 🎯 Environment-Based Testing Setup

You now have separate configurations for **Development** and **Production** testing environments.

## 📁 Environment Files

### **Development Environment** (`environments/dev-environment.json`)
- **Base URL**: `http://svb.local:8000`
- **Iteration Delay**: 5 seconds (fast for dev testing)
- **Max Iterations**: 2
- **Timeout**: 10 seconds
- **Purpose**: Quick testing during development

### **Production Environment** (`environments/prod-environment.json`)
- **Base URL**: `https://devtest2.onrender.com` (update this)
- **Iteration Delay**: 1 minute (consistent timing)
- **Max Iterations**: 2 (quick and efficient)
- **Timeout**: 30 seconds (production network considerations)
- **Purpose**: Comprehensive production monitoring

## 🚀 Available Commands

### **Development Testing**
```bash
# Run health check tests against development environment
npm run test:health:dev

# Generates: test-reports/health-check-dev-report.html
```

### **Production Testing**
```bash
# Run health check tests against production environment
npm run test:health:prod

# Generates: test-reports/health-check-prod-report.html
```

### **Default Testing** (uses collection defaults)
```bash
# Run with default settings
npm run test:health

# Generates: test-reports/health-check-report.html
```

## ⚙️ Configuration Differences

| Setting | Development | Production |
|---------|-------------|------------|
| **Base URL** | `localhost:8000` | `your-production-api.com` |
| **Iteration Delay** | 5 seconds | 1 minute |
| **Max Iterations** | 2 | 2 |
| **Timeout** | 10 seconds | 30 seconds |
| **Purpose** | Quick dev testing | Production monitoring |

## 🔧 Customization

### **Update Production URL**
Edit `environments/prod-environment.json`:
```json
{
  "key": "baseUrl",
  "value": "https://your-actual-production-url.com"
}
```

### **Adjust Timing**
- **Dev**: Change `iterationDelay` to `"15000"` for 15-second intervals
- **Prod**: Change `iterationDelay` to `"600000"` for 10-minute intervals

### **Add More Environments**
Create new environment files like:
- `environments/staging-environment.json`
- `environments/qa-environment.json`

## 🎯 Usage Examples

### **During Development**
```bash
# Quick health check every 5 seconds
npm run test:health:dev
```

### **Production Monitoring**
```bash
# Comprehensive production health check every 1 minute
npm run test:health:prod
```

### **CI/CD Integration**
```bash
# In your CI/CD pipeline
npm run test:health:prod
```

## 📊 Report Outputs

Each environment generates separate reports:
- **Dev**: `test-reports/health-check-dev-report.html`
- **Prod**: `test-reports/health-check-prod-report.html`
- **Default**: `test-reports/health-check-report.html`

## 🎉 Benefits

- ✅ **Environment Isolation**: Separate configs for dev/prod
- ✅ **Flexible Timing**: Different intervals for different needs
- ✅ **Easy Switching**: Simple npm commands
- ✅ **Separate Reports**: Environment-specific results
- ✅ **CI/CD Ready**: Easy integration with build pipelines

Your testing setup now supports both development and production environments with appropriate configurations for each! 🚀
