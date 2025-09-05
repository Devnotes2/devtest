# E2E Testing Guide - Complete User Workflows

## 🎯 **What is E2E Testing?**

End-to-End (E2E) testing simulates real user scenarios by testing complete workflows from start to finish. Our E2E tests:

- ✅ **Test Complete User Journeys** - From login to complex operations
- ✅ **Use Real Database** - No mocks, real data persistence
- ✅ **Test Business Logic** - Full application behavior
- ✅ **Test Data Relationships** - How modules interact with each other
- ✅ **Test Performance** - Real-world scenarios under load

## 📁 **Test Structure (Matches Your Dev Structure)**

```
test/e2e/
├── instituteData/                    # Matches Controller/instituteData/
│   ├── institutes.e2e.test.js       # Matches institutesCt.js
│   ├── departments.e2e.test.js      # Matches departmentCt.js
│   ├── academicYear.e2e.test.js     # Matches academicYearCt.js
│   └── aggregation/                 # Matches Controller/instituteData/aggregation/
│       ├── grades.e2e.test.js       # Matches gradesCt.js
│       ├── subjects.e2e.test.js     # Matches subjectsCt.js
│       ├── gradeSections.e2e.test.js # Matches gradeSectionsCt.js
│       ├── gradeBatches.e2e.test.js # Matches gradeBatchesCt.js
│       ├── gradeSectionBatches.e2e.test.js # Matches gradeSectionBatchesCt.js
│       └── locationTypesInInstitute.e2e.test.js # Matches locationTypesInInstituteCt.js
```

## 🚀 **How to Run E2E Tests**

### **1. Run All E2E Tests**
```bash
npm test
# or
npm run test:e2e
```

### **2. Run Specific Module Tests**
```bash
# All institute data tests
npm run test:institute

# Only aggregation module tests
npm run test:aggregation

# Specific test file
npm test -- institutes.e2e.test.js
npm test -- departments.e2e.test.js
npm test -- grades.e2e.test.js
```

### **3. Run with Coverage**
```bash
npm run test:coverage
```

### **4. Run in Watch Mode**
```bash
npm run test:watch
```

## 🧪 **What Each E2E Test Covers**

### **Institutes E2E Tests** (`institutes.e2e.test.js`)
- ✅ Complete institute setup workflow
- ✅ Institute deletion cascade
- ✅ Data integrity across entities
- ✅ Concurrent operations
- ✅ Performance with large datasets

### **Departments E2E Tests** (`departments.e2e.test.js`)
- ✅ CRUD operations (Create, Read, Update, Delete)
- ✅ Business logic validation
- ✅ Duplicate prevention within institute
- ✅ Cross-institute operations
- ✅ Listing and filtering
- ✅ Error handling

### **Academic Year E2E Tests** (`academicYear.e2e.test.js`)
- ✅ CRUD operations
- ✅ Current academic year logic
- ✅ Date range validation
- ✅ Duplicate prevention
- ✅ Year-based filtering
- ✅ Error handling

### **Grades E2E Tests** (`grades.e2e.test.js`)
- ✅ CRUD operations
- ✅ Grade level validation
- ✅ Duplicate prevention
- ✅ Level-based filtering and sorting
- ✅ Cross-institute operations
- ✅ Error handling

### **Subjects E2E Tests** (`subjects.e2e.test.js`)
- ✅ CRUD operations
- ✅ Subject code validation
- ✅ Credits and type validation
- ✅ Type-based filtering
- ✅ Credits range filtering
- ✅ Error handling

### **Grade Sections E2E Tests** (`gradeSections.e2e.test.js`)
- ✅ CRUD operations
- ✅ Capacity validation
- ✅ Section name uniqueness within grade
- ✅ Grade-based filtering
- ✅ Capacity range filtering
- ✅ Error handling

### **Grade Batches E2E Tests** (`gradeBatches.e2e.test.js`)
- ✅ CRUD operations
- ✅ Date range validation
- ✅ Batch name uniqueness within grade/year
- ✅ Academic year filtering
- ✅ Date range filtering
- ✅ Error handling

### **Grade Section Batches E2E Tests** (`gradeSectionBatches.e2e.test.js`)
- ✅ CRUD operations
- ✅ Cross-entity validation
- ✅ Institute consistency checks
- ✅ Complex relationship testing
- ✅ Error handling

### **Location Types E2E Tests** (`locationTypesInInstitute.e2e.test.js`)
- ✅ CRUD operations
- ✅ Capacity and type validation
- ✅ Type-based filtering
- ✅ Capacity range filtering
- ✅ Sorting by multiple fields
- ✅ Error handling

## 🔍 **Understanding E2E Test Results**

### **✅ Success Output**
```
✅ PASS test/e2e/instituteData/institutes.e2e.test.js
✅ PASS test/e2e/instituteData/departments.e2e.test.js
✅ PASS test/e2e/instituteData/aggregation/grades.e2e.test.js

Test Suites: 8 passed, 8 total
Tests: 45 passed, 45 total
Time: 25.234s
```

### **❌ Failure Output**
```
❌ FAIL test/e2e/instituteData/departments.e2e.test.js
  Departments E2E Tests
    Department CRUD Operations
      ✗ should create, read, update, and delete a department

    Expected: 201
    Received: 400

    Error: Validation failed: name is required
```

## 🎯 **E2E Test Patterns**

### **1. Complete CRUD Workflow**
```javascript
it('should create, read, update, and delete a department', async () => {
  // CREATE
  const createResponse = await request(app)
    .post('/departments')
    .set('Authorization', `Bearer ${authToken}`)
    .send(departmentData)
    .expect(201);

  const createdDepartment = createResponse.body.data.department;

  // READ
  const getResponse = await request(app)
    .get(`/departments/${createdDepartment._id}`)
    .set('Authorization', `Bearer ${authToken}`)
    .expect(200);

  // UPDATE
  const updateResponse = await request(app)
    .put(`/departments/${createdDepartment._id}`)
    .set('Authorization', `Bearer ${authToken}`)
    .send(updateData)
    .expect(200);

  // DELETE
  const deleteResponse = await request(app)
    .delete(`/departments/${createdDepartment._id}`)
    .set('Authorization', `Bearer ${authToken}`)
    .expect(200);

  // VERIFY DELETION
  await request(app)
    .get(`/departments/${createdDepartment._id}`)
    .set('Authorization', `Bearer ${authToken}`)
    .expect(404);
});
```

### **2. Business Logic Testing**
```javascript
it('should prevent duplicate department names within same institute', async () => {
  // Create first department
  await request(app)
    .post('/departments')
    .set('Authorization', `Bearer ${authToken}`)
    .send(departmentData)
    .expect(201);

  // Try to create duplicate
  const duplicateResponse = await request(app)
    .post('/departments')
    .set('Authorization', `Bearer ${authToken}`)
    .send(departmentData)
    .expect(409);

  expect(duplicateResponse.body.error).toContain('already exists');
});
```

### **3. Complex Workflow Testing**
```javascript
it('should complete full institute setup workflow', async () => {
  // Step 1: Create Institute
  const instituteResponse = await request(app)
    .post('/institutes')
    .set('Authorization', `Bearer ${authToken}`)
    .send(instituteData)
    .expect(201);

  // Step 2: Create Department
  const departmentResponse = await request(app)
    .post('/departments')
    .set('Authorization', `Bearer ${authToken}`)
    .send({ ...departmentData, instituteId: instituteResponse.body.data.institute._id })
    .expect(201);

  // Step 3: Create Grade
  const gradeResponse = await request(app)
    .post('/grades')
    .set('Authorization', `Bearer ${authToken}`)
    .send({ ...gradeData, instituteId: instituteResponse.body.data.institute._id })
    .expect(201);

  // Step 4: Create Subject
  // ... and so on through complete workflow
});
```

## 🛠️ **E2E Test Setup & Teardown**

### **Database Management**
```javascript
beforeAll(async () => {
  // Connect to test database
  await DatabaseHelpers.connectToTestDatabase();
});

afterAll(async () => {
  // Disconnect from test database
  await DatabaseHelpers.disconnectFromTestDatabase();
});

beforeEach(async () => {
  // Clear test database for each test
  await DatabaseHelpers.clearTestDatabase();
  
  // Setup fresh test data
  adminUser = MockHelpers.createMockUser({ role: 'admin' });
  authToken = TestHelpers.generateAuthToken(adminUser);
});
```

### **Authentication Setup**
```javascript
beforeEach(async () => {
  // Create admin user and token
  adminUser = MockHelpers.createMockUser({ role: 'admin' });
  authToken = TestHelpers.generateAuthToken(adminUser);
});

// Use in tests
.set('Authorization', `Bearer ${authToken}`)
```

## 📊 **Coverage & Quality**

### **Coverage Thresholds**
- **Statements**: 40% minimum
- **Branches**: 40% minimum  
- **Functions**: 40% minimum
- **Lines**: 40% minimum

### **Coverage Report**
After running `npm run test:coverage`, check:
```
📁 coverage/
├── lcov-report/
│   └── index.html          # Open in browser for detailed coverage
├── lcov.info              # Coverage data file
└── clover.xml             # Coverage in XML format
```

## 🎯 **Best Practices for E2E Testing**

### **1. Test Complete Workflows**
- Don't just test individual endpoints
- Test how modules work together
- Test real user scenarios

### **2. Use Real Data**
- No mocks for database operations
- Use realistic test data
- Test with actual data relationships

### **3. Test Business Logic**
- Test validation rules
- Test duplicate prevention
- Test data integrity

### **4. Test Error Scenarios**
- Test invalid data
- Test missing authentication
- Test non-existent resources

### **5. Clean Up After Tests**
- Clear database between tests
- Reset mocks
- Ensure test isolation

## 🚦 **Getting Started with E2E Testing**

### **1. Run Your First Test**
```bash
npm test -- institutes.e2e.test.js
```

### **2. Check Test Results**
Look for:
- ✅ Green checkmarks for passed tests
- ❌ Red X marks for failed tests
- Error messages for debugging

### **3. Run with Coverage**
```bash
npm run test:coverage
```

### **4. Debug Failed Tests**
- Check error messages
- Verify test data
- Check database connections
- Review authentication setup

## 🎉 **Success!**

Your E2E testing framework is now ready to:
- ✅ **Test Complete Workflows** from start to finish
- ✅ **Validate Business Logic** with real data
- ✅ **Ensure Data Integrity** across modules
- ✅ **Test Performance** under realistic conditions
- ✅ **Catch Integration Issues** before production

**Happy E2E Testing! 🚀**
