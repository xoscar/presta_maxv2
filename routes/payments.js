const express = require('express');
const auth = require('../utils/auth');

// loangs controller
const controller = require('../controllers/payments');

const router = express.Router();

router.all('*', auth.middleware);

router.post('/:loanId/payments', controller.create);
router.get('/:loanId/payments/:id', controller.info);
router.patch('/:loanId/payments/:id', controller.update);
router.delete('/:loanId/payments/:id', controller.delete);

module.exports = router;
