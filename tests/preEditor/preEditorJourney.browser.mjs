import assert from 'node:assert/strict'
import process from 'node:process'
import test from 'node:test'

import { chromium } from 'playwright'

const BASE_URL = process.env.PRE_EDITOR_BASE_URL ?? 'http://127.0.0.1:5173'
const BASE = new URL(BASE_URL)
const APP_BASE_PATHNAME = BASE.pathname === '/' ? '' : BASE.pathname.replace(/\/$/, '')
const APP_TITLE = '<title>Article creation</title>'
const SOURCE_ONE = 'https://example.com/source-one'
const SOURCE_TWO = 'https://example.org/source-two'

const JOURNEYS = [
  {
    key: 'landform-mount-everest',
    title: 'Mount Everest',
    type: 'Landform',
    qid: 'Q513',
    relation: 'Wikidata item',
    outline: 'landform',
    outlineLabel: 'Landform',
    asset: 'mount-everest',
  },
  {
    key: 'island-easter-island',
    title: 'Easter Island',
    type: 'Island',
    qid: 'Q14452',
    relation: 'Wikidata item',
    outline: 'island',
    outlineLabel: 'Island',
    asset: 'easter-island',
  },
  {
    key: 'software-google-earth',
    title: 'Google Earth',
    type: 'Software',
    qid: 'Q42274',
    relation: 'Wikidata item',
    outline: 'software',
    outlineLabel: 'Software',
    asset: 'google-earth',
  },
  {
    key: 'object-mars',
    title: 'Mars',
    type: 'Astronomical Object',
    qid: 'Q111',
    relation: 'Wikidata item',
    outline: 'astronomical-object',
    outlineLabel: 'Astronomical Object',
    asset: 'mars',
  },
  {
    key: 'person-neil-armstrong',
    title: 'Neil Armstrong',
    type: 'Person',
    qid: 'Q1615',
    relation: 'Wikidata item',
    outline: 'person',
    outlineLabel: 'Person',
    asset: 'neil-armstrong',
  },
  {
    key: 'person-valentina-tereshkova',
    title: 'Valentina Tereshkova',
    type: 'Person',
    qid: 'Q44371',
    relation: 'Wikidata item',
    outline: 'person',
    outlineLabel: 'Person',
    asset: 'valentina-tereshkova',
  },
  {
    key: 'event-chandrayaan-3-landing',
    title: 'Chandrayaan-3 Moon landing',
    type: 'Recent Event',
    qid: 'Q65049774',
    relation: 'Related Wikidata item',
    outline: 'recent-event',
    outlineLabel: 'Recent Event',
    asset: 'chandrayaan-3',
  },
  {
    key: 'company-spacex',
    title: 'SpaceX',
    type: 'Company',
    qid: 'Q193701',
    relation: 'Wikidata item',
    outline: 'company',
    outlineLabel: 'Company',
    asset: 'spacex',
  },
]

let browser

function appPath(pathname = '/') {
  const normalizedPathname = pathname.startsWith('/') ? pathname : `/${pathname}`
  return `${APP_BASE_PATHNAME}${normalizedPathname}`
}

function appUrl(pathname = '/') {
  return new URL(appPath(pathname), BASE.origin).href
}

function setupUrl(journey, step = 'subject') {
  const url = new URL(appUrl('/article-guidance'))
  url.search = new URLSearchParams({
    step,
    journey: journey.key,
    title: journey.title,
    sourceOrigin: 'redlink',
    variant: 'toolbar-outline',
  })
  return url.href
}

async function assertAppIdentity() {
  const appRootUrl = appUrl('/')
  const response = await fetch(appRootUrl)
  assert.equal(response.ok, true, `Expected ${appRootUrl} to return a successful response`)
  assert.equal(
    (await response.text()).includes(APP_TITLE),
    true,
    `Expected ${appRootUrl} to contain ${APP_TITLE}`,
  )
}

async function assertVisible(locator) {
  await locator.waitFor({ state: 'visible' })
  assert.equal(await locator.isVisible(), true)
}

async function assertStep(page, journey, step) {
  await page.waitForURL((url) => {
    return (
      url.pathname === appPath('/article-guidance') &&
      url.searchParams.get('journey') === journey.key &&
      url.searchParams.get('step') === step
    )
  })
}

async function addSource(page, source) {
  await page.getByLabel('Paste a link to a source').fill(source)
  await page.getByRole('button', { name: 'Add source', exact: true }).click()
}

async function newLocalContext(viewport = { width: 1280, height: 900 }) {
  const context = await browser.newContext({ viewport })
  const externalRequests = []

  await context.route('**/*', async (route) => {
    const requestUrl = new URL(route.request().url())
    if (['http:', 'https:'].includes(requestUrl.protocol) && requestUrl.origin !== BASE.origin) {
      externalRequests.push(requestUrl.href)
      await route.abort()
      return
    }
    await route.continue()
  })

  return { context, externalRequests }
}

test.before(async () => {
  await assertAppIdentity()
  browser = await chromium.launch({ headless: process.env.PRE_EDITOR_HEADLESS !== 'false' })
})

test.after(async () => {
  await browser?.close()
})

test('Exploration exposes eight exact red-link setup routes', async () => {
  const { context, externalRequests } = await newLocalContext({ width: 390, height: 844 })
  const page = await context.newPage()

  try {
    await page.goto(appUrl('/article'))
    await assertVisible(page.getByRole('heading', { level: 1, name: 'Exploration', exact: true }))

    const redLinks = page.locator('.proto-wiki__missing-link')
    assert.equal(await redLinks.count(), JOURNEYS.length)

    for (const journey of JOURNEYS) {
      const link = page.getByRole('link', {
        name: `${journey.title} — simulated missing article; opens article-creation guidance`,
        exact: true,
      })
      await assertVisible(link)
      assert.equal(new URL(await link.getAttribute('href'), page.url()).href, setupUrl(journey))
    }

    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
      true,
      'The mobile article should not overflow horizontally',
    )
    assert.deepEqual(externalRequests, [])
  } finally {
    await context.close()
  }
})

test('every red link completes its pictured setup journey and opens its own outline', async (t) => {
  for (const [index, journey] of JOURNEYS.entries()) {
    await t.test(journey.title, async () => {
      const viewport = index === 0 ? { width: 390, height: 844 } : { width: 1280, height: 900 }
      const { context, externalRequests } = await newLocalContext(viewport)
      const page = await context.newPage()
      page.setDefaultTimeout(7_000)
      page.setDefaultNavigationTimeout(12_000)

      try {
        await page.goto(appUrl('/article'))
        await page
          .getByRole('link', {
            name: `${journey.title} — simulated missing article; opens article-creation guidance`,
            exact: true,
          })
          .click()
        await assertStep(page, journey, 'subject')

        assert.equal(
          await page.getByLabel('Article title', { exact: true }).inputValue(),
          journey.title,
        )
        const result = page.locator('.subject-result')
        await assertVisible(result)
        await assertVisible(result.getByText(journey.title, { exact: true }))
        await assertVisible(result.getByText(journey.type, { exact: true }))
        assert.equal(
          (await result.locator('.subject-result__wikidata').innerText()).trim(),
          `${journey.relation} · ${journey.qid}`,
        )

        const thumbnail = result.locator('.cdx-thumbnail__image')
        await assertVisible(thumbnail)
        const backgroundImage = await thumbnail.evaluate(
          (element) => window.getComputedStyle(element).backgroundImage,
        )
        const thumbnailUrl = new URL(
          backgroundImage.match(/^url\(["']?(.*?)["']?\)$/)?.[1],
          page.url(),
        )
        assert.equal(thumbnailUrl.origin, BASE.origin)
        assert.match(thumbnailUrl.pathname, new RegExp(`/${journey.asset}(?:[-.]|$)`))
        assert.equal(
          thumbnailUrl.pathname.startsWith(`${APP_BASE_PATHNAME}/assets/`) ||
            thumbnailUrl.pathname.startsWith(`${APP_BASE_PATHNAME}/src/preEditor/assets/subjects/`),
          true,
          `Expected a bundled thumbnail path, received ${thumbnailUrl.pathname}`,
        )

        if (index === 0) {
          await assertVisible(page.locator('.article-guidance-shell__mobile-back'))
          assert.equal(
            await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
            true,
            'The mobile Subject step should not overflow horizontally',
          )
        }

        await result.click()
        await assertStep(page, journey, 'sources')
        await addSource(page, SOURCE_ONE)
        await addSource(page, SOURCE_TWO)
        await page.getByRole('button', { name: 'Continue', exact: true }).click()
        await assertStep(page, journey, 'guidance')
        await page.getByRole('button', { name: 'Start writing', exact: true }).click()
        await page.waitForURL((url) => url.pathname === appPath('/editor'))

        const editorUrl = new URL(page.url())
        assert.deepEqual(
          {
            articleguidance: editorUrl.searchParams.get('articleguidance'),
            lang: editorUrl.searchParams.get('lang'),
            outline: editorUrl.searchParams.get('outline'),
            sourceOrigin: editorUrl.searchParams.get('sourceOrigin'),
            title: editorUrl.searchParams.get('title'),
            variant: editorUrl.searchParams.get('variant'),
          },
          {
            articleguidance: '1',
            lang: 'en',
            outline: journey.outline,
            sourceOrigin: 'redlink',
            title: journey.title,
            variant: 'toolbar-outline',
          },
        )
        assert.deepEqual(editorUrl.searchParams.getAll('source'), [SOURCE_ONE, SOURCE_TWO])
        await assertVisible(
          page.getByRole('region', {
            name: `${journey.outlineLabel} article outline sections`,
            exact: true,
          }),
        )
        assert.deepEqual(externalRequests, [])
      } finally {
        await context.close()
      }
    })
  }
})

test('compact setup routes recover illegal stages and a refresh to Subject', async () => {
  const journey = JOURNEYS.find(({ key }) => key === 'person-neil-armstrong')
  const { context, externalRequests } = await newLocalContext({ width: 390, height: 844 })
  const page = await context.newPage()

  try {
    await page.goto(setupUrl(journey, 'sources'))
    await assertStep(page, journey, 'subject')
    assert.equal(page.url(), setupUrl(journey))

    await page.locator('.subject-result').click()
    await addSource(page, SOURCE_ONE)
    await addSource(page, SOURCE_TWO)
    await page.getByRole('button', { name: 'Continue', exact: true }).click()
    await assertStep(page, journey, 'guidance')
    await page.reload()
    await assertStep(page, journey, 'subject')
    assert.equal(page.url(), setupUrl(journey))

    await page.goto(
      appUrl(
        '/article-guidance?step=subject&journey=unknown&title=Unknown&sourceOrigin=redlink&variant=toolbar-outline',
      ),
    )
    await page.waitForURL((url) => url.pathname === appPath('/article'))
    assert.deepEqual(externalRequests, [])
  } finally {
    await context.close()
  }
})
