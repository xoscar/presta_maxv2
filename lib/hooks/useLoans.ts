import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { loansApi, paymentsApi, type LoansQueryParams } from '@/lib/api';
import type {
  LoanCreateInput,
  LoanUpdateInput,
  PaymentCreateInput,
  PaymentUpdateInput,
} from '@/types';
import { clientKeys } from './useClients';

// Query keys factory for loans
export const loanKeys = {
  all: ['loans'] as const,
  lists: () => [...loanKeys.all, 'list'] as const,
  list: (params: LoansQueryParams) => [...loanKeys.lists(), params] as const,
  details: () => [...loanKeys.all, 'detail'] as const,
  detail: (id: string) => [...loanKeys.details(), id] as const,
};

// Hook to fetch paginated loans list
export function useLoans(params: LoansQueryParams = {}) {
  return useQuery({
    queryKey: loanKeys.list(params),
    queryFn: () => loansApi.list(params),
  });
}

// Hook to fetch a single loan by ID
export function useLoan(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: loanKeys.detail(id),
    queryFn: () => loansApi.getById(id),
    enabled: options?.enabled ?? !!id,
  });
}

// Hook to create a new loan
export function useCreateLoan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LoanCreateInput) => loansApi.create(data),
    onSuccess: (newLoan) => {
      // Invalidate loans list and client details
      queryClient.invalidateQueries({ queryKey: loanKeys.lists() });
      if (newLoan.client_id) {
        queryClient.invalidateQueries({ queryKey: clientKeys.detail(newLoan.client_id) });
      }
    },
  });
}

// Hook to update a loan
export function useUpdateLoan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: LoanUpdateInput }) => loansApi.update(id, data),
    onSuccess: (updatedLoan) => {
      queryClient.invalidateQueries({ queryKey: loanKeys.detail(updatedLoan.id) });
      queryClient.invalidateQueries({ queryKey: loanKeys.lists() });
      if (updatedLoan.client_id) {
        queryClient.invalidateQueries({ queryKey: clientKeys.detail(updatedLoan.client_id) });
      }
    },
  });
}

// Hook to delete a loan
export function useDeleteLoan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, clientId }: { id: string; clientId?: string | null }) => loansApi.delete(id),
    onSuccess: (_, variables) => {
      // Remove from cache and invalidate lists
      queryClient.removeQueries({ queryKey: loanKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: loanKeys.lists() });
      // Also invalidate client if provided
      if (variables.clientId) {
        queryClient.invalidateQueries({ queryKey: clientKeys.detail(variables.clientId) });
      }
    },
  });
}

// Hook to create a payment
export function useCreatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ loanId, data }: { loanId: string; data: PaymentCreateInput }) =>
      paymentsApi.create(loanId, data),
    onSuccess: (_, variables) => {
      // Invalidate the loan detail to refetch with new payment
      queryClient.invalidateQueries({ queryKey: loanKeys.detail(variables.loanId) });
      queryClient.invalidateQueries({ queryKey: loanKeys.lists() });
      queryClient.invalidateQueries({ queryKey: clientKeys.all });
    },
  });
}

// Hook to update a payment
export function useUpdatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      loanId,
      paymentId,
      data,
    }: {
      loanId: string;
      paymentId: string;
      data: PaymentUpdateInput;
    }) => paymentsApi.update(loanId, paymentId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: loanKeys.detail(variables.loanId) });
      queryClient.invalidateQueries({ queryKey: loanKeys.lists() });
      queryClient.invalidateQueries({ queryKey: clientKeys.all });
    },
  });
}

// Hook to delete a payment
export function useDeletePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ loanId, paymentId }: { loanId: string; paymentId: string }) =>
      paymentsApi.delete(loanId, paymentId),
    onSuccess: (_, variables) => {
      // Invalidate the loan detail to refetch
      queryClient.invalidateQueries({ queryKey: loanKeys.detail(variables.loanId) });
      queryClient.invalidateQueries({ queryKey: loanKeys.lists() });
      queryClient.invalidateQueries({ queryKey: clientKeys.all });
    },
  });
}
