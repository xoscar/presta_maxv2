import prisma from '@/lib/prisma';
import { format, formatDistanceToNow, isAfter, subYears } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Client, Loan, Charge } from '@prisma/client';
import type {
  IClientInfo,
  IClientFullInfo,
  ClientCreateInput,
  ClientUpdateInput,
  ILoanInfo,
  IChargeInfo,
} from '@/types';
import { loanService, type EmbeddedPayment } from './loan.service';
import { chargeService } from './charge.service';

export interface ValidationError {
  statusCode: number;
  messages: Array<{ code: string; text: string }>;
  type: string;
}

// Extended types for clients with relations (payments embedded on Loan)
export type ClientWithLoans = Client & { loans: (Loan & { payments: EmbeddedPayment[] })[] };
export type ClientWithCharges = Client & { charges: Charge[] };
export type ClientWithRelations = Client & {
  loans: (Loan & { payments: EmbeddedPayment[] })[];
  charges: Charge[];
};

export const clientService = {
  /**
   * Validate client creation data
   */
  async validateCreate(body: Partial<ClientCreateInput> = {}): Promise<ClientCreateInput> {
    const requiredFields = ['name', 'surname', 'address', 'phone', 'user_id'] as const;
    const errors = requiredFields.reduce((acc: Array<{ code: string; text: string }>, field) => {
      if (!body[field]) {
        acc.push({ code: field, text: `${field} ingresado no es válido.` });
      }
      return acc;
    }, []);

    if (errors.length) {
      throw {
        statusCode: 400,
        messages: errors,
        type: 'ValidationError',
      } as ValidationError;
    }

    return body as ClientCreateInput;
  },

  /**
   * Validate client update data
   */
  async validateUpdate(body: Partial<ClientUpdateInput> = {}): Promise<ClientUpdateInput> {
    const requiredFields = ['name', 'surname', 'address', 'phone'] as const;
    const errors = requiredFields.reduce((acc: Array<{ code: string; text: string }>, field) => {
      if (!body[field]) {
        acc.push({ code: field, text: `${field} ingresado no es válido.` });
      }
      return acc;
    }, []);

    if (errors.length) {
      throw {
        statusCode: 400,
        messages: errors,
        type: 'ValidationError',
      } as ValidationError;
    }

    return body as ClientUpdateInput;
  },

  /**
   * Generate a new client ID based on name and surname
   */
  async getNewId(params: {
    userId: string;
    body: { name: string; surname: string };
  }): Promise<string> {
    const clientIdPrefix = `${params.body.name.slice(0, 2).toUpperCase()}${params.body.surname.slice(0, 2).toUpperCase()}`;

    const clients = await prisma.client.findMany({
      where: {
        userId: params.userId,
        clientId: { startsWith: clientIdPrefix },
      },
      select: { clientId: true },
    });

    return `${clientIdPrefix}${clients.length}`;
  },

  /**
   * Create a new client
   */
  async create(data: ClientCreateInput & { clientId?: string; user_id: string }): Promise<Client> {
    const clientId =
      data.clientId ||
      (await this.getNewId({
        userId: data.user_id,
        body: { name: data.name, surname: data.surname },
      }));

    const searchFields = [data.name, clientId, data.surname]
      .map((val) => String(val || '').toLowerCase())
      .filter((val) => val);

    return prisma.client.create({
      data: {
        clientId,
        name: data.name,
        surname: data.surname,
        address: data.address,
        phone: data.phone,
        search: searchFields,
        userId: data.user_id,
      },
    });
  },

  /**
   * Update a client
   */
  async update(id: string, data: ClientUpdateInput): Promise<Client> {
    const client = await prisma.client.findUnique({ where: { id } });
    if (!client) {
      throw { statusCode: 404, message: 'Client not found' };
    }

    const searchFields = [data.name, client.clientId, data.surname]
      .map((val) => String(val || '').toLowerCase())
      .filter((val) => val);

    return prisma.client.update({
      where: { id },
      data: {
        name: data.name,
        surname: data.surname,
        address: data.address,
        phone: data.phone,
        search: searchFields,
      },
    });
  },

  /**
   * Delete a client and all related loans and charges
   */
  async deleteClient(id: string): Promise<void> {
    // Delete all loans (payments are embedded and removed with each loan)
    await prisma.loan.deleteMany({ where: { clientId: id } });

    // Delete all charges
    await prisma.charge.deleteMany({ where: { clientId: id } });

    // Delete the client
    await prisma.client.delete({ where: { id } });
  },

  /**
   * Get basic client info
   */
  toBasicInfo(client: Client): IClientInfo {
    return {
      id: client.id,
      client_id: client.clientId,
      name: client.name.split(' ')[0].toLowerCase(),
      surname: client.surname.toLowerCase(),
      name_complete: `${client.name} ${client.surname}`.toLowerCase(),
      address: client.address,
      phone: client.phone,
      created: format(client.createdAt, 'dd/MM/yyyy HH:mm'),
      created_from_now: formatDistanceToNow(client.createdAt, { addSuffix: true, locale: es }),
      updated: format(client.updatedAt, 'dd/MM/yyyy HH:mm'),
    };
  },

  /**
   * Get loans for a client
   */
  async getLoans(
    clientId: string,
    params?: { finished: boolean }
  ): Promise<{
    loans: ILoanInfo[];
    metadata: {
      expired: boolean;
      last_payment: Date | null;
      last_loan: Date | null;
      loans_depth: number;
    };
  }> {
    const where = params ? { clientId, finished: params.finished } : { clientId };

    const loans = await prisma.loan.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    const loansWithPayments = loans as (Loan & { payments: EmbeddedPayment[] })[];
    const loansInfo = loansWithPayments.map((loan) => loanService.toBasicInfo(loan));

    // Calculate metadata
    const fourYearsAgo = subYears(new Date(), 4);
    let lastPaymentDate: Date | null = null;

    for (const loan of loansWithPayments) {
      if (loan.payments.length > 0) {
        const sortedPayments = [...loan.payments].sort((a, b) =>
          isAfter(b.created, a.created) ? 1 : -1
        );
        const lastPayment = sortedPayments[0];
        if (isAfter(lastPayment.created, lastPaymentDate || fourYearsAgo)) {
          lastPaymentDate = lastPayment.created;
        }
      }
    }

    return {
      loans: loansInfo,
      metadata: {
        expired: loansWithPayments.some((loan) => loanService.isExpired(loan)),
        last_payment: lastPaymentDate,
        last_loan:
          loansWithPayments.length > 0
            ? loansWithPayments[loansWithPayments.length - 1].createdAt
            : null,
        loans_depth: loansInfo.reduce((acc, loan) => acc + loan.current_balance, 0),
      },
    };
  },

  /**
   * Get charges for a client
   */
  async getCharges(
    clientId: string,
    params: { finished: boolean }
  ): Promise<{ charges: IChargeInfo[]; total_depth: number }> {
    const charges = await prisma.charge.findMany({
      where: {
        clientId,
        paid: params.finished,
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      charges: charges.map((charge) => chargeService.toInfo(charge)),
      total_depth: charges.reduce((acc, charge) => acc + charge.amount, 0),
    };
  },

  /**
   * Get full client info with loans and charges
   */
  async toFullInfo(client: Client): Promise<IClientFullInfo> {
    const [activeLoans, finishedLoans, activeCharges, finishedCharges] = await Promise.all([
      this.getLoans(client.id, { finished: false }),
      this.getLoans(client.id, { finished: true }),
      this.getCharges(client.id, { finished: false }),
      this.getCharges(client.id, { finished: true }),
    ]);

    const basicInfo = this.toBasicInfo(client);

    return {
      ...basicInfo,
      loans: activeLoans.loans,
      active_loans: activeLoans.loans.length > 0,
      loans_depth: activeLoans.metadata.loans_depth,
      last_payment: activeLoans.metadata.last_payment
        ? format(activeLoans.metadata.last_payment, 'dd/MM/yyyy HH:mm')
        : null,
      last_payment_from_now: activeLoans.metadata.last_payment
        ? formatDistanceToNow(activeLoans.metadata.last_payment, { addSuffix: true, locale: es })
        : null,
      last_loan: activeLoans.metadata.last_loan
        ? format(activeLoans.metadata.last_loan, 'dd/MM/yyyy HH:mm')
        : null,
      last_loan_from_now: activeLoans.metadata.last_loan
        ? formatDistanceToNow(activeLoans.metadata.last_loan, { addSuffix: true, locale: es })
        : null,
      expired_loans: activeLoans.metadata.expired,
      finished_loans: finishedLoans.loans,
      charges: activeCharges.charges,
      charges_depth: activeCharges.total_depth,
      paid_charges: finishedCharges.charges,
      total_depth: (activeLoans.metadata.loans_depth || 0) + (activeCharges.total_depth || 0),
    };
  },

  /**
   * Find client by ID
   */
  async findById(id: string): Promise<Client | null> {
    return prisma.client.findUnique({ where: { id } });
  },

  /**
   * Find client by ID with all relations
   */
  async findByIdWithRelations(id: string): Promise<ClientWithRelations | null> {
    const result = await prisma.client.findUnique({
      where: { id },
      include: {
        loans: true,
        charges: true,
      },
    });
    return result as ClientWithRelations | null;
  },
};

export default clientService;
