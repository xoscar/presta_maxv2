import { test, expect } from '@playwright/test';
import { selectors, uniqueId } from './fixtures';

test.describe('Clients', () => {
  test('should display clients list', async ({ page }) => {
    await page.goto('/clients');

    await expect(page).toHaveURL('/clients');

    await page.waitForLoadState('networkidle');

    const clientCards = page.locator(selectors.clientCard);
    const count = await clientCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should search for clients and find results', async ({ page }) => {
    await page.goto('/clients');
    await page.waitForLoadState('networkidle');

    const uniqueName = `SearchTest${uniqueId()}`;
    const uniqueSurname = `Apellido${uniqueId()}`;

    await page.click(selectors.createClientButton);

    const modal = page.locator(selectors.modal);
    await expect(modal).toBeVisible();

    const nameInput = modal.locator('input[name="name"]');
    await nameInput.waitFor({ state: 'visible', timeout: 10000 });

    await nameInput.fill(uniqueName);
    await modal.locator('input[name="surname"]').fill(uniqueSurname);
    await modal.locator('input[name="phone"]').fill('5599887766');
    await modal.locator('input[name="address"]').fill('Search Test Address');

    await modal.locator(selectors.submitButton).click();
    await expect(modal).not.toBeVisible({ timeout: 10000 });
    await page.waitForLoadState('networkidle');

    const newClient = page.locator(selectors.clientCard).filter({ hasText: uniqueName });
    await expect(newClient).toBeVisible();

    const searchInput = page.locator('input[placeholder*="Buscar"]');
    await searchInput.fill(uniqueName);

    await page.waitForTimeout(500);
    await page.waitForLoadState('networkidle');

    const searchResults = page.locator(selectors.clientCard);
    const resultsCount = await searchResults.count();
    expect(resultsCount).toBeGreaterThanOrEqual(1);

    const foundClient = page.locator(selectors.clientCard).filter({ hasText: uniqueName });
    await expect(foundClient).toBeVisible();

    const clearButton = page.locator('input[placeholder*="Buscar"]').locator('..').locator('button');
    if (await clearButton.isVisible()) {
      await clearButton.click();
      await page.waitForTimeout(500);
      await page.waitForLoadState('networkidle');
    }
  });

  test('should show no results for non-existent search', async ({ page }) => {
    await page.goto('/clients');
    await page.waitForLoadState('networkidle');

    const searchInput = page.locator('input[placeholder*="Buscar"]');
    await searchInput.fill('zzzznonexistent12345xyz');

    await page.waitForTimeout(500);
    await page.waitForLoadState('networkidle');

    const searchResults = page.locator(selectors.clientCard);
    const resultsCount = await searchResults.count();
    expect(resultsCount).toBe(0);

    const emptyMessage = page.getByText('No se encontraron clientes');
    await expect(emptyMessage).toBeVisible();
  });

  test('should create a new client', async ({ page }) => {
    await page.goto('/clients');
    await page.waitForLoadState('networkidle');

    await page.click(selectors.createClientButton);

    const modal = page.locator(selectors.modal);
    await expect(modal).toBeVisible();

    const nameInput = modal.locator('input[name="name"]');
    await nameInput.waitFor({ state: 'visible', timeout: 10000 });

    const testName = `TestName-${uniqueId()}`;
    const testSurname = `TestSurname-${uniqueId()}`;

    await nameInput.fill(testName);
    await modal.locator('input[name="surname"]').fill(testSurname);
    await modal.locator('input[name="phone"]').fill('5512345678');
    await modal.locator('input[name="address"]').fill('Test Address 123, Col. Test');

    await modal.locator(selectors.submitButton).click();

    await expect(modal).not.toBeVisible({ timeout: 10000 });

    await page.waitForLoadState('networkidle');

    const newClientCard = page.locator(selectors.clientCard).filter({
      hasText: testName,
    });
    await expect(newClientCard).toBeVisible();
  });

  test('should navigate to client profile', async ({ page }) => {
    await page.goto('/clients');

    await page.waitForLoadState('networkidle');

    const firstClient = page.locator(selectors.clientCard).first();
    await firstClient.click();

    await expect(page).toHaveURL(/\/clients\/[a-zA-Z0-9]+/);

    const profileHeading = page.locator('h1, h2').first();
    await expect(profileHeading).toBeVisible();
  });

  test('should edit a client', async ({ page }) => {
    await page.goto('/clients');

    await page.waitForLoadState('networkidle');

    const firstClient = page.locator(selectors.clientCard).first();
    await firstClient.click();

    await expect(page).toHaveURL(/\/clients\/[a-zA-Z0-9]+/);
    await page.waitForLoadState('networkidle');

    const editButton = page.locator('[data-testid="edit-client-button"]');
    await editButton.click();

    const modal = page.locator(selectors.modal);
    await expect(modal).toBeVisible();

    const phoneInput = modal.locator('input[name="phone"]');
    await phoneInput.waitFor({ state: 'visible', timeout: 10000 });

    const newPhone = `55${Math.floor(Math.random() * 100000000)}`;
    await phoneInput.clear();
    await phoneInput.fill(newPhone);

    await modal.locator(selectors.submitButton).click();

    await expect(modal).not.toBeVisible({ timeout: 10000 });

    await page.waitForLoadState('networkidle');
  });
});
