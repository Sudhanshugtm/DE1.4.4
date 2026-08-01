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

  it('stores declared semantic identity and the original placeholder in editor HTML', () => {
    const html = outlineItemToEditorHtml(
      {
        key: 'country:lead',
        title: 'Introduction',
        content: "'''[Country name]''', officially [official name], is in [region].",
      },
      { isLead: true, outlineId: 'country' },
    )

    expect(html).toContain('data-scaffold-binding="country:subject-name"')
    expect(html).toContain('data-scaffold-placeholder="[Country name]"')
    expect(html).toContain('<strong>')
    expect(html).not.toContain('data-scaffold-binding="country:official-name"')
  })

  it('does not add semantic markup without an outline id', () => {
    expect(
      outlineItemToEditorHtml(
        { key: 'country:lead', title: 'Introduction', content: '[Country name]' },
        { isLead: true },
      ),
    ).toBe('<p>[Country name]</p>')
  })
})
