const express = require('express');
const auth = require('../utils/auth');
const Charge = require('../models/Charge');

const router = express.Router();

// clients controller
const controller = require('../controllers/charges');

router.get('/:id', auth.middleware, Charge.getFromRequest, controller.info);
router.post('/', auth.middleware, controller.create);
router.patch('/:id', auth.middleware, Charge.getFromRequest, controller.update);
router.delete('/:id', auth.middleware, Charge.getFromRequest, controller.delete);
router.post('/:id/pay', auth.middleware, Charge.getFromRequest, controller.pay);

module.exports = router;
