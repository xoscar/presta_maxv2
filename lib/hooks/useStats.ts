import { useQuery } from '@tanstack/react-query';
import { statsApi } from '@/lib/api';

export const statsKeys = {
  all: ['stats'] as const,
  detail: (from: string, to: string) => [...statsKeys.all, from, to] as const,
};

export function useStats(from: string, to: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: statsKeys.detail(from, to),
    queryFn: () => statsApi.get({ from, to }),
    enabled: (options?.enabled ?? true) && !!from && !!to,
  });
}
