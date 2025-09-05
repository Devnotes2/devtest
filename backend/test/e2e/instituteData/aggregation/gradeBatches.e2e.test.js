const request = require('supertest');
const app = require('../../../app');
const TestHelpers = require('../../../helpers/testHelpers');
const MockHelpers = require('../../../helpers/mockHelpers');
const DatabaseHelpers = require('../../../helpers/databaseHelpers');
const testData = require('../../../fixtures/testData');

describe('Grade Batches E2E Tests', () => {
  let authToken;
  let adminUser;
  let testInstitute;
  let createdInstitute;
  let createdGrade;
  let createdAcademicYear;

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

    // Create a test grade
    const gradeResponse = await request(app)
      .post('/grades')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        ...testData.grades.validGrade,
        instituteId: createdInstitute._id
      })
      .expect(201);
    
    createdGrade = gradeResponse.body.data.grade;

    // Create a test academic year
    const academicYearResponse = await request(app)
      .post('/academic-years')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        ...testData.academicYears.validAcademicYear,
        instituteId: createdInstitute._id
      })
      .expect(201);
    
    createdAcademicYear = academicYearResponse.body.data.academicYear;
  });

  afterEach(async () => {
    MockHelpers.resetAllMocks();
  });

  describe('Grade Batches CRUD Operations', () => {
    it('should create, read, update, and delete a grade batch', async () => {
      // CREATE: Create a new grade batch
      const gradeBatchData = {
        ...testData.gradeBatches.validGradeBatch,
        grade: createdGrade._id,
        academicYear: createdAcademicYear._id,
        instituteId: createdInstitute._id
      };

      const createResponse = await request(app)
        .post('/grade-batches')
        .set('Authorization', `Bearer ${authToken}`)
        .send(gradeBatchData)
        .expect(201);

      expect(createResponse.body.success).toBe(true);
      expect(createResponse.body.data.gradeBatch.name).toBe(gradeBatchData.name);
      expect(createResponse.body.data.gradeBatch.grade).toBe(createdGrade._id);
      expect(createResponse.body.data.gradeBatch.academicYear).toBe(createdAcademicYear._id);
      expect(createResponse.body.data.gradeBatch.instituteId).toBe(createdInstitute._id);

      const createdGradeBatch = createResponse.body.data.gradeBatch;

      // READ: Get the created grade batch
      const getResponse = await request(app)
        .get(`/grade-batches/${createdGradeBatch._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(getResponse.body.success).toBe(true);
      expect(getResponse.body.data.gradeBatch._id).toBe(createdGradeBatch._id);
      expect(getResponse.body.data.gradeBatch.name).toBe(gradeBatchData.name);

      // UPDATE: Update the grade batch
      const updateData = {
        name: 'Batch 2025',
        description: 'Updated batch description'
      };

      const updateResponse = await request(app)
        .put(`/grade-batches/${createdGradeBatch._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(updateResponse.body.success).toBe(true);
      expect(updateResponse.body.data.gradeBatch.name).toBe(updateData.name);
      expect(updateResponse.body.data.gradeBatch.description).toBe(updateData.description);

      // DELETE: Delete the grade batch
      const deleteResponse = await request(app)
        .delete(`/grade-batches/${createdGradeBatch._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(deleteResponse.body.success).toBe(true);

      // VERIFY: Ensure grade batch is deleted
      await request(app)
        .get(`/grade-batches/${createdGradeBatch._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should handle grade batch creation with invalid data', async () => {
      const invalidGradeBatchData = {
        ...testData.gradeBatches.invalidGradeBatch,
        grade: createdGrade._id,
        academicYear: createdAcademicYear._id,
        instituteId: createdInstitute._id
      };

      const response = await request(app)
        .post('/grade-batches')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidGradeBatchData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('Grade Batches Business Logic', () => {
    it('should prevent duplicate batch names within same grade and academic year', async () => {
      const gradeBatchData = {
        ...testData.gradeBatches.validGradeBatch,
        name: 'Batch 2024',
        grade: createdGrade._id,
        academicYear: createdAcademicYear._id,
        instituteId: createdInstitute._id
      };

      // Create first grade batch
      await request(app)
        .post('/grade-batches')
        .set('Authorization', `Bearer ${authToken}`)
        .send(gradeBatchData)
        .expect(201);

      // Try to create duplicate
      const duplicateResponse = await request(app)
        .post('/grade-batches')
        .set('Authorization', `Bearer ${authToken}`)
        .send(gradeBatchData)
        .expect(409);

      expect(duplicateResponse.body.success).toBe(false);
      expect(duplicateResponse.body.error).toContain('already exists');
    });

    it('should allow same batch name in different academic years', async () => {
      // Create second academic year
      const secondAcademicYearResponse = await request(app)
        .post('/academic-years')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          ...testData.academicYears.validAcademicYear,
          year: 2025,
          isCurrent: false,
          instituteId: createdInstitute._id
        })
        .expect(201);

      const secondAcademicYear = secondAcademicYearResponse.body.data.academicYear;

      const gradeBatchData = {
        ...testData.gradeBatches.validGradeBatch,
        name: 'Batch 2024',
        grade: createdGrade._id,
        academicYear: createdAcademicYear._id,
        instituteId: createdInstitute._id
      };

      // Create batch in first academic year
      await request(app)
        .post('/grade-batches')
        .set('Authorization', `Bearer ${authToken}`)
        .send(gradeBatchData)
        .expect(201);

      // Create same name batch in second academic year
      const secondBatchData = {
        ...gradeBatchData,
        academicYear: secondAcademicYear._id
      };

      const response = await request(app)
        .post('/grade-batches')
        .set('Authorization', `Bearer ${authToken}`)
        .send(secondBatchData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.gradeBatch.name).toBe('Batch 2024');
    });

    it('should validate batch date ranges', async () => {
      const invalidDateRangeBatch = {
        ...testData.gradeBatches.validGradeBatch,
        name: 'Invalid Batch',
        grade: createdGrade._id,
        academicYear: createdAcademicYear._id,
        startDate: new Date('2024-09-01'),
        endDate: new Date('2024-08-01'), // End date before start date
        instituteId: createdInstitute._id
      };

      const response = await request(app)
        .post('/grade-batches')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidDateRangeBatch)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('date');
    });
  });

  describe('Grade Batches Listing and Filtering', () => {
    beforeEach(async () => {
      // Create multiple grade batches for testing
      const gradeBatches = [
        { ...testData.gradeBatches.validGradeBatch, name: 'Batch A', grade: createdGrade._id, academicYear: createdAcademicYear._id, instituteId: createdInstitute._id },
        { ...testData.gradeBatches.validGradeBatch, name: 'Batch B', grade: createdGrade._id, academicYear: createdAcademicYear._id, instituteId: createdInstitute._id },
        { ...testData.gradeBatches.validGradeBatch, name: 'Batch C', grade: createdGrade._id, academicYear: createdAcademicYear._id, instituteId: createdInstitute._id }
      ];

      for (const batch of gradeBatches) {
        await request(app)
          .post('/grade-batches')
          .set('Authorization', `Bearer ${authToken}`)
          .send(batch)
          .expect(201);
      }
    });

    it('should list all grade batches with pagination', async () => {
      const response = await request(app)
        .get('/grade-batches')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.gradeBatches).toHaveLength(3);
      expect(response.body.data.pagination).toBeDefined();
    });

    it('should filter grade batches by institute', async () => {
      const response = await request(app)
        .get('/grade-batches')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ instituteId: createdInstitute._id })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.gradeBatches).toHaveLength(3);
      response.body.data.gradeBatches.forEach(batch => {
        expect(batch.instituteId).toBe(createdInstitute._id);
      });
    });

    it('should filter grade batches by grade', async () => {
      const response = await request(app)
        .get('/grade-batches')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ 
          instituteId: createdInstitute._id,
          grade: createdGrade._id
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.gradeBatches).toHaveLength(3);
      response.body.data.gradeBatches.forEach(batch => {
        expect(batch.grade).toBe(createdGrade._id);
      });
    });

    it('should filter grade batches by academic year', async () => {
      const response = await request(app)
        .get('/grade-batches')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ 
          instituteId: createdInstitute._id,
          academicYear: createdAcademicYear._id
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.gradeBatches).toHaveLength(3);
      response.body.data.gradeBatches.forEach(batch => {
        expect(batch.academicYear).toBe(createdAcademicYear._id);
      });
    });

    it('should search grade batches by name', async () => {
      const response = await request(app)
        .get('/grade-batches')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ search: 'Batch A' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.gradeBatches).toHaveLength(1);
      expect(response.body.data.gradeBatches[0].name).toBe('Batch A');
    });

    it('should sort grade batches by name', async () => {
      const response = await request(app)
        .get('/grade-batches')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ 
          instituteId: createdInstitute._id,
          sortBy: 'name',
          sortOrder: 'asc'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.gradeBatches).toHaveLength(3);
      
      // Verify sorting
      for (let i = 1; i < response.body.data.gradeBatches.length; i++) {
        expect(response.body.data.gradeBatches[i].name.localeCompare(
          response.body.data.gradeBatches[i-1].name
        )).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe('Grade Batches Error Handling', () => {
    it('should handle non-existent grade batch ID', async () => {
      const nonExistentId = '507f1f77bcf86cd799439999';

      const response = await request(app)
        .get(`/grade-batches/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('not found');
    });

    it('should handle invalid grade batch ID format', async () => {
      const invalidId = 'invalid-id';

      const response = await request(app)
        .get(`/grade-batches/${invalidId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid ID format');
    });

    it('should handle grade batch operations without authentication', async () => {
      const gradeBatchData = {
        ...testData.gradeBatches.validGradeBatch,
        grade: createdGrade._id,
        academicYear: createdAcademicYear._id,
        instituteId: createdInstitute._id
      };

      const response = await request(app)
        .post('/grade-batches')
        .send(gradeBatchData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('token');
    });
  });
});
