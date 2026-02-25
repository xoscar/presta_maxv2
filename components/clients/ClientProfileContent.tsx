'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  PageLoader,
  FormInput,
} from '@/components/ui';
import {
  useClient,
  useUpdateClient,
  useDeleteClient,
  useCreateLoan,
  useCreateCharge,
  useMarkChargePaid,
  useDeleteCharge,
} from '@/lib/hooks';
import type { ILoanInfo, IChargeInfo } from '@/types';
import { ArrowLeft, Loader2, Plus, Pencil, Trash2, Check } from 'lucide-react';

interface Props {
  clientId: string;
}

export function ClientProfileContent({ clientId }: Props) {
  const router = useRouter();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isChargeModalOpen, setIsChargeModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    address: '',
    phone: '',
  });
  const [loanFormData, setLoanFormData] = useState({
    amount: '',
    weekly_payment: '',
    weeks: '',
    description: '',
  });
  const [chargeFormData, setChargeFormData] = useState({
    amount: '',
    description: '',
  });

  // React Query hooks
  const { data: client, isLoading, error: fetchError } = useClient(clientId);
  const updateClient = useUpdateClient();
  const deleteClient = useDeleteClient();
  const createLoan = useCreateLoan();
  const createCharge = useCreateCharge();
  const markChargePaid = useMarkChargePaid();
  const deleteCharge = useDeleteCharge();

  // Sync form data when client is loaded
  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name,
        surname: client.surname,
        address: client.address,
        phone: client.phone,
      });
    }
  }, [client]);

  // Redirect if client not found
  useEffect(() => {
    if (fetchError) {
      router.push('/clients');
    }
  }, [fetchError, router]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    updateClient.mutate(
      { id: clientId, data: formData },
      {
        onSuccess: () => {
          setIsEditModalOpen(false);
        },
      }
    );
  };

  const handleCreateLoan = async (e: React.FormEvent) => {
    e.preventDefault();

    createLoan.mutate(
      {
        ...loanFormData,
        amount: Number(loanFormData.amount),
        weekly_payment: Number(loanFormData.weekly_payment),
        weeks: Number(loanFormData.weeks),
        client_id: clientId,
      },
      {
        onSuccess: () => {
          setIsLoanModalOpen(false);
          setLoanFormData({ amount: '', weekly_payment: '', weeks: '', description: '' });
        },
      }
    );
  };

  const handleDelete = async () => {
    deleteClient.mutate(clientId, {
      onSuccess: () => {
        router.push('/clients');
      },
    });
  };

  const handleCreateCharge = async (e: React.FormEvent) => {
    e.preventDefault();

    createCharge.mutate(
      {
        amount: Number(chargeFormData.amount),
        description: chargeFormData.description || undefined,
        client_id: clientId,
      },
      {
        onSuccess: () => {
          setIsChargeModalOpen(false);
          setChargeFormData({ amount: '', description: '' });
        },
      }
    );
  };

  const handleMarkChargePaid = async (chargeId: string) => {
    markChargePaid.mutate({ chargeId, clientId });
  };

  const handleDeleteCharge = async (chargeId: string) => {
    if (!confirm('¿Estás seguro de eliminar este cargo?')) return;
    deleteCharge.mutate({ chargeId, clientId });
  };

  if (isLoading) {
    return <PageLoader />;
  }

  if (!client) {
    return null;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-center gap-2 mb-6 md:gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href="/clients">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold capitalize truncate">{client.name_complete}</h1>
          <p className="text-muted-foreground">{client.client_id}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            data-testid="edit-client-button"
            variant="outline"
            onClick={() => setIsEditModalOpen(true)}
          >
            <Pencil className="h-4 w-4 mr-2" />
            Editar
          </Button>
          <Button variant="destructive" onClick={() => setIsDeleteModalOpen(true)}>
            <Trash2 className="h-4 w-4 mr-2" />
            Eliminar
          </Button>
        </div>
      </div>

      {/* Client info card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Información</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Teléfono</p>
              <p className="font-medium">{client.phone}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Dirección</p>
              <p className="font-medium">{client.address}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Cliente desde</p>
              <p className="font-medium">{client.created}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Deuda total</p>
              <p className="font-medium text-lg">${client.total_depth.toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Loans */}
      <Card className="mb-6">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>Préstamos Activos</CardTitle>
          <Button
            data-testid="create-loan-button"
            size="sm"
            onClick={() => setIsLoanModalOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Préstamo
          </Button>
        </CardHeader>
        <CardContent>
          {client.loans.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No hay préstamos activos</p>
          ) : (
            <div className="space-y-3">
              {client.loans.map((loan: ILoanInfo) => (
                <LoanCard key={loan.id} loan={loan} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Finished Loans */}
      {client.finished_loans.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Préstamos Finalizados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {client.finished_loans.map((loan: ILoanInfo) => (
                <LoanCard key={loan.id} loan={loan} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charges */}
      <Card className="mb-6">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>Cargos Pendientes ({client.charges.length})</CardTitle>
          <Button
            data-testid="create-charge-button"
            size="sm"
            variant="outline"
            onClick={() => setIsChargeModalOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Cargo
          </Button>
        </CardHeader>
        <CardContent>
          {client.charges.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No hay cargos pendientes</p>
          ) : (
            <div data-testid="charges-list" className="space-y-2">
              {client.charges.map((charge: IChargeInfo) => (
                <div
                  key={charge.id}
                  data-testid="charge-item"
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div>
                    <p className="font-medium">{charge.description || 'Cargo'}</p>
                    <p className="text-sm text-muted-foreground">{charge.created}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">${charge.amount.toLocaleString()}</p>
                    <Button
                      data-testid="mark-charge-paid-button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleMarkChargePaid(charge.id)}
                      disabled={markChargePaid.isPending}
                      className="text-green-600 hover:text-green-700 hover:bg-green-100"
                      title="Marcar como pagado"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      data-testid="delete-charge-button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteCharge(charge.id)}
                      disabled={deleteCharge.isPending}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      title="Eliminar cargo"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Cliente</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            {updateClient.error && (
              <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
                {updateClient.error.message}
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
              <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={updateClient.isPending}>
                {updateClient.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Guardar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create Loan Modal */}
      <Dialog open={isLoanModalOpen} onOpenChange={setIsLoanModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo Préstamo</DialogTitle>
          </DialogHeader>
          <form data-testid="loan-form" onSubmit={handleCreateLoan} className="space-y-4">
            {createLoan.error && (
              <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
                {createLoan.error.message}
              </div>
            )}
            <FormInput
              name="amount"
              label="Cantidad"
              type="number"
              value={loanFormData.amount}
              onChange={(e) => setLoanFormData({ ...loanFormData, amount: e.target.value })}
              required
            />
            <FormInput
              name="weekly_payment"
              label="Pago Semanal"
              type="number"
              value={loanFormData.weekly_payment}
              onChange={(e) => setLoanFormData({ ...loanFormData, weekly_payment: e.target.value })}
              required
            />
            <FormInput
              name="weeks"
              label="Semanas"
              type="number"
              value={loanFormData.weeks}
              onChange={(e) => setLoanFormData({ ...loanFormData, weeks: e.target.value })}
              required
            />
            <FormInput
              name="description"
              label="Descripción (opcional)"
              value={loanFormData.description}
              onChange={(e) => setLoanFormData({ ...loanFormData, description: e.target.value })}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsLoanModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createLoan.isPending}>
                {createLoan.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Crear Préstamo
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create Charge Modal */}
      <Dialog open={isChargeModalOpen} onOpenChange={setIsChargeModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo Cargo</DialogTitle>
          </DialogHeader>
          <form data-testid="charge-form" onSubmit={handleCreateCharge} className="space-y-4">
            {createCharge.error && (
              <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
                {createCharge.error.message}
              </div>
            )}
            <FormInput
              name="charge_amount"
              label="Cantidad"
              type="number"
              value={chargeFormData.amount}
              onChange={(e) => setChargeFormData({ ...chargeFormData, amount: e.target.value })}
              required
            />
            <FormInput
              name="charge_description"
              label="Descripción (opcional)"
              value={chargeFormData.description}
              onChange={(e) =>
                setChargeFormData({ ...chargeFormData, description: e.target.value })
              }
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsChargeModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createCharge.isPending}>
                {createCharge.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Crear Cargo
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Cliente</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar este cliente? Esta acción eliminará también todos
              sus préstamos y no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          {deleteClient.error && (
            <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
              {deleteClient.error.message}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteClient.isPending}>
              {deleteClient.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function LoanCard({ loan }: { loan: ILoanInfo }) {
  return (
    <Link
      href={`/loans/${loan.id}`}
      className="block p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium">#{loan.number_id}</span>
            {loan.expired && !loan.finished && <Badge variant="destructive">Vencido</Badge>}
            {loan.finished && (
              <Badge variant="outline" className="border-green-500 text-green-600">
                Finalizado
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            ${loan.amount.toLocaleString()} • {loan.weeks} semanas • {loan.payments?.length ?? 0}{' '}
            {loan.payments?.length === 1 ? 'pago' : 'pagos'} • {loan.created}
          </p>
          <p className="text-sm text-muted-foreground mt-0.5">
            Pago semanal: ${loan.weekly_payment.toLocaleString()}
            {loan.last_payment_from_now != null
              ? ` • Último pago: ${loan.last_payment_from_now}`
              : ' • Sin pagos aún'}
          </p>
        </div>
        <div className="text-right">
          <p className="font-semibold">${loan.current_balance.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">Saldo</p>
        </div>
      </div>
    </Link>
  );
}

export default ClientProfileContent;
