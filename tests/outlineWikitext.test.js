import { describe, expect, it } from 'vitest'
import { outlineItemToEditorHtml } from '../src/utils/outlineWikitext.js'

describe('outlineItemToEditorHtml', () => {
  it('keeps a stable key on a non-lead section heading', () => {
    expect(
      outlineItemToEditorHtml({
        key: 'city:history',
        title: 'History',
      }),
    ).toContain('data-outline-item-key="city:history"')
  })

  it('keeps lead content without an outline heading', () => {
    expect(
      outlineItemToEditorHtml(
        { key: 'city:lead', title: 'Lead', content: 'Introduction' },
        { isLead: true },
      ),
    ).toBe('<p>Introduction</p>')
  })
})
