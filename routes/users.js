const express = require('express');
const auth = require('../utils/auth');

const router = express.Router();

// users controller
const controller = require('../controllers/users');

router.post('/login', controller.postLogin);
router.get('/:userId', auth.middleware, controller.getUserInfo);

module.exports = router;
