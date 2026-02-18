import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { clientService } from '@/lib/services/client.service';
import { getCurrentUser } from '@/lib/auth';
import { unauthorized, notFound, fromLegacyError } from '@/lib/problem-details';

// GET /api/clients/[id]/loans - Get client's loans
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return unauthorized();
    }

    const { id } = await params;
    const client = await prisma.client.findFirst({
      where: { id, userId: user.id },
    });

    if (!client) {
      return notFound('client', 'The requested client was not found.', `/api/clients/${id}`);
    }

    const { searchParams } = new URL(request.url);
    const finished = searchParams.get('finished');

    let loans;
    if (finished !== null) {
      loans = await clientService.getLoans(id, { finished: finished === 'true' });
    } else {
      loans = await clientService.getLoans(id);
    }

    return NextResponse.json(loans);
  } catch (error: any) {
    return fromLegacyError(error);
  }
}
