import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { clientService } from '@/lib/services/client.service';
import { getCurrentUser } from '@/lib/auth';
import { unauthorized, notFound, fromLegacyError } from '@/lib/problem-details';

// GET /api/clients/[id] - Get client by ID
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

    const clientInfo = await clientService.toFullInfo(client);
    return NextResponse.json(clientInfo);
  } catch (error: any) {
    return fromLegacyError(error);
  }
}

// PATCH /api/clients/[id] - Update client
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return unauthorized();
    }

    const { id } = await params;
    const body = await request.json();

    // Check ownership
    const existingClient = await prisma.client.findFirst({
      where: { id, userId: user.id },
    });

    if (!existingClient) {
      return notFound('client', 'The requested client was not found.', `/api/clients/${id}`);
    }

    // Validate
    const validatedBody = await clientService.validateUpdate(body);

    // Update client
    const client = await clientService.update(id, validatedBody);

    return NextResponse.json(clientService.toBasicInfo(client));
  } catch (error: any) {
    return fromLegacyError(error);
  }
}

// DELETE /api/clients/[id] - Delete client
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
    const client = await prisma.client.findFirst({
      where: { id, userId: user.id },
    });

    if (!client) {
      return notFound('client', 'The requested client was not found.', `/api/clients/${id}`);
    }

    await clientService.deleteClient(id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return fromLegacyError(error);
  }
}
