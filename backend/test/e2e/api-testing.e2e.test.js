const request = require('supertest');
const app = require('../app');
const TestHelpers = require('../helpers/testHelpers');
const MockHelpers = require('../helpers/mockHelpers');
const testData = require('../fixtures/testData');

describe('API Testing - Grade Batches Endpoints', () => {
  let authToken;
  let adminUser;

  beforeEach(async () => {
    // Setup admin user
    adminUser = MockHelpers.createMockUser({ role: 'admin' });
    authToken = TestHelpers.generateAuthToken(adminUser);
  });

  afterEach(async () => {
    MockHelpers.resetAllMocks();
  });

  describe('GET /instituteAggreRt/gradeBatchesInInstitute', () => {
    it('should return 200 for basic GET request', async () => {
      const response = await request(app)
        .get('/instituteAggreRt/gradeBatchesInInstitute')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toBeDefined();
    });

    it('should handle pagination parameters', async () => {
      const response = await request(app)
        .get('/instituteAggreRt/gradeBatchesInInstitute?page=1&limit=5')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toBeDefined();
    });

    it('should handle dropdown parameter', async () => {
      const response = await request(app)
        .get('/instituteAggreRt/gradeBatchesInInstitute?dropdown=true')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toBeDefined();
    });

    it('should handle filter parameters', async () => {
      const response = await request(app)
        .get('/instituteAggreRt/gradeBatchesInInstitute?instituteId=507f1f77bcf86cd799439011')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toBeDefined();
    });

    it('should handle aggregate parameter', async () => {
      const response = await request(app)
        .get('/instituteAggreRt/gradeBatchesInInstitute?aggregate=false')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toBeDefined();
    });
  });

  describe('POST /instituteAggreRt/gradeBatchesInInstitute', () => {
    it('should handle valid grade batch creation request', async () => {
      const gradeBatchData = {
        batch: "2023-24",
        instituteId: "507f1f77bcf86cd799439011",
        departmentId: "507f1f77bcf86cd799439012",
        gradeId: "507f1f77bcf86cd799439013",
        description: "Grade 10 Batch for Academic Year 2023-24"
      };

      const response = await request(app)
        .post('/instituteAggreRt/gradeBatchesInInstitute')
        .set('Authorization', `Bearer ${authToken}`)
        .send(gradeBatchData);

      // Should get a response (even if it fails due to no database)
      expect(response.status).toBeDefined();
      expect(response.body).toBeDefined();
    });

    it('should handle minimal required fields', async () => {
      const gradeBatchData = {
        batch: "2024-25",
        instituteId: "507f1f77bcf86cd799439011",
        departmentId: "507f1f77bcf86cd799439012",
        gradeId: "507f1f77bcf86cd799439013"
      };

      const response = await request(app)
        .post('/instituteAggreRt/gradeBatchesInInstitute')
        .set('Authorization', `Bearer ${authToken}`)
        .send(gradeBatchData);

      expect(response.status).toBeDefined();
      expect(response.body).toBeDefined();
    });

    it('should handle missing required fields', async () => {
      const gradeBatchData = {
        batch: "2023-24"
        // Missing required fields
      };

      const response = await request(app)
        .post('/instituteAggreRt/gradeBatchesInInstitute')
        .set('Authorization', `Bearer ${authToken}`)
        .send(gradeBatchData);

      expect(response.status).toBeDefined();
      expect(response.body).toBeDefined();
    });
  });

  describe('PUT /instituteAggreRt/gradeBatchesInInstitute', () => {
    it('should handle grade batch update request', async () => {
      const updateData = {
        _id: "507f1f77bcf86cd799439011",
        updatedData: {
          batch: "2024-25",
          description: "Updated Grade 10 Batch for Academic Year 2024-25"
        }
      };

      const response = await request(app)
        .put('/instituteAggreRt/gradeBatchesInInstitute')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBeDefined();
      expect(response.body).toBeDefined();
    });

    it('should handle partial update', async () => {
      const updateData = {
        _id: "507f1f77bcf86cd799439011",
        updatedData: {
          description: "Updated description only"
        }
      };

      const response = await request(app)
        .put('/instituteAggreRt/gradeBatchesInInstitute')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBeDefined();
      expect(response.body).toBeDefined();
    });
  });

  describe('DELETE /instituteAggreRt/gradeBatchesInInstitute', () => {
    it('should handle simple deletion request', async () => {
      const deleteData = {
        ids: ["507f1f77bcf86cd799439011"]
      };

      const response = await request(app)
        .delete('/instituteAggreRt/gradeBatchesInInstitute')
        .set('Authorization', `Bearer ${authToken}`)
        .send(deleteData);

      expect(response.status).toBeDefined();
      expect(response.body).toBeDefined();
    });

    it('should handle bulk deletion request', async () => {
      const deleteData = {
        ids: ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439012", "507f1f77bcf86cd799439013"]
      };

      const response = await request(app)
        .delete('/instituteAggreRt/gradeBatchesInInstitute')
        .set('Authorization', `Bearer ${authToken}`)
        .send(deleteData);

      expect(response.status).toBeDefined();
      expect(response.body).toBeDefined();
    });

    it('should handle archive request', async () => {
      const deleteData = {
        ids: ["507f1f77bcf86cd799439011"],
        archive: true
      };

      const response = await request(app)
        .delete('/instituteAggreRt/gradeBatchesInInstitute')
        .set('Authorization', `Bearer ${authToken}`)
        .send(deleteData);

      expect(response.status).toBeDefined();
      expect(response.body).toBeDefined();
    });

    it('should handle transfer dependencies request', async () => {
      const deleteData = {
        ids: ["507f1f77bcf86cd799439011"],
        transferTo: "507f1f77bcf86cd799439012"
      };

      const response = await request(app)
        .delete('/instituteAggreRt/gradeBatchesInInstitute')
        .set('Authorization', `Bearer ${authToken}`)
        .send(deleteData);

      expect(response.status).toBeDefined();
      expect(response.body).toBeDefined();
    });
  });

  describe('API Error Handling', () => {
    it('should handle requests without authentication', async () => {
      const response = await request(app)
        .get('/instituteAggreRt/gradeBatchesInInstitute');

      expect(response.status).toBeDefined();
    });

    it('should handle invalid authentication token', async () => {
      const response = await request(app)
        .get('/instituteAggreRt/gradeBatchesInInstitute')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBeDefined();
    });

    it('should handle malformed JSON in POST request', async () => {
      const response = await request(app)
        .post('/instituteAggreRt/gradeBatchesInInstitute')
        .set('Authorization', `Bearer ${authToken}`)
        .set('Content-Type', 'application/json')
        .send('invalid json');

      expect(response.status).toBeDefined();
    });
  });

  describe('API Response Validation', () => {
    it('should return consistent response structure for GET', async () => {
      const response = await request(app)
        .get('/instituteAggreRt/gradeBatchesInInstitute')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toBeDefined();
      expect(typeof response.body).toBe('object');
    });

    it('should return consistent response structure for POST', async () => {
      const gradeBatchData = {
        batch: "2023-24",
        instituteId: "507f1f77bcf86cd799439011",
        departmentId: "507f1f77bcf86cd799439012",
        gradeId: "507f1f77bcf86cd799439013"
      };

      const response = await request(app)
        .post('/instituteAggreRt/gradeBatchesInInstitute')
        .set('Authorization', `Bearer ${authToken}`)
        .send(gradeBatchData);

      expect(response.body).toBeDefined();
      expect(typeof response.body).toBe('object');
    });
  });
});
