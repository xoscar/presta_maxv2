const express = require('express');
const auth = require('../utils/auth');

const router = express.Router();

// clients controller
const controller = require('../controllers/charges');

router.all('*', auth.middleware);

router.get('/:id', controller.info);
router.post('/', controller.create);
router.patch('/:id', controller.update);
router.delete('/:id', controller.delete);
router.post('/:id/pay', controller.pay);

module.exports = router;
