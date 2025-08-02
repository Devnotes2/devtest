const express = require('express');

const router = express.Router();
const tenantCt = require('../../Controller/authentication/tenantCt');

// GET all tenants
router.get('/tenants', tenantCt.getTenants);

// POST a new tenant
router.post('/tenants', tenantCt.createTenant);

// PUT (update) a tenant
router.put('/tenants/:instituteCode', tenantCt.updateTenant);

// DELETE a tenant
router.delete('/tenants/:instituteCode', tenantCt.deleteTenant);

module.exports = router;