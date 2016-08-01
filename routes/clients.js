const express = require('express');
const router = express.Router();
const auth = require('../utils/auth');
const Client = require('../models/Client');

// portal controller
const controller = require('../controllers/clients');

router.get('/', auth.middleware, controller.search);
router.get('/:id', auth.middleware, Client.getFromRequest, controller.info);
router.post('/', auth.middleware, controller.create);
router.patch('/:id', auth.middleware, Client.getFromRequest, controller.update);
router.delete('/:id', controller.delete);

module.exports = router;
