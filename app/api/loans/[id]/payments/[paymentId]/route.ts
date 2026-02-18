import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { paymentService } from '@/lib/services/payment.service';
import { getCurrentUser } from '@/lib/auth';
import { unauthorized, notFound, fromLegacyError } from '@/lib/problem-details';

// GET /api/loans/[id]/payments/[paymentId] - Get payment by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; paymentId: string }> }
) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return unauthorized();
    }

    const { id: loanId, paymentId } = await params;

    // Check loan ownership
    const loan = await prisma.loan.findFirst({
      where: { id: loanId, userId: user.id },
    });

    if (!loan) {
      return notFound('loan', 'The requested loan was not found.', `/api/loans/${loanId}`);
    }

    const payment = await paymentService.findById(paymentId);
    if (!payment) {
      return notFound(
        'payment',
        'The requested payment was not found.',
        `/api/loans/${loanId}/payments/${paymentId}`
      );
    }

    // Ensure payment belongs to this loan
    const loanHasPayment = (loan.payments || []).some((p: { id: string | null }) => p.id === paymentId);
    if (!loanHasPayment) {
      return notFound(
        'payment',
        'The requested payment was not found.',
        `/api/loans/${loanId}/payments/${paymentId}`
      );
    }

    return NextResponse.json(paymentService.toInfo(payment, loanId));
  } catch (error: any) {
    return fromLegacyError(error);
  }
}

// PATCH /api/loans/[id]/payments/[paymentId] - Update payment
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; paymentId: string }> }
) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return unauthorized();
    }

    const { id: loanId, paymentId } = await params;
    const body = await request.json();

    // Check loan ownership
    const loan = await prisma.loan.findFirst({
      where: { id: loanId, userId: user.id },
    });

    if (!loan) {
      return notFound('loan', 'The requested loan was not found.', `/api/loans/${loanId}`);
    }

    const existingPayment = await paymentService.findById(paymentId);
    const loanHasPayment = (loan.payments || []).some((p: { id: string | null }) => p.id === paymentId);

    if (!existingPayment || !loanHasPayment) {
      return notFound(
        'payment',
        'The requested payment was not found.',
        `/api/loans/${loanId}/payments/${paymentId}`
      );
    }

    // Update payment
    const payment = await paymentService.update(paymentId, body);

    return NextResponse.json(paymentService.toInfo(payment, loanId));
  } catch (error: any) {
    return fromLegacyError(error);
  }
}

// DELETE /api/loans/[id]/payments/[paymentId] - Delete payment
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; paymentId: string }> }
) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return unauthorized();
    }

    const { id: loanId, paymentId } = await params;

    // Check loan ownership
    const loan = await prisma.loan.findFirst({
      where: { id: loanId, userId: user.id },
    });

    if (!loan) {
      return notFound('loan', 'The requested loan was not found.', `/api/loans/${loanId}`);
    }

    const payment = await paymentService.findById(paymentId);
    const loanHasPayment = (loan.payments || []).some((p: { id: string | null }) => p.id === paymentId);

    if (!payment || !loanHasPayment) {
      return notFound(
        'payment',
        'The requested payment was not found.',
        `/api/loans/${loanId}/payments/${paymentId}`
      );
    }

    await paymentService.deletePayment(paymentId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return fromLegacyError(error);
  }
}
