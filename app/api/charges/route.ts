import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { chargeService } from '@/lib/services/charge.service';
import { getCurrentUser } from '@/lib/auth';
import { unauthorized, notFound, fromLegacyError } from '@/lib/problem-details';

// POST /api/charges - Create a new charge
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return unauthorized();
    }

    const body = await request.json();

    // Validate
    const validatedBody = await chargeService.validateCreate(body);

    // Verify client exists
    const client = await prisma.client.findFirst({
      where: {
        id: validatedBody.client_id,
        userId: user.id,
      },
    });

    if (!client) {
      return notFound(
        'client',
        'The client for this charge was not found.',
        `/api/clients/${validatedBody.client_id}`
      );
    }

    // Create charge
    const charge = await chargeService.create({
      ...validatedBody,
      user_id: user.id,
    });

    return NextResponse.json(chargeService.toInfo(charge), { status: 201 });
  } catch (error: any) {
    return fromLegacyError(error);
  }
}
