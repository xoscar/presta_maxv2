'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui';
import { backupApi } from '@/lib/api';
import { clientKeys, loanKeys, statsKeys } from '@/lib/hooks';
import { Loader2, Upload } from 'lucide-react';

interface RestoreBackupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RestoreBackupModal({ open, onOpenChange }: RestoreBackupModalProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setFile(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) resetForm();
    onOpenChange(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!file) {
      setError('Selecciona un archivo ZIP de respaldo.');
      return;
    }
    if (!file.name.toLowerCase().endsWith('.zip')) {
      setError('El archivo debe ser un ZIP.');
      return;
    }

    setIsPending(true);
    try {
      await backupApi.restoreBackup(file);
      handleOpenChange(false);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: clientKeys.all }),
        queryClient.invalidateQueries({ queryKey: loanKeys.all }),
        queryClient.invalidateQueries({ queryKey: statsKeys.all }),
      ]);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al restaurar el respaldo.');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Restaurar respaldo</DialogTitle>
          <DialogDescription>
            Sube un archivo ZIP de respaldo de PrestaMax. Esto reemplazará todos tus datos actuales
            (clientes, préstamos y cargos) con los del respaldo. Esta acción no se puede deshacer.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm">{error}</div>
          )}

          <div className="space-y-2">
            <label
              htmlFor="restore-file"
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-muted-foreground/25 rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
            >
              <Upload className="h-8 w-8 text-muted-foreground mb-2" />
              <span className="text-sm text-muted-foreground">
                {file ? file.name : 'Haz clic o arrastra un archivo .zip'}
              </span>
              <input
                ref={inputRef}
                id="restore-file"
                type="file"
                accept=".zip"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending || !file}>
              {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Restaurar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
