const express = require('express');
const router = express.Router();

const generalDataCt = require('../Controller/generalData/generalDataCt');

router.get('/:type?/:itemId?', generalDataCt.getGeneraldata);
router.post('/:type?', generalDataCt.addGeneraldata);
router.put('/:type?', generalDataCt.updateGeneraldata);
router.delete('/:type?', generalDataCt.deleteGeneraldata);

module.exports = router;
