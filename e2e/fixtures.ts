import { test as base, expect, Page } from '@playwright/test';

/**
 * Test credentials from seed data
 */
export const TEST_USER = {
  username: 'admin',
  password: 'admin123',
};

/**
 * Common selectors used across tests
 */
export const selectors = {
  // Login page
  usernameInput: 'input[name="username"]',
  passwordInput: 'input[name="password"]',
  loginButton: 'button[type="submit"]',
  loginError: '[data-testid="login-error"]',

  // Navigation
  sidebar: '[data-testid="sidebar"]',
  userMenu: '[data-testid="user-menu"]',
  logoutButton: '[data-testid="logout-button"]',
  changePasswordButton: '[data-testid="change-password-button"]',
  downloadBackupButton: '[data-testid="download-backup-button"]',
  restoreBackupButton: '[data-testid="restore-backup-button"]',

  // Change password modal
  changePasswordModal: '[role="dialog"]',
  currentPasswordInput: 'input[name="currentPassword"]',
  newPasswordInput: 'input[name="newPassword"]',
  confirmPasswordInput: 'input[name="confirmPassword"]',
  changePasswordSubmitButton: 'button[type="submit"]',

  // Restore backup modal
  restoreBackupModal: '[role="dialog"]',
  restoreBackupFileInput: 'input#restore-file',

  // Clients page
  clientsList: '[data-testid="clients-list"]',
  clientCard: '[data-testid="client-card"]',
  createClientButton: '[data-testid="create-client-button"]',
  clientForm: '[data-testid="client-form"]',

  // Loans page
  loansList: '[data-testid="loans-list"]',
  loanCard: '[data-testid="loan-card"]',
  createLoanButton: '[data-testid="create-loan-button"]',
  loanForm: '[data-testid="loan-form"]',

  // Payments
  addPaymentButton: '[data-testid="add-payment-button"]',
  paymentForm: '[data-testid="payment-form"]',

  // Charges
  chargesList: '[data-testid="charges-list"]',
  chargeItem: '[data-testid="charge-item"]',
  createChargeButton: '[data-testid="create-charge-button"]',
  chargeForm: '[data-testid="charge-form"]',
  markChargePaidButton: '[data-testid="mark-charge-paid-button"]',
  deleteChargeButton: '[data-testid="delete-charge-button"]',

  // Common
  loader: '[data-testid="loader"]',
  modal: '[role="dialog"]',
  submitButton: 'button[type="submit"]',
};

/**
 * Login helper function
 */
export async function login(page: Page): Promise<void> {
  await page.goto('/login');
  await page.fill(selectors.usernameInput, TEST_USER.username);
  await page.fill(selectors.passwordInput, TEST_USER.password);
  await page.click(selectors.loginButton);
  await page.waitForURL('/clients');
}

/**
 * Wait for page to be fully loaded (no loaders visible)
 */
export async function waitForPageLoad(page: Page): Promise<void> {
  await page.waitForLoadState('networkidle');
}

/**
 * Generate a unique test identifier
 */
export function uniqueId(): string {
  return `test-${Date.now()}-${Math.random().toString(36).substring(7)}`;
}

/**
 * Custom test fixture with common utilities
 */
export const test = base.extend<{
  authenticatedPage: Page;
}>({
  authenticatedPage: async ({ page }, use) => {
    await login(page);
    await use(page);
  },
});

export { expect };
