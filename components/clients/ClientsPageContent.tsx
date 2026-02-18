'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Button,
  Card,
  CardContent,
  Badge,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  SearchInput,
  Pagination,
  PageLoader,
  FormInput,
} from '@/components/ui';
import { useClients, useCreateClient } from '@/lib/hooks';
import type { IClientFullInfo } from '@/types';
import { Loader2, Plus, User } from 'lucide-react';

export function ClientsPageContent() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    address: '',
    phone: '',
  });

  // React Query hooks
  const {
    data: clientsData,
    isLoading,
    isFetching,
  } = useClients({
    page,
    limit: 20,
    search: search || undefined,
  });

  const createClient = useCreateClient();

  const clients = clientsData?.data ?? [];
  const totalPages = clientsData ? Math.ceil(clientsData.total / clientsData.limit) : 1;

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    createClient.mutate(formData, {
      onSuccess: () => {
        setIsModalOpen(false);
        setFormData({ name: '', surname: '', address: '', phone: '' });
      },
    });
  };

  if (isLoading && clients.length === 0) {
    return <PageLoader />;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Clientes</h1>
        <Button data-testid="create-client-button" onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Cliente
        </Button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <SearchInput
          value={search}
          onChange={handleSearchChange}
          placeholder="Buscar clientes..."
        />
      </div>

      {/* Loading indicator for background fetching */}
      {isFetching && !isLoading && (
        <div className="absolute top-4 right-4">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
      )}

      {/* Clients list */}
      {clients.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No se encontraron clientes</p>
          </CardContent>
        </Card>
      ) : (
        <div data-testid="clients-list" className="grid gap-4">
          {clients.map((client: IClientFullInfo) => (
            <Link key={client.id} href={`/clients/${client.id}`} className="block">
              <Card
                data-testid="client-card"
                className="hover:shadow-lg transition-shadow cursor-pointer"
              >
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold capitalize">{client.name_complete}</h3>
                        <p className="text-sm text-muted-foreground">
                          {client.client_id} • {client.phone}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {client.active_loans && (
                        <Badge variant={client.expired_loans ? 'destructive' : 'default'}>
                          {client.expired_loans ? 'Vencido' : 'Activo'}
                        </Badge>
                      )}
                      {client.total_depth > 0 && (
                        <p className="text-lg font-semibold mt-1">
                          ${client.total_depth.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />

      {/* Create Client Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo Cliente</DialogTitle>
          </DialogHeader>
          <form data-testid="client-form" onSubmit={handleSubmit} className="space-y-4">
            {createClient.error && (
              <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
                {createClient.error.message}
              </div>
            )}

            <FormInput
              name="name"
              label="Nombre"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />

            <FormInput
              name="surname"
              label="Apellido"
              value={formData.surname}
              onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
              required
            />

            <FormInput
              name="address"
              label="Dirección"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              required
            />

            <FormInput
              name="phone"
              label="Teléfono"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createClient.isPending}>
                {createClient.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Crear Cliente
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ClientsPageContent;
