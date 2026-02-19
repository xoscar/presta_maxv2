import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test('navigates from sidebar and shows dashboard stats', async ({ page }) => {
    await page.goto('/clients');
    await page.waitForLoadState('networkidle');

    // Click the sidebar item for Dashboard (Estadísticas) - rendered as Link inside Button
    await page.getByRole('link', { name: /Estadísticas/i }).click();

    await page.waitForURL('/dashboard');
    await page.waitForLoadState('networkidle');

    // Page title (h1) and card section titles (CardTitle renders as div, not heading)
    await expect(page.getByRole('heading', { name: 'Estadísticas' })).toBeVisible();
    await expect(page.getByText('Deuda total')).toBeVisible();
    await expect(page.getByText('Monto pagado por cliente')).toBeVisible();
    await expect(page.getByText('Préstamos por cliente')).toBeVisible();
    await expect(page.getByText('Cargos por cliente')).toBeVisible();
  });

  test('changes statistics range using presets', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    const sevenDaysButton = page.getByRole('button', { name: 'Últimos 7 días' });
    const thirtyDaysButton = page.getByRole('button', { name: 'Últimos 30 días' });

    // Default preset should be 30 days highlighted
    await expect(thirtyDaysButton).toHaveClass(/bg-primary/);

    // Switch to 7-day preset and ensure it becomes active
    await sevenDaysButton.click();
    await page.waitForLoadState('networkidle');

    await expect(sevenDaysButton).toHaveClass(/bg-primary/);
  });

  test('renders all dashboard sections', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // All three chart sections (or their empty states) are present
    await expect(page.getByText('Monto pagado por cliente')).toBeVisible();
    await expect(page.getByText('Préstamos por cliente')).toBeVisible();
    await expect(page.getByText('Cargos por cliente')).toBeVisible();
  });
});
