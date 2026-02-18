import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { paymentService } from '@/lib/services/payment.service';
import { loanService } from '@/lib/services/loan.service';
import { getCurrentUser } from '@/lib/auth';
import { unauthorized, notFound, fromLegacyError } from '@/lib/problem-details';

// POST /api/loans/[id]/payments - Create a payment
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return unauthorized();
    }

    const { id: loanId } = await params;
    const body = await request.json();

    // Check loan ownership
    const loan = await prisma.loan.findFirst({
      where: { id: loanId, userId: user.id },
    });

    if (!loan) {
      return notFound('loan', 'The requested loan was not found.', `/api/loans/${loanId}`);
    }

    // Create payment
    const payment = await paymentService.create(loanId, body);

    return NextResponse.json(paymentService.toInfo(payment, loanId), { status: 201 });
  } catch (error: any) {
    return fromLegacyError(error);
  }
}

// GET /api/loans/[id]/payments - Get all payments for a loan
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return unauthorized();
    }

    const { id: loanId } = await params;

    // Check loan ownership (payments are embedded on loan)
    const loan = await prisma.loan.findFirst({
      where: { id: loanId, userId: user.id },
    });

    if (!loan) {
      return notFound('loan', 'The requested loan was not found.', `/api/loans/${loanId}`);
    }

    const paymentsInfo = loanService.getPaymentsInfo(loan);

    return NextResponse.json({ payments: paymentsInfo });
  } catch (error: any) {
    return fromLegacyError(error);
  }
}
