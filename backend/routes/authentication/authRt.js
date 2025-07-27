const express = require('express');

const router = express.Router();
const authCt = require('../../Controller/authentication/authCt')

// router.post('/register', authCt.register);

router.post('/login', authCt.login);
router.get('/loginDropdown', authCt.getInstituteDropdown);

module.exports = router;
