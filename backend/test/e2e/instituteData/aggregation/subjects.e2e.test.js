const request = require('supertest');
const app = require('../../../app');
const TestHelpers = require('../../../helpers/testHelpers');
const MockHelpers = require('../../../helpers/mockHelpers');
const DatabaseHelpers = require('../../../helpers/databaseHelpers');
const testData = require('../../../fixtures/testData');

describe('Subjects E2E Tests', () => {
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

  describe('Subjects CRUD Operations', () => {
    it('should create, read, update, and delete a subject', async () => {
      // CREATE: Create a new subject
      const subjectData = {
        ...testData.subjects.validSubject,
        instituteId: createdInstitute._id
      };

      const createResponse = await request(app)
        .post('/subjects')
        .set('Authorization', `Bearer ${authToken}`)
        .send(subjectData)
        .expect(201);

      expect(createResponse.body.success).toBe(true);
      expect(createResponse.body.data.subject.name).toBe(subjectData.name);
      expect(createResponse.body.data.subject.code).toBe(subjectData.code);
      expect(createResponse.body.data.subject.instituteId).toBe(createdInstitute._id);

      const createdSubject = createResponse.body.data.subject;

      // READ: Get the created subject
      const getResponse = await request(app)
        .get(`/subjects/${createdSubject._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(getResponse.body.success).toBe(true);
      expect(getResponse.body.data.subject._id).toBe(createdSubject._id);
      expect(getResponse.body.data.subject.name).toBe(subjectData.name);

      // UPDATE: Update the subject
      const updateData = {
        name: 'Advanced Mathematics',
        description: 'Updated description for Advanced Mathematics',
        credits: 5
      };

      const updateResponse = await request(app)
        .put(`/subjects/${createdSubject._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(updateResponse.body.success).toBe(true);
      expect(updateResponse.body.data.subject.name).toBe(updateData.name);
      expect(updateResponse.body.data.subject.description).toBe(updateData.description);
      expect(updateResponse.body.data.subject.credits).toBe(updateData.credits);

      // DELETE: Delete the subject
      const deleteResponse = await request(app)
        .delete(`/subjects/${createdSubject._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(deleteResponse.body.success).toBe(true);

      // VERIFY: Ensure subject is deleted
      await request(app)
        .get(`/subjects/${createdSubject._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should handle subject creation with invalid data', async () => {
      const invalidSubjectData = {
        ...testData.subjects.invalidSubject,
        instituteId: createdInstitute._id
      };

      const response = await request(app)
        .post('/subjects')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidSubjectData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('Subjects Business Logic', () => {
    it('should prevent duplicate subject codes within same institute', async () => {
      const subjectData = {
        ...testData.subjects.validSubject,
        code: 'MATH101',
        instituteId: createdInstitute._id
      };

      // Create first subject
      await request(app)
        .post('/subjects')
        .set('Authorization', `Bearer ${authToken}`)
        .send(subjectData)
        .expect(201);

      // Try to create duplicate
      const duplicateResponse = await request(app)
        .post('/subjects')
        .set('Authorization', `Bearer ${authToken}`)
        .send(subjectData)
        .expect(409);

      expect(duplicateResponse.body.success).toBe(false);
      expect(duplicateResponse.body.error).toContain('already exists');
    });

    it('should allow same subject code in different institutes', async () => {
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

      const subjectData = {
        ...testData.subjects.validSubject,
        code: 'MATH101',
        instituteId: createdInstitute._id
      };

      // Create subject in first institute
      await request(app)
        .post('/subjects')
        .set('Authorization', `Bearer ${authToken}`)
        .send(subjectData)
        .expect(201);

      // Create same code subject in second institute
      const secondSubjectData = {
        ...subjectData,
        instituteId: secondInstitute._id
      };

      const response = await request(app)
        .post('/subjects')
        .set('Authorization', `Bearer ${authToken}`)
        .send(secondSubjectData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.subject.code).toBe('MATH101');
    });

    it('should validate subject credits constraints', async () => {
      const invalidCreditsSubject = {
        ...testData.subjects.validSubject,
        name: 'Test Subject',
        code: 'TEST101',
        credits: -1, // Invalid credits (should be positive)
        instituteId: createdInstitute._id
      };

      const response = await request(app)
        .post('/subjects')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidCreditsSubject)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('credits');
    });

    it('should validate subject type constraints', async () => {
      const invalidTypeSubject = {
        ...testData.subjects.validSubject,
        name: 'Test Subject',
        code: 'TEST101',
        type: 'invalid-type', // Invalid type
        instituteId: createdInstitute._id
      };

      const response = await request(app)
        .post('/subjects')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidTypeSubject)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('type');
    });
  });

  describe('Subjects Listing and Filtering', () => {
    beforeEach(async () => {
      // Create multiple subjects for testing
      const subjects = [
        { ...testData.subjects.validSubject, name: 'Mathematics', code: 'MATH101', type: 'core', instituteId: createdInstitute._id },
        { ...testData.subjects.validSubject, name: 'Physics', code: 'PHYS101', type: 'core', instituteId: createdInstitute._id },
        { ...testData.subjects.validSubject, name: 'Chemistry', code: 'CHEM101', type: 'core', instituteId: createdInstitute._id },
        { ...testData.subjects.validSubject, name: 'Art', code: 'ART101', type: 'elective', instituteId: createdInstitute._id },
        { ...testData.subjects.validSubject, name: 'Music', code: 'MUS101', type: 'elective', instituteId: createdInstitute._id }
      ];

      for (const subject of subjects) {
        await request(app)
          .post('/subjects')
          .set('Authorization', `Bearer ${authToken}`)
          .send(subject)
          .expect(201);
      }
    });

    it('should list all subjects with pagination', async () => {
      const response = await request(app)
        .get('/subjects')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.subjects).toHaveLength(5);
      expect(response.body.data.pagination).toBeDefined();
    });

    it('should filter subjects by institute', async () => {
      const response = await request(app)
        .get('/subjects')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ instituteId: createdInstitute._id })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.subjects).toHaveLength(5);
      response.body.data.subjects.forEach(subject => {
        expect(subject.instituteId).toBe(createdInstitute._id);
      });
    });

    it('should search subjects by name', async () => {
      const response = await request(app)
        .get('/subjects')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ search: 'Math' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.subjects).toHaveLength(1);
      expect(response.body.data.subjects[0].name).toContain('Math');
    });

    it('should filter subjects by type', async () => {
      const response = await request(app)
        .get('/subjects')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ 
          instituteId: createdInstitute._id,
          type: 'core'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.subjects).toHaveLength(3);
      response.body.data.subjects.forEach(subject => {
        expect(subject.type).toBe('core');
      });
    });

    it('should filter subjects by credits range', async () => {
      const response = await request(app)
        .get('/subjects')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ 
          instituteId: createdInstitute._id,
          creditsFrom: 4,
          creditsTo: 5
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.data.subjects.forEach(subject => {
        expect(subject.credits).toBeGreaterThanOrEqual(4);
        expect(subject.credits).toBeLessThanOrEqual(5);
      });
    });

    it('should sort subjects by name', async () => {
      const response = await request(app)
        .get('/subjects')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ 
          instituteId: createdInstitute._id,
          sortBy: 'name',
          sortOrder: 'asc'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.subjects).toHaveLength(5);
      
      // Verify sorting
      for (let i = 1; i < response.body.data.subjects.length; i++) {
        expect(response.body.data.subjects[i].name.localeCompare(
          response.body.data.subjects[i-1].name
        )).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe('Subjects Error Handling', () => {
    it('should handle non-existent subject ID', async () => {
      const nonExistentId = '507f1f77bcf86cd799439999';

      const response = await request(app)
        .get(`/subjects/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('not found');
    });

    it('should handle invalid subject ID format', async () => {
      const invalidId = 'invalid-id';

      const response = await request(app)
        .get(`/subjects/${invalidId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid ID format');
    });

    it('should handle subject operations without authentication', async () => {
      const subjectData = {
        ...testData.subjects.validSubject,
        instituteId: createdInstitute._id
      };

      const response = await request(app)
        .post('/subjects')
        .send(subjectData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('token');
    });
  });
});
