import { NextRequest, NextResponse } from 'next/server';
import { userService } from '@/lib/services/user.service';
import { createToken } from '@/lib/auth';
import { fromLegacyError } from '@/lib/problem-details';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate login credentials
    await userService.validateLogin(body);

    // Attempt login
    const user = await userService.login(body);

    // Create JWT token
    const token = await createToken({
      username: user.username,
      userId: user.id,
      token: user.token || '',
    });

    return NextResponse.json({
      user: userService.toInfo(user),
      token,
    });
  } catch (error: any) {
    return fromLegacyError(error);
  }
}
