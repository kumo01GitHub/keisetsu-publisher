import { expect, test } from '@playwright/test';

const NEW_DECK_LABEL = /新規作成|New deck/;
const TITLE_LABEL = /タイトル|Title/;
const ADD_ROW_LABEL = /行を追加|Add row/;

test.describe('publisher major flows', () => {
  test('starts new deck editing flow', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByText('kdb Builder / Deck Editor')).toBeVisible();
    await page.getByRole('button', { name: NEW_DECK_LABEL }).click();
    await expect(page.getByText(/新規単語帳の編集を開始しました。|Started editing a new deck\./)).toBeVisible();
  });

  test('adds and edits card rows', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: ADD_ROW_LABEL }).click();
    await expect(page.locator('tbody tr')).toHaveCount(2);

    const firstRow = page.locator('tbody tr').first();
    await firstRow.locator('td').nth(1).locator('input').fill('hello');
    await firstRow.locator('td').nth(2).locator('input').fill('こんにちは');

    await expect(firstRow.locator('td').nth(1).locator('input')).toHaveValue('hello');
    await expect(firstRow.locator('td').nth(2).locator('input')).toHaveValue('こんにちは');
  });

});
