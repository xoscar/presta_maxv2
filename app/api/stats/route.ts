import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { statsService } from '@/lib/services/stats.service';
import { unauthorized, validationError } from '@/lib/problem-details';

export async function GET(request: NextRequest) {
  const user = await getCurrentUser(request);

  if (!user) {
    return unauthorized();
  }

  const { searchParams } = new URL(request.url);
  const fromParam = searchParams.get('from');
  const toParam = searchParams.get('to');

  if (!fromParam || !toParam) {
    return validationError(
      [{ field: 'from', message: 'from is required' }, { field: 'to', message: 'to is required' }],
      'Query params from and to (ISO dates) are required'
    );
  }

  const from = new Date(fromParam);
  const to = new Date(toParam);

  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
    return validationError(
      [{ field: 'from', message: 'Invalid date' }, { field: 'to', message: 'Invalid date' }],
      'from and to must be valid ISO dates'
    );
  }

  if (from > to) {
    return validationError(
      [{ field: 'from', message: 'from must be before to' }],
      'from must be before or equal to to'
    );
  }

  const stats = await statsService.getStats(user.id, from, to);
  return NextResponse.json(stats);
}
