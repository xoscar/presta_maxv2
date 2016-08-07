const express = require('express');
const router = express.Router();
const auth = require('../utils/auth');
const Charge = require('../models/Charge');

// clients controller
const controller = require('../controllers/charges');

router.patch('/:id', auth.middleware, Charge.getFromRequest, controller.pay);
router.post('/', auth.middleware, controller.create);
router.delete('/:id', auth.middleware, Charge.getFromRequest, controller.delete);

module.exports = router;
