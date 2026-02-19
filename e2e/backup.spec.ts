import { test, expect } from '@playwright/test';
import { selectors } from './fixtures';

test.describe('Backup', () => {
  test('should open restore backup modal from user menu', async ({ page }) => {
    await page.goto('/clients');
    await page.waitForLoadState('networkidle');

    await page.click(selectors.userMenu);
    await page.click(selectors.restoreBackupButton);

    const modal = page.locator(selectors.restoreBackupModal);
    await expect(modal).toBeVisible();
    await expect(modal.getByRole('heading', { name: 'Restaurar respaldo' })).toBeVisible();
    await expect(modal.getByText('Haz clic o arrastra un archivo .zip')).toBeVisible();
    await expect(modal.getByRole('button', { name: 'Restaurar' })).toBeVisible();
    await expect(modal.getByRole('button', { name: 'Cancelar' })).toBeVisible();
  });

  test('should download backup as zip file', async ({ page }) => {
    await page.goto('/clients');
    await page.waitForLoadState('networkidle');

    await page.click(selectors.userMenu);
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.click(selectors.downloadBackupButton),
    ]);

    const filename = download.suggestedFilename();
    expect(filename).toMatch(/^prestamax-backup-\d{4}-\d{2}-\d{2}\.zip$/);

    const path = await download.path();
    expect(path).toBeTruthy();
  });

  test('should show error when restoring non-zip file', async ({ page }) => {
    await page.goto('/clients');
    await page.waitForLoadState('networkidle');

    await page.click(selectors.userMenu);
    await page.click(selectors.restoreBackupButton);

    const modal = page.locator(selectors.restoreBackupModal);
    await expect(modal).toBeVisible();

    await modal.locator(selectors.restoreBackupFileInput).setInputFiles({
      name: 'not-a-backup.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('not a zip file'),
    });

    await modal.getByRole('button', { name: 'Restaurar' }).click();

    await expect(modal.getByText(/El archivo debe ser un ZIP/i)).toBeVisible({ timeout: 5000 });
  });

  test.skip('should restore backup successfully when given valid zip', async ({ page }) => {
    await page.goto('/clients');
    await page.waitForLoadState('networkidle');

    await page.click(selectors.userMenu);
    const [download] = await Promise.all([
      page.waitForEvent('download', { timeout: 20000 }),
      page.click(selectors.downloadBackupButton),
    ]);

    const path = await download.path();
    expect(path).toBeTruthy();

    await page.click(selectors.userMenu);
    await page.click(selectors.restoreBackupButton);

    const modal = page.locator(selectors.restoreBackupModal);
    await expect(modal).toBeVisible();

    await modal.locator(selectors.restoreBackupFileInput).setInputFiles(path);

    await modal.getByRole('button', { name: 'Restaurar' }).click();

    await expect(modal).not.toBeVisible({ timeout: 60000 });
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveURL(/\/clients/);
  });
});
