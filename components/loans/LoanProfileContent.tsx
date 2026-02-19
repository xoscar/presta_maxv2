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
  Progress,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  PageLoader,
  FormInput,
  Separator,
} from '@/components/ui';
import {
  useLoan,
  useDeleteLoan,
  useUpdateLoan,
  useCreatePayment,
  useUpdatePayment,
  useDeletePayment,
} from '@/lib/hooks';
import type { IPaymentInfo } from '@/types';
import { ArrowLeft, Plus, Trash2, Loader2, Pencil } from 'lucide-react';

interface Props {
  loanId: string;
}

export function LoanProfileContent({ loanId }: Props) {
  const router = useRouter();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditLoanModalOpen, setIsEditLoanModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<IPaymentInfo | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editWeeklyPayment, setEditWeeklyPayment] = useState('');
  const [editWeeks, setEditWeeks] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPaymentAmount, setEditPaymentAmount] = useState('');
  const [editPaymentCreated, setEditPaymentCreated] = useState('');

  // React Query hooks
  const { data: loan, isLoading, error: fetchError } = useLoan(loanId);
  const deleteLoan = useDeleteLoan();
  const updateLoan = useUpdateLoan();
  const createPayment = useCreatePayment();
  const updatePayment = useUpdatePayment();
  const deletePayment = useDeletePayment();

  // Redirect if loan not found
  useEffect(() => {
    if (fetchError) {
      router.push('/loans');
    }
  }, [fetchError, router]);

  // Sync edit loan form when opening modal
  useEffect(() => {
    if (isEditLoanModalOpen && loan) {
      setEditAmount(String(loan.amount));
      setEditWeeklyPayment(String(loan.weekly_payment));
      setEditWeeks(String(loan.weeks));
      setEditDescription(loan.description ?? '');
    }
  }, [isEditLoanModalOpen, loan]);

  // Sync edit payment form when opening modal
  useEffect(() => {
    if (editingPayment) {
      setEditPaymentAmount(String(editingPayment.amount));
      setEditPaymentCreated('');
    }
  }, [editingPayment]);

  const handleEditLoan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loan?.client_id) return;
    updateLoan.mutate(
      {
        id: loanId,
        data: {
          amount: Number(editAmount),
          weekly_payment: Number(editWeeklyPayment),
          weeks: Number(editWeeks),
          description: editDescription.trim() || undefined,
          client_id: loan.client_id,
        },
      },
      { onSuccess: () => setIsEditLoanModalOpen(false) }
    );
  };

  const handleEditPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPayment) return;
    const data: { amount: number; created?: string } = {
      amount: Number(editPaymentAmount),
    };
    if (editPaymentCreated.trim()) {
      data.created = new Date(editPaymentCreated).toISOString();
    }
    updatePayment.mutate(
      { loanId, paymentId: editingPayment.id, data },
      { onSuccess: () => setEditingPayment(null) }
    );
  };

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();

    createPayment.mutate(
      { loanId, data: { amount: Number(paymentAmount) } },
      {
        onSuccess: () => {
          setIsPaymentModalOpen(false);
          setPaymentAmount('');
        },
      }
    );
  };

  const handleDeletePayment = async (paymentId: string) => {
    if (!confirm('¿Estás seguro de eliminar este pago?')) return;

    deletePayment.mutate({ loanId, paymentId });
  };

  const handleDeleteLoan = async () => {
    deleteLoan.mutate(
      { id: loanId, clientId: loan?.client_id },
      {
        onSuccess: () => {
          router.push('/loans');
        },
      }
    );
  };

  if (isLoading) {
    return <PageLoader />;
  }

  if (!loan) {
    return null;
  }

  const progressPercent = ((loan.amount - loan.current_balance) / loan.amount) * 100;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-center gap-2 mb-6 md:gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link href="/loans">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold">Préstamo #{loan.number_id}</h1>
          {loan.client && (
            <Link
              href={`/clients/${loan.client_id}`}
              className="text-primary hover:underline capitalize"
            >
              {loan.client.name_complete}
            </Link>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {loan.client_id && (
            <Button
              variant="outline"
              onClick={() => setIsEditLoanModalOpen(true)}
              data-testid="edit-loan-button"
            >
              <Pencil className="h-4 w-4 mr-2" />
              Editar
            </Button>
          )}
          {!loan.finished && (
            <Button data-testid="add-payment-button" onClick={() => setIsPaymentModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Pago
            </Button>
          )}
          <Button variant="destructive" onClick={() => setIsDeleteModalOpen(true)}>
            <Trash2 className="h-4 w-4 mr-2" />
            Eliminar
          </Button>
        </div>
      </div>

      {/* Status badges */}
      <div className="flex gap-2 mb-6">
        {loan.expired && !loan.finished && <Badge variant="destructive">Vencido</Badge>}
        {loan.finished && (
          <Badge variant="outline" className="border-green-500 text-green-600">
            Finalizado
          </Badge>
        )}
        {!loan.finished && !loan.expired && (
          <Badge variant="secondary">Activo - Semana {loan.current_week}</Badge>
        )}
      </div>

      {/* Loan info card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Información del Préstamo</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Progress bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span>Progreso de pago</span>
              <span>{progressPercent.toFixed(1)}%</span>
            </div>
            <Progress value={progressPercent} className="h-3" />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
            <div>
              <p className="text-sm text-muted-foreground">Monto Original</p>
              <p className="text-xl font-semibold">${loan.amount.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Saldo Actual</p>
              <p className="text-xl font-semibold text-primary">
                ${loan.current_balance.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pago Semanal</p>
              <p className="text-xl font-semibold">${loan.weekly_payment.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Semanas</p>
              <p className="text-xl font-semibold">{loan.weeks}</p>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
            <div>
              <p className="text-sm text-muted-foreground">Fecha de creación</p>
              <p className="font-medium">{loan.created}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Fecha de vencimiento</p>
              <p className="font-medium">{loan.expired_date}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Último pago</p>
              <p className="font-medium">{loan.last_payment_from_now || 'Sin pagos'}</p>
            </div>
            {loan.finished_date && (
              <div>
                <p className="text-sm text-muted-foreground">Fecha de finalización</p>
                <p className="font-medium">{loan.finished_date}</p>
              </div>
            )}
          </div>

          {loan.description && (
            <>
              <Separator className="my-4" />
              <div>
                <p className="text-sm text-muted-foreground">Descripción</p>
                <p className="font-medium">{loan.description}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Payments */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Pagos ({loan.payments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loan.payments.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No hay pagos registrados</p>
          ) : (
            <div className="space-y-2">
              {loan.payments.map((payment: IPaymentInfo) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-4 bg-muted rounded-lg"
                >
                  <div>
                    <p className="font-semibold">${payment.amount.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">{payment.created}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {payment.created_from_now}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingPayment(payment)}
                      disabled={updatePayment.isPending}
                      data-testid={`edit-payment-button-${payment.id}`}
                      title="Editar pago"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeletePayment(payment.id)}
                      disabled={deletePayment.isPending}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
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

      {/* Add Payment Modal */}
      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Pago</DialogTitle>
          </DialogHeader>
          <form data-testid="payment-form" onSubmit={handleAddPayment} className="space-y-4">
            {createPayment.error && (
              <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
                {createPayment.error.message}
              </div>
            )}

            <div className="text-center mb-4">
              <p className="text-sm text-muted-foreground">Saldo actual</p>
              <p className="text-2xl font-bold">${loan.current_balance.toLocaleString()}</p>
            </div>

            <FormInput
              name="amount"
              label="Monto del pago"
              type="number"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              max={loan.current_balance}
              required
            />

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPaymentAmount(loan.weekly_payment.toString())}
              >
                Pago semanal (${loan.weekly_payment})
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPaymentAmount(loan.current_balance.toString())}
              >
                Saldar todo
              </Button>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsPaymentModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createPayment.isPending}>
                {createPayment.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Agregar Pago
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Loan Modal */}
      <Dialog open={isEditLoanModalOpen} onOpenChange={setIsEditLoanModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Préstamo</DialogTitle>
            <DialogDescription>
              Modifica el monto, pago semanal o semanas del préstamo.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditLoan} className="space-y-4">
            {updateLoan.error && (
              <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
                {updateLoan.error.message}
              </div>
            )}
            <FormInput
              name="amount"
              label="Monto"
              type="number"
              value={editAmount}
              onChange={(e) => setEditAmount(e.target.value)}
              required
              min={1}
            />
            <FormInput
              name="weekly_payment"
              label="Pago semanal"
              type="number"
              value={editWeeklyPayment}
              onChange={(e) => setEditWeeklyPayment(e.target.value)}
              required
              min={1}
            />
            <FormInput
              name="weeks"
              label="Semanas"
              type="number"
              value={editWeeks}
              onChange={(e) => setEditWeeks(e.target.value)}
              required
              min={1}
              max={60}
            />
            <FormInput
              name="description"
              label="Descripción (opcional)"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditLoanModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={updateLoan.isPending}>
                {updateLoan.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Guardar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Payment Modal */}
      <Dialog open={!!editingPayment} onOpenChange={(open) => !open && setEditingPayment(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Pago</DialogTitle>
            <DialogDescription>Modifica el monto o la fecha del pago.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditPayment} className="space-y-4">
            {updatePayment.error && (
              <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
                {updatePayment.error.message}
              </div>
            )}
            <FormInput
              name="amount"
              label="Monto"
              type="number"
              value={editPaymentAmount}
              onChange={(e) => setEditPaymentAmount(e.target.value)}
              required
              min={1}
            />
            <FormInput
              name="created"
              label="Fecha (opcional)"
              type="datetime-local"
              value={editPaymentCreated}
              onChange={(e) => setEditPaymentCreated(e.target.value)}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditingPayment(null)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={updatePayment.isPending}>
                {updatePayment.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Guardar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Préstamo</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar este préstamo? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          {deleteLoan.error && (
            <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
              {deleteLoan.error.message}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteLoan}
              disabled={deleteLoan.isPending}
            >
              {deleteLoan.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default LoanProfileContent;
