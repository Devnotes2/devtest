const request = require('supertest');
const app = require('../../app');
const TestHelpers = require('../../helpers/testHelpers');
const MockHelpers = require('../../helpers/mockHelpers');
const DatabaseHelpers = require('../../helpers/databaseHelpers');
const testData = require('../../fixtures/testData');

describe('Departments E2E Tests', () => {
  let authToken;
  let adminUser;
  let testInstitute;
  let createdInstitute;

  beforeAll(async () => {
    // Connect to test database
    await DatabaseHelpers.connectToTestDatabase();
  });

  afterAll(async () => {
    // Disconnect from test database
    await DatabaseHelpers.disconnectFromTestDatabase();
  });

  beforeEach(async () => {
    // Clear test database
    await DatabaseHelpers.clearTestDatabase();
    
    // Setup admin user
    adminUser = MockHelpers.createMockUser({ role: 'admin' });
    authToken = TestHelpers.generateAuthToken(adminUser);
    
    // Create a test institute first (departments need an institute)
    const instituteResponse = await request(app)
      .post('/institutes')
      .set('Authorization', `Bearer ${authToken}`)
      .send(testData.institutes.validInstitute)
      .expect(201);
    
    createdInstitute = instituteResponse.body.data.institute;
  });

  afterEach(async () => {
    MockHelpers.resetAllMocks();
  });

  describe('Department CRUD Operations', () => {
    it('should create, read, update, and delete a department', async () => {
      // CREATE: Create a new department
      const departmentData = {
        ...testData.departments.validDepartment,
        instituteId: createdInstitute._id
      };

      const createResponse = await request(app)
        .post('/departments')
        .set('Authorization', `Bearer ${authToken}`)
        .send(departmentData)
        .expect(201);

      expect(createResponse.body.success).toBe(true);
      expect(createResponse.body.data.department.name).toBe(departmentData.name);
      expect(createResponse.body.data.department.instituteId).toBe(createdInstitute._id);

      const createdDepartment = createResponse.body.data.department;

      // READ: Get the created department
      const getResponse = await request(app)
        .get(`/departments/${createdDepartment._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(getResponse.body.success).toBe(true);
      expect(getResponse.body.data.department._id).toBe(createdDepartment._id);
      expect(getResponse.body.data.department.name).toBe(departmentData.name);

      // UPDATE: Update the department
      const updateData = {
        name: 'Updated Computer Science Department',
        description: 'Updated description for CS department'
      };

      const updateResponse = await request(app)
        .put(`/departments/${createdDepartment._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(updateResponse.body.success).toBe(true);
      expect(updateResponse.body.data.department.name).toBe(updateData.name);
      expect(updateResponse.body.data.department.description).toBe(updateData.description);

      // DELETE: Delete the department
      const deleteResponse = await request(app)
        .delete(`/departments/${createdDepartment._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(deleteResponse.body.success).toBe(true);

      // VERIFY: Ensure department is deleted
      await request(app)
        .get(`/departments/${createdDepartment._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should handle department creation with invalid data', async () => {
      const invalidDepartmentData = {
        ...testData.departments.invalidDepartment,
        instituteId: createdInstitute._id
      };

      const response = await request(app)
        .post('/departments')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidDepartmentData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });

    it('should handle department creation without authentication', async () => {
      const departmentData = {
        ...testData.departments.validDepartment,
        instituteId: createdInstitute._id
      };

      const response = await request(app)
        .post('/departments')
        .send(departmentData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('token');
    });
  });

  describe('Department Listing and Filtering', () => {
    beforeEach(async () => {
      // Create multiple departments for testing
      const departments = [
        { ...testData.departments.validDepartment, name: 'Computer Science', instituteId: createdInstitute._id },
        { ...testData.departments.validDepartment, name: 'Mathematics', instituteId: createdInstitute._id },
        { ...testData.departments.validDepartment, name: 'Physics', instituteId: createdInstitute._id }
      ];

      for (const dept of departments) {
        await request(app)
          .post('/departments')
          .set('Authorization', `Bearer ${authToken}`)
          .send(dept)
          .expect(201);
      }
    });

    it('should list all departments with pagination', async () => {
      const response = await request(app)
        .get('/departments')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.departments).toHaveLength(3);
      expect(response.body.data.pagination).toBeDefined();
      expect(response.body.data.pagination.page).toBe(1);
      expect(response.body.data.pagination.limit).toBe(10);
    });

    it('should filter departments by institute', async () => {
      const response = await request(app)
        .get('/departments')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ instituteId: createdInstitute._id })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.departments).toHaveLength(3);
      response.body.data.departments.forEach(dept => {
        expect(dept.instituteId).toBe(createdInstitute._id);
      });
    });

    it('should search departments by name', async () => {
      const response = await request(app)
        .get('/departments')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ search: 'Computer' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.departments).toHaveLength(1);
      expect(response.body.data.departments[0].name).toContain('Computer');
    });
  });

  describe('Department Business Logic', () => {
    it('should prevent duplicate department names within same institute', async () => {
      const departmentData = {
        ...testData.departments.validDepartment,
        name: 'Unique Department',
        instituteId: createdInstitute._id
      };

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

      expect(duplicateResponse.body.success).toBe(false);
      expect(duplicateResponse.body.error).toContain('already exists');
    });

    it('should allow same department name in different institutes', async () => {
      // Create second institute
      const secondInstituteResponse = await request(app)
        .post('/institutes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          ...testData.institutes.validInstitute,
          name: 'Second Institute'
        })
        .expect(201);

      const secondInstitute = secondInstituteResponse.body.data.institute;

      const departmentData = {
        ...testData.departments.validDepartment,
        name: 'Same Department Name',
        instituteId: createdInstitute._id
      };

      // Create department in first institute
      await request(app)
        .post('/departments')
        .set('Authorization', `Bearer ${authToken}`)
        .send(departmentData)
        .expect(201);

      // Create same name department in second institute
      const secondDeptData = {
        ...departmentData,
        instituteId: secondInstitute._id
      };

      const response = await request(app)
        .post('/departments')
        .set('Authorization', `Bearer ${authToken}`)
        .send(secondDeptData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.department.name).toBe('Same Department Name');
    });
  });

  describe('Department Error Handling', () => {
    it('should handle non-existent department ID', async () => {
      const nonExistentId = '507f1f77bcf86cd799439999';

      const response = await request(app)
        .get(`/departments/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('not found');
    });

    it('should handle invalid department ID format', async () => {
      const invalidId = 'invalid-id';

      const response = await request(app)
        .get(`/departments/${invalidId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid ID format');
    });

    it('should handle department deletion with dependencies', async () => {
      // Create department
      const departmentData = {
        ...testData.departments.validDepartment,
        instituteId: createdInstitute._id
      };

      const createResponse = await request(app)
        .post('/departments')
        .set('Authorization', `Bearer ${authToken}`)
        .send(departmentData)
        .expect(201);

      const createdDepartment = createResponse.body.data.department;

      // Try to delete department (should work as no dependencies in this test)
      const deleteResponse = await request(app)
        .delete(`/departments/${createdDepartment._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(deleteResponse.body.success).toBe(true);
    });
  });
});
