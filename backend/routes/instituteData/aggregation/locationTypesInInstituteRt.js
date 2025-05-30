const express = require('express');
const router = express.Router();

const locationTypesInInstituteCt = require('../../../Controller/instituteData/aggregation/locationTypesInInstituteCt');
router.get('/locationTypesInInstitute',locationTypesInInstituteCt.getLocationTypesInInstituteAgs);
// router.get('/locationTypesInInstitute',locationTypesInInstituteCt.getLocationTypesInInstitute);
router.get('/locationTypesInInstitute/:_id?',locationTypesInInstituteCt.getLocationTypesInInstitute);

router.post('/locationTypesInInstitute',locationTypesInInstituteCt.createLocationTypesInInstitute);
router.put('/locationTypesInInstitute',locationTypesInInstituteCt.updateLocationTypesInInstitute);
router.delete('/locationTypesInInstitute',locationTypesInInstituteCt.deleteLocationTypesInInstitute);

module.exports = router;