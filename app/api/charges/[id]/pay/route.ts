import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { chargeService } from '@/lib/services/charge.service';
import { getCurrentUser } from '@/lib/auth';
import { unauthorized, notFound, fromLegacyError } from '@/lib/problem-details';

// POST /api/charges/[id]/pay - Mark charge as paid
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return unauthorized();
    }

    const { id } = await params;

    // Check ownership
    const existingCharge = await prisma.charge.findFirst({
      where: { id, userId: user.id },
    });

    if (!existingCharge) {
      return notFound('charge', 'The requested charge was not found.', `/api/charges/${id}`);
    }

    // Mark as paid
    const charge = await chargeService.markAsPaid(id);

    return NextResponse.json(chargeService.toInfo(charge));
  } catch (error: any) {
    return fromLegacyError(error);
  }
}
