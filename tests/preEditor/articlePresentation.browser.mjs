import assert from 'node:assert/strict'
import process from 'node:process'
import test from 'node:test'

import { chromium } from 'playwright'

const BASE_URL = process.env.PRE_EDITOR_BASE_URL ?? 'http://127.0.0.1:5174'

test('article omits the research notice and uses colour without persistent underlines', async () => {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()

  try {
    await page.goto(new URL('/article', BASE_URL).href)

    assert.equal(await page.getByText('Research prototype', { exact: true }).count(), 0)

    for (const selector of ['.proto-wiki__missing-link', '.proto-wiki__context-link']) {
      const decorations = await page
        .locator(selector)
        .evaluateAll((elements) =>
          elements.map((element) => getComputedStyle(element).textDecorationLine),
        )
      assert.ok(decorations.length > 0)
      assert.deepEqual(new Set(decorations), new Set(['none']))
    }
  } finally {
    await browser.close()
  }
})
