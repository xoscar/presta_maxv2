const express = require('express');
const router = express.Router();
const auth = require('../utils/auth');
const Loan = require('../models/Loan').Loan;

// loangs controller
const controller = require('../controllers/loans');

//////////////////////
// Routes for loans //
//////////////////////

router.get('/', auth.middleware, controller.search);
router.get('/:id', auth.middleware, Loan.getFromRequest, controller.info);
router.post('/', auth.middleware, controller.create);
router.patch('/:id', auth.middleware, Loan.getFromRequest, controller.update);
router.delete('/:id', auth.middleware, Loan.getFromRequest, controller.delete);

/////////////////////////
// Routes for payments //
/////////////////////////

router.post('/:id/payments', auth.middleware, Loan.getFromRequest, controller.createPayment);
router.get('/:id/payments/:paymentId', auth.middleware, Loan.getFromRequest, controller.getPayment);
router.patch('/:id/payments/:paymentId/update', auth.middleware, Loan.getFromRequest, controller.updatePayment);
router.delete('/:id/payments/:paymentId', auth.middleware, Loan.getFromRequest, controller.deletePayment);

module.exports = router;
