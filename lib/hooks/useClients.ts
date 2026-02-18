import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientsApi, type ClientsQueryParams } from '@/lib/api';
import type { ClientCreateInput, ClientUpdateInput } from '@/types';

// Query keys factory for clients
export const clientKeys = {
  all: ['clients'] as const,
  lists: () => [...clientKeys.all, 'list'] as const,
  list: (params: ClientsQueryParams) => [...clientKeys.lists(), params] as const,
  details: () => [...clientKeys.all, 'detail'] as const,
  detail: (id: string) => [...clientKeys.details(), id] as const,
};

// Hook to fetch paginated clients list
export function useClients(params: ClientsQueryParams = {}) {
  return useQuery({
    queryKey: clientKeys.list(params),
    queryFn: () => clientsApi.list(params),
  });
}

// Hook to fetch a single client by ID
export function useClient(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: clientKeys.detail(id),
    queryFn: () => clientsApi.getById(id),
    enabled: options?.enabled ?? !!id,
  });
}

// Hook to create a new client
export function useCreateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ClientCreateInput) => clientsApi.create(data),
    onSuccess: () => {
      // Invalidate clients list to refetch
      queryClient.invalidateQueries({ queryKey: clientKeys.lists() });
    },
  });
}

// Hook to update a client
export function useUpdateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ClientUpdateInput }) =>
      clientsApi.update(id, data),
    onSuccess: (_, variables) => {
      // Invalidate the specific client and lists
      queryClient.invalidateQueries({ queryKey: clientKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: clientKeys.lists() });
    },
  });
}

// Hook to delete a client
export function useDeleteClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => clientsApi.delete(id),
    onSuccess: (_, id) => {
      // Remove the client from cache and invalidate lists
      queryClient.removeQueries({ queryKey: clientKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: clientKeys.lists() });
    },
  });
}
