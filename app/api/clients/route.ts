import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { clientService } from '@/lib/services/client.service';
import { getCurrentUser } from '@/lib/auth';
import { unauthorized, fromLegacyError } from '@/lib/problem-details';

// GET /api/clients - List/search clients
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
    const skip = (page - 1) * limit;

    const where: any = { userId: user.id };

    if (search) {
      const searchLower = search.toLowerCase();
      where.OR = [
        { name: { contains: searchLower, mode: 'insensitive' } },
        { surname: { contains: searchLower, mode: 'insensitive' } },
        { clientId: { contains: searchLower, mode: 'insensitive' } },
        { phone: { contains: searchLower, mode: 'insensitive' } },
      ];
    }

    const [clients, total] = await Promise.all([
      prisma.client.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.client.count({ where }),
    ]);

    const clientsInfo = await Promise.all(clients.map((client) => clientService.toFullInfo(client)));

    return NextResponse.json({
      data: clientsInfo,
      total,
      page,
      limit,
      hasMore: skip + clients.length < total,
    });
  } catch (error: any) {
    return fromLegacyError(error);
  }
}

// POST /api/clients - Create a new client
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return unauthorized();
    }

    const body = await request.json();
    body.user_id = user.id;

    // Validate
    const validatedBody = await clientService.validateCreate(body);

    // Create client (explicitly pass user_id to satisfy type requirements)
    const client = await clientService.create({
      ...validatedBody,
      user_id: user.id,
    });

    return NextResponse.json(clientService.toBasicInfo(client), { status: 201 });
  } catch (error: any) {
    return fromLegacyError(error);
  }
}
