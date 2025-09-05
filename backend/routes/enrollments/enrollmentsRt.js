const express = require('express');
const router = express.Router();
const {
  getEnrollments,
  createEnrollment,
  updateEnrollment,
  deleteEnrollment
} = require('../../Controller/enrollments/enrollmentsCt');

// Get enrollments (GET) - supports aggregation, pagination, filtering, sorting
router.get('/enrollments', getEnrollments);

// Create enrollment (POST)
router.post('/enrollments', createEnrollment);

// Update enrollment (PUT)
router.put('/enrollments', updateEnrollment);

// Delete enrollment(s) (DELETE) - supports dependency handling
router.delete('/enrollments', deleteEnrollment);

module.exports = router;
