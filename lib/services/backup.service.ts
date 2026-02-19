import archiver from 'archiver';
import AdmZip from 'adm-zip';
import { PassThrough } from 'stream';
import prisma from '@/lib/prisma';
import type { Client, Loan, Charge } from '@prisma/client';
import type { EmbeddedPayment } from './loan.service';

const BACKUP_JSON_NAME = 'prestamax-backup.json';
const BACKUP_VERSION = 1;

export interface BackupData {
  version: number;
  exportedAt: string;
  user: { id: string; username: string };
  clients: Client[];
  loans: (Loan & { payments: EmbeddedPayment[] })[];
  charges: Charge[];
}

export interface RestoreSummary {
  clients: number;
  loans: number;
  charges: number;
}

function parseDate(value: unknown): Date | undefined {
  if (value == null) return undefined;
  if (value instanceof Date) return value;
  const d = new Date(String(value));
  return isNaN(d.getTime()) ? undefined : d;
}

function parsePayment(p: { id?: string | null; amount: number; created: unknown }): {
  id: string | null;
  amount: number;
  created: Date;
} {
  const created = parseDate(p.created);
  if (!created) throw new Error('Fecha de pago inválida en el respaldo.');
  return {
    id: p.id ?? null,
    amount: Number(p.amount),
    created,
  };
}

function parseClient(raw: Record<string, unknown>): Record<string, unknown> {
  const createdAt = parseDate(raw.createdAt);
  const updatedAt = parseDate(raw.updatedAt);
  if (!createdAt || !updatedAt) throw new Error('Fechas de cliente inválidas en el respaldo.');
  return {
    ...raw,
    createdAt,
    updatedAt,
  };
}

function parseLoan(raw: Record<string, unknown>): Record<string, unknown> {
  const createdAt = parseDate(raw.createdAt);
  const updatedAt = parseDate(raw.updatedAt);
  const expiredDate = parseDate(raw.expiredDate);
  const finishedDate = parseDate(raw.finishedDate);
  if (!createdAt || !updatedAt || !expiredDate)
    throw new Error('Fechas de préstamo inválidas en el respaldo.');
  const payments = Array.isArray(raw.payments)
    ? (raw.payments as Array<{ id?: string | null; amount: number; created: unknown }>).map(
        parsePayment
      )
    : [];
  return {
    ...raw,
    createdAt,
    updatedAt,
    expiredDate,
    finishedDate: finishedDate ?? null,
    payments,
  };
}

function parseCharge(raw: Record<string, unknown>): Record<string, unknown> {
  const createdAt = parseDate(raw.createdAt);
  const paidDate = parseDate(raw.paidDate);
  const expirationDate = parseDate(raw.expirationDate);
  if (!createdAt) throw new Error('Fechas de cargo inválidas en el respaldo.');
  return {
    ...raw,
    createdAt,
    paidDate: paidDate ?? null,
    expirationDate: expirationDate ?? null,
  };
}

export const backupService = {
  async getBackupData(userId: string): Promise<BackupData> {
    const [user, clients, loans, charges] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, username: true },
      }),
      prisma.client.findMany({ where: { userId }, orderBy: { createdAt: 'asc' } }),
      prisma.loan.findMany({ where: { userId }, orderBy: { createdAt: 'asc' } }),
      prisma.charge.findMany({ where: { userId }, orderBy: { createdAt: 'asc' } }),
    ]);

    if (!user) throw new Error('User not found');

    return {
      version: BACKUP_VERSION,
      exportedAt: new Date().toISOString(),
      user: { id: user.id, username: user.username },
      clients,
      loans: loans as (Loan & { payments: EmbeddedPayment[] })[],
      charges,
    };
  },

  async createBackupZipBuffer(userId: string): Promise<Buffer> {
    const data = await this.getBackupData(userId);
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      const pass = new PassThrough();
      pass.on('data', (chunk: Buffer) => chunks.push(chunk));
      pass.on('end', () => resolve(Buffer.concat(chunks)));
      pass.on('error', reject);

      const archive = archiver('zip', { zlib: { level: 9 } });
      archive.on('error', reject);
      archive.pipe(pass);
      archive.append(JSON.stringify(data, null, 0), { name: BACKUP_JSON_NAME });
      archive.finalize();
    });
  },

  async restoreFromBackup(userId: string, zipBuffer: Buffer): Promise<RestoreSummary> {
    const zip = new AdmZip(zipBuffer);
    const entry = zip.getEntry(BACKUP_JSON_NAME);
    if (!entry || entry.isDirectory) {
      throw new Error('El archivo de respaldo no contiene el archivo esperado.');
    }

    const text = entry.getData().toString('utf8');
    let raw: unknown;
    try {
      raw = JSON.parse(text);
    } catch {
      throw new Error('El archivo de respaldo no es un JSON válido.');
    }

    if (typeof raw !== 'object' || raw === null) {
      throw new Error('Formato de respaldo inválido.');
    }

    const obj = raw as Record<string, unknown>;
    const version = obj.version;
    if (version !== BACKUP_VERSION) {
      throw new Error(
        `Versión de respaldo no soportada: ${version}. Se esperaba ${BACKUP_VERSION}.`
      );
    }

    const clientsRaw = obj.clients;
    const loansRaw = obj.loans;
    const chargesRaw = obj.charges;

    if (!Array.isArray(clientsRaw))
      throw new Error('El respaldo no contiene la lista de clientes.');
    if (!Array.isArray(loansRaw)) throw new Error('El respaldo no contiene la lista de préstamos.');
    if (!Array.isArray(chargesRaw)) throw new Error('El respaldo no contiene la lista de cargos.');

    const clients = (clientsRaw as Record<string, unknown>[]).map(parseClient);
    const loans = (loansRaw as Record<string, unknown>[]).map(parseLoan);
    const charges = (chargesRaw as Record<string, unknown>[]).map(parseCharge);

    const RESTORE_TX_TIMEOUT_MS = 120_000; // 2 min for large restores (many sequential creates)

    await prisma.$transaction(
      async (tx) => {
        await tx.charge.deleteMany({ where: { userId } });
        await tx.loan.deleteMany({ where: { userId } });
        await tx.client.deleteMany({ where: { userId } });

        for (const c of clients) {
          await tx.client.create({
            data: {
              id: c.id as string,
              clientId: c.clientId as string,
              name: c.name as string,
              surname: c.surname as string,
              address: c.address as string,
              phone: c.phone as string,
              search: (c.search as string[]) ?? [],
              createdAt: c.createdAt as Date,
              updatedAt: c.updatedAt as Date,
              userId,
            },
          });
        }

        if (loans.length) {
          for (const l of loans) {
            await tx.loan.create({
              data: {
                id: l.id as string,
                numberId: l.numberId as number,
                amount: l.amount as number,
                weeklyPayment: l.weeklyPayment as number,
                weeks: l.weeks as number,
                description: (l.description as string) ?? null,
                clientName: (l.clientName as string) ?? null,
                clientIdentifier: (l.clientIdentifier as string) ?? null,
                finished: (l.finished as boolean) ?? false,
                finishedDate: l.finishedDate as Date | null,
                visible: (l.visible as boolean) ?? true,
                expiredDate: l.expiredDate as Date,
                search: (l.search as string[]) ?? [],
                file: (l.file as string) ?? null,
                createdAt: l.createdAt as Date,
                updatedAt: l.updatedAt as Date,
                clientId: (l.clientId as string) ?? null,
                userId,
                payments:
                  (l.payments as { id: string | null; amount: number; created: Date }[]) ?? [],
              },
            });
          }
        }

        for (const c of charges) {
          await tx.charge.create({
            data: {
              id: c.id as string,
              amount: c.amount as number,
              description: (c.description as string) ?? null,
              paid: (c.paid as boolean) ?? false,
              paidDate: c.paidDate as Date | null,
              expirationDate: c.expirationDate as Date | null,
              createdAt: c.createdAt as Date,
              clientId: c.clientId as string,
              userId,
            },
          });
        }
      },
      { timeout: RESTORE_TX_TIMEOUT_MS }
    );

    let maxNumberId = 0;
    if (loans.length) {
      for (const l of loans) {
        const n = Number((l as { numberId?: number }).numberId);
        if (!isNaN(n) && n > maxNumberId) maxNumberId = n;
      }
      await prisma.counter.upsert({
        where: { name: 'loans' },
        update: { count: maxNumberId + 2 },
        create: { name: 'loans', count: maxNumberId + 2 },
      });
    }

    return { clients: clients.length, loans: loans.length, charges: charges.length };
  },
};
