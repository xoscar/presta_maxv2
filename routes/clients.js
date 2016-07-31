const express = require('express');
const router = express.Router();
const auth = require('../utils/auth');

// portal controller
const controller = require('../controllers/clients');

router.get('/', auth.middleware, controller.search);
router.get('/:id', controller.info);
router.post('/', controller.create);
router.patch('/', controller.update);
router.delete('/', controller.delete);

module.exports = router;
