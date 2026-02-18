import { test as setup, expect } from '@playwright/test';
import { TEST_USER, selectors } from './fixtures';

const authFile = 'e2e/.auth/user.json';

setup('authenticate', async ({ page }) => {
  // Go to login page
  await page.goto('/login');

  // Wait for the page to be fully hydrated
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle');

  // Wait for the input to be ready (ensure JS has loaded)
  const usernameInput = page.locator(selectors.usernameInput);
  await usernameInput.waitFor({ state: 'visible', timeout: 10000 });

  // Fill credentials
  await usernameInput.fill(TEST_USER.username);
  await page.fill(selectors.passwordInput, TEST_USER.password);

  // Click the submit button
  await page.click(selectors.loginButton);

  // Wait for redirect to clients page
  await page.waitForURL('**/clients', { timeout: 30000 });

  await expect(page).toHaveURL(/\/clients/);

  // Save auth state
  await page.context().storageState({ path: authFile });
});
