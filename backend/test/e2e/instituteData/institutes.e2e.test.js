const request = require('supertest');
const app = require('../app');
const TestHelpers = require('../helpers/testHelpers');
const MockHelpers = require('../helpers/mockHelpers');
const DatabaseHelpers = require('../helpers/databaseHelpers');
const testData = require('../fixtures/testData');

describe('Institute Management E2E Tests', () => {
  let authToken;
  let adminUser;
  let testInstitute;
  let testDepartment;
  let testGrade;

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
    
    // Setup test data
    testInstitute = MockHelpers.createMockInstitute(testData.institutes.validInstitute);
    testDepartment = MockHelpers.createMockDepartment(testData.departments.validDepartment);
    testGrade = MockHelpers.createMockGrade(testData.grades.validGrade);
  });

  afterEach(async () => {
    MockHelpers.resetAllMocks();
  });

  describe('Complete Institute Setup Flow', () => {
    it('should complete full institute setup workflow', async () => {
      // Step 1: Create Institute
      const instituteResponse = await request(app)
        .post('/institutes')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testData.institutes.validInstitute)
        .expect(201);

      const createdInstitute = instituteResponse.body.data.institute;
      expect(createdInstitute.name).toBe(testData.institutes.validInstitute.name);

      // Step 2: Create Department for the Institute
      const departmentData = {
        ...testData.departments.validDepartment,
        instituteId: createdInstitute._id
      };

      const departmentResponse = await request(app)
        .post('/departments')
        .set('Authorization', `Bearer ${authToken}`)
        .send(departmentData)
        .expect(201);

      const createdDepartment = departmentResponse.body.data.department;
      expect(createdDepartment.name).toBe(testData.departments.validDepartment.name);

      // Step 3: Create Grade for the Institute
      const gradeData = {
        ...testData.grades.validGrade,
        instituteId: createdInstitute._id
      };

      const gradeResponse = await request(app)
        .post('/grades')
        .set('Authorization', `Bearer ${authToken}`)
        .send(gradeData)
        .expect(201);

      const createdGrade = gradeResponse.body.data.grade;
      expect(createdGrade.name).toBe(testData.grades.validGrade.name);

      // Step 4: Create Subject for the Institute
      const subjectData = {
        ...testData.subjects.validSubject,
        instituteId: createdInstitute._id
      };

      const subjectResponse = await request(app)
        .post('/subjects')
        .set('Authorization', `Bearer ${authToken}`)
        .send(subjectData)
        .expect(201);

      const createdSubject = subjectResponse.body.data.subject;
      expect(createdSubject.name).toBe(testData.subjects.validSubject.name);

      // Step 5: Create Grade Section
      const gradeSectionData = {
        ...testData.gradeSections.validGradeSection,
        grade: createdGrade._id,
        instituteId: createdInstitute._id
      };

      const gradeSectionResponse = await request(app)
        .post('/grade-sections')
        .set('Authorization', `Bearer ${authToken}`)
        .send(gradeSectionData)
        .expect(201);

      const createdGradeSection = gradeSectionResponse.body.data.gradeSection;
      expect(createdGradeSection.name).toBe(testData.gradeSections.validGradeSection.name);

      // Step 6: Create Academic Year
      const academicYearData = {
        ...testData.academicYears.validAcademicYear,
        instituteId: createdInstitute._id
      };

      const academicYearResponse = await request(app)
        .post('/academic-years')
        .set('Authorization', `Bearer ${authToken}`)
        .send(academicYearData)
        .expect(201);

      const createdAcademicYear = academicYearResponse.body.data.academicYear;
      expect(createdAcademicYear.year).toBe(testData.academicYears.validAcademicYear.year);

      // Step 7: Create Enrollment
      const enrollmentData = {
        ...testData.enrollments.validEnrollment,
        instituteId: createdInstitute._id,
        grade: createdGrade._id,
        section: createdGradeSection._id,
        academicYear: createdAcademicYear._id
      };

      const enrollmentResponse = await request(app)
        .post('/enrollments')
        .set('Authorization', `Bearer ${authToken}`)
        .send(enrollmentData)
        .expect(201);

      const createdEnrollment = enrollmentResponse.body.data.enrollment;
      expect(createdEnrollment.studentId).toBe(testData.enrollments.validEnrollment.studentId);

      // Step 8: Verify complete setup by getting institute details
      const instituteDetailsResponse = await request(app)
        .get(`/institutes/${createdInstitute._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(instituteDetailsResponse.body.data.institute._id).toBe(createdInstitute._id);
    });

    it('should handle institute deletion cascade', async () => {
      // Step 1: Create Institute with related data
      const instituteResponse = await request(app)
        .post('/institutes')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testData.institutes.validInstitute)
        .expect(201);

      const createdInstitute = instituteResponse.body.data.institute;

      // Step 2: Create related entities
      const departmentData = {
        ...testData.departments.validDepartment,
        instituteId: createdInstitute._id
      };

      await request(app)
        .post('/departments')
        .set('Authorization', `Bearer ${authToken}`)
        .send(departmentData)
        .expect(201);

      const gradeData = {
        ...testData.grades.validGrade,
        instituteId: createdInstitute._id
      };

      await request(app)
        .post('/grades')
        .set('Authorization', `Bearer ${authToken}`)
        .send(gradeData)
        .expect(201);

      // Step 3: Delete Institute (should cascade delete related entities)
      const deleteResponse = await request(app)
        .delete(`/institutes/${createdInstitute._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(deleteResponse.body.success).toBe(true);

      // Step 4: Verify related entities are also deleted
      const departmentsResponse = await request(app)
        .get('/departments')
        .query({ instituteId: createdInstitute._id })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(departmentsResponse.body.data.departments).toHaveLength(0);

      const gradesResponse = await request(app)
        .get('/grades')
        .query({ instituteId: createdInstitute._id })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(gradesResponse.body.data.grades).toHaveLength(0);
    });
  });

  describe('Data Integrity and Validation', () => {
    it('should maintain referential integrity across entities', async () => {
      // Create Institute
      const instituteResponse = await request(app)
        .post('/institutes')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testData.institutes.validInstitute)
        .expect(201);

      const createdInstitute = instituteResponse.body.data.institute;

      // Create Department with valid institute reference
      const departmentData = {
        ...testData.departments.validDepartment,
        instituteId: createdInstitute._id
      };

      const departmentResponse = await request(app)
        .post('/departments')
        .set('Authorization', `Bearer ${authToken}`)
        .send(departmentData)
        .expect(201);

      // Try to create Department with invalid institute reference
      const invalidDepartmentData = {
        ...testData.departments.validDepartment,
        instituteId: '507f1f77bcf86cd799439999' // Non-existent ID
      };

      const invalidDepartmentResponse = await request(app)
        .post('/departments')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidDepartmentData)
        .expect(400);

      expect(invalidDepartmentResponse.body.success).toBe(false);
      expect(invalidDepartmentResponse.body.error).toContain('Institute not found');
    });

    it('should handle concurrent operations gracefully', async () => {
      const instituteData = testData.institutes.validInstitute;

      // Create multiple institutes concurrently
      const promises = Array.from({ length: 5 }, (_, index) => 
        request(app)
          .post('/institutes')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            ...instituteData,
            name: `${instituteData.name} ${index + 1}`
          })
      );

      const responses = await Promise.all(promises);

      // All should succeed
      responses.forEach(response => {
        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
      });

      // Verify all institutes were created
      const allInstitutesResponse = await request(app)
        .get('/institutes')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(allInstitutesResponse.body.data.institutes).toHaveLength(5);
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle large dataset operations efficiently', async () => {
      // Create Institute
      const instituteResponse = await request(app)
        .post('/institutes')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testData.institutes.validInstitute)
        .expect(201);

      const createdInstitute = instituteResponse.body.data.institute;

      // Create multiple departments
      const departmentPromises = Array.from({ length: 100 }, (_, index) => 
        request(app)
          .post('/departments')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            ...testData.departments.validDepartment,
            name: `Department ${index + 1}`,
            instituteId: createdInstitute._id
          })
      );

      const startTime = Date.now();
      await Promise.all(departmentPromises);
      const endTime = Date.now();

      // Should complete within reasonable time (adjust threshold as needed)
      expect(endTime - startTime).toBeLessThan(10000); // 10 seconds

      // Verify all departments were created
      const departmentsResponse = await request(app)
        .get('/departments')
        .query({ instituteId: createdInstitute._id })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(departmentsResponse.body.data.departments).toHaveLength(100);
    });
  });
});
