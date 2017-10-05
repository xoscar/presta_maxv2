const express = require('express');
const auth = require('../utils/auth');

const router = express.Router();

// clients controller
const controller = require('../controllers/clients');

router.all('*', auth.middleware);

router.get('/', controller.search);
router.get('/:id', controller.info);
router.get('/:id/loans', controller.loans);
router.post('/', controller.create);
router.patch('/:id', controller.update);
router.delete('/:id', controller.delete);

module.exports = router;
