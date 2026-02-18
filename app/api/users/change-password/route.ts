import { NextRequest, NextResponse } from 'next/server';
import { userService } from '@/lib/services/user.service';
import { getCurrentUser } from '@/lib/auth';
import { unauthorized, fromLegacyError } from '@/lib/problem-details';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return unauthorized();
    }

    const body = await request.json();
    const { currentPassword, newPassword } = userService.validateChangePassword(body);

    const fullUser = await userService.findById(user.id);
    if (!fullUser) {
      return unauthorized();
    }

    const isMatch = await userService.comparePassword(fullUser, currentPassword);
    if (!isMatch) {
      return unauthorized('Contraseña actual incorrecta.');
    }

    await userService.updatePassword(user.id, newPassword);

    return new NextResponse(null, { status: 204 });
  } catch (error: unknown) {
    return fromLegacyError(
      error as { statusCode?: number; messages?: Array<{ code: string; text: string }>; type?: string; message?: string }
    );
  }
}
