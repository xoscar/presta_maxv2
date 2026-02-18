'use client';

import { useState } from 'react';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  FormInput,
} from '@/components/ui';
import { useLogin } from '@/lib/hooks';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const login = useLogin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    login.mutate(formData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary">PrestaMax</h1>
          <p className="text-muted-foreground mt-2">Sistema de Gestión de Préstamos</p>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle>Iniciar Sesión</CardTitle>
            <CardDescription>Ingresa tus credenciales para acceder al sistema</CardDescription>
          </CardHeader>
          <CardContent>
            {login.error && (
              <div
                data-testid="login-error"
                className="mb-4 p-3 bg-destructive/10 text-destructive rounded-lg text-sm"
              >
                {login.error.message}
              </div>
            )}

            <form id="login-form" onSubmit={handleSubmit} className="space-y-4">
              <FormInput
                name="username"
                label="Usuario"
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="Ingresa tu usuario"
                required
                autoFocus
              />

              <FormInput
                name="password"
                label="Contraseña"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Ingresa tu contraseña"
                required
              />
            </form>
          </CardContent>
          <CardFooter>
            <Button type="submit" form="login-form" className="w-full" disabled={login.isPending}>
              {login.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Iniciar Sesión
            </Button>
          </CardFooter>
        </Card>

        <p className="text-center text-muted-foreground text-sm mt-6">
          &copy; {new Date().getFullYear()} PrestaMax. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
}
