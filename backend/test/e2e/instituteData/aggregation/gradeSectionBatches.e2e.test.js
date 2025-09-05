const request = require('supertest');
const app = require('../../../app');
const TestHelpers = require('../../../helpers/testHelpers');
const MockHelpers = require('../../../helpers/mockHelpers');
const DatabaseHelpers = require('../../../helpers/databaseHelpers');
const testData = require('../../../fixtures/testData');

describe('Grade Section Batches E2E Tests', () => {
  let authToken;
  let adminUser;
  let testInstitute;
  let createdInstitute;
  let createdGrade;
  let createdGradeSection;
  let createdGradeBatch;

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

    // Create a test grade section
    const gradeSectionResponse = await request(app)
      .post('/grade-sections')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        ...testData.gradeSections.validGradeSection,
        grade: createdGrade._id,
        instituteId: createdInstitute._id
      })
      .expect(201);
    
    createdGradeSection = gradeSectionResponse.body.data.gradeSection;

    // Create a test grade batch
    const gradeBatchResponse = await request(app)
      .post('/grade-batches')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        ...testData.gradeBatches.validGradeBatch,
        grade: createdGrade._id,
        instituteId: createdInstitute._id
      })
      .expect(201);
    
    createdGradeBatch = gradeBatchResponse.body.data.gradeBatch;
  });

  afterEach(async () => {
    MockHelpers.resetAllMocks();
  });

  describe('Grade Section Batches CRUD Operations', () => {
    it('should create, read, update, and delete a grade section batch', async () => {
      // CREATE: Create a new grade section batch
      const gradeSectionBatchData = {
        ...testData.gradeSectionBatches.validGradeSectionBatch,
        gradeSectionId: createdGradeSection._id,
        batchId: createdGradeBatch._id,
        instituteId: createdInstitute._id
      };

      const createResponse = await request(app)
        .post('/grade-section-batches')
        .set('Authorization', `Bearer ${authToken}`)
        .send(gradeSectionBatchData)
        .expect(201);

      expect(createResponse.body.success).toBe(true);
      expect(createResponse.body.data.gradeSectionBatch.gradeSectionId).toBe(createdGradeSection._id);
      expect(createResponse.body.data.gradeSectionBatch.batchId).toBe(createdGradeBatch._id);
      expect(createResponse.body.data.gradeSectionBatch.instituteId).toBe(createdInstitute._id);

      const createdGradeSectionBatch = createResponse.body.data.gradeSectionBatch;

      // READ: Get the created grade section batch
      const getResponse = await request(app)
        .get(`/grade-section-batches/${createdGradeSectionBatch._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(getResponse.body.success).toBe(true);
      expect(getResponse.body.data.gradeSectionBatch._id).toBe(createdGradeSectionBatch._id);
      expect(getResponse.body.data.gradeSectionBatch.gradeSectionId).toBe(createdGradeSection._id);

      // UPDATE: Update the grade section batch
      const updateData = {
        description: 'Updated grade section batch description'
      };

      const updateResponse = await request(app)
        .put(`/grade-section-batches/${createdGradeSectionBatch._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(updateResponse.body.success).toBe(true);
      expect(updateResponse.body.data.gradeSectionBatch.description).toBe(updateData.description);

      // DELETE: Delete the grade section batch
      const deleteResponse = await request(app)
        .delete(`/grade-section-batches/${createdGradeSectionBatch._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(deleteResponse.body.success).toBe(true);

      // VERIFY: Ensure grade section batch is deleted
      await request(app)
        .get(`/grade-section-batches/${createdGradeSectionBatch._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should handle grade section batch creation with invalid data', async () => {
      const invalidGradeSectionBatchData = {
        ...testData.gradeSectionBatches.invalidGradeSectionBatch,
        gradeSectionId: createdGradeSection._id,
        batchId: createdGradeBatch._id,
        instituteId: createdInstitute._id
      };

      const response = await request(app)
        .post('/grade-section-batches')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidGradeSectionBatchData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('Grade Section Batches Business Logic', () => {
    it('should prevent duplicate grade section batch combinations', async () => {
      const gradeSectionBatchData = {
        ...testData.gradeSectionBatches.validGradeSectionBatch,
        gradeSectionId: createdGradeSection._id,
        batchId: createdGradeBatch._id,
        instituteId: createdInstitute._id
      };

      // Create first grade section batch
      await request(app)
        .post('/grade-section-batches')
        .set('Authorization', `Bearer ${authToken}`)
        .send(gradeSectionBatchData)
        .expect(201);

      // Try to create duplicate
      const duplicateResponse = await request(app)
        .post('/grade-section-batches')
        .set('Authorization', `Bearer ${authToken}`)
        .send(gradeSectionBatchData)
        .expect(409);

      expect(duplicateResponse.body.success).toBe(false);
      expect(duplicateResponse.body.error).toContain('already exists');
    });

    it('should validate grade section batch date ranges', async () => {
      const invalidDateRangeBatch = {
        ...testData.gradeSectionBatches.validGradeSectionBatch,
        gradeSectionId: createdGradeSection._id,
        batchId: createdGradeBatch._id,
        startDate: new Date('2024-09-01'),
        endDate: new Date('2024-08-01'), // End date before start date
        instituteId: createdInstitute._id
      };

      const response = await request(app)
        .post('/grade-section-batches')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidDateRangeBatch)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('date');
    });

    it('should validate grade section and batch belong to same institute', async () => {
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

      // Create grade section in second institute
      const secondGradeResponse = await request(app)
        .post('/grades')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          ...testData.grades.validGrade,
          name: 'Grade 11',
          level: 11,
          instituteId: secondInstitute._id
        })
        .expect(201);

      const secondGrade = secondGradeResponse.body.data.grade;

      const secondGradeSectionResponse = await request(app)
        .post('/grade-sections')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          ...testData.gradeSections.validGradeSection,
          name: 'Section D',
          grade: secondGrade._id,
          instituteId: secondInstitute._id
        })
        .expect(201);

      const secondGradeSection = secondGradeSectionResponse.body.data.gradeSection;

      // Try to create grade section batch with grade section from different institute
      const invalidGradeSectionBatchData = {
        ...testData.gradeSectionBatches.validGradeSectionBatch,
        gradeSectionId: secondGradeSection._id, // From second institute
        batchId: createdGradeBatch._id, // From first institute
        instituteId: createdInstitute._id
      };

      const response = await request(app)
        .post('/grade-section-batches')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidGradeSectionBatchData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('institute');
    });
  });

  describe('Grade Section Batches Listing and Filtering', () => {
    beforeEach(async () => {
      // Create multiple grade section batches for testing
      const gradeSectionBatches = [
        { ...testData.gradeSectionBatches.validGradeSectionBatch, gradeSectionId: createdGradeSection._id, batchId: createdGradeBatch._id, instituteId: createdInstitute._id }
      ];

      // Create additional grade sections and batches for more test data
      const additionalGradeSectionResponse = await request(app)
        .post('/grade-sections')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          ...testData.gradeSections.validGradeSection,
          name: 'Section B',
          grade: createdGrade._id,
          instituteId: createdInstitute._id
        })
        .expect(201);

      const additionalGradeSection = additionalGradeSectionResponse.body.data.gradeSection;

      const additionalGradeBatchResponse = await request(app)
        .post('/grade-batches')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          ...testData.gradeBatches.validGradeBatch,
          name: 'Batch B',
          grade: createdGrade._id,
          instituteId: createdInstitute._id
        })
        .expect(201);

      const additionalGradeBatch = additionalGradeBatchResponse.body.data.gradeBatch;

      gradeSectionBatches.push({
        ...testData.gradeSectionBatches.validGradeSectionBatch,
        gradeSectionId: additionalGradeSection._id,
        batchId: additionalGradeBatch._id,
        instituteId: createdInstitute._id
      });

      for (const gsb of gradeSectionBatches) {
        await request(app)
          .post('/grade-section-batches')
          .set('Authorization', `Bearer ${authToken}`)
          .send(gsb)
          .expect(201);
      }
    });

    it('should list all grade section batches with pagination', async () => {
      const response = await request(app)
        .get('/grade-section-batches')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.gradeSectionBatches).toHaveLength(2);
      expect(response.body.data.pagination).toBeDefined();
    });

    it('should filter grade section batches by institute', async () => {
      const response = await request(app)
        .get('/grade-section-batches')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ instituteId: createdInstitute._id })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.gradeSectionBatches).toHaveLength(2);
      response.body.data.gradeSectionBatches.forEach(gsb => {
        expect(gsb.instituteId).toBe(createdInstitute._id);
      });
    });

    it('should filter grade section batches by grade section', async () => {
      const response = await request(app)
        .get('/grade-section-batches')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ 
          instituteId: createdInstitute._id,
          gradeSectionId: createdGradeSection._id
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.gradeSectionBatches).toHaveLength(1);
      expect(response.body.data.gradeSectionBatches[0].gradeSectionId).toBe(createdGradeSection._id);
    });

    it('should filter grade section batches by batch', async () => {
      const response = await request(app)
        .get('/grade-section-batches')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ 
          instituteId: createdInstitute._id,
          batchId: createdGradeBatch._id
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.gradeSectionBatches).toHaveLength(1);
      expect(response.body.data.gradeSectionBatches[0].batchId).toBe(createdGradeBatch._id);
    });

    it('should filter grade section batches by academic year', async () => {
      const response = await request(app)
        .get('/grade-section-batches')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ 
          instituteId: createdInstitute._id,
          academicYear: createdGradeBatch.academicYear
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.data.gradeSectionBatches.forEach(gsb => {
        expect(gsb.academicYear).toBe(createdGradeBatch.academicYear);
      });
    });
  });

  describe('Grade Section Batches Error Handling', () => {
    it('should handle non-existent grade section batch ID', async () => {
      const nonExistentId = '507f1f77bcf86cd799439999';

      const response = await request(app)
        .get(`/grade-section-batches/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('not found');
    });

    it('should handle invalid grade section batch ID format', async () => {
      const invalidId = 'invalid-id';

      const response = await request(app)
        .get(`/grade-section-batches/${invalidId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid ID format');
    });

    it('should handle grade section batch operations without authentication', async () => {
      const gradeSectionBatchData = {
        ...testData.gradeSectionBatches.validGradeSectionBatch,
        gradeSectionId: createdGradeSection._id,
        batchId: createdGradeBatch._id,
        instituteId: createdInstitute._id
      };

      const response = await request(app)
        .post('/grade-section-batches')
        .send(gradeSectionBatchData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('token');
    });
  });
});
