const express = require('express');
const router = express.Router();
const asideDataCt = require('../../Controller/asideData/asideDataCt'); // Assuming your model is in models/AsideData.js

// GET aside data by type (menu, member, etc.)
router.get('/:type', asideDataCt.asideData);

module.exports = router;
