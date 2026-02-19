import type {
  IClientFullInfo,
  ILoanFullInfo,
  ILoanInfo,
  IUserInfo,
  IPaymentInfo,
  IChargeInfo,
  PaginatedResponse,
  ClientCreateInput,
  ClientUpdateInput,
  LoanCreateInput,
  LoanUpdateInput,
  PaymentCreateInput,
  PaymentUpdateInput,
  ChargeCreateInput,
  StatsResponse,
} from '@/types';

/**
 * RFC 7807 Problem Details interface
 * https://datatracker.ietf.org/doc/html/rfc7807
 */
export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail?: string;
  instance?: string;
  errors?: Array<{ field: string; message: string }>;
  [key: string]: unknown;
}

/**
 * Custom error class for API errors following RFC 7807
 */
export class ApiError extends Error {
  /** HTTP status code */
  status: number;
  /** Problem type URI */
  type: string;
  /** Human-readable title */
  title: string;
  /** Human-readable detail specific to this occurrence */
  detail?: string;
  /** URI identifying the specific occurrence */
  instance?: string;
  /** Validation errors if present */
  errors?: Array<{ field: string; message: string }>;

  constructor(problem: ProblemDetails) {
    super(problem.detail || problem.title);
    this.name = 'ApiError';
    this.status = problem.status;
    this.type = problem.type;
    this.title = problem.title;
    this.detail = problem.detail;
    this.instance = problem.instance;
    this.errors = problem.errors;
  }

  /**
   * Get user-friendly error message
   */
  get message(): string {
    return this.detail || this.title;
  }
}

/**
 * Check if response is a problem details response
 */
function isProblemDetails(contentType: string | null, data: unknown): data is ProblemDetails {
  if (contentType?.includes('application/problem+json')) {
    return true;
  }
  // Also handle regular JSON that looks like problem details
  return (
    typeof data === 'object' &&
    data !== null &&
    'type' in data &&
    'title' in data &&
    'status' in data
  );
}

/**
 * Generic fetch wrapper with RFC 7807 error handling
 */
async function fetchApi<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json, application/problem+json',
      ...options?.headers,
    },
  });

  const contentType = response.headers.get('Content-Type');
  const data = await response.json();

  if (!response.ok) {
    // Handle RFC 7807 problem details
    if (isProblemDetails(contentType, data)) {
      throw new ApiError(data);
    }

    // Fallback for legacy error format
    throw new ApiError({
      type: 'about:blank',
      title: data.title || 'Error',
      status: response.status,
      detail: data.detail || data.error || data.message || 'An error occurred',
    });
  }

  return data;
}

// ==================== Auth API ====================
export const authApi = {
  login: async (credentials: { username: string; password: string }) => {
    const data = await fetchApi<{ user: IUserInfo; token: string }>('/api/users/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    // Set cookie after successful login
    await fetch('/api/users/set-cookie', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: data.token }),
    });

    return data;
  },

  logout: async () => {
    return fetchApi<{ success: boolean }>('/api/users/logout', {
      method: 'POST',
    });
  },

  changePassword: async (payload: { currentPassword: string; newPassword: string }) => {
    const response = await fetch('/api/users/change-password', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const contentType = response.headers.get('Content-Type');
    const text = await response.text();
    const data = text ? JSON.parse(text) : null;

    if (!response.ok) {
      if (contentType?.includes('application/problem+json') && data) {
        throw new ApiError(data);
      }
      throw new ApiError({
        type: 'about:blank',
        title: data?.title || 'Error',
        status: response.status,
        detail: data?.detail || data?.error || data?.message || 'Error al cambiar contraseña',
      });
    }

    return undefined;
  },
};

// ==================== Clients API ====================
export interface ClientsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
}

export const clientsApi = {
  list: async (params: ClientsQueryParams = {}) => {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.limit) searchParams.set('limit', params.limit.toString());
    if (params.search) searchParams.set('search', params.search);

    return fetchApi<PaginatedResponse<IClientFullInfo>>(`/api/clients?${searchParams}`);
  },

  getById: async (id: string) => {
    return fetchApi<IClientFullInfo>(`/api/clients/${id}`);
  },

  create: async (data: ClientCreateInput) => {
    return fetchApi<IClientFullInfo>('/api/clients', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: ClientUpdateInput) => {
    return fetchApi<IClientFullInfo>(`/api/clients/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string) => {
    return fetchApi<{ success: boolean }>(`/api/clients/${id}`, {
      method: 'DELETE',
    });
  },

  getLoans: async (clientId: string, finished?: boolean) => {
    const params = new URLSearchParams();
    if (finished !== undefined) params.set('finished', finished.toString());
    return fetchApi<{ loans: ILoanInfo[] }>(`/api/clients/${clientId}/loans?${params}`);
  },
};

// ==================== Loans API ====================
export interface LoansQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  finished?: boolean;
}

export const loansApi = {
  list: async (params: LoansQueryParams = {}) => {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.limit) searchParams.set('limit', params.limit.toString());
    if (params.search) searchParams.set('search', params.search);
    if (params.finished !== undefined) searchParams.set('finished', params.finished.toString());

    return fetchApi<PaginatedResponse<ILoanInfo>>(`/api/loans?${searchParams}`);
  },

  getById: async (id: string) => {
    return fetchApi<ILoanFullInfo>(`/api/loans/${id}`);
  },

  create: async (data: LoanCreateInput) => {
    return fetchApi<ILoanFullInfo>('/api/loans', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: LoanUpdateInput) => {
    return fetchApi<ILoanFullInfo>(`/api/loans/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string) => {
    return fetchApi<{ success: boolean }>(`/api/loans/${id}`, {
      method: 'DELETE',
    });
  },
};

// ==================== Payments API ====================
export const paymentsApi = {
  create: async (loanId: string, data: PaymentCreateInput) => {
    return fetchApi<IPaymentInfo>(`/api/loans/${loanId}/payments`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (loanId: string, paymentId: string, data: PaymentUpdateInput) => {
    return fetchApi<IPaymentInfo>(`/api/loans/${loanId}/payments/${paymentId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  delete: async (loanId: string, paymentId: string) => {
    return fetchApi<{ success: boolean }>(`/api/loans/${loanId}/payments/${paymentId}`, {
      method: 'DELETE',
    });
  },
};

// ==================== Charges API ====================
export const chargesApi = {
  create: async (data: ChargeCreateInput) => {
    return fetchApi<IChargeInfo>('/api/charges', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getById: async (id: string) => {
    return fetchApi<IChargeInfo>(`/api/charges/${id}`);
  },

  markAsPaid: async (id: string) => {
    return fetchApi<IChargeInfo>(`/api/charges/${id}/pay`, {
      method: 'POST',
    });
  },

  delete: async (id: string) => {
    return fetchApi<{ success: boolean }>(`/api/charges/${id}`, {
      method: 'DELETE',
    });
  },
};

// ==================== Stats API ====================
export interface StatsQueryParams {
  from: string;
  to: string;
}

export const statsApi = {
  get: async (params: StatsQueryParams): Promise<StatsResponse> => {
    const searchParams = new URLSearchParams({
      from: params.from,
      to: params.to,
    });
    return fetchApi<StatsResponse>(`/api/stats?${searchParams}`);
  },
};

// ==================== Backup API ====================
export interface RestoreBackupResponse {
  success: boolean;
  clients: number;
  loans: number;
  charges: number;
  message: string;
}

export const backupApi = {
  downloadBackup: async (): Promise<void> => {
    const response = await fetch('/api/backup', { credentials: 'include' });
    if (!response.ok) {
      const contentType = response.headers.get('Content-Type');
      const text = await response.text();
      const data = text ? JSON.parse(text) : null;
      if (contentType?.includes('application/problem+json') && data) {
        throw new ApiError(data);
      }
      throw new ApiError({
        type: 'about:blank',
        title: data?.title || 'Error',
        status: response.status,
        detail: data?.detail || data?.error || data?.message || 'Error al descargar el respaldo',
      });
    }
    const blob = await response.blob();
    const disposition = response.headers.get('Content-Disposition');
    const match = disposition?.match(/filename="?([^";\n]+)"?/);
    const filename = match ? match[1].trim() : 'prestamax-backup.zip';
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  },

  restoreBackup: async (file: File): Promise<RestoreBackupResponse> => {
    const formData = new FormData();
    formData.set('file', file);

    const response = await fetch('/api/backup/restore', {
      method: 'POST',
      credentials: 'include',
      body: formData,
      headers: {
        Accept: 'application/json, application/problem+json',
      },
    });

    const contentType = response.headers.get('Content-Type');
    const data = await response.json();

    if (!response.ok) {
      if (isProblemDetails(contentType, data)) {
        throw new ApiError(data);
      }
      throw new ApiError({
        type: 'about:blank',
        title: data?.title || 'Error',
        status: response.status,
        detail: data?.detail || data?.error || data?.message || 'Error al restaurar el respaldo',
      });
    }

    return data as RestoreBackupResponse;
  },
};
