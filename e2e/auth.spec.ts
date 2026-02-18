import { test, expect } from '@playwright/test';
import { TEST_USER, selectors } from './fixtures';

test.describe('Authentication', () => {
  test.describe('Login', () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test('should login with valid credentials', async ({ page }) => {
      await page.goto('/login');

      await page.fill(selectors.usernameInput, TEST_USER.username);
      await page.fill(selectors.passwordInput, TEST_USER.password);
      await page.click(selectors.loginButton);

      await expect(page).toHaveURL('/clients');
    });

    test('should show error with invalid credentials', async ({ page }) => {
      await page.goto('/login');

      await page.fill(selectors.usernameInput, 'wronguser');
      await page.fill(selectors.passwordInput, 'wrongpass');
      await page.click(selectors.loginButton);

      await expect(page).toHaveURL('/login');

      const errorMessage = page.locator(selectors.loginError);
      await expect(errorMessage).toBeVisible();
    });

    test('should show error with empty credentials', async ({ page }) => {
      await page.goto('/login');

      await page.click(selectors.loginButton);

      await expect(page).toHaveURL('/login');
    });
  });

  test.describe('Protected Routes', () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test('should redirect to login when accessing /clients unauthenticated', async ({ page }) => {
      await page.goto('/clients');

      await expect(page).toHaveURL('/login');
    });

    test('should redirect to login when accessing /loans unauthenticated', async ({ page }) => {
      await page.goto('/loans');

      await expect(page).toHaveURL('/login');
    });
  });

  test.describe('Logout', () => {
    test('should logout and redirect to login', async ({ page }) => {
      await page.goto('/clients');
      await expect(page).toHaveURL('/clients');

      await page.click(selectors.userMenu);

      await page.click(selectors.logoutButton);

      await expect(page).toHaveURL('/login');

      await page.goto('/clients');
      await expect(page).toHaveURL('/login');
    });
  });
});
