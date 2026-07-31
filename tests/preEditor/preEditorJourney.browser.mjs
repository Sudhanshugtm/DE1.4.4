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

    const sourcesPageHeading = page.getByRole('heading', {
      level: 1,
      name: 'New article',
      exact: true,
    })
    await assertVisible(sourcesPageHeading)
    assert.equal(
      await sourcesPageHeading.evaluate((element) => document.activeElement === element),
      true,
    )
    await assertVisible(
      page.getByRole('heading', {
        level: 2,
        name: SUBJECT_TITLE,
        exact: true,
      }),
    )
    await assertVisible(page.getByRole('button', { name: 'Edit article title', exact: true }))
    await assertVisible(
      page.getByRole('heading', {
        level: 3,
        name: 'Add sources *',
        exact: true,
      }),
    )
    await assertVisible(
      page.getByText('This type of article requires sources before you can continue.', {
        exact: true,
      }),
    )
    assert.equal(
      await page.getByText('Paste a link to a source', { exact: true }).count(),
      0,
      'The source prompt should be a placeholder, not a visible field label',
    )

    const sourceInput = page.getByLabel('Paste a link to a source')
    const addSourceButton = page.getByRole('button', { name: 'Add source', exact: true })
    const continueButton = page.getByRole('button', { name: 'Continue', exact: true })
    assert.equal(await continueButton.isDisabled(), true)
    await assertVisible(
      page.getByText('Person articles on this wiki require sources.', { exact: true }),
    )

    await sourceInput.fill('not a valid URL')
    await addSourceButton.click()
    await assertVisible(page.getByRole('alert').getByText('Enter a valid URL', { exact: true }))
    assert.equal(await sourceInput.inputValue(), 'not a valid URL')

    await addSource(page, SOURCE_ONE)
    assert.equal(await sourceInput.inputValue(), '')
    assert.equal(await page.getByRole('alert').count(), 0)
    await assertVisible(page.getByText('1 of 2 sources added.', { exact: true }))
    await assertVisible(page.getByText('example.com', { exact: true }))
    const addedSources = page.getByRole('list', { name: 'Added sources', exact: true })
    await assertVisible(addedSources)
    await assertVisible(addedSources.getByRole('listitem').filter({ hasText: 'example.com' }))
    assert.equal(await page.getByText(SOURCE_ONE, { exact: true }).count(), 0)
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
    await assertVisible(
      page.getByText('Person articles on this wiki require sources.', { exact: true }),
    )
    assert.equal(await continueButton.isDisabled(), true)

    await addSourceButton.click()
    assert.equal(await sourceInput.inputValue(), '')
    assert.equal(await page.getByRole('alert').count(), 0)
    await assertVisible(page.getByText('1 of 2 sources added.', { exact: true }))
    assert.equal(await continueButton.isDisabled(), true)

    await addSource(page, SOURCE_TWO)
    await assertVisible(page.getByText('You can add sources while you write.', { exact: true }))
    await assertVisible(page.getByText('example.org', { exact: true }))
    assert.equal(await page.getByText(SOURCE_TWO, { exact: true }).count(), 0)
    assert.equal(await sourceInput.isDisabled(), false)
    assert.equal(await addSourceButton.isDisabled(), true)
    assert.equal(await continueButton.isEnabled(), true)

    await continueButton.click()
    await assertStep(page, 'guidance')
    const guidancePageHeading = page.getByRole('heading', {
      level: 1,
      name: 'New article',
      exact: true,
    })
    await assertVisible(guidancePageHeading)
    assert.equal(
      await guidancePageHeading.evaluate((element) => document.activeElement === element),
      true,
    )
    await assertVisible(
      page.getByRole('heading', {
        level: 4,
        name: 'Getting started with this article',
        exact: true,
      }),
    )

    await page.getByRole('button', { name: 'Back', exact: true }).click()
    await assertStep(page, 'sources')
    assert.equal(await continueButton.isEnabled(), true)
    await continueButton.click()
    await assertStep(page, 'guidance')

    const guidanceCopy = [
      'Start with who this person is and why they are notable. Use reliable, independent sources that cover the person in depth.',
      'Write in the third person and keep a neutral tone throughout.',
      "Don't write about yourself, your family, or your friends.",
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

test('Article Guidance matches the extension shell and Sources layout at compact and desktop widths', async () => {
  const context = await browser.newContext({ viewport: { width: 1025, height: 900 } })
  const page = await context.newPage()
  page.setDefaultTimeout(5_000)
  page.setDefaultNavigationTimeout(10_000)

  try {
    await page.goto(
      appUrl(
        '/article-guidance?step=subject&title=Ritu+Karidhal&source=redlink&variant=toolbar-outline',
      ),
    )

    const titleInput = page.getByLabel('Article title', { exact: true })
    await assertVisible(titleInput)
    assert.equal(
      await page.getByText('Article title', { exact: true }).count(),
      0,
      'The article title prompt should be a placeholder, not a visible field label',
    )
    const subjectPresentation = await page.evaluate(() => {
      const titleInputElement = document.querySelector('#article-title')
      const resultsHeading = document.querySelector('.article-guidance-stage__subheading')
      const result = document.querySelector('.subject-result')
      const titleInputStyle = getComputedStyle(titleInputElement)

      return {
        inputBorderBottomWidth: titleInputStyle.borderBottomWidth,
        inputBorderTopWidth: titleInputStyle.borderTopWidth,
        inputFontFamily: titleInputStyle.fontFamily,
        inputFontSize: titleInputStyle.fontSize,
        resultIsCodexCard: result.classList.contains('cdx-card'),
        resultsHeadingFontSize: getComputedStyle(resultsHeading).fontSize,
      }
    })
    assert.equal(subjectPresentation.inputBorderBottomWidth, '1px')
    assert.equal(subjectPresentation.inputBorderTopWidth, '0px')
    assert.match(subjectPresentation.inputFontFamily, /Georgia|Times|Libertine/)
    assert.equal(subjectPresentation.inputFontSize, '20px')
    assert.equal(subjectPresentation.resultIsCodexCard, true)
    assert.equal(subjectPresentation.resultsHeadingFontSize, '20px')

    await selectSubject(page)

    const pageHeading = page.getByRole('heading', {
      level: 1,
      name: 'New article',
      exact: true,
    })
    const mobileBack = page.locator('.article-guidance-shell__mobile-back')
    const tipsAccordion = page.locator('.article-guidance-source-tips__accordion')
    const tipsPanel = page.locator('.article-guidance-source-tips__panel')
    const addSourceLabel = page.locator('.source-url-form__add-label')

    await assertVisible(pageHeading)
    await assertVisible(mobileBack)
    await assertVisible(tipsAccordion)
    await assertVisible(tipsAccordion.getByText('Tips for Person articles', { exact: true }))
    assert.equal(await page.getByText('Tips for person articles', { exact: true }).count(), 0)
    assert.equal(await tipsPanel.isVisible(), false)
    assert.equal(await addSourceLabel.isVisible(), false)

    const compactPresentation = await page.evaluate(() => {
      const shell = document.querySelector('.article-guidance-shell')
      const header = document.querySelector('.article-guidance-shell__header')
      const headerInner = document.querySelector('.article-guidance-shell__header-inner')
      const heading = document.querySelector('.article-guidance-shell__heading')
      const body = document.querySelector('.article-guidance-shell__body')
      const content = document.querySelector('.article-guidance-shell__content')
      const layout = document.querySelector('.article-guidance-sources')
      const articleTitle = document.querySelector('.article-guidance-subject__title')

      return {
        articleTitleFontSize: getComputedStyle(articleTitle).fontSize,
        bodyWidth: body.getBoundingClientRect().width,
        contentX: content.getBoundingClientRect().x,
        contentWidth: content.getBoundingClientRect().width,
        gridColumns: getComputedStyle(layout).gridTemplateColumns,
        headerHeight: header.getBoundingClientRect().height,
        headerInnerX: headerInner.getBoundingClientRect().x,
        headingFontSize: getComputedStyle(heading).fontSize,
        headingTextAlign: getComputedStyle(heading).textAlign,
        shellWidth: shell.getBoundingClientRect().width,
      }
    })
    assert.equal(compactPresentation.articleTitleFontSize, '24px')
    assert.equal(compactPresentation.bodyWidth, 1024)
    assert.equal(compactPresentation.contentX, 31.25)
    assert.equal(compactPresentation.contentWidth, 640)
    assert.equal(compactPresentation.gridColumns, '640px')
    assert.equal(compactPresentation.headerHeight, 45)
    assert.equal(compactPresentation.headerInnerX, 0.5)
    assert.equal(compactPresentation.headingFontSize, '18px')
    assert.equal(compactPresentation.headingTextAlign, 'center')
    assert.equal(compactPresentation.shellWidth, 1024)

    await page.setViewportSize({ width: 1280, height: 900 })
    await assertVisible(tipsPanel)
    assert.equal(await tipsAccordion.isVisible(), false)
    assert.equal(await mobileBack.isVisible(), false)
    await assertVisible(addSourceLabel)

    const sourceInput = page.getByLabel('Paste a link to a source')
    await sourceInput.focus()
    const desktopPresentation = await page.evaluate(() => {
      const shell = document.querySelector('.article-guidance-shell')
      const heading = document.querySelector('.article-guidance-shell__heading')
      const body = document.querySelector('.article-guidance-shell__body')
      const content = document.querySelector('.article-guidance-shell__content')
      const layout = document.querySelector('.article-guidance-sources')
      const actions = document.querySelector('.article-guidance-actions--sources')
      const sourceInputWrapper = document.querySelector('.source-url-form__input')
      const tipsIcon = document.querySelector(
        '.article-guidance-source-tips__panel .article-guidance-source-tips__icon',
      )

      return {
        actionsJustify: getComputedStyle(actions).justifyContent,
        bodyWidth: body.getBoundingClientRect().width,
        contentWidth: content.getBoundingClientRect().width,
        gridColumns: getComputedStyle(layout).gridTemplateColumns,
        headingFontFamily: getComputedStyle(heading).fontFamily,
        headingFontSize: getComputedStyle(heading).fontSize,
        headingTextAlign: getComputedStyle(heading).textAlign,
        shellWidth: shell.getBoundingClientRect().width,
        sourceInputBorderColor: getComputedStyle(sourceInputWrapper).borderColor,
        tipsIconColor: getComputedStyle(tipsIcon).color,
      }
    })
    assert.equal(desktopPresentation.actionsJustify, 'space-between')
    assert.equal(desktopPresentation.bodyWidth, 1024)
    assert.equal(desktopPresentation.contentWidth, 1024)
    assert.equal(desktopPresentation.gridColumns, '640px 352px')
    assert.match(desktopPresentation.headingFontFamily, /Georgia|Times|Libertine/)
    assert.equal(desktopPresentation.headingFontSize, '28px')
    assert.equal(desktopPresentation.headingTextAlign, 'left')
    assert.equal(desktopPresentation.shellWidth, 1024)
    assert.equal(desktopPresentation.sourceInputBorderColor, 'rgb(51, 102, 204)')
    assert.equal(desktopPresentation.tipsIconColor, 'rgb(32, 33, 34)')
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
