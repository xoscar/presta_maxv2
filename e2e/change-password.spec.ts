import { test, expect } from '@playwright/test';
import { TEST_USER, selectors } from './fixtures';

test.describe('Change Password', () => {
  test('should open change password modal from user menu', async ({ page }) => {
    await page.goto('/clients');
    await page.waitForLoadState('networkidle');

    await page.click(selectors.userMenu);
    await page.click(selectors.changePasswordButton);

    const modal = page.locator(selectors.changePasswordModal);
    await expect(modal).toBeVisible();
    await expect(modal.getByRole('heading', { name: 'Cambiar contraseña' })).toBeVisible();
    await expect(modal.locator(selectors.currentPasswordInput)).toBeVisible();
    await expect(modal.locator(selectors.newPasswordInput)).toBeVisible();
    await expect(modal.locator(selectors.confirmPasswordInput)).toBeVisible();
  });

  test('should change password successfully', async ({ page }) => {
    await page.goto('/clients');
    await page.waitForLoadState('networkidle');

    await page.click(selectors.userMenu);
    await page.click(selectors.changePasswordButton);

    const modal = page.locator(selectors.changePasswordModal);
    await expect(modal).toBeVisible();

    const newPassword = 'admin456';
    await modal.locator(selectors.currentPasswordInput).fill(TEST_USER.password);
    await modal.locator(selectors.newPasswordInput).fill(newPassword);
    await modal.locator(selectors.confirmPasswordInput).fill(newPassword);

    await modal.getByRole('button', { name: 'Cambiar contraseña' }).click();

    await expect(modal).not.toBeVisible({ timeout: 10000 });

    // Verify we are still logged in and can use new password on next login
    await page.click(selectors.userMenu);
    await page.click(selectors.logoutButton);
    await expect(page).toHaveURL('/login');

    await page.fill(selectors.usernameInput, TEST_USER.username);
    await page.fill(selectors.passwordInput, newPassword);
    await page.click(selectors.loginButton);
    await expect(page).toHaveURL('/clients');

    // Restore original password for other tests (optional, if tests run in isolation this may not be needed)
    await page.click(selectors.userMenu);
    await page.click(selectors.changePasswordButton);
    const modalRestore = page.locator(selectors.changePasswordModal);
    await modalRestore.locator(selectors.currentPasswordInput).fill(newPassword);
    await modalRestore.locator(selectors.newPasswordInput).fill(TEST_USER.password);
    await modalRestore.locator(selectors.confirmPasswordInput).fill(TEST_USER.password);
    await modalRestore.getByRole('button', { name: 'Cambiar contraseña' }).click();
    await expect(modalRestore).not.toBeVisible({ timeout: 10000 });
  });

  test('should show error when current password is wrong', async ({ page }) => {
    await page.goto('/clients');
    await page.waitForLoadState('networkidle');

    await page.click(selectors.userMenu);
    await page.click(selectors.changePasswordButton);

    const modal = page.locator(selectors.changePasswordModal);
    await expect(modal).toBeVisible();

    await modal.locator(selectors.currentPasswordInput).fill('wrongcurrent');
    await modal.locator(selectors.newPasswordInput).fill('newpass123');
    await modal.locator(selectors.confirmPasswordInput).fill('newpass123');

    await modal.getByRole('button', { name: 'Cambiar contraseña' }).click();

    await expect(modal).toBeVisible();
    await expect(modal.getByText(/contraseña actual incorrecta/i)).toBeVisible({
      timeout: 5000,
    });
  });

  test('should show error when new password and confirm do not match', async ({ page }) => {
    await page.goto('/clients');
    await page.waitForLoadState('networkidle');

    await page.click(selectors.userMenu);
    await page.click(selectors.changePasswordButton);

    const modal = page.locator(selectors.changePasswordModal);
    await expect(modal).toBeVisible();

    await modal.locator(selectors.currentPasswordInput).fill(TEST_USER.password);
    await modal.locator(selectors.newPasswordInput).fill('newpass123');
    await modal.locator(selectors.confirmPasswordInput).fill('different123');

    await modal.getByRole('button', { name: 'Cambiar contraseña' }).click();

    await expect(modal).toBeVisible();
    await expect(modal.getByText(/no coincide/i)).toBeVisible();
  });
});
