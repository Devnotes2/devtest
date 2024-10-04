const express = require('express');

const router = express.Router();
const regLoginCt = require('../Controller/regLoginCt');

router.post('/register', regLoginCt.register);
router.post('/login', regLoginCt.login);

module.exports = router;
