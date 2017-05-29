const express = require('express');

const router = express.Router();

// portal controller
const controller = require('../controllers/portal');

router.get('/', controller.getIndex);
router.get('/login', controller.getLogIn);
router.post('/login', controller.postLogIn);
router.get('/signup', controller.getSignUp);
router.post('/signup', controller.postSignUp);
router.get('/logout', controller.getLogOut);

module.exports = router;
