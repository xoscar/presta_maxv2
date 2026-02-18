import prisma from '@/lib/prisma';
import { loanService, type LoanWithPayments } from '@/lib/services/loan.service';
import type { StatsResponse } from '@/types';

export const statsService = {
  async getStats(userId: string, from: Date, to: Date): Promise<StatsResponse> {
    const [totalDebt, paymentsByClient, loansCountByClient, chargesCountByClient] =
      await Promise.all([
        this.getTotalDebt(userId),
        this.getPaymentsByClient(userId, from, to),
        this.getLoansCountByClient(userId, from, to),
        this.getChargesCountByClient(userId, from, to),
      ]);

    return {
      totalDebt,
      paymentsByClient,
      loansCountByClient,
      chargesCountByClient,
    };
  },

  async getTotalDebt(userId: string): Promise<number> {
    const loans = await prisma.loan.findMany({
      where: { userId, finished: false },
    });

    return loans.reduce((sum, loan) => {
      const balance = loanService.getCurrentBalance(loan as LoanWithPayments);
      return sum + balance;
    }, 0);
  },

  async getPaymentsByClient(
    userId: string,
    from: Date,
    to: Date
  ): Promise<StatsResponse['paymentsByClient']> {
    const loans = await prisma.loan.findMany({
      where: { userId },
      include: { client: true },
    });

    const byClient = new Map<string, { clientName: string; totalPaid: number }>();

    for (const loan of loans) {
      const clientId = loan.clientId ?? '';
      const clientName = loan.client
        ? `${loan.client.name} ${loan.client.surname}`.trim()
        : 'Sin cliente';

      const payments = ((
        loan as { payments?: { amount: number; created?: Date; createdAt?: Date }[] }
      ).payments || []) as { amount: number; created?: Date; createdAt?: Date }[];
      for (const p of payments) {
        const created = p.created ?? p.createdAt;
        const createdDate = created ? new Date(created) : null;
        if (!createdDate || createdDate < from || createdDate > to) continue;
        const existing = byClient.get(clientId);
        if (existing) {
          existing.totalPaid += p.amount;
        } else {
          byClient.set(clientId, { clientName, totalPaid: p.amount });
        }
      }
    }

    return Array.from(byClient.entries()).map(([clientId, { clientName, totalPaid }]) => ({
      clientId,
      clientName,
      totalPaid,
    }));
  },

  async getLoansCountByClient(
    userId: string,
    from: Date,
    to: Date
  ): Promise<StatsResponse['loansCountByClient']> {
    const loans = await prisma.loan.findMany({
      where: {
        userId,
        createdAt: { gte: from, lte: to },
      },
      include: { client: true },
    });

    const byClient = new Map<string, { clientName: string; count: number }>();

    for (const loan of loans) {
      const clientId = loan.clientId ?? '';
      const clientName = loan.client
        ? `${loan.client.name} ${loan.client.surname}`.trim()
        : 'Sin cliente';

      const existing = byClient.get(clientId);
      if (existing) {
        existing.count += 1;
      } else {
        byClient.set(clientId, { clientName, count: 1 });
      }
    }

    return Array.from(byClient.entries()).map(([clientId, { clientName, count }]) => ({
      clientId,
      clientName,
      count,
    }));
  },

  async getChargesCountByClient(
    userId: string,
    from: Date,
    to: Date
  ): Promise<StatsResponse['chargesCountByClient']> {
    const charges = await prisma.charge.findMany({
      where: {
        userId,
        createdAt: { gte: from, lte: to },
      },
      include: { client: true },
    });

    const byClient = new Map<string, { clientName: string; count: number }>();

    for (const charge of charges) {
      const clientId = charge.clientId;
      const clientName = charge.client
        ? `${charge.client.name} ${charge.client.surname}`.trim()
        : 'Sin cliente';

      const existing = byClient.get(clientId);
      if (existing) {
        existing.count += 1;
      } else {
        byClient.set(clientId, { clientName, count: 1 });
      }
    }

    return Array.from(byClient.entries()).map(([clientId, { clientName, count }]) => ({
      clientId,
      clientName,
      count,
    }));
  },
};
