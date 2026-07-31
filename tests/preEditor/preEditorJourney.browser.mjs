import assert from 'node:assert/strict'
import process from 'node:process'
import test from 'node:test'

import { chromium } from 'playwright'

const BASE_URL = process.env.PRE_EDITOR_BASE_URL ?? 'http://127.0.0.1:5173'
const BASE = new URL(BASE_URL)
const APP_BASE_PATHNAME = BASE.pathname === '/' ? '' : BASE.pathname.replace(/\/$/, '')
const APP_TITLE = '<title>Article creation</title>'
const SUBJECT_TITLE = 'Ritu Karidhal'
const RED_LINK_NAME = 'Ritu Karidhal — article does not exist'
const SOURCE_ONE = 'https://example.com/mission-profile'
const SOURCE_TWO = 'https://example.org/space-programme'

let browser

function appPath(pathname = '/') {
  const normalizedPathname = pathname.startsWith('/') ? pathname : `/${pathname}`
  return `${APP_BASE_PATHNAME}${normalizedPathname}`
}

function appUrl(pathname = '/') {
  return new URL(appPath(pathname), BASE.origin).href
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

async function assertStep(page, step) {
  await page.waitForURL(
    (url) => url.pathname === appPath('/article-guidance') && url.searchParams.get('step') === step,
  )
  assert.equal(new URL(page.url()).searchParams.get('step'), step)
}

async function assertQueryContract(page, expectedStep) {
  const url = new URL(page.url())
  assert.equal(url.pathname, appPath('/article-guidance'))
  assert.equal(url.searchParams.get('step'), expectedStep)
  assert.equal(url.searchParams.get('title'), SUBJECT_TITLE)
  assert.equal(url.searchParams.get('source'), 'redlink')
  assert.equal(url.searchParams.get('variant'), 'toolbar-outline')
}

async function selectSubject(page) {
  const result = page.getByRole('button', {
    name: /Ritu Karidhal · Person Indian scientist and aerospace engineer/,
  })
  await assertVisible(result)
  await result.click()
  await assertStep(page, 'sources')
}

async function addSource(page, source) {
  await page.getByLabel('Paste a link to a source').fill(source)
  await page.getByRole('button', { name: 'Add source', exact: true }).click()
}

test.before(async () => {
  await assertAppIdentity()
  browser = await chromium.launch({ headless: true })
})

test.after(async () => {
  await browser?.close()
})

test('red link completes the guarded Article Guidance journey and hands both sources to the editor', async () => {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } })
  const page = await context.newPage()
  page.setDefaultTimeout(5_000)
  page.setDefaultNavigationTimeout(10_000)

  try {
    await page.goto(appUrl('/article'))

    const redLink = page.getByRole('link', { name: RED_LINK_NAME, exact: true })
    await assertVisible(redLink)
    await assertVisible(
      page.getByRole('heading', {
        level: 1,
        name: 'Women in the Indian space programme',
        exact: true,
      }),
    )
    const redLinkPresentation = await redLink.evaluate((element) => {
      const style = window.getComputedStyle(element)
      return {
        color: style.color,
        tagName: element.tagName,
        textDecorationLine: style.textDecorationLine,
      }
    })
    assert.deepEqual(redLinkPresentation, {
      color: 'rgb(191, 60, 44)',
      tagName: 'A',
      textDecorationLine: 'underline',
    })
    const redLinkUrl = new URL(await redLink.getAttribute('href'), page.url())
    assert.equal(redLinkUrl.pathname, appPath('/article-guidance'))
    assert.deepEqual(
      [...redLinkUrl.searchParams.entries()],
      [
        ['step', 'subject'],
        ['title', SUBJECT_TITLE],
        ['source', 'redlink'],
        ['variant', 'toolbar-outline'],
      ],
    )

    await redLink.focus()
    await redLink.press('Enter')
    await assertStep(page, 'subject')
    await assertVisible(page.getByRole('heading', { level: 1, name: 'New article', exact: true }))

    const titleInput = page.getByLabel('Article title', { exact: true })
    assert.equal(await titleInput.inputValue(), SUBJECT_TITLE)
    await assertVisible(page.getByRole('heading', { name: 'What is this?', exact: true }))

    const subjectResult = page.getByRole('button', {
      name: /Ritu Karidhal · Person Indian scientist and aerospace engineer/,
    })
    await assertVisible(subjectResult)

    await page.getByRole('button', { name: 'Back', exact: true }).click()
    await page.waitForURL((url) => url.pathname === appPath('/article'))
    await redLink.focus()
    await redLink.press('Enter')
    await assertStep(page, 'subject')

    await titleInput.fill('Different person')
    await assertVisible(page.getByText('No subjects found for "Different person"', { exact: true }))
    assert.equal(await subjectResult.count(), 0)
    await titleInput.fill(SUBJECT_TITLE)
    await assertVisible(subjectResult)

    await subjectResult.focus()
    await subjectResult.press('Enter')
    await assertStep(page, 'sources')

    await page.goBack()
    await assertStep(page, 'subject')
    await titleInput.fill('Different person')
    await page.goForward()
    await assertStep(page, 'subject')
    assert.equal(await titleInput.inputValue(), 'Different person')
    await assertVisible(page.getByText('No subjects found for "Different person"', { exact: true }))

    await titleInput.fill(SUBJECT_TITLE)
    await selectSubject(page)
    await page.goBack()
    await assertStep(page, 'subject')
    assert.equal(await titleInput.inputValue(), SUBJECT_TITLE)
    await page.goForward()
    await assertStep(page, 'sources')

    const sourcesHeading = page.getByRole('heading', {
      level: 1,
      name: 'Add sources',
      exact: true,
    })
    await assertVisible(sourcesHeading)
    assert.equal(
      await sourcesHeading.evaluate((element) => document.activeElement === element),
      true,
    )
    await assertVisible(
      page.getByText('Sources help readers check the facts and shows why this subject matters.', {
        exact: true,
      }),
    )
    await assertVisible(
      page.getByText('Person articles on this wiki require sources.', { exact: true }),
    )

    const sourceInput = page.getByLabel('Paste a link to a source')
    const addSourceButton = page.getByRole('button', { name: 'Add source', exact: true })
    const continueButton = page.getByRole('button', { name: 'Continue', exact: true })
    assert.equal(await continueButton.isDisabled(), true)
    await assertVisible(page.getByText('0 of 2 sources added', { exact: true }))

    await sourceInput.fill('not a valid URL')
    await addSourceButton.click()
    await assertVisible(page.getByRole('alert').getByText('Enter a valid URL', { exact: true }))
    assert.equal(await sourceInput.inputValue(), 'not a valid URL')

    await addSource(page, SOURCE_ONE)
    assert.equal(await sourceInput.inputValue(), '')
    assert.equal(await page.getByRole('alert').count(), 0)
    await assertVisible(page.getByText('1 of 2 sources added', { exact: true }))
    await assertVisible(page.getByText('example.com', { exact: true }))
    await assertVisible(page.getByText(SOURCE_ONE, { exact: true }))
    assert.equal(await continueButton.isDisabled(), true)

    await sourceInput.fill('https://EXAMPLE.COM/mission-profile')
    await addSourceButton.click()
    await assertVisible(
      page.getByRole('alert').getByText('This source has already been added', {
        exact: true,
      }),
    )
    assert.equal(await sourceInput.inputValue(), 'https://EXAMPLE.COM/mission-profile')

    await page.getByRole('button', { name: /Remove.*example\.com/i }).click()
    await assertVisible(page.getByText('0 of 2 sources added', { exact: true }))
    assert.equal(await continueButton.isDisabled(), true)

    await addSourceButton.click()
    assert.equal(await sourceInput.inputValue(), '')
    assert.equal(await page.getByRole('alert').count(), 0)
    await assertVisible(page.getByText('1 of 2 sources added', { exact: true }))
    assert.equal(await continueButton.isDisabled(), true)

    await addSource(page, SOURCE_TWO)
    await assertVisible(page.getByText('2 of 2 sources added', { exact: true }))
    await assertVisible(page.getByText('example.org', { exact: true }))
    await assertVisible(page.getByText(SOURCE_TWO, { exact: true }))
    assert.equal(await sourceInput.isDisabled(), true)
    assert.equal(await addSourceButton.isDisabled(), true)
    assert.equal(await continueButton.isEnabled(), true)

    await continueButton.click()
    await assertStep(page, 'guidance')
    const guidanceHeading = page.getByRole('heading', {
      level: 1,
      name: 'Getting started with this article',
      exact: true,
    })
    await assertVisible(guidanceHeading)
    assert.equal(
      await guidanceHeading.evaluate((element) => document.activeElement === element),
      true,
    )

    await page.getByRole('button', { name: 'Back', exact: true }).click()
    await assertStep(page, 'sources')
    assert.equal(await continueButton.isEnabled(), true)
    await continueButton.click()
    await assertStep(page, 'guidance')

    const guidanceCopy = [
      'Here are a few tips to help you write a great article.',
      'Start with who this person is and why they are notable. Use reliable, independent sources that cover the person in depth.',
      'Write in the third person and keep a neutral tone throughout.',
      "Don't write about yourself, your family, or your friends.",
      'Established encyclopaedias and biographical dictionaries',
      'Official government or parliamentary records',
      'Academic or peer-reviewed publications',
      'Major newswires and outlets with editorial standards',
      'Social media platforms and posts',
      'Blogs and personal websites',
      'Fan sites and fandom wikis',
      'Promotional material, press releases, and marketing content',
    ]
    for (const copy of guidanceCopy) {
      await assertVisible(page.getByText(copy, { exact: true }))
    }

    await page.getByRole('button', { name: 'Start writing', exact: true }).click()
    await page.waitForURL((url) => url.pathname === appPath('/editor'))
    await assertVisible(page.locator('.editor-page'))

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
        outline: 'person',
        sourceOrigin: 'redlink',
        title: SUBJECT_TITLE,
        variant: 'toolbar-outline',
      },
    )
    assert.deepEqual(editorUrl.searchParams.getAll('source'), [SOURCE_ONE, SOURCE_TWO])
  } finally {
    await context.close()
  }
})

test('direct, invalid, and refreshed setup routes replace illegal stages with Subject and retain origin queries', async () => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } })
  const page = await context.newPage()
  page.setDefaultTimeout(5_000)
  page.setDefaultNavigationTimeout(10_000)
  const preservedQuery = 'title=Ritu+Karidhal&source=redlink&variant=toolbar-outline'

  try {
    await page.goto(appUrl(`/article-guidance?step=sources&${preservedQuery}`))
    await assertStep(page, 'subject')
    await assertQueryContract(page, 'subject')

    await page.goto(appUrl(`/article-guidance?step&${preservedQuery}`))
    await assertStep(page, 'subject')
    await assertQueryContract(page, 'subject')

    await page.goto(appUrl(`/article-guidance?step=sources&step=guidance&${preservedQuery}`))
    await assertStep(page, 'subject')
    await assertQueryContract(page, 'subject')

    await page.goto(appUrl(`/article-guidance?step=guidance&${preservedQuery}`))
    await assertStep(page, 'subject')
    await assertQueryContract(page, 'subject')

    await page.getByRole('button', { name: 'Back', exact: true }).click()
    await page.waitForURL((url) => url.pathname === appPath('/article'))

    await page.goto(appUrl(`/article-guidance?step=sources&${preservedQuery}`))
    await assertStep(page, 'subject')
    await selectSubject(page)

    await addSource(page, 'https://example.net/one')
    await addSource(page, 'https://example.edu/two')
    await page.getByRole('button', { name: 'Continue', exact: true }).click()
    await assertStep(page, 'guidance')
    await assertQueryContract(page, 'guidance')

    await page.reload()
    await assertStep(page, 'subject')
    await assertQueryContract(page, 'subject')
    assert.equal(
      await page.getByLabel('Article title', { exact: true }).inputValue(),
      SUBJECT_TITLE,
    )
  } finally {
    await context.close()
  }
})
