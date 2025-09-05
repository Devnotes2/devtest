const request = require('supertest');
const app = require('../../../app');
const TestHelpers = require('../../../helpers/testHelpers');
const MockHelpers = require('../../../helpers/mockHelpers');
const DatabaseHelpers = require('../../../helpers/databaseHelpers');
const testData = require('../../../fixtures/testData');

describe('Location Types in Institute E2E Tests', () => {
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

  describe('Location Types CRUD Operations', () => {
    it('should create, read, update, and delete a location type', async () => {
      // CREATE: Create a new location type
      const locationTypeData = {
        ...testData.locationTypes.validLocationType,
        instituteId: createdInstitute._id
      };

      const createResponse = await request(app)
        .post('/location-types')
        .set('Authorization', `Bearer ${authToken}`)
        .send(locationTypeData)
        .expect(201);

      expect(createResponse.body.success).toBe(true);
      expect(createResponse.body.data.locationType.name).toBe(locationTypeData.name);
      expect(createResponse.body.data.locationType.instituteId).toBe(createdInstitute._id);

      const createdLocationType = createResponse.body.data.locationType;

      // READ: Get the created location type
      const getResponse = await request(app)
        .get(`/location-types/${createdLocationType._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(getResponse.body.success).toBe(true);
      expect(getResponse.body.data.locationType._id).toBe(createdLocationType._id);
      expect(getResponse.body.data.locationType.name).toBe(locationTypeData.name);

      // UPDATE: Update the location type
      const updateData = {
        name: 'Advanced Classroom',
        description: 'Updated description for advanced classroom',
        capacity: 40
      };

      const updateResponse = await request(app)
        .put(`/location-types/${createdLocationType._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(updateResponse.body.success).toBe(true);
      expect(updateResponse.body.data.locationType.name).toBe(updateData.name);
      expect(updateResponse.body.data.locationType.description).toBe(updateData.description);
      expect(updateResponse.body.data.locationType.capacity).toBe(updateData.capacity);

      // DELETE: Delete the location type
      const deleteResponse = await request(app)
        .delete(`/location-types/${createdLocationType._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(deleteResponse.body.success).toBe(true);

      // VERIFY: Ensure location type is deleted
      await request(app)
        .get(`/location-types/${createdLocationType._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should handle location type creation with invalid data', async () => {
      const invalidLocationTypeData = {
        ...testData.locationTypes.invalidLocationType,
        instituteId: createdInstitute._id
      };

      const response = await request(app)
        .post('/location-types')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidLocationTypeData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('Location Types Business Logic', () => {
    it('should prevent duplicate location type names within same institute', async () => {
      const locationTypeData = {
        ...testData.locationTypes.validLocationType,
        name: 'Classroom',
        instituteId: createdInstitute._id
      };

      // Create first location type
      await request(app)
        .post('/location-types')
        .set('Authorization', `Bearer ${authToken}`)
        .send(locationTypeData)
        .expect(201);

      // Try to create duplicate
      const duplicateResponse = await request(app)
        .post('/location-types')
        .set('Authorization', `Bearer ${authToken}`)
        .send(locationTypeData)
        .expect(409);

      expect(duplicateResponse.body.success).toBe(false);
      expect(duplicateResponse.body.error).toContain('already exists');
    });

    it('should allow same location type name in different institutes', async () => {
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

      const locationTypeData = {
        ...testData.locationTypes.validLocationType,
        name: 'Classroom',
        instituteId: createdInstitute._id
      };

      // Create location type in first institute
      await request(app)
        .post('/location-types')
        .set('Authorization', `Bearer ${authToken}`)
        .send(locationTypeData)
        .expect(201);

      // Create same name location type in second institute
      const secondLocationTypeData = {
        ...locationTypeData,
        instituteId: secondInstitute._id
      };

      const response = await request(app)
        .post('/location-types')
        .set('Authorization', `Bearer ${authToken}`)
        .send(secondLocationTypeData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.locationType.name).toBe('Classroom');
    });

    it('should validate location type capacity constraints', async () => {
      const invalidCapacityLocationType = {
        ...testData.locationTypes.validLocationType,
        name: 'Test Location',
        capacity: -10, // Invalid capacity (should be positive)
        instituteId: createdInstitute._id
      };

      const response = await request(app)
        .post('/location-types')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidCapacityLocationType)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('capacity');
    });

    it('should validate location type constraints', async () => {
      const invalidTypeLocationType = {
        ...testData.locationTypes.validLocationType,
        name: 'Test Location',
        type: 'invalid-type', // Invalid type
        instituteId: createdInstitute._id
      };

      const response = await request(app)
        .post('/location-types')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidTypeLocationType)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('type');
    });
  });

  describe('Location Types Listing and Filtering', () => {
    beforeEach(async () => {
      // Create multiple location types for testing
      const locationTypes = [
        { ...testData.locationTypes.validLocationType, name: 'Classroom', type: 'academic', capacity: 30, instituteId: createdInstitute._id },
        { ...testData.locationTypes.validLocationType, name: 'Laboratory', type: 'academic', capacity: 25, instituteId: createdInstitute._id },
        { ...testData.locationTypes.validLocationType, name: 'Library', type: 'academic', capacity: 50, instituteId: createdInstitute._id },
        { ...testData.locationTypes.validLocationType, name: 'Cafeteria', type: 'non-academic', capacity: 100, instituteId: createdInstitute._id },
        { ...testData.locationTypes.validLocationType, name: 'Auditorium', type: 'non-academic', capacity: 200, instituteId: createdInstitute._id }
      ];

      for (const locationType of locationTypes) {
        await request(app)
          .post('/location-types')
          .set('Authorization', `Bearer ${authToken}`)
          .send(locationType)
          .expect(201);
      }
    });

    it('should list all location types with pagination', async () => {
      const response = await request(app)
        .get('/location-types')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.locationTypes).toHaveLength(5);
      expect(response.body.data.pagination).toBeDefined();
    });

    it('should filter location types by institute', async () => {
      const response = await request(app)
        .get('/location-types')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ instituteId: createdInstitute._id })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.locationTypes).toHaveLength(5);
      response.body.data.locationTypes.forEach(locationType => {
        expect(locationType.instituteId).toBe(createdInstitute._id);
      });
    });

    it('should search location types by name', async () => {
      const response = await request(app)
        .get('/location-types')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ search: 'Class' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.locationTypes).toHaveLength(1);
      expect(response.body.data.locationTypes[0].name).toContain('Class');
    });

    it('should filter location types by type', async () => {
      const response = await request(app)
        .get('/location-types')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ 
          instituteId: createdInstitute._id,
          type: 'academic'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.locationTypes).toHaveLength(3);
      response.body.data.locationTypes.forEach(locationType => {
        expect(locationType.type).toBe('academic');
      });
    });

    it('should filter location types by capacity range', async () => {
      const response = await request(app)
        .get('/location-types')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ 
          instituteId: createdInstitute._id,
          capacityFrom: 25,
          capacityTo: 50
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.locationTypes).toHaveLength(3);
      response.body.data.locationTypes.forEach(locationType => {
        expect(locationType.capacity).toBeGreaterThanOrEqual(25);
        expect(locationType.capacity).toBeLessThanOrEqual(50);
      });
    });

    it('should sort location types by name', async () => {
      const response = await request(app)
        .get('/location-types')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ 
          instituteId: createdInstitute._id,
          sortBy: 'name',
          sortOrder: 'asc'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.locationTypes).toHaveLength(5);
      
      // Verify sorting
      for (let i = 1; i < response.body.data.locationTypes.length; i++) {
        expect(response.body.data.locationTypes[i].name.localeCompare(
          response.body.data.locationTypes[i-1].name
        )).toBeGreaterThanOrEqual(0);
      }
    });

    it('should sort location types by capacity', async () => {
      const response = await request(app)
        .get('/location-types')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ 
          instituteId: createdInstitute._id,
          sortBy: 'capacity',
          sortOrder: 'desc'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.locationTypes).toHaveLength(5);
      
      // Verify sorting (descending)
      for (let i = 1; i < response.body.data.locationTypes.length; i++) {
        expect(response.body.data.locationTypes[i-1].capacity).toBeGreaterThanOrEqual(
          response.body.data.locationTypes[i].capacity
        );
      }
    });
  });

  describe('Location Types Error Handling', () => {
    it('should handle non-existent location type ID', async () => {
      const nonExistentId = '507f1f77bcf86cd799439999';

      const response = await request(app)
        .get(`/location-types/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('not found');
    });

    it('should handle invalid location type ID format', async () => {
      const invalidId = 'invalid-id';

      const response = await request(app)
        .get(`/location-types/${invalidId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Invalid ID format');
    });

    it('should handle location type operations without authentication', async () => {
      const locationTypeData = {
        ...testData.locationTypes.validLocationType,
        instituteId: createdInstitute._id
      };

      const response = await request(app)
        .post('/location-types')
        .send(locationTypeData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('token');
    });
  });
});
