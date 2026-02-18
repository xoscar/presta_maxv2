import { test, expect } from '@playwright/test';
import { selectors } from './fixtures';

test.describe('Loans', () => {
  test('should display loans list', async ({ page }) => {
    await page.goto('/loans');

    await expect(page).toHaveURL('/loans');

    await page.waitForLoadState('networkidle');

    const loanCards = page.locator(selectors.loanCard);
    const count = await loanCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should filter loans by status', async ({ page }) => {
    await page.goto('/loans');

    await page.waitForLoadState('networkidle');

    const finishedFilter = page.getByRole('button', { name: 'Terminados' });
    await finishedFilter.click();

    await page.waitForLoadState('networkidle');

    await expect(finishedFilter).toHaveClass(/bg-primary|variant-default/);
  });

  test('should search for loans', async ({ page }) => {
    await page.goto('/loans');

    await page.waitForLoadState('networkidle');

    const initialCount = await page.locator(selectors.loanCard).count();

    const searchInput = page.locator('input[placeholder*="Buscar"]');
    await searchInput.fill('zzz-nonexistent-query');

    await page.waitForTimeout(600);
    await page.waitForLoadState('networkidle');

    const searchedCount = await page.locator(selectors.loanCard).count();
    expect(searchedCount).toBeLessThanOrEqual(initialCount);
  });

  test('should navigate to loan profile', async ({ page }) => {
    await page.goto('/loans');

    await page.waitForLoadState('networkidle');

    const firstLoan = page.locator(selectors.loanCard).first();
    await firstLoan.click();

    await expect(page).toHaveURL(/\/loans\/[a-zA-Z0-9]+/);

    const loanHeader = page.locator('h1, h2').first();
    await expect(loanHeader).toBeVisible();
  });

  test('should create a loan from client profile', async ({ page }) => {
    await page.goto('/clients');

    await page.waitForLoadState('networkidle');

    const firstClient = page.locator(selectors.clientCard).first();
    await firstClient.click();

    await expect(page).toHaveURL(/\/clients\/[a-zA-Z0-9]+/);
    await page.waitForLoadState('networkidle');

    await page.click(selectors.createLoanButton);

    const modal = page.locator(selectors.modal);
    await expect(modal).toBeVisible();

    const amountInput = modal.locator('input[name="amount"]');
    await amountInput.waitFor({ state: 'visible', timeout: 10000 });

    await amountInput.fill('5000');
    await modal.locator('input[name="weeks"]').fill('10');
    await modal.locator('input[name="weekly_payment"]').fill('600');

    await modal.locator(selectors.submitButton).click();

    await expect(modal).not.toBeVisible({ timeout: 10000 });

    await page.waitForLoadState('networkidle');
  });

  test('should add payment to a loan', async ({ page }) => {
    await page.goto('/loans');

    await page.waitForLoadState('networkidle');

    const activeLoan = page.locator(selectors.loanCard).first();
    await activeLoan.click();

    await expect(page).toHaveURL(/\/loans\/[a-zA-Z0-9]+/);
    await page.waitForLoadState('networkidle');

    const addPaymentButton = page.locator(selectors.addPaymentButton);
    const buttonVisible = await addPaymentButton.isVisible();

    if (!buttonVisible) {
      test.skip(true, 'No active loans with add payment button available');
      return;
    }

    await addPaymentButton.click();

    const modal = page.locator(selectors.modal);
    await expect(modal).toBeVisible();

    const amountInput = modal.locator('input[name="amount"]');
    await amountInput.waitFor({ state: 'visible', timeout: 10000 });

    await amountInput.fill('500');

    await modal.locator(selectors.submitButton).click();

    await expect(modal).not.toBeVisible({ timeout: 10000 });

    await page.waitForLoadState('networkidle');
  });

  test('should view loan payment history', async ({ page }) => {
    await page.goto('/loans');

    await page.waitForLoadState('networkidle');

    const firstLoan = page.locator(selectors.loanCard).first();
    await firstLoan.click();

    await expect(page).toHaveURL(/\/loans\/[a-zA-Z0-9]+/);

    await page.waitForLoadState('networkidle');

    const paymentSection = page.getByText(/Historial de Pagos/);
    await expect(paymentSection).toBeVisible();
  });
});
