'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Button,
  Card,
  CardContent,
  Badge,
  SearchInput,
  Pagination,
  PageLoader,
} from '@/components/ui';
import { useLoans } from '@/lib/hooks';
import type { ILoanInfo } from '@/types';
import { Loader2, DollarSign } from 'lucide-react';

export function LoansPageContent() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<'all' | 'active' | 'finished'>('active');

  // React Query hook
  const {
    data: loansData,
    isLoading,
    isFetching,
  } = useLoans({
    page,
    limit: 20,
    search: search || undefined,
    finished: filter === 'all' ? undefined : filter === 'finished',
  });

  const loans = loansData?.data ?? [];
  const totalPages = loansData ? Math.ceil(loansData.total / loansData.limit) : 1;

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleFilterChange = (newFilter: 'all' | 'active' | 'finished') => {
    setFilter(newFilter);
    setPage(1);
  };

  if (isLoading && loans.length === 0) {
    return <PageLoader />;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="mt-4 text-2xl font-bold sm:mt-0">Préstamos</h1>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <SearchInput
            value={search}
            onChange={handleSearchChange}
            placeholder="Buscar préstamos..."
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={filter === 'active' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleFilterChange('active')}
          >
            Activos
          </Button>
          <Button
            variant={filter === 'finished' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleFilterChange('finished')}
          >
            Terminados
          </Button>
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleFilterChange('all')}
          >
            Todos
          </Button>
        </div>
      </div>

      {/* Loading indicator for background fetching */}
      {isFetching && !isLoading && (
        <div className="absolute top-4 right-4">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
      )}

      {/* Loans list */}
      {loans.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No se encontraron préstamos</p>
          </CardContent>
        </Card>
      ) : (
        <div data-testid="loans-list" className="grid gap-4">
          {loans.map((loan: ILoanInfo) => (
            <Link key={loan.id} href={`/loans/${loan.id}`} className="block">
              <Card
                data-testid="loan-card"
                className="hover:shadow-lg transition-shadow cursor-pointer"
              >
                <CardContent className="py-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center ${
                          loan.finished
                            ? 'bg-green-100 dark:bg-green-900/30'
                            : loan.expired
                              ? 'bg-destructive/10'
                              : 'bg-primary/10'
                        }`}
                      >
                        <DollarSign
                          className={`h-5 w-5 ${
                            loan.finished
                              ? 'text-green-600 dark:text-green-400'
                              : loan.expired
                                ? 'text-destructive'
                                : 'text-primary'
                          }`}
                        />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold">Préstamo #{loan.number_id}</h3>
                        <p className="text-sm text-muted-foreground truncate">
                          ${loan.amount.toLocaleString()} • {loan.weeks} semanas • {loan.created}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="flex items-center gap-2 justify-end mb-1">
                        {loan.expired && !loan.finished && (
                          <Badge variant="destructive">Vencido</Badge>
                        )}
                        {loan.finished && (
                          <Badge variant="outline" className="border-green-500 text-green-600">
                            Finalizado
                          </Badge>
                        )}
                        {!loan.finished && !loan.expired && (
                          <Badge variant="secondary">
                            Semana {loan.current_week}/{loan.weeks}
                          </Badge>
                        )}
                      </div>
                      <p className="text-lg font-semibold">
                        ${loan.current_balance.toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground">Saldo</p>
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
    </div>
  );
}

export default LoansPageContent;
