const express = require('express');
const router = express.Router();

const institutesCt = require('../../Controller/instituteData/institutesCt');

router.get('/institutes/:id?', institutesCt.getInstitutes);
router.post('/institutes', institutesCt.insertInstitute);
router.put('/institutes', institutesCt.updateInstitute);
router.delete('/institutes', institutesCt.deleteInstitutes);


module.exports = router;
