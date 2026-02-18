import prisma from '@/lib/prisma';
import { format, formatDistanceToNow, isAfter } from 'date-fns';
import { es } from 'date-fns/locale';
import validator from 'validator';
import type { Charge } from '@prisma/client';
import type { IChargeInfo, ChargeCreateInput, ChargeUpdateInput } from '@/types';

export interface ValidationError {
  statusCode: number;
  messages: Array<{ code: string; text: string }>;
  type: string;
}

export const chargeService = {
  /**
   * Validate charge creation data
   */
  async validateCreate(body: Partial<ChargeCreateInput> = {}): Promise<ChargeCreateInput> {
    const errors: Array<{ code: string; text: string }> = [];

    if (!body.amount || !validator.isNumeric(String(body.amount))) {
      errors.push({ code: 'amount', text: 'La cantidad debe ser numerica.' });
    }

    if (!body.client_id || !validator.isMongoId(body.client_id)) {
      errors.push({
        code: 'client_id',
        text: 'El número de identificación del cliente es invalido.',
      });
    }

    if (errors.length) {
      throw {
        statusCode: 400,
        messages: errors,
        type: 'ValidationError',
      } as ValidationError;
    }

    return body as ChargeCreateInput;
  },

  /**
   * Validate charge update data
   */
  async validateUpdate(body: Partial<ChargeUpdateInput> = {}): Promise<ChargeUpdateInput> {
    const errors: Array<{ code: string; text: string }> = [];

    if (!body.amount) {
      errors.push({ code: 'amount', text: 'La cantidad debe ser numerica.' });
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

    return body as ChargeUpdateInput;
  },

  /**
   * Create a new charge
   */
  async create(data: ChargeCreateInput & { user_id: string }): Promise<Charge> {
    return prisma.charge.create({
      data: {
        amount: Math.round(Number(data.amount)),
        description: data.description,
        expirationDate: data.expiration_date ? new Date(data.expiration_date) : undefined,
        clientId: data.client_id,
        userId: data.user_id,
      },
    });
  },

  /**
   * Update a charge
   */
  async update(id: string, data: ChargeUpdateInput): Promise<Charge> {
    const charge = await prisma.charge.findUnique({ where: { id } });
    if (!charge) {
      throw { statusCode: 404, message: 'Charge not found' };
    }

    return prisma.charge.update({
      where: { id },
      data: {
        amount: Math.round(Number(data.amount)),
        description: data.description,
        expirationDate: data.expiration_date
          ? new Date(data.expiration_date)
          : charge.expirationDate,
        createdAt: data.created ? new Date(data.created) : charge.createdAt,
      },
    });
  },

  /**
   * Mark a charge as paid
   */
  async markAsPaid(id: string): Promise<Charge> {
    return prisma.charge.update({
      where: { id },
      data: {
        paid: true,
        paidDate: new Date(),
      },
    });
  },

  /**
   * Delete a charge
   */
  async deleteCharge(id: string): Promise<void> {
    await prisma.charge.delete({ where: { id } });
  },

  /**
   * Get charge info
   */
  toInfo(charge: Charge): IChargeInfo {
    return {
      id: charge.id,
      amount: charge.amount,
      description: charge.description || undefined,
      paid: charge.paid,
      created: format(charge.createdAt, 'dd/MM/yyyy HH:mm'),
      created_from_now: formatDistanceToNow(charge.createdAt, { addSuffix: true, locale: es }),
      expired: charge.expirationDate ? !isAfter(new Date(), charge.expirationDate) : false,
      paid_date: charge.paidDate ? format(charge.paidDate, 'dd/MM/yyyy HH:mm') : null,
    };
  },

  /**
   * Find charge by ID
   */
  async findById(id: string): Promise<Charge | null> {
    return prisma.charge.findUnique({ where: { id } });
  },

  /**
   * Find charges by client ID
   */
  async findByClientId(clientId: string, options?: { paid?: boolean }): Promise<Charge[]> {
    return prisma.charge.findMany({
      where: {
        clientId,
        ...(options?.paid !== undefined && { paid: options.paid }),
      },
      orderBy: { createdAt: 'desc' },
    });
  },
};

export default chargeService;
