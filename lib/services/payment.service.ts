import prisma from '@/lib/prisma';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Payment } from '@prisma/client';
import type { IPaymentInfo, PaymentCreateInput, PaymentUpdateInput } from '@/types';
import { loanService } from './loan.service';

export interface ValidationError {
  statusCode: number;
  messages: Array<{ code: string; text: string }>;
  type: string;
}

export const paymentService = {
  /**
   * Validate payment creation data
   */
  validateCreate(body: PaymentCreateInput, currentBalance: number): PaymentCreateInput {
    const errors: Array<{ code: string; text: string }> = [];

    if (!body.amount || typeof body.amount !== 'number' || body.amount <= 0) {
      errors.push({ code: 'amount', text: 'La cantidad del pago debe ser numerica.' });
    }

    if (currentBalance - body.amount < 0) {
      errors.push({
        code: 'payment',
        text: 'El abono es mayor a la cantidad del saldo del prestamo',
      });
    }

    if (currentBalance === 0) {
      errors.push({ code: 'payment', text: 'El prestamo ya fue saldado.' });
    }

    if (errors.length) {
      throw {
        statusCode: 400,
        messages: errors,
        type: 'ValidationError',
      } as ValidationError;
    }

    return { amount: body.amount };
  },

  /**
   * Validate payment update data
   */
  validateUpdate(body: PaymentUpdateInput, currentBalance: number): PaymentUpdateInput {
    const errors: Array<{ code: string; text: string }> = [];

    if (!body.amount || typeof body.amount !== 'number') {
      errors.push({ code: 'amount', text: 'La cantidad del pago debe ser numerica.' });
    }

    if (currentBalance - body.amount < 0) {
      errors.push({ code: 'payment', text: 'El prestamo ya fue saldado.' });
    }

    if (body.created) {
      const date = new Date(body.created);
      if (isNaN(date.getTime())) {
        errors.push({ code: 'created', text: 'La fecha de creación no es válida.' });
      }
    }

    if (errors.length) {
      throw {
        statusCode: 400,
        messages: errors,
        type: 'ValidationError',
      } as ValidationError;
    }

    return body;
  },

  /**
   * Create a new payment
   */
  async create(loanId: string, data: PaymentCreateInput): Promise<Payment> {
    const loan = await loanService.findByIdWithPayments(loanId);
    if (!loan) {
      throw { statusCode: 404, message: 'Loan not found' };
    }

    const currentBalance = loanService.getCurrentBalance(loan);
    this.validateCreate(data, currentBalance);

    const payment = await prisma.payment.create({
      data: {
        amount: data.amount,
        loanId,
        createdAt: data.created ? new Date(data.created) : new Date(),
      },
    });

    // Recalculate loan finished status
    await loanService.recalculateFinished(loanId);

    return payment;
  },

  /**
   * Update a payment
   */
  async update(paymentId: string, data: PaymentUpdateInput): Promise<Payment> {
    const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
    if (!payment) {
      throw { statusCode: 404, message: 'Payment not found' };
    }

    const loan = await loanService.findByIdWithPayments(payment.loanId);
    if (!loan) {
      throw { statusCode: 404, message: 'Loan not found' };
    }

    // Calculate balance excluding this payment
    const balanceWithoutPayment =
      loan.amount -
      loan.payments.filter((p) => p.id !== paymentId).reduce((acc, p) => acc + p.amount, 0);

    this.validateUpdate(data, balanceWithoutPayment);

    const updatedPayment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        amount: data.amount,
        createdAt: data.created ? new Date(data.created) : payment.createdAt,
      },
    });

    // Recalculate loan finished status
    await loanService.recalculateFinished(payment.loanId);

    return updatedPayment;
  },

  /**
   * Delete a payment
   */
  async deletePayment(paymentId: string): Promise<void> {
    const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
    if (!payment) {
      throw { statusCode: 404, message: 'Payment not found' };
    }

    await prisma.payment.delete({ where: { id: paymentId } });

    // Recalculate loan finished status
    await loanService.recalculateFinished(payment.loanId);
  },

  /**
   * Get payment info
   */
  toInfo(payment: Payment, loanId: string): IPaymentInfo {
    return {
      id: payment.id,
      loan_id: loanId,
      amount: payment.amount,
      created: format(payment.createdAt, 'dd/MM/yyyy HH:mm'),
      created_from_now: formatDistanceToNow(payment.createdAt, { addSuffix: true, locale: es }),
    };
  },

  /**
   * Find payment by ID
   */
  async findById(id: string): Promise<Payment | null> {
    return prisma.payment.findUnique({ where: { id } });
  },

  /**
   * Find payments by loan ID
   */
  async findByLoanId(loanId: string): Promise<Payment[]> {
    return prisma.payment.findMany({
      where: { loanId },
      orderBy: { createdAt: 'desc' },
    });
  },
};

export default paymentService;
