import { randomBytes } from 'crypto';
import prisma from '@/lib/prisma';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import type { IPaymentInfo, PaymentCreateInput, PaymentUpdateInput } from '@/types';
import { loanService, type EmbeddedPayment } from './loan.service';

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
   * Create a new payment (embedded in loan)
   */
  async create(loanId: string, data: PaymentCreateInput): Promise<EmbeddedPayment> {
    const loan = await loanService.findByIdWithPayments(loanId);
    if (!loan) {
      throw { statusCode: 404, message: 'Loan not found' };
    }

    const currentBalance = loanService.getCurrentBalance(loan);
    this.validateCreate(data, currentBalance);

    const created = data.created ? new Date(data.created) : new Date();
    const newPayment: EmbeddedPayment = {
      id: randomBytes(12).toString('hex'),
      amount: Math.round(data.amount),
      created,
    };

    await prisma.loan.update({
      where: { id: loanId },
      data: {
        payments: {
          push: [newPayment],
        },
      },
    });

    await loanService.recalculateFinished(loanId);

    return newPayment;
  },

  /**
   * Update a payment (embedded in loan)
   */
  async update(paymentId: string, data: PaymentUpdateInput): Promise<EmbeddedPayment> {
    const loan = await prisma.loan.findFirst({
      where: { payments: { some: { id: paymentId } } },
    });

    if (!loan) {
      throw { statusCode: 404, message: 'Payment not found' };
    }

    const payments = (loan.payments || []) as EmbeddedPayment[];
    const balanceWithoutPayment =
      loan.amount -
      payments.filter((p) => p.id !== paymentId).reduce((acc, p) => acc + p.amount, 0);

    this.validateUpdate(data, balanceWithoutPayment);

    const getCreated = (p: EmbeddedPayment) => p.created ?? (p as { createdAt?: Date }).createdAt;
    const updatedPayments = payments.map((p) =>
      p.id === paymentId
        ? {
            ...p,
            amount: Math.round(data.amount),
            created: data.created ? new Date(data.created) : getCreated(p),
          }
        : p
    );

    await prisma.loan.update({
      where: { id: loan.id },
      data: { payments: { set: updatedPayments } },
    });

    await loanService.recalculateFinished(loan.id);

    return updatedPayments.find((p) => p.id === paymentId)!;
  },

  /**
   * Delete a payment (remove from loan's embedded array)
   */
  async deletePayment(paymentId: string): Promise<void> {
    const loan = await prisma.loan.findFirst({
      where: { payments: { some: { id: paymentId } } },
    });

    if (!loan) {
      throw { statusCode: 404, message: 'Payment not found' };
    }

    const payments = (loan.payments || []) as EmbeddedPayment[];
    const filtered = payments.filter((p) => p.id !== paymentId);

    await prisma.loan.update({
      where: { id: loan.id },
      data: { payments: { set: filtered } },
    });

    await loanService.recalculateFinished(loan.id);
  },

  /**
   * Get payment info (assigns fallback id for legacy payments without id)
   */
  toInfo(payment: EmbeddedPayment, loanId: string): IPaymentInfo {
    const createdDate = payment.created ?? (payment as { createdAt?: Date }).createdAt;
    const id =
      payment.id ??
      `legacy-${loanId}-${new Date(createdDate).getTime()}-${Math.random().toString(36).slice(2, 9)}`;
    return {
      id,
      loan_id: loanId,
      amount: payment.amount,
      created: format(createdDate, 'dd/MM/yyyy HH:mm'),
      created_from_now: formatDistanceToNow(createdDate, { addSuffix: true, locale: es }),
    };
  },

  /**
   * Find payment by ID (search in loans)
   */
  async findById(id: string): Promise<EmbeddedPayment | null> {
    const loan = await prisma.loan.findFirst({
      where: { payments: { some: { id } } },
    });

    if (!loan) return null;

    const payment = (loan.payments || []).find((p: { id: string | null }) => p.id === id);
    return (payment as EmbeddedPayment) ?? null;
  },

  /**
   * Find payments by loan ID (embedded on loan)
   */
  async findByLoanId(loanId: string): Promise<EmbeddedPayment[]> {
    const loan = await prisma.loan.findUnique({
      where: { id: loanId },
    });

    if (!loan) return [];

    const payments = (loan.payments || []) as EmbeddedPayment[];
    const getCreated = (p: EmbeddedPayment) => p.created ?? (p as { createdAt?: Date }).createdAt;
    return [...payments].sort(
      (a, b) => new Date(getCreated(b)).getTime() - new Date(getCreated(a)).getTime()
    );
  },
};

export default paymentService;
