import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { loanService } from '@/lib/services/loan.service';
import { clientService } from '@/lib/services/client.service';
import { getCurrentUser } from '@/lib/auth';
import { unauthorized, notFound, fromLegacyError } from '@/lib/problem-details';

// GET /api/loans - List/search loans
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return unauthorized();
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const finished = searchParams.get('finished');
    const skip = (page - 1) * limit;

    const where: any = { userId: user.id };

    if (search) {
      const searchLower = search.toLowerCase();
      const searchNum = parseInt(search.replace('#', ''), 10);

      where.OR = [
        { clientName: { contains: searchLower, mode: 'insensitive' } },
        { clientIdentifier: { contains: searchLower, mode: 'insensitive' } },
        { description: { contains: searchLower, mode: 'insensitive' } },
        ...(isNaN(searchNum) ? [] : [{ numberId: searchNum }]),
      ];
    }

    if (finished !== null && finished !== undefined) {
      where.finished = finished === 'true';
    }

    const [loans, total] = await Promise.all([
      prisma.loan.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.loan.count({ where }),
    ]);

    const loansInfo = loans.map((loan) => loanService.toBasicInfo(loan));

    return NextResponse.json({
      data: loansInfo,
      total,
      page,
      limit,
      hasMore: skip + loans.length < total,
    });
  } catch (error: any) {
    console.log(error);
    return fromLegacyError(error);
  }
}

// POST /api/loans - Create a new loan
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return unauthorized();
    }

    const body = await request.json();

    // Validate
    const validatedBody = await loanService.validateCreate(body);

    // Get client info
    const client = await prisma.client.findFirst({
      where: {
        id: validatedBody.client_id,
        userId: user.id,
      },
    });

    if (!client) {
      return notFound(
        'client',
        'The client for this loan was not found.',
        `/api/clients/${validatedBody.client_id}`
      );
    }

    // Create loan
    const loan = await loanService.create({
      ...validatedBody,
      user_id: user.id,
      client_name: `${client.name} ${client.surname}`,
      client_identifier: client.clientId,
    });

    const loanInfo = loanService.toFullInfo(loan, clientService.toBasicInfo(client));
    return NextResponse.json(loanInfo, { status: 201 });
  } catch (error: any) {
    return fromLegacyError(error);
  }
}
