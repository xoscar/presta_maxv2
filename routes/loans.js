const express = require('express');
const auth = require('../utils/auth');

// loangs controller
const controller = require('../controllers/loans');

const router = express.Router();

router.all('*', auth.middleware);

router.get('/', controller.search);
router.get('/:id', controller.info);
router.post('/', controller.create);
router.patch('/:id', controller.update);
router.delete('/:id', controller.delete);

module.exports = router;
