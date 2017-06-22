const express = require('express');
const auth = require('../utils/auth');
const Client = require('../models/Client');

const router = express.Router();

// clients controller
const controller = require('../controllers/clients');

router.get('/', auth.middleware, controller.search);
router.get('/:id', auth.middleware, Client.getFromRequest, controller.info);
router.get('/:id/loans', auth.middleware, Client.getFromRequest, controller.loans);
router.post('/', auth.middleware, controller.create);
router.patch('/:id', auth.middleware, Client.getFromRequest, controller.update);
router.delete('/:id', auth.middleware, Client.getFromRequest, controller.delete);

module.exports = router;
