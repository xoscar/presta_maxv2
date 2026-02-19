'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, PageLoader } from '@/components/ui';
import { Button } from '@/components/ui/button';
import { useStats } from '@/lib/hooks';
import { subDays, endOfDay, startOfDay, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const PRESETS = [
  { label: 'Últimos 7 días', days: 7 },
  { label: 'Últimos 30 días', days: 30 },
  { label: 'Últimos 90 días', days: 90 },
  { label: 'Último año', days: 365 },
] as const;

const CHART_COLORS = ['hsl(174, 100%, 29%)', 'hsl(173, 58%, 39%)', 'hsl(197, 37%, 24%)'];

function getDefaultRange(): { from: string; to: string } {
  const to = endOfDay(new Date());
  const from = startOfDay(subDays(to, 30));
  return { from: from.toISOString(), to: to.toISOString() };
}

export function DashboardPageContent() {
  const [range, setRange] = useState(getDefaultRange);
  const [activePresetDays, setActivePresetDays] = useState<number>(30);

  const { data, isLoading, error } = useStats(range.from, range.to);

  const selectPreset = (days: number) => {
    setActivePresetDays(days);
    const to = endOfDay(new Date());
    const from = startOfDay(subDays(to, days));
    setRange({ from: from.toISOString(), to: to.toISOString() });
  };

  const paymentsData = useMemo(
    () =>
      (data?.paymentsByClient ?? []).map((item) => ({
        name: item.clientName.length > 15 ? item.clientName.slice(0, 15) + '…' : item.clientName,
        fullName: item.clientName,
        value: item.totalPaid,
      })),
    [data?.paymentsByClient]
  );

  const loansData = useMemo(
    () =>
      (data?.loansCountByClient ?? []).map((item) => ({
        name: item.clientName.length > 15 ? item.clientName.slice(0, 15) + '…' : item.clientName,
        fullName: item.clientName,
        value: item.count,
      })),
    [data?.loansCountByClient]
  );

  const chargesData = useMemo(
    () =>
      (data?.chargesCountByClient ?? []).map((item) => ({
        name: item.clientName.length > 15 ? item.clientName.slice(0, 15) + '…' : item.clientName,
        fullName: item.clientName,
        value: item.count,
      })),
    [data?.chargesCountByClient]
  );

  if (isLoading) {
    return <PageLoader />;
  }

  if (error) {
    return (
      <div className="p-4">
        <p className="text-destructive">Error al cargar estadísticas. Intenta de nuevo.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Estadísticas</h1>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map(({ label, days }) => (
            <Button
              key={days}
              variant="outline"
              size="sm"
              onClick={() => selectPreset(days)}
              className={activePresetDays === days ? 'bg-primary text-primary-foreground' : ''}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      {/* Total debt - no timeframe */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Deuda total</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-primary">
            ${(data?.totalDebt ?? 0).toLocaleString('es-MX')}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Suma del saldo actual de todos los préstamos activos
          </p>
        </CardContent>
      </Card>

      {/* Payments by client */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Monto pagado por cliente</CardTitle>
          <p className="text-sm text-muted-foreground">
            Período: {format(new Date(range.from), 'd MMM yyyy', { locale: es })} –{' '}
            {format(new Date(range.to), 'd MMM yyyy', { locale: es })}
          </p>
        </CardHeader>
        <CardContent>
          {paymentsData.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center">
              Sin datos en el período seleccionado
            </p>
          ) : (
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={paymentsData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
                  <Tooltip
                    formatter={(value: number) => [`$${value.toLocaleString('es-MX')}`, 'Pagado']}
                    labelFormatter={(_, payload) =>
                      Array.isArray(payload) && payload[0]?.payload?.fullName
                        ? String(payload[0].payload.fullName)
                        : ''
                    }
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {paymentsData.map((_, index) => (
                      <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Loans per client */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Préstamos por cliente</CardTitle>
          <p className="text-sm text-muted-foreground">
            Préstamos creados en el período seleccionado
          </p>
        </CardHeader>
        <CardContent>
          {loansData.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center">
              Sin datos en el período seleccionado
            </p>
          ) : (
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={loansData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                  <Tooltip
                    formatter={(value: number) => [value, 'Préstamos']}
                    labelFormatter={(_, payload) =>
                      Array.isArray(payload) && payload[0]?.payload?.fullName
                        ? String(payload[0].payload.fullName)
                        : ''
                    }
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} name="Préstamos">
                    {loansData.map((_, index) => (
                      <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Charges per client */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Cargos por cliente</CardTitle>
          <p className="text-sm text-muted-foreground">Cargos creados en el período seleccionado</p>
        </CardHeader>
        <CardContent>
          {chargesData.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center">
              Sin datos en el período seleccionado
            </p>
          ) : (
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chargesData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                  <Tooltip
                    formatter={(value: number) => [value, 'Cargos']}
                    labelFormatter={(_, payload) =>
                      Array.isArray(payload) && payload[0]?.payload?.fullName
                        ? String(payload[0].payload.fullName)
                        : ''
                    }
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} name="Cargos">
                    {chargesData.map((_, index) => (
                      <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
