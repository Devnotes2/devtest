const express = require('express');
const router = express.Router();

const departmentCt = require('../../Controller/instituteData/departmentCt');

router.get('/department', departmentCt.getDepartment);
router.post('/department', departmentCt.createDepartment);
router.put('/department', departmentCt.updateDepartment);
router.delete('/department', departmentCt.deleteDepartment);


module.exports = router;
