import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { loanService } from '@/lib/services/loan.service';
import { clientService } from '@/lib/services/client.service';
import { getCurrentUser } from '@/lib/auth';
import { unauthorized, notFound, fromLegacyError } from '@/lib/problem-details';

// GET /api/loans/[id] - Get loan by ID
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return unauthorized();
    }

    const { id } = await params;
    const loan = await prisma.loan.findFirst({
      where: { id, userId: user.id },
      include: { client: true },
    });

    if (!loan) {
      return notFound('loan', 'The requested loan was not found.', `/api/loans/${id}`);
    }

    const loanInfo = loanService.toFullInfo(
      loan,
      loan.client ? clientService.toBasicInfo(loan.client) : undefined
    );

    return NextResponse.json(loanInfo);
  } catch (error: any) {
    return fromLegacyError(error);
  }
}

// PATCH /api/loans/[id] - Update loan
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return unauthorized();
    }

    const { id } = await params;
    const body = await request.json();

    // Check ownership
    const existingLoan = await prisma.loan.findFirst({
      where: { id, userId: user.id },
    });

    if (!existingLoan) {
      return notFound('loan', 'The requested loan was not found.', `/api/loans/${id}`);
    }

    // Validate
    const validatedBody = await loanService.validateUpdate(body);

    // Update loan
    const loan = await loanService.update(id, validatedBody);

    // Get client info
    const client = loan.clientId
      ? await prisma.client.findUnique({
          where: { id: loan.clientId },
        })
      : null;

    const loanInfo = loanService.toFullInfo(
      loan,
      client ? clientService.toBasicInfo(client) : undefined
    );

    return NextResponse.json(loanInfo);
  } catch (error: any) {
    return fromLegacyError(error);
  }
}

// DELETE /api/loans/[id] - Delete loan
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return unauthorized();
    }

    const { id } = await params;

    // Check ownership
    const loan = await prisma.loan.findFirst({
      where: { id, userId: user.id },
    });

    if (!loan) {
      return notFound('loan', 'The requested loan was not found.', `/api/loans/${id}`);
    }

    await loanService.deleteLoan(id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return fromLegacyError(error);
  }
}
