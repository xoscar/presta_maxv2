// ==================== User Types ====================
// Legacy interface kept for reference (Prisma uses its own types)
export interface IUser {
  id: string;
  name?: string;
  username: string;
  password: string;
  token: string;
  role: string;
}

export interface IUserInfo {
  id: string;
  username: string;
  role: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

// ==================== Client Types ====================
// Legacy interface kept for reference (Prisma uses its own types)
export interface IClient {
  id: string;
  client_id: string;
  name: string;
  surname: string;
  address: string;
  phone: string;
  search: string[];
  user_id: string;
  created: Date;
  updated: Date;
}

export interface IClientInfo {
  id: string;
  client_id: string;
  name: string;
  surname: string;
  name_complete: string;
  address: string;
  phone: string;
  created: string;
  created_from_now: string;
  updated: string;
}

export interface IClientFullInfo extends IClientInfo {
  loans: ILoanInfo[];
  active_loans: boolean;
  loans_depth: number;
  last_payment: string | null;
  last_payment_from_now: string | null;
  last_loan: string | null;
  last_loan_from_now: string | null;
  expired_loans: boolean;
  finished_loans: ILoanInfo[];
  charges: IChargeInfo[];
  charges_depth: number;
  paid_charges: IChargeInfo[];
  total_depth: number;
}

export interface ClientCreateInput {
  name: string;
  surname: string;
  address: string;
  phone: string;
  user_id?: string;
}

export interface ClientUpdateInput {
  name: string;
  surname: string;
  address: string;
  phone: string;
}

// ==================== Loan Types ====================
// Legacy interface kept for reference (Prisma uses its own types)
export interface IPayment {
  id: string;
  amount: number;
  created: Date;
}

export interface IPaymentInfo {
  id: string;
  loan_id: string;
  amount: number;
  created: string;
  created_from_now: string;
}

// Legacy interface kept for reference (Prisma uses its own types)
export interface ILoan {
  id: string;
  number_id: number;
  amount: number;
  weekly_payment: number;
  file?: string;
  description?: string;
  client_name: string;
  client_identifier: string;
  finished_date?: Date;
  created: Date;
  updated: Date;
  finished: boolean;
  visible: boolean;
  weeks: number;
  expired_date: Date;
  search: string[];
  client_id: string;
  user_id: string;
  payments: IPayment[];
}

export interface ILoanInfo {
  id: string;
  number_id: number;
  amount: number;
  description?: string;
  weekly_payment: number;
  created: string;
  created_from_now: string;
  current_week: number | null;
  weeks: number;
  last_payment: IPaymentInfo | null;
  last_payment_from_now: string | null;
  expired: boolean;
  expired_date: string;
  expired_date_from_now: string;
  finished: boolean;
  finished_date: string | null;
  updated: string;
  current_balance: number;
  client_id: string | null;
  payments: IPaymentInfo[];
}

export interface ILoanFullInfo extends ILoanInfo {
  client?: IClientInfo;
}

export interface LoanCreateInput {
  amount: number;
  weekly_payment: number;
  weeks: number;
  description?: string;
  client_id: string;
  created?: string;
}

export interface LoanUpdateInput {
  amount: number;
  weekly_payment: number;
  weeks: number;
  description?: string;
  client_id: string;
  created?: string;
}

export interface PaymentCreateInput {
  amount: number;
  created?: string;
}

export interface PaymentUpdateInput {
  amount: number;
  created?: string;
}

// ==================== Charge Types ====================
// Legacy interface kept for reference (Prisma uses its own types)
export interface ICharge {
  id: string;
  amount: number;
  expiration_date?: Date;
  created: Date;
  description?: string;
  paid_date?: Date;
  paid: boolean;
  client_id: string;
  user_id: string;
}

export interface IChargeInfo {
  id: string;
  amount: number;
  description?: string;
  paid: boolean;
  created: string;
  created_from_now: string;
  expired: boolean;
  paid_date: string | null;
}

export interface ChargeCreateInput {
  amount: string | number;
  description?: string;
  expiration_date?: string;
  client_id: string;
}

export interface ChargeUpdateInput {
  amount: string | number;
  description?: string;
  expiration_date?: string;
  created?: string;
}

// ==================== Counter Types ====================
// Legacy interface kept for reference (Prisma uses its own types)
export interface ICounter {
  id: string;
  count: number;
  name: string;
}

// ==================== API Response Types ====================
export interface ApiError {
  statusCode: number;
  messages: Array<{ code: string; text: string }>;
  type: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface SearchQuery {
  search?: string;
  page?: number;
  limit?: number;
}

// ==================== Auth Types ====================
export interface JWTPayload {
  username: string;
  userId: string;
  token: string;
  iat?: number;
  exp?: number;
}

export interface AuthUser {
  id: string;
  username: string;
  role: string;
}
