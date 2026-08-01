import { getFieldBindingKey } from '../config/outlines/fieldBindings.js'

const SIMPLE_WIKIPEDIA_ARTICLE_URL = 'https://simple.wikipedia.org/wiki/'

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function restoreTokens(value, tokens) {
  return value.replace(/%%OUTLINE_TOKEN_(\d+)%%/g, (_match, index) => tokens[Number(index)])
}

function renderEmphasis(value) {
  return value
    .replace(
      /&#039;&#039;&#039;&#039;&#039;(.+?)&#039;&#039;&#039;&#039;&#039;/g,
      '<strong><em>$1</em></strong>',
    )
    .replace(/&#039;&#039;&#039;(.+?)&#039;&#039;&#039;/g, '<strong>$1</strong>')
    .replace(/&#039;&#039;(.+?)&#039;&#039;/g, '<em>$1</em>')
}

/**
 * Convert the small subset of inline wikitext used by Article Guidance
 * scaffolds into safe, readable HTML.
 */
export function renderInlineWikitext(value = '', { outlineId } = {}) {
  const tokens = []
  const stash = (html) => {
    const token = `%%OUTLINE_TOKEN_${tokens.length}%%`
    tokens.push(html)
    return token
  }

  let source = String(value)

  if (outlineId) {
    source = source.replace(/\[[^[\]]+\]/g, (label) => {
      const binding = getFieldBindingKey(outlineId, label)
      if (!binding) return label
      return stash(
        `<span data-scaffold-binding="${escapeHtml(binding)}" data-scaffold-placeholder="${escapeHtml(label)}">${escapeHtml(label)}</span>`,
      )
    })
  }

  source = source.replace(/\{\{\s*(?:citation needed|cn)\b[^{}]*\}\}/gi, () =>
    stash('<sup class="outline-source-prompt">Source</sup>'),
  )

  source = source.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_match, target, label) => {
    const normalizedTarget = target.trim().replaceAll(' ', '_')
    const href = `${SIMPLE_WIKIPEDIA_ARTICLE_URL}${encodeURIComponent(normalizedTarget)}`
    const linkLabel = renderEmphasis(escapeHtml((label || target).trim()))
    return stash(`<a href="${escapeHtml(href)}" target="_blank" rel="noopener">${linkLabel}</a>`)
  })

  source = source.replace(/\[(https?:\/\/[^\s\]]+)(?:\s+([^\]]+))?\]/g, (_match, href, label) => {
    const linkLabel = renderEmphasis(escapeHtml((label || href).trim()))
    return stash(`<a href="${escapeHtml(href)}" target="_blank" rel="noopener">${linkLabel}</a>`)
  })

  source = source.replace(/<br\s*\/?>/gi, () => stash('<br>'))
  source = renderEmphasis(escapeHtml(source))

  return restoreTokens(source, tokens)
}

function closeList(html, listType) {
  if (listType) html.push(`</${listType}>`)
  return null
}

/**
 * Convert scaffold wikitext into block HTML suitable both for preview and for
 * insertion into TipTap. Bracket prompts remain ordinary, editable text.
 */
export function outlineWikitextToHtml(value = '', { outlineId } = {}) {
  const lines = String(value)
    .replace(/\r\n?/g, '\n')
    .replace(/<!--[\s\S]*?-->/g, '')
    .trim()
    .split('\n')

  if (lines.length === 1 && lines[0] === '') return ''

  const html = []
  let paragraph = []
  let listType = null

  const flushParagraph = () => {
    if (!paragraph.length) return
    html.push(`<p>${renderInlineWikitext(paragraph.join(' '), { outlineId })}</p>`)
    paragraph = []
  }

  for (const rawLine of lines) {
    const line = rawLine.trim()

    if (!line) {
      flushParagraph()
      listType = closeList(html, listType)
      continue
    }

    const listMatch = line.match(/^([*#])\s*(.*)$/)
    if (listMatch) {
      flushParagraph()
      const nextListType = listMatch[1] === '*' ? 'ul' : 'ol'
      if (listType !== nextListType) {
        listType = closeList(html, listType)
        html.push(`<${nextListType}>`)
        listType = nextListType
      }
      html.push(`<li>${renderInlineWikitext(listMatch[2], { outlineId })}</li>`)
      continue
    }

    const headingMatch = line.match(/^={2,6}\s*(.*?)\s*={2,6}$/)
    if (headingMatch) {
      flushParagraph()
      listType = closeList(html, listType)
      html.push(
        `<p><strong>${renderInlineWikitext(headingMatch[1], { outlineId })}</strong></p>`,
      )
      continue
    }

    if (listType) listType = closeList(html, listType)
    paragraph.push(line)
  }

  flushParagraph()
  closeList(html, listType)

  return html.join('')
}

export function isReferencesSection(section) {
  return /^references?$/i.test(section?.title?.trim() || '')
}

/**
 * Produce the editor payload for one flat outline item.
 * The lead has no heading. Every other item is an H2 followed by its body.
 */
export function outlineItemToEditorHtml(item, { isLead = false, outlineId } = {}) {
  if (!item) return ''

  if (isLead) {
    return outlineWikitextToHtml(item.content, { outlineId })
  }

  const heading = `<h2 data-outline-item-key="${escapeHtml(item.key || '')}">${escapeHtml(item.title || '')}</h2>`
  if (isReferencesSection(item)) return heading

  return `${heading}${outlineWikitextToHtml(item.content, { outlineId })}`
}
