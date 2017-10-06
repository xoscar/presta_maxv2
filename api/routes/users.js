const express = require('express');
const auth = require('../utils/auth');

const router = express.Router();

// users controller
const controller = require('../controllers/users');

router.post('/login', controller.login);
router.get('/:userId', auth.middleware, controller.info);

module.exports = router;
