import { chromium, expect } from '@playwright/test';
import assert from 'node:assert/strict';

// Run against next dev, where React reports attribute hydration mismatches.
const origin = process.env.HYDRATION_ORIGIN || 'http://127.0.0.1:4321';
const browser = await chromium.launch();
try {
  for (const mutation of ['none', 'root', 'content']) {
    const context = await browser.newContext();
    try {
      const page = await context.newPage();
      const hydrationErrors = [];
      page.on('console', message => {
        if (message.type() === 'error' && /hydrat/i.test(message.text())) hydrationErrors.push(message.text());
      });
      await page.route(`${origin}/`, async route => {
        const response = await route.fetch();
        let html = await response.text();
        if (mutation === 'root') html = html.replace('<html ', '<html class="js-storylane-extension" ');
        if (mutation === 'content') html = html.replace('<main id="main"', '<main data-extension-mutation="true" id="main"');
        await route.fulfill({ response, body: html });
      });
      await page.goto(origin);
      await page.waitForLoadState('networkidle');
      if (mutation === 'content') {
        assert.ok(hydrationErrors.some(error => error.includes('data-extension-mutation')), 'Descendant mismatches must remain visible');
      } else {
        assert.deepEqual(hydrationErrors, [], `${mutation}: no hydration warnings`);
        if (mutation === 'root') assert.equal(await page.locator('html').getAttribute('class'), 'js-storylane-extension');
        await page.locator('#task-select').click();
        await expect(page.getByRole('option', { name: 'Pagination', exact: true })).toBeVisible();
      }
    } finally {
      await context.close();
    }
  }
  console.log('PASS: clean hydration, Storylane root attributes, working picker, and descendant mismatch detection.');
} finally {
  await browser.close();
}
