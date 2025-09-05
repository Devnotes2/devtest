const request = require('supertest');
const app = require('../../app');
const TestHelpers = require('../../helpers/testHelpers');
const MockHelpers = require('../../helpers/mockHelpers');
const DatabaseHelpers = require('../../helpers/databaseHelpers');
const testData = require('../../fixtures/testData');

describe('Academic Year E2E Tests', () => {
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

  describe('Academic Year CRUD Operations', () => {
    it('should create, read, update, and delete an academic year', async () => {
      // CREATE: Create a new academic year
      const academicYearData = {
        ...testData.academicYears.validAcademicYear,
        instituteId: createdInstitute._id
      };

      const createResponse = await request(app)
        .post('/academic-years')
        .set('Authorization', `Bearer ${authToken}`)
        .send(academicYearData)
        .expect(201);

      expect(createResponse.body.success).toBe(true);
      expect(createResponse.body.data.academicYear.year).toBe(academicYearData.year);
      expect(createResponse.body.data.academicYear.instituteId).toBe(createdInstitute._id);

      const createdAcademicYear = createResponse.body.data.academicYear;

      // READ: Get the created academic year
      const getResponse = await request(app)
        .get(`/academic-years/${createdAcademicYear._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(getResponse.body.success).toBe(true);
      expect(getResponse.body.data.academicYear._id).toBe(createdAcademicYear._id);
      expect(getResponse.body.data.academicYear.year).toBe(academicYearData.year);

      // UPDATE: Update the academic year
      const updateData = {
        description: 'Updated Academic Year Description',
        isCurrent: false
      };

      const updateResponse = await request(app)
        .put(`/academic-years/${createdAcademicYear._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(updateResponse.body.success).toBe(true);
      expect(updateResponse.body.data.academicYear.description).toBe(updateData.description);
      expect(updateResponse.body.data.academicYear.isCurrent).toBe(updateData.isCurrent);

      // DELETE: Delete the academic year
      const deleteResponse = await request(app)
        .delete(`/academic-years/${createdAcademicYear._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(deleteResponse.body.success).toBe(true);

      // VERIFY: Ensure academic year is deleted
      await request(app)
        .get(`/academic-years/${createdAcademicYear._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should handle academic year creation with invalid data', async () => {
      const invalidAcademicYearData = {
        ...testData.academicYears.invalidAcademicYear,
        instituteId: createdInstitute._id
      };

      const response = await request(app)
        .post('/academic-years')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidAcademicYearData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('Academic Year Business Logic', () => {
    it('should prevent duplicate academic years within same institute', async () => {
      const academicYearData = {
        ...testData.academicYears.validAcademicYear,
        year: 2024,
        instituteId: createdInstitute._id
      };

      // Create first academic year
      await request(app)
        .post('/academic-years')
        .set('Authorization', `Bearer ${authToken}`)
        .send(academicYearData)
        .expect(201);

      // Try to create duplicate
      const duplicateResponse = await request(app)
        .post('/academic-years')
        .set('Authorization', `Bearer ${authToken}`)
        .send(academicYearData)
        .expect(409);

      expect(duplicateResponse.body.success).toBe(false);
      expect(duplicateResponse.body.error).toContain('already exists');
    });

    it('should allow only one current academic year per institute', async () => {
      const academicYear1 = {
        ...testData.academicYears.validAcademicYear,
        year: 2024,
        isCurrent: true,
        instituteId: createdInstitute._id
      };

      const academicYear2 = {
        ...testData.academicYears.validAcademicYear,
        year: 2025,
        isCurrent: true,
        instituteId: createdInstitute._id
      };

      // Create first current academic year
      await request(app)
        .post('/academic-years')
        .set('Authorization', `Bearer ${authToken}`)
        .send(academicYear1)
        .expect(201);

      // Try to create second current academic year
      const response = await request(app)
        .post('/academic-years')
        .set('Authorization', `Bearer ${authToken}`)
        .send(academicYear2)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('current academic year');
    });

    it('should validate academic year date ranges', async () => {
      const invalidDateRange = {
        ...testData.academicYears.validAcademicYear,
        year: 2024,
        startDate: new Date('2024-09-01'),
        endDate: new Date('2024-08-01'), // End date before start date
        instituteId: createdInstitute._id
      };

      const response = await request(app)
        .post('/academic-years')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidDateRange)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('date');
    });
  });

  describe('Academic Year Listing and Filtering', () => {
    beforeEach(async () => {
      // Create multiple academic years for testing
      const academicYears = [
        { ...testData.academicYears.validAcademicYear, year: 2022, isCurrent: false, instituteId: createdInstitute._id },
        { ...testData.academicYears.validAcademicYear, year: 2023, isCurrent: false, instituteId: createdInstitute._id },
        { ...testData.academicYears.validAcademicYear, year: 2024, isCurrent: true, instituteId: createdInstitute._id }
      ];

      for (const ay of academicYears) {
        await request(app)
          .post('/academic-years')
          .set('Authorization', `Bearer ${authToken}`)
          .send(ay)
          .expect(201);
      }
    });

    it('should list all academic years with pagination', async () => {
      const response = await request(app)
        .get('/academic-years')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.academicYears).toHaveLength(3);
      expect(response.body.data.pagination).toBeDefined();
    });

    it('should filter academic years by institute', async () => {
      const response = await request(app)
        .get('/academic-years')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ instituteId: createdInstitute._id })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.academicYears).toHaveLength(3);
      response.body.data.academicYears.forEach(ay => {
        expect(ay.instituteId).toBe(createdInstitute._id);
      });
    });

    it('should get current academic year', async () => {
      const response = await request(app)
        .get('/academic-years/current')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ instituteId: createdInstitute._id })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.academicYear.isCurrent).toBe(true);
      expect(response.body.data.academicYear.year).toBe(2024);
    });

    it('should filter academic years by year range', async () => {
      const response = await request(app)
        .get('/academic-years')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ 
          instituteId: createdInstitute._id,
          yearFrom: 2023,
          yearTo: 2024
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.academicYears).toHaveLength(2);
      response.body.data.academicYears.forEach(ay => {
        expect(ay.year).toBeGreaterThanOrEqual(2023);
        expect(ay.year).toBeLessThanOrEqual(2024);
      });
    });
  });

  describe('Academic Year Error Handling', () => {
    it('should handle non-existent academic year ID', async () => {
      const nonExistentId = '507f1f77bcf86cd799439999';

      const response = await request(app)
        .get(`/academic-years/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('not found');
    });

    it('should handle invalid academic year ID format', async () => {
      const invalidId = 'invalid-id';

      const response = await request(app)
        .get(`/academic-years/${invalidId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid ID format');
    });

    it('should handle academic year operations without authentication', async () => {
      const academicYearData = {
        ...testData.academicYears.validAcademicYear,
        instituteId: createdInstitute._id
      };

      const response = await request(app)
        .post('/academic-years')
        .send(academicYearData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('token');
    });
  });
});
