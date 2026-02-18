import prisma from '@/lib/prisma';
import {
  format,
  formatDistanceToNow,
  differenceInWeeks,
  endOfWeek,
  addWeeks,
  isAfter,
} from 'date-fns';
import { es } from 'date-fns/locale';
import validator from 'validator';
import type { Loan, Payment, Client } from '@prisma/client';
import type {
  ILoanInfo,
  IPaymentInfo,
  LoanCreateInput,
  LoanUpdateInput,
  IClientInfo,
} from '@/types';

export interface ValidationError {
  statusCode: number;
  messages: Array<{ code: string; text: string }>;
  type: string;
}

// Extended types for loans with relations
export type LoanWithPayments = Loan & { payments: Payment[] };
export type LoanWithClient = Loan & { client: Client | null; payments: Payment[] };

export const loanService = {
  /**
   * Validate loan creation data
   */
  async validateCreate(body: Partial<LoanCreateInput> = {}): Promise<LoanCreateInput> {
    const errors: Array<{ code: string; text: string }> = [];

    if (!body.amount || typeof body.amount !== 'number') {
      errors.push({ code: 'amount', text: 'El amount no es valido' });
    }

    if (!body.weekly_payment || typeof body.weekly_payment !== 'number') {
      errors.push({ code: 'weekly_payment', text: 'El weekly_payment no es valido' });
    }

    if (!body.weeks || typeof body.weeks !== 'number') {
      errors.push({ code: 'weeks', text: 'El weeks no es valido' });
    }

    if (!body.client_id || !validator.isMongoId(body.client_id)) {
      errors.push({
        code: 'client_id',
        text: 'El número de identificación del cliente es invalido.',
      });
    }

    if (body.created) {
      const date = new Date(body.created);
      if (isNaN(date.getTime())) {
        errors.push({ code: 'created', text: 'La fecha de creación no es válida.' });
      }
    }

    if (!errors.length) {
      if (body.weeks! < 0 || body.weeks! > 60) {
        errors.push({ code: 'weeks', text: 'El número de semanas debe ser entre 1 y 60' });
      }

      if (body.amount! <= body.weeks!) {
        errors.push({
          code: 'amount',
          text: 'El número de semanas debe de ser menor al de la cantidad total del prestamo.',
        });
      }

      if (body.amount! <= body.weekly_payment!) {
        errors.push({
          code: 'amount',
          text: 'El pago semanal debe de ser menor a la cantidad total del prestamo.',
        });
      }
    }

    if (errors.length) {
      throw {
        statusCode: 400,
        messages: errors,
        type: 'ValidationError',
      } as ValidationError;
    }

    return body as LoanCreateInput;
  },

  /**
   * Validate loan update data
   */
  async validateUpdate(body: Partial<LoanUpdateInput> = {}): Promise<LoanUpdateInput> {
    const errors: Array<{ code: string; text: string }> = [];

    if (!body.amount || typeof body.amount !== 'number') {
      errors.push({ code: 'amount', text: 'El amount no es valido' });
    }

    if (!body.weekly_payment || typeof body.weekly_payment !== 'number') {
      errors.push({ code: 'weekly_payment', text: 'El weekly_payment no es valido' });
    }

    if (!body.weeks || typeof body.weeks !== 'number') {
      errors.push({ code: 'weeks', text: 'El weeks no es valido' });
    }

    if (!body.client_id || !validator.isMongoId(body.client_id)) {
      errors.push({
        code: 'client_id',
        text: 'El número de identificación del cliente es invalido.',
      });
    }

    if (body.created) {
      const date = new Date(body.created);
      if (isNaN(date.getTime())) {
        errors.push({ code: 'created', text: 'La fecha de creación no es válida.' });
      }
    }

    if (!errors.length) {
      if (body.weeks! < 0 || body.weeks! > 60) {
        errors.push({ code: 'weeks', text: 'El número de semanas debe ser entre 1 y 60' });
      }

      if (body.amount! <= body.weeks!) {
        errors.push({
          code: 'amount',
          text: 'El número de semanas debe de ser menor al de la cantidad total del prestamo.',
        });
      }

      if (body.amount! <= body.weekly_payment!) {
        errors.push({
          code: 'amount',
          text: 'El pago semanal debe de ser menor a la cantidad total del prestamo.',
        });
      }
    }

    if (errors.length) {
      throw {
        statusCode: 400,
        messages: errors,
        type: 'ValidationError',
      } as ValidationError;
    }

    return body as LoanUpdateInput;
  },

  /**
   * Get next loan number ID using atomic increment
   */
  async getNextLoanId(): Promise<number> {
    const counter = await prisma.counter.upsert({
      where: { name: 'loans' },
      update: { count: { increment: 1 } },
      create: { name: 'loans', count: 2 },
    });
    return counter.count - 1;
  },

  /**
   * Create a new loan
   */
  async create(
    data: LoanCreateInput & { user_id: string; client_name: string; client_identifier: string }
  ): Promise<LoanWithPayments> {
    const numberId = await this.getNextLoanId();
    const createdDate = data.created ? new Date(data.created) : new Date();
    const expiredDate = endOfWeek(addWeeks(endOfWeek(createdDate), data.weeks));

    const searchFields = [
      String(data.amount),
      String(data.weeks),
      data.client_id,
      data.client_identifier,
      data.client_name,
      String(numberId),
    ].filter((val) => val);

    const loan = await prisma.loan.create({
      data: {
        numberId,
        amount: data.amount,
        weeklyPayment: data.weekly_payment,
        weeks: data.weeks,
        description: data.description,
        clientName: data.client_name,
        clientIdentifier: data.client_identifier,
        expiredDate,
        search: searchFields,
        clientId: data.client_id,
        userId: data.user_id,
        createdAt: createdDate,
      },
      include: { payments: true },
    });

    return loan;
  },

  /**
   * Update a loan
   */
  async update(id: string, data: LoanUpdateInput): Promise<LoanWithPayments> {
    const loan = await prisma.loan.findUnique({
      where: { id },
      include: { payments: true },
    });

    if (!loan) {
      throw { statusCode: 404, message: 'Loan not found' };
    }

    const createdDate = data.created ? new Date(data.created) : loan.createdAt;
    const expiredDate = endOfWeek(addWeeks(endOfWeek(createdDate), data.weeks));
    const currentBalance = this.getCurrentBalance(loan);
    const finished = currentBalance === 0;

    return prisma.loan.update({
      where: { id },
      data: {
        amount: data.amount,
        weeklyPayment: data.weekly_payment,
        weeks: data.weeks,
        description: data.description,
        expiredDate,
        finished,
        finishedDate: finished && !loan.finishedDate ? new Date() : loan.finishedDate,
        createdAt: createdDate,
      },
      include: { payments: true },
    });
  },

  /**
   * Delete a loan and its payments
   */
  async deleteLoan(id: string): Promise<void> {
    // First delete all payments
    await prisma.payment.deleteMany({ where: { loanId: id } });
    // Then delete the loan
    await prisma.loan.delete({ where: { id } });
  },

  /**
   * Check if loan is expired
   */
  isExpired(loan: Loan): boolean {
    return isAfter(new Date(), loan.expiredDate) && !loan.finished;
  },

  /**
   * Get current week of loan
   */
  getCurrentWeek(loan: Loan): number | null {
    const weeksDiff = differenceInWeeks(new Date(), loan.createdAt);
    return weeksDiff > loan.weeks + 1 ? null : weeksDiff + 1;
  },

  /**
   * Get current balance of loan
   */
  getCurrentBalance(loan: LoanWithPayments): number {
    return loan.amount - loan.payments.reduce((acc, payment) => acc + payment.amount, 0);
  },

  /**
   * Get last payment of loan
   */
  getLastPayment(loan: LoanWithPayments): Payment | null {
    if (loan.payments.length === 0) return null;

    return [...loan.payments].sort((a, b) => (isAfter(a.createdAt, b.createdAt) ? -1 : 1))[0];
  },

  /**
   * Convert payment to info object
   */
  paymentToInfo(payment: Payment, loanId: string): IPaymentInfo {
    return {
      id: payment.id,
      loan_id: loanId,
      amount: payment.amount,
      created: format(payment.createdAt, 'dd/MM/yyyy HH:mm'),
      created_from_now: formatDistanceToNow(payment.createdAt, { addSuffix: true, locale: es }),
    };
  },

  /**
   * Get payments info for a loan
   */
  getPaymentsInfo(loan: LoanWithPayments): IPaymentInfo[] {
    return [...loan.payments]
      .sort((a, b) => (isAfter(b.createdAt, a.createdAt) ? 1 : -1))
      .map((payment) => this.paymentToInfo(payment, loan.id));
  },

  /**
   * Get basic loan info
   */
  toBasicInfo(loan: LoanWithPayments): ILoanInfo {
    const lastPayment = this.getLastPayment(loan);

    return {
      id: loan.id,
      number_id: loan.numberId,
      amount: loan.amount,
      description: loan.description || undefined,
      weekly_payment: loan.weeklyPayment,
      created: format(loan.createdAt, 'dd/MM/yyyy HH:mm'),
      created_from_now: formatDistanceToNow(loan.createdAt, { addSuffix: true, locale: es }),
      current_week: this.getCurrentWeek(loan),
      weeks: loan.weeks,
      last_payment: lastPayment ? this.paymentToInfo(lastPayment, loan.id) : null,
      last_payment_from_now: lastPayment
        ? formatDistanceToNow(lastPayment.createdAt, { addSuffix: true, locale: es })
        : null,
      expired: this.isExpired(loan),
      expired_date: format(loan.expiredDate, 'dd/MM/yyyy HH:mm'),
      expired_date_from_now: formatDistanceToNow(loan.expiredDate, { addSuffix: true, locale: es }),
      finished: loan.finished,
      finished_date: loan.finishedDate ? format(loan.finishedDate, 'dd/MM/yyyy HH:mm') : null,
      updated: format(loan.updatedAt, 'dd/MM/yyyy HH:mm'),
      current_balance: this.getCurrentBalance(loan),
      client_id: loan.clientId,
      payments: this.getPaymentsInfo(loan),
    };
  },

  /**
   * Get full loan info with client
   */
  toFullInfo(
    loan: LoanWithPayments,
    clientInfo?: IClientInfo
  ): ILoanInfo & { client?: IClientInfo } {
    return {
      ...this.toBasicInfo(loan),
      client: clientInfo,
    };
  },

  /**
   * Find loan by ID
   */
  async findById(id: string): Promise<Loan | null> {
    return prisma.loan.findUnique({ where: { id } });
  },

  /**
   * Find loan by ID with payments
   */
  async findByIdWithPayments(id: string): Promise<LoanWithPayments | null> {
    return prisma.loan.findUnique({
      where: { id },
      include: { payments: true },
    });
  },

  /**
   * Find loan by ID with client and payments
   */
  async findByIdWithClient(id: string): Promise<LoanWithClient | null> {
    return prisma.loan.findUnique({
      where: { id },
      include: { client: true, payments: true },
    });
  },

  /**
   * Recalculate and update finished status
   */
  async recalculateFinished(id: string): Promise<LoanWithPayments> {
    const loan = await this.findByIdWithPayments(id);
    if (!loan) {
      throw { statusCode: 404, message: 'Loan not found' };
    }

    const currentBalance = this.getCurrentBalance(loan);
    const finished = currentBalance === 0;

    return prisma.loan.update({
      where: { id },
      data: {
        finished,
        finishedDate: finished && !loan.finishedDate ? new Date() : loan.finishedDate,
      },
      include: { payments: true },
    });
  },
};

export default loanService;
