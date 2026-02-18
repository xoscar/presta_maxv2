import { NextRequest, NextResponse } from 'next/server';
import { userService } from '@/lib/services/user.service';
import { getCurrentUser } from '@/lib/auth';
import { unauthorized, notFound, fromLegacyError } from '@/lib/problem-details';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return unauthorized();
    }

    const { userId } = await params;
    const foundUser = await userService.findById(userId);

    if (!foundUser) {
      return notFound('user', 'The requested user was not found.', `/api/users/${userId}`);
    }

    return NextResponse.json(userService.toInfo(foundUser));
  } catch (error: any) {
    return fromLegacyError(error);
  }
}
