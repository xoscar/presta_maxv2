import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { chargeService } from '@/lib/services/charge.service';
import { getCurrentUser } from '@/lib/auth';
import { unauthorized, notFound, fromLegacyError } from '@/lib/problem-details';

// GET /api/charges/[id] - Get charge by ID
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return unauthorized();
    }

    const { id } = await params;
    const charge = await prisma.charge.findFirst({
      where: { id, userId: user.id },
    });

    if (!charge) {
      return notFound('charge', 'The requested charge was not found.', `/api/charges/${id}`);
    }

    return NextResponse.json(chargeService.toInfo(charge));
  } catch (error: any) {
    return fromLegacyError(error);
  }
}

// PATCH /api/charges/[id] - Update charge
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return unauthorized();
    }

    const { id } = await params;
    const body = await request.json();

    // Check ownership
    const existingCharge = await prisma.charge.findFirst({
      where: { id, userId: user.id },
    });

    if (!existingCharge) {
      return notFound('charge', 'The requested charge was not found.', `/api/charges/${id}`);
    }

    // Validate
    const validatedBody = await chargeService.validateUpdate(body);

    // Update charge
    const charge = await chargeService.update(id, validatedBody);

    return NextResponse.json(chargeService.toInfo(charge));
  } catch (error: any) {
    return fromLegacyError(error);
  }
}

// DELETE /api/charges/[id] - Delete charge
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
    const charge = await prisma.charge.findFirst({
      where: { id, userId: user.id },
    });

    if (!charge) {
      return notFound('charge', 'The requested charge was not found.', `/api/charges/${id}`);
    }

    await chargeService.deleteCharge(id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return fromLegacyError(error);
  }
}
