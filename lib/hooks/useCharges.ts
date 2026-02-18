import { useMutation, useQueryClient } from '@tanstack/react-query';
import { chargesApi } from '@/lib/api';
import type { ChargeCreateInput } from '@/types';
import { clientKeys } from './useClients';

export const chargeKeys = {
  all: ['charges'] as const,
  detail: (id: string) => [...chargeKeys.all, id] as const,
};

export function useCreateCharge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ChargeCreateInput) => chargesApi.create(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: clientKeys.detail(variables.client_id) });
    },
  });
}

export function useMarkChargePaid() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ chargeId, clientId }: { chargeId: string; clientId: string }) =>
      chargesApi.markAsPaid(chargeId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: clientKeys.detail(variables.clientId) });
    },
  });
}

export function useDeleteCharge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ chargeId, clientId }: { chargeId: string; clientId: string }) =>
      chargesApi.delete(chargeId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: clientKeys.detail(variables.clientId) });
    },
  });
}
