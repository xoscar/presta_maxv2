/**
 * Database Seeding Script
 *
 * Usage:
 *   npm run db:seed           - Add data without clearing (additive mode)
 *   npm run db:seed:reset     - Clear database and create fresh data
 *   npx prisma db seed        - Alternative using Prisma CLI
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local (Next.js convention)
config({ path: resolve(process.cwd(), '.env.local') });

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { generators } from './generators';

const prisma = new PrismaClient();

// Configuration
const CONFIG = {
  clientCount: { min: 30, max: 50 },
  loansPerClient: { min: 1, max: 4 },
  chargesProbability: 0.3, // 30% of clients have charges
  finishedLoanProbability: 0.3, // 30% of loans are finished
  expiredLoanProbability: 0.1, // 10% of active loans are expired
  paidChargeProbability: 0.3, // 30% of charges are paid
};

async function clearDatabase() {
  console.log('🗑️  Clearing database...');

  // Delete in order to respect foreign key constraints
  await prisma.payment.deleteMany();
  console.log('   ✓ Payments deleted');

  await prisma.charge.deleteMany();
  console.log('   ✓ Charges deleted');

  await prisma.loan.deleteMany();
  console.log('   ✓ Loans deleted');

  await prisma.client.deleteMany();
  console.log('   ✓ Clients deleted');

  await prisma.user.deleteMany();
  console.log('   ✓ Users deleted');

  await prisma.counter.deleteMany();
  console.log('   ✓ Counters deleted');

  console.log('');
}

async function createTestUser() {
  console.log('👤 Creating test user...');

  const existingUser = await prisma.user.findUnique({
    where: { username: 'admin' },
  });

  if (existingUser) {
    console.log('   ✓ User "admin" already exists');
    return existingUser;
  }

  const user = await prisma.user.create({
    data: {
      username: 'admin',
      password: await bcrypt.hash('admin123', 10),
      name: 'Administrador',
      role: 'admin',
    },
  });

  console.log('   ✓ Created user: admin / admin123');
  return user;
}

async function getOrCreateCounter() {
  let counter = await prisma.counter.findUnique({
    where: { name: 'loans' },
  });

  if (!counter) {
    counter = await prisma.counter.create({
      data: { name: 'loans', count: 1 },
    });
  }

  return counter;
}

async function getNextLoanId(): Promise<number> {
  const counter = await prisma.counter.update({
    where: { name: 'loans' },
    data: { count: { increment: 1 } },
  });
  return counter.count - 1;
}

async function createClient(userId: string, index: number) {
  const nombre = generators.nombre();
  const apellido = generators.apellido();
  const createdAt = generators.fechaPasada(365);

  const client = await prisma.client.create({
    data: {
      clientId: generators.clientId(index),
      name: nombre,
      surname: apellido,
      address: generators.direccion(),
      phone: generators.telefono(),
      search: generators.searchTerms(nombre, apellido),
      userId,
      createdAt,
      updatedAt: createdAt,
    },
  });

  return client;
}

async function createLoan(
  userId: string,
  clientId: string,
  clientName: string,
  clientIdentifier: string,
  loanCreatedAt: Date
) {
  const numberId = await getNextLoanId();
  const amount = generators.montoPrestramo();
  const weeks = generators.semanas();
  const weeklyPayment = generators.pagoSemanal(amount, weeks);
  const description = generators.descripcionPrestamo();

  // Determine loan status
  const isFinished = generators.randomBool(CONFIG.finishedLoanProbability);
  const expiredDate = generators.fechaVencimiento(loanCreatedAt, weeks);
  const isExpired = !isFinished && expiredDate < new Date();

  let finishedDate: Date | null = null;
  if (isFinished) {
    // Finished date is sometime between creation and expiration
    const finishEnd = new Date(Math.min(expiredDate.getTime(), Date.now()));
    finishedDate = generators.randomDate(loanCreatedAt, finishEnd);
  }

  const loan = await prisma.loan.create({
    data: {
      numberId,
      amount,
      weeklyPayment,
      weeks,
      description,
      clientName,
      clientIdentifier,
      finished: isFinished,
      finishedDate,
      visible: true,
      expiredDate,
      search: [`#${numberId}`, clientName.toLowerCase(), clientIdentifier.toLowerCase()],
      userId,
      clientId,
      createdAt: loanCreatedAt,
      updatedAt: loanCreatedAt,
    },
  });

  // Create payments for this loan
  await createPayments(loan.id, amount, weeklyPayment, weeks, loanCreatedAt, isFinished);

  return { loan, isFinished, isExpired };
}

async function createPayments(
  loanId: string,
  totalAmount: number,
  weeklyPayment: number,
  weeks: number,
  loanCreatedAt: Date,
  isFinished: boolean
) {
  // Calculate how many payments to create
  const now = new Date();
  const weeksSinceLoan = Math.floor(
    (now.getTime() - loanCreatedAt.getTime()) / (7 * 24 * 60 * 60 * 1000)
  );

  let paymentsToCreate: number;
  if (isFinished) {
    // Finished loans have all payments
    paymentsToCreate = weeks;
  } else {
    // Active loans have random number of payments based on time passed
    const maxPayments = Math.min(weeksSinceLoan, weeks);
    // Sometimes clients miss payments, so vary between 50-100% of expected
    paymentsToCreate = Math.floor(maxPayments * generators.randomFloat(0.5, 1.0));
  }

  let totalPaid = 0;
  const payments: { amount: number; createdAt: Date }[] = [];

  for (let i = 0; i < paymentsToCreate; i++) {
    // Calculate payment date (roughly weekly from loan creation)
    const paymentDate = new Date(loanCreatedAt);
    paymentDate.setDate(paymentDate.getDate() + (i + 1) * 7 + generators.randomInt(-2, 2));

    // Don't create future payments
    if (paymentDate > now) continue;

    // Last payment might be different to finish the loan
    let paymentAmount: number;
    if (isFinished && i === paymentsToCreate - 1) {
      // Final payment covers remaining balance
      paymentAmount = totalAmount - totalPaid;
    } else {
      // Normal weekly payment with slight variation
      paymentAmount = weeklyPayment + generators.randomInt(-50, 50);
    }

    // Don't overpay
    if (totalPaid + paymentAmount > totalAmount) {
      paymentAmount = totalAmount - totalPaid;
    }

    if (paymentAmount > 0) {
      payments.push({ amount: paymentAmount, createdAt: paymentDate });
      totalPaid += paymentAmount;
    }
  }

  // Batch create payments
  if (payments.length > 0) {
    await prisma.payment.createMany({
      data: payments.map((p) => ({
        amount: p.amount,
        createdAt: p.createdAt,
        loanId,
      })),
    });
  }

  return payments.length;
}

async function createCharge(userId: string, clientId: string, clientCreatedAt: Date) {
  const isPaid = generators.randomBool(CONFIG.paidChargeProbability);
  const createdAt = generators.randomDate(clientCreatedAt, new Date());

  let paidDate: Date | null = null;
  let expirationDate: Date | null = null;

  if (isPaid) {
    paidDate = generators.randomDate(createdAt, new Date());
  } else {
    // Set expiration date in the future or past (for overdue charges)
    const daysOffset = generators.randomInt(-30, 60);
    expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + daysOffset);
  }

  await prisma.charge.create({
    data: {
      amount: generators.montoCargo(),
      description: generators.descripcionCargo(),
      paid: isPaid,
      paidDate,
      expirationDate,
      createdAt,
      userId,
      clientId,
    },
  });
}

async function seed() {
  const reset = process.argv.includes('--reset');

  console.log('');
  console.log('🌱 PrestaMax Database Seeder');
  console.log('============================');
  console.log(`Mode: ${reset ? 'RESET (clear + seed)' : 'ADDITIVE (append)'}`);
  console.log('');

  if (reset) {
    await clearDatabase();
  }

  // Create or get test user
  const user = await createTestUser();
  console.log('');

  // Ensure counter exists
  await getOrCreateCounter();

  // Generate clients
  const clientCount = generators.randomInt(CONFIG.clientCount.min, CONFIG.clientCount.max);
  console.log(`👥 Creating ${clientCount} clients with loans and charges...`);

  let totalLoans = 0;
  let finishedLoans = 0;
  let expiredLoans = 0;
  let totalPayments = 0;
  let totalCharges = 0;

  // Get current client count for indexing
  const existingClients = await prisma.client.count();

  for (let i = 0; i < clientCount; i++) {
    const clientIndex = existingClients + i + 1;
    const client = await createClient(user.id, clientIndex);

    // Create loans for this client
    const loanCount = generators.randomInt(CONFIG.loansPerClient.min, CONFIG.loansPerClient.max);

    for (let j = 0; j < loanCount; j++) {
      // Loans created after client was created
      const loanCreatedAt = generators.randomDate(client.createdAt, new Date());

      const { isFinished, isExpired } = await createLoan(
        user.id,
        client.id,
        `${client.name} ${client.surname}`,
        client.clientId,
        loanCreatedAt
      );

      totalLoans++;
      if (isFinished) finishedLoans++;
      if (isExpired) expiredLoans++;
    }

    // Maybe create charges for this client
    if (generators.randomBool(CONFIG.chargesProbability)) {
      const chargeCount = generators.randomInt(1, 2);
      for (let k = 0; k < chargeCount; k++) {
        await createCharge(user.id, client.id, client.createdAt);
        totalCharges++;
      }
    }

    // Progress indicator
    if ((i + 1) % 10 === 0 || i === clientCount - 1) {
      process.stdout.write(`\r   Progress: ${i + 1}/${clientCount} clients`);
    }
  }

  // Count actual payments
  totalPayments = await prisma.payment.count();

  console.log('\n');
  console.log('📊 Summary:');
  console.log(`   • Clients: ${clientCount}`);
  console.log(`   • Loans: ${totalLoans} (${finishedLoans} finished, ${expiredLoans} expired)`);
  console.log(`   • Payments: ${totalPayments}`);
  console.log(`   • Charges: ${totalCharges}`);
  console.log('');
  console.log('✅ Seeding complete!');
  console.log('');
  console.log('🔑 Login credentials:');
  console.log('   Username: admin');
  console.log('   Password: admin123');
  console.log('');
}

seed()
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
