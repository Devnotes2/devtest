const request = require('supertest');
const app = require('../../../app');
const TestHelpers = require('../../../helpers/testHelpers');
const MockHelpers = require('../../../helpers/mockHelpers');
const DatabaseHelpers = require('../../../helpers/databaseHelpers');
const testData = require('../../../fixtures/testData');

describe('Grade Sections E2E Tests', () => {
  let authToken;
  let adminUser;
  let testInstitute;
  let createdInstitute;
  let createdGrade;

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
  });

  afterEach(async () => {
    MockHelpers.resetAllMocks();
  });

  describe('Grade Sections CRUD Operations', () => {
    it('should create, read, update, and delete a grade section', async () => {
      // CREATE: Create a new grade section
      const gradeSectionData = {
        ...testData.gradeSections.validGradeSection,
        grade: createdGrade._id,
        instituteId: createdInstitute._id
      };

      const createResponse = await request(app)
        .post('/grade-sections')
        .set('Authorization', `Bearer ${authToken}`)
        .send(gradeSectionData)
        .expect(201);

      expect(createResponse.body.success).toBe(true);
      expect(createResponse.body.data.gradeSection.name).toBe(gradeSectionData.name);
      expect(createResponse.body.data.gradeSection.grade).toBe(createdGrade._id);
      expect(createResponse.body.data.gradeSection.instituteId).toBe(createdInstitute._id);

      const createdGradeSection = createResponse.body.data.gradeSection;

      // READ: Get the created grade section
      const getResponse = await request(app)
        .get(`/grade-sections/${createdGradeSection._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(getResponse.body.success).toBe(true);
      expect(getResponse.body.data.gradeSection._id).toBe(createdGradeSection._id);
      expect(getResponse.body.data.gradeSection.name).toBe(gradeSectionData.name);

      // UPDATE: Update the grade section
      const updateData = {
        name: 'Section B',
        capacity: 35,
        classTeacher: 'Mrs. Jane Doe'
      };

      const updateResponse = await request(app)
        .put(`/grade-sections/${createdGradeSection._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(updateResponse.body.success).toBe(true);
      expect(updateResponse.body.data.gradeSection.name).toBe(updateData.name);
      expect(updateResponse.body.data.gradeSection.capacity).toBe(updateData.capacity);
      expect(updateResponse.body.data.gradeSection.classTeacher).toBe(updateData.classTeacher);

      // DELETE: Delete the grade section
      const deleteResponse = await request(app)
        .delete(`/grade-sections/${createdGradeSection._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(deleteResponse.body.success).toBe(true);

      // VERIFY: Ensure grade section is deleted
      await request(app)
        .get(`/grade-sections/${createdGradeSection._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should handle grade section creation with invalid data', async () => {
      const invalidGradeSectionData = {
        ...testData.gradeSections.invalidGradeSection,
        grade: createdGrade._id,
        instituteId: createdInstitute._id
      };

      const response = await request(app)
        .post('/grade-sections')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidGradeSectionData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('Grade Sections Business Logic', () => {
    it('should prevent duplicate section names within same grade', async () => {
      const gradeSectionData = {
        ...testData.gradeSections.validGradeSection,
        name: 'Section A',
        grade: createdGrade._id,
        instituteId: createdInstitute._id
      };

      // Create first grade section
      await request(app)
        .post('/grade-sections')
        .set('Authorization', `Bearer ${authToken}`)
        .send(gradeSectionData)
        .expect(201);

      // Try to create duplicate
      const duplicateResponse = await request(app)
        .post('/grade-sections')
        .set('Authorization', `Bearer ${authToken}`)
        .send(gradeSectionData)
        .expect(409);

      expect(duplicateResponse.body.success).toBe(false);
      expect(duplicateResponse.body.error).toContain('already exists');
    });

    it('should allow same section name in different grades', async () => {
      // Create second grade
      const secondGradeResponse = await request(app)
        .post('/grades')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          ...testData.grades.validGrade,
          name: 'Grade 11',
          level: 11,
          instituteId: createdInstitute._id
        })
        .expect(201);

      const secondGrade = secondGradeResponse.body.data.grade;

      const gradeSectionData = {
        ...testData.gradeSections.validGradeSection,
        name: 'Section A',
        grade: createdGrade._id,
        instituteId: createdInstitute._id
      };

      // Create section in first grade
      await request(app)
        .post('/grade-sections')
        .set('Authorization', `Bearer ${authToken}`)
        .send(gradeSectionData)
        .expect(201);

      // Create same name section in second grade
      const secondSectionData = {
        ...gradeSectionData,
        grade: secondGrade._id
      };

      const response = await request(app)
        .post('/grade-sections')
        .set('Authorization', `Bearer ${authToken}`)
        .send(secondSectionData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.gradeSection.name).toBe('Section A');
    });

    it('should validate section capacity constraints', async () => {
      const invalidCapacitySection = {
        ...testData.gradeSections.validGradeSection,
        name: 'Section C',
        capacity: -5, // Invalid capacity (should be positive)
        grade: createdGrade._id,
        instituteId: createdInstitute._id
      };

      const response = await request(app)
        .post('/grade-sections')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidCapacitySection)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('capacity');
    });
  });

  describe('Grade Sections Listing and Filtering', () => {
    beforeEach(async () => {
      // Create multiple grade sections for testing
      const gradeSections = [
        { ...testData.gradeSections.validGradeSection, name: 'Section A', capacity: 30, grade: createdGrade._id, instituteId: createdInstitute._id },
        { ...testData.gradeSections.validGradeSection, name: 'Section B', capacity: 25, grade: createdGrade._id, instituteId: createdInstitute._id },
        { ...testData.gradeSections.validGradeSection, name: 'Section C', capacity: 35, grade: createdGrade._id, instituteId: createdInstitute._id }
      ];

      for (const section of gradeSections) {
        await request(app)
          .post('/grade-sections')
          .set('Authorization', `Bearer ${authToken}`)
          .send(section)
          .expect(201);
      }
    });

    it('should list all grade sections with pagination', async () => {
      const response = await request(app)
        .get('/grade-sections')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.gradeSections).toHaveLength(3);
      expect(response.body.data.pagination).toBeDefined();
    });

    it('should filter grade sections by institute', async () => {
      const response = await request(app)
        .get('/grade-sections')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ instituteId: createdInstitute._id })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.gradeSections).toHaveLength(3);
      response.body.data.gradeSections.forEach(section => {
        expect(section.instituteId).toBe(createdInstitute._id);
      });
    });

    it('should filter grade sections by grade', async () => {
      const response = await request(app)
        .get('/grade-sections')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ 
          instituteId: createdInstitute._id,
          grade: createdGrade._id
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.gradeSections).toHaveLength(3);
      response.body.data.gradeSections.forEach(section => {
        expect(section.grade).toBe(createdGrade._id);
      });
    });

    it('should search grade sections by name', async () => {
      const response = await request(app)
        .get('/grade-sections')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ search: 'Section A' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.gradeSections).toHaveLength(1);
      expect(response.body.data.gradeSections[0].name).toBe('Section A');
    });

    it('should filter grade sections by capacity range', async () => {
      const response = await request(app)
        .get('/grade-sections')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ 
          instituteId: createdInstitute._id,
          capacityFrom: 25,
          capacityTo: 30
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.gradeSections).toHaveLength(2);
      response.body.data.gradeSections.forEach(section => {
        expect(section.capacity).toBeGreaterThanOrEqual(25);
        expect(section.capacity).toBeLessThanOrEqual(30);
      });
    });

    it('should sort grade sections by name', async () => {
      const response = await request(app)
        .get('/grade-sections')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ 
          instituteId: createdInstitute._id,
          sortBy: 'name',
          sortOrder: 'asc'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.gradeSections).toHaveLength(3);
      
      // Verify sorting
      for (let i = 1; i < response.body.data.gradeSections.length; i++) {
        expect(response.body.data.gradeSections[i].name.localeCompare(
          response.body.data.gradeSections[i-1].name
        )).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe('Grade Sections Error Handling', () => {
    it('should handle non-existent grade section ID', async () => {
      const nonExistentId = '507f1f77bcf86cd799439999';

      const response = await request(app)
        .get(`/grade-sections/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('not found');
    });

    it('should handle invalid grade section ID format', async () => {
      const invalidId = 'invalid-id';

      const response = await request(app)
        .get(`/grade-sections/${invalidId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid ID format');
    });

    it('should handle grade section operations without authentication', async () => {
      const gradeSectionData = {
        ...testData.gradeSections.validGradeSection,
        grade: createdGrade._id,
        instituteId: createdInstitute._id
      };

      const response = await request(app)
        .post('/grade-sections')
        .send(gradeSectionData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('token');
    });
  });
});
