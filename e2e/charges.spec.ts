import { test, expect } from '@playwright/test';
import { selectors, uniqueId } from './fixtures';

test.describe('Charges', () => {
  test('should display charges section on client profile', async ({ page }) => {
    await page.goto('/clients');

    await page.waitForLoadState('networkidle');

    const firstClient = page.locator(selectors.clientCard).first();
    await firstClient.click();

    await expect(page).toHaveURL(/\/clients\/[a-zA-Z0-9]+/);
    await page.waitForLoadState('networkidle');

    const chargesSection = page.getByText(/Cargos Pendientes/);
    await expect(chargesSection).toBeVisible();

    const createChargeButton = page.locator(selectors.createChargeButton);
    await expect(createChargeButton).toBeVisible();
  });

  test('should create a new charge', async ({ page }) => {
    await page.goto('/clients');

    await page.waitForLoadState('networkidle');

    const firstClient = page.locator(selectors.clientCard).first();
    await firstClient.click();

    await expect(page).toHaveURL(/\/clients\/[a-zA-Z0-9]+/);
    await page.waitForLoadState('networkidle');

    await page.click(selectors.createChargeButton);

    const modal = page.locator(selectors.modal);
    await expect(modal).toBeVisible();

    const amountInput = modal.locator('input[name="charge_amount"]');
    await amountInput.waitFor({ state: 'visible', timeout: 10000 });

    const testDescription = `Test Charge ${uniqueId()}`;

    await amountInput.fill('250');
    await modal.locator('input[name="charge_description"]').fill(testDescription);

    await modal.locator(selectors.submitButton).click();

    await expect(modal).not.toBeVisible({ timeout: 10000 });

    await page.waitForLoadState('networkidle');

    const newCharge = page.locator(selectors.chargeItem).filter({
      hasText: testDescription,
    });
    await expect(newCharge).toBeVisible();
  });

  test('should mark a charge as paid', async ({ page }) => {
    await page.goto('/clients');

    await page.waitForLoadState('networkidle');

    const firstClient = page.locator(selectors.clientCard).first();
    await firstClient.click();

    await expect(page).toHaveURL(/\/clients\/[a-zA-Z0-9]+/);
    await page.waitForLoadState('networkidle');

    const testDescription = `Charge to pay ${uniqueId()}`;

    await page.click(selectors.createChargeButton);

    const modal = page.locator(selectors.modal);
    await expect(modal).toBeVisible();

    const amountInput = modal.locator('input[name="charge_amount"]');
    await amountInput.waitFor({ state: 'visible', timeout: 10000 });

    await amountInput.fill('100');
    await modal.locator('input[name="charge_description"]').fill(testDescription);

    await modal.locator(selectors.submitButton).click();

    await expect(modal).not.toBeVisible({ timeout: 10000 });
    await page.waitForLoadState('networkidle');

    const newCharge = page.locator(selectors.chargeItem).filter({
      hasText: testDescription,
    });
    await expect(newCharge).toBeVisible();

    const markPaidButton = newCharge.locator(selectors.markChargePaidButton);
    await markPaidButton.click();

    await expect(newCharge).not.toBeVisible({ timeout: 10000 });
  });

  test('should delete a charge', async ({ page }) => {
    await page.goto('/clients');

    await page.waitForLoadState('networkidle');

    const firstClient = page.locator(selectors.clientCard).first();
    await firstClient.click();

    await expect(page).toHaveURL(/\/clients\/[a-zA-Z0-9]+/);
    await page.waitForLoadState('networkidle');

    await page.click(selectors.createChargeButton);

    const modal = page.locator(selectors.modal);
    await expect(modal).toBeVisible();

    const amountInput = modal.locator('input[name="charge_amount"]');
    await amountInput.waitFor({ state: 'visible', timeout: 10000 });

    const testDescription = `Charge to delete ${uniqueId()}`;

    await amountInput.fill('150');
    await modal.locator('input[name="charge_description"]').fill(testDescription);

    await modal.locator(selectors.submitButton).click();

    await expect(modal).not.toBeVisible({ timeout: 10000 });
    await page.waitForLoadState('networkidle');

    const chargeToDelete = page.locator(selectors.chargeItem).filter({
      hasText: testDescription,
    });
    await expect(chargeToDelete).toBeVisible();

    page.on('dialog', (dialog) => dialog.accept());

    const deleteButton = chargeToDelete.locator(selectors.deleteChargeButton);
    await deleteButton.click();

    await page.waitForLoadState('networkidle');

    await expect(chargeToDelete).not.toBeVisible();
  });

  test('should show empty state when no charges', async ({ page }) => {
    await page.goto('/clients');

    await page.waitForLoadState('networkidle');

    const firstClient = page.locator(selectors.clientCard).first();
    await firstClient.click();

    await expect(page).toHaveURL(/\/clients\/[a-zA-Z0-9]+/);
    await page.waitForLoadState('networkidle');

    const chargesSection = page.getByText(/Cargos Pendientes/);
    await expect(chargesSection).toBeVisible();
  });
});
