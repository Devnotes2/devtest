const request = require('supertest');
const app = require('../../../app');
const TestHelpers = require('../../../helpers/testHelpers');
const MockHelpers = require('../../../helpers/mockHelpers');
const DatabaseHelpers = require('../../../helpers/databaseHelpers');
const testData = require('../../../fixtures/testData');

describe('Grades E2E Tests', () => {
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
    
    // Create a test institute first
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

  describe('Grades CRUD Operations', () => {
    it('should create, read, update, and delete a grade', async () => {
      // CREATE: Create a new grade
      const gradeData = {
        ...testData.grades.validGrade,
        instituteId: createdInstitute._id
      };

      const createResponse = await request(app)
        .post('/grades')
        .set('Authorization', `Bearer ${authToken}`)
        .send(gradeData)
        .expect(201);

      expect(createResponse.body.success).toBe(true);
      expect(createResponse.body.data.grade.name).toBe(gradeData.name);
      expect(createResponse.body.data.grade.instituteId).toBe(createdInstitute._id);

      const createdGrade = createResponse.body.data.grade;

      // READ: Get the created grade
      const getResponse = await request(app)
        .get(`/grades/${createdGrade._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(getResponse.body.success).toBe(true);
      expect(getResponse.body.data.grade._id).toBe(createdGrade._id);
      expect(getResponse.body.data.grade.name).toBe(gradeData.name);

      // UPDATE: Update the grade
      const updateData = {
        name: 'Updated Grade 11',
        description: 'Updated description for Grade 11'
      };

      const updateResponse = await request(app)
        .put(`/grades/${createdGrade._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(updateResponse.body.success).toBe(true);
      expect(updateResponse.body.data.grade.name).toBe(updateData.name);
      expect(updateResponse.body.data.grade.description).toBe(updateData.description);

      // DELETE: Delete the grade
      const deleteResponse = await request(app)
        .delete(`/grades/${createdGrade._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(deleteResponse.body.success).toBe(true);

      // VERIFY: Ensure grade is deleted
      await request(app)
        .get(`/grades/${createdGrade._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should handle grade creation with invalid data', async () => {
      const invalidGradeData = {
        ...testData.grades.invalidGrade,
        instituteId: createdInstitute._id
      };

      const response = await request(app)
        .post('/grades')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidGradeData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('Grades Business Logic', () => {
    it('should prevent duplicate grade names within same institute', async () => {
      const gradeData = {
        ...testData.grades.validGrade,
        name: 'Grade 10',
        instituteId: createdInstitute._id
      };

      // Create first grade
      await request(app)
        .post('/grades')
        .set('Authorization', `Bearer ${authToken}`)
        .send(gradeData)
        .expect(201);

      // Try to create duplicate
      const duplicateResponse = await request(app)
        .post('/grades')
        .set('Authorization', `Bearer ${authToken}`)
        .send(gradeData)
        .expect(409);

      expect(duplicateResponse.body.success).toBe(false);
      expect(duplicateResponse.body.error).toContain('already exists');
    });

    it('should allow same grade name in different institutes', async () => {
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

      const gradeData = {
        ...testData.grades.validGrade,
        name: 'Grade 10',
        instituteId: createdInstitute._id
      };

      // Create grade in first institute
      await request(app)
        .post('/grades')
        .set('Authorization', `Bearer ${authToken}`)
        .send(gradeData)
        .expect(201);

      // Create same name grade in second institute
      const secondGradeData = {
        ...gradeData,
        instituteId: secondInstitute._id
      };

      const response = await request(app)
        .post('/grades')
        .set('Authorization', `Bearer ${authToken}`)
        .send(secondGradeData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.grade.name).toBe('Grade 10');
    });

    it('should validate grade level constraints', async () => {
      const invalidLevelGrade = {
        ...testData.grades.validGrade,
        name: 'Grade 15',
        level: 15, // Invalid level (should be 1-12)
        instituteId: createdInstitute._id
      };

      const response = await request(app)
        .post('/grades')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidLevelGrade)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('level');
    });
  });

  describe('Grades Listing and Filtering', () => {
    beforeEach(async () => {
      // Create multiple grades for testing
      const grades = [
        { ...testData.grades.validGrade, name: 'Grade 9', level: 9, instituteId: createdInstitute._id },
        { ...testData.grades.validGrade, name: 'Grade 10', level: 10, instituteId: createdInstitute._id },
        { ...testData.grades.validGrade, name: 'Grade 11', level: 11, instituteId: createdInstitute._id },
        { ...testData.grades.validGrade, name: 'Grade 12', level: 12, instituteId: createdInstitute._id }
      ];

      for (const grade of grades) {
        await request(app)
          .post('/grades')
          .set('Authorization', `Bearer ${authToken}`)
          .send(grade)
          .expect(201);
      }
    });

    it('should list all grades with pagination', async () => {
      const response = await request(app)
        .get('/grades')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.grades).toHaveLength(4);
      expect(response.body.data.pagination).toBeDefined();
    });

    it('should filter grades by institute', async () => {
      const response = await request(app)
        .get('/grades')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ instituteId: createdInstitute._id })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.grades).toHaveLength(4);
      response.body.data.grades.forEach(grade => {
        expect(grade.instituteId).toBe(createdInstitute._id);
      });
    });

    it('should search grades by name', async () => {
      const response = await request(app)
        .get('/grades')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ search: 'Grade 10' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.grades).toHaveLength(1);
      expect(response.body.data.grades[0].name).toBe('Grade 10');
    });

    it('should filter grades by level range', async () => {
      const response = await request(app)
        .get('/grades')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ 
          instituteId: createdInstitute._id,
          levelFrom: 10,
          levelTo: 12
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.grades).toHaveLength(3);
      response.body.data.grades.forEach(grade => {
        expect(grade.level).toBeGreaterThanOrEqual(10);
        expect(grade.level).toBeLessThanOrEqual(12);
      });
    });

    it('should sort grades by level', async () => {
      const response = await request(app)
        .get('/grades')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ 
          instituteId: createdInstitute._id,
          sortBy: 'level',
          sortOrder: 'asc'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.grades).toHaveLength(4);
      
      // Verify sorting
      for (let i = 1; i < response.body.data.grades.length; i++) {
        expect(response.body.data.grades[i].level).toBeGreaterThanOrEqual(
          response.body.data.grades[i-1].level
        );
      }
    });
  });

  describe('Grades Error Handling', () => {
    it('should handle non-existent grade ID', async () => {
      const nonExistentId = '507f1f77bcf86cd799439999';

      const response = await request(app)
        .get(`/grades/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('not found');
    });

    it('should handle invalid grade ID format', async () => {
      const invalidId = 'invalid-id';

      const response = await request(app)
        .get(`/grades/${invalidId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid ID format');
    });

    it('should handle grade operations without authentication', async () => {
      const gradeData = {
        ...testData.grades.validGrade,
        instituteId: createdInstitute._id
      };

      const response = await request(app)
        .post('/grades')
        .send(gradeData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('token');
    });
  });
});
