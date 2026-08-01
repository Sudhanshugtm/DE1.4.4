// @vitest-environment jsdom

import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import SectionHeading from '../src/extensions/sectionHeading.js'
import * as sectionDeleteControls from '../src/extensions/sectionDeleteControls.js'

const { findSectionRange, getOutlineSectionKeys } = sectionDeleteControls
const SectionDeleteControls = sectionDeleteControls.default

const editors = []
const originalGetClientRects = Range.prototype.getClientRects
const originalScrollBy = window.scrollBy

beforeAll(() => {
  window.scrollBy = () => {}
  Range.prototype.getClientRects = () => [
    {
      top: 0,
      bottom: 1,
      left: 0,
      right: 0,
      width: 0,
      height: 1,
    },
  ]
})

afterAll(() => {
  window.scrollBy = originalScrollBy
  Range.prototype.getClientRects = originalGetClientRects
})

function createEditor(content) {
  const element = document.createElement('div')
  document.body.append(element)
  const editor = new Editor({
    element,
    extensions: [
      StarterKit.configure({ heading: false }),
      SectionHeading.configure({ levels: [2, 3, 4] }),
      ...(SectionDeleteControls ? [SectionDeleteControls] : []),
    ],
    content,
  })
  editors.push(editor)

  return editor
}

afterEach(() => {
  editors.splice(0).forEach((editor) => {
    const element = editor.options.element
    editor.destroy()
    element.remove()
  })
})

describe('outline section ranges', () => {
  it('returns only stable keyed top-level H2 keys', () => {
    const editor = createEditor(`
      <h2 data-outline-item-key="city:history">History</h2>
      <p>History text</p>
      <h2>Culture</h2>
      <h3 data-outline-item-key="city:arts">Arts</h3>
      <h2 data-outline-item-key="city:geography">Geography</h2>
    `)

    expect(getOutlineSectionKeys(editor.state.doc)).toEqual(
      new Set(['city:history', 'city:geography']),
    )
  })

  it('starts at a keyed H2 and stops immediately before the next H2', () => {
    const editor = createEditor(`
      <h2 data-outline-item-key="city:history">History</h2>
      <p>History text</p>
      <h2 data-outline-item-key="city:geography">Geography</h2>
      <p>Geography text</p>
    `)
    const headings = []
    editor.state.doc.forEach((node, offset) => {
      if (node.type.name === 'heading') headings.push(offset)
    })

    expect(findSectionRange(editor.state.doc, 'city:history')).toEqual({
      from: headings[0],
      to: headings[1],
    })
  })

  it('ends the first of three H2 sections at the second heading, not the third', () => {
    const editor = createEditor(`
      <h2 data-outline-item-key="city:history">History</h2>
      <p>History text</p>
      <h2 data-outline-item-key="city:geography">Geography</h2>
      <p>Geography text</p>
      <h2 data-outline-item-key="city:transport">Transport</h2>
    `)
    const headings = []
    editor.state.doc.forEach((node, offset) => {
      if (node.type.name === 'heading') headings.push(offset)
    })

    expect(findSectionRange(editor.state.doc, 'city:history')).toEqual({
      from: headings[0],
      to: headings[1],
    })
  })

  it('stops before an unkeyed manually authored H2 without treating it as an outline key', () => {
    const editor = createEditor(`
      <h2 data-outline-item-key="city:history">History</h2>
      <p>History text</p>
      <h2>Local history</h2>
    `)
    const headings = []
    editor.state.doc.forEach((node, offset) => {
      if (node.type.name === 'heading') headings.push(offset)
    })

    expect(findSectionRange(editor.state.doc, 'city:history')).toEqual({
      from: headings[0],
      to: headings[1],
    })
    expect(getOutlineSectionKeys(editor.state.doc)).toEqual(new Set(['city:history']))
  })

  it('ends a final keyed H2 section at the end of the document', () => {
    const editor = createEditor(`
      <h2 data-outline-item-key="city:history">History</h2>
      <p>History text</p>
    `)
    const heading = []
    editor.state.doc.forEach((node, offset) => {
      if (node.type.name === 'heading') heading.push(offset)
    })

    expect(findSectionRange(editor.state.doc, 'city:history')).toEqual({
      from: heading[0],
      to: editor.state.doc.content.size,
    })
  })
})

describe('section delete controls', () => {
  it('adds a delete control only to keyed top-level H2 sections', () => {
    const editor = createEditor(`
      <h2 data-outline-item-key="city:history">History</h2>
      <p>History text</p>
      <h2>Manual section</h2>
    `)

    const controls = editor.view.dom.querySelectorAll('.section-delete-control')

    expect(controls).toHaveLength(1)
    expect(controls[0].closest('h2')?.dataset.outlineItemKey).toBe('city:history')
    expect(editor.view.dom.querySelector('h2:not([data-outline-item-key]) button')).toBeNull()
  })

  it('renders an accessible native button physically inside its heading', () => {
    const editor = createEditor(`
      <h2 data-outline-item-key="city:history">History</h2>
      <p>History text</p>
    `)

    const control = editor.view.dom.querySelector('.section-delete-control')

    expect(control).toBeInstanceOf(HTMLButtonElement)
    expect(control.type).toBe('button')
    expect(control.contentEditable).toBe('false')
    expect(control.getAttribute('contenteditable')).toBe('false')
    expect(control.getAttribute('aria-label')).toBe('Delete History section')
    expect(control.parentElement?.tagName).toBe('H2')
    expect(control.querySelector('svg')).toMatchObject({
      ariaHidden: 'true',
    })
    expect(control.querySelector('svg')?.getAttribute('viewBox')).toBe('0 0 20 20')
  })

  it('updates the accessible label when the editable heading text changes', () => {
    const editor = createEditor(`
      <h2 data-outline-item-key="city:history">History</h2>
      <p>History text</p>
    `)
    const headingOffset = 0
    const heading = editor.state.doc.child(0)

    expect(
      editor.view.dom.querySelector('.section-delete-control')?.getAttribute('aria-label'),
    ).toBe('Delete History section')

    editor.commands.insertContentAt(
      {
        from: headingOffset + 1,
        to: headingOffset + 1 + heading.content.size,
      },
      'New History',
    )

    const controls = editor.view.dom.querySelectorAll('.section-delete-control')
    expect(controls).toHaveLength(1)
    expect(controls[0].getAttribute('aria-label')).toBe('Delete New History section')
  })

  it('uses an untitled fallback for an empty keyed heading', () => {
    const editor = createEditor(`
      <h2 data-outline-item-key="city:history"></h2>
      <p>History text</p>
    `)

    expect(
      editor.view.dom.querySelector('.section-delete-control')?.getAttribute('aria-label'),
    ).toBe('Delete untitled section')
  })

  it('preserves the editor selection on cancelable pointer activation', () => {
    const editor = createEditor(`
      <h2 data-outline-item-key="city:history">History</h2>
      <p>History text</p>
    `)
    const control = editor.view.dom.querySelector('.section-delete-control')
    const pointerDown = new Event('pointerdown', {
      bubbles: true,
      cancelable: true,
    })

    expect(control.dispatchEvent(pointerDown)).toBe(false)
    expect(pointerDown.defaultPrevented).toBe(true)
  })

  it('keeps the widget out of serialized content and preserves the keyed attribute', () => {
    const editor = createEditor(`
      <h2 data-outline-item-key="city:history">History</h2>
      <p>History text</p>
    `)

    expect(editor.view.dom.querySelector('.section-delete-control')).not.toBeNull()
    expect(editor.getHTML()).not.toContain('section-delete-control')
    expect(editor.getHTML()).not.toContain('<button')
    expect(editor.getHTML()).toContain('<h2 data-outline-item-key="city:history">History</h2>')

    editor.commands.setContent(editor.getHTML())

    expect(getOutlineSectionKeys(editor.state.doc)).toEqual(new Set(['city:history']))
    expect(editor.getHTML()).toContain('<h2 data-outline-item-key="city:history">History</h2>')
  })

  it('deletes the keyed H2 and all nested content before the next H2', () => {
    const editor = createEditor(`
      <p>Lead text</p>
      <h2 data-outline-item-key="city:history">History</h2>
      <p>User-written history</p>
      <h3>Early history</h3>
      <p>Nested details</p>
      <ul><li>Timeline item</li></ul>
      <h2 data-outline-item-key="city:geography">Geography</h2>
      <p>Geography text</p>
    `)

    editor.view.dom
      .querySelector('[aria-label="Delete History section"]')
      .dispatchEvent(new MouseEvent('click', { bubbles: true }))

    expect(editor.getText()).toContain('Lead text')
    expect(editor.getText()).not.toContain('History')
    expect(editor.getText()).not.toContain('User-written history')
    expect(editor.getText()).not.toContain('Early history')
    expect(editor.getText()).not.toContain('Nested details')
    expect(editor.getText()).not.toContain('Timeline item')
    expect(editor.getText()).toContain('Geography')
    expect(editor.getText()).toContain('Geography text')
    expect(getOutlineSectionKeys(editor.state.doc)).toEqual(new Set(['city:geography']))
  })

  it('deletes the later section when duplicate outline keys exist', () => {
    const editor = createEditor(`
      <h2 data-outline-item-key="city:history">History</h2>
      <p>First history body</p>
      <h2 data-outline-item-key="city:history">History</h2>
      <p>Later history body</p>
      <h2 data-outline-item-key="city:geography">Geography</h2>
      <p>Geography body</p>
    `)
    const historyControls = editor.view.dom.querySelectorAll(
      '[aria-label="Delete History section"]',
    )

    expect(historyControls).toHaveLength(2)

    historyControls[1].dispatchEvent(new MouseEvent('click', { bubbles: true }))

    expect(editor.getText()).toContain('First history body')
    expect(editor.getText()).not.toContain('Later history body')
    expect(editor.getText()).toContain('Geography')
    expect(editor.getText()).toContain('Geography body')
    expect(editor.view.dom.querySelectorAll('[aria-label="Delete History section"]')).toHaveLength(
      1,
    )
  })

  it('keeps the editor unfocused after deleting a section', () => {
    const editor = createEditor(`
      <h2 data-outline-item-key="city:history">History</h2>
      <p>History text</p>
      <h2 data-outline-item-key="city:geography">Geography</h2>
    `)
    const control = editor.view.dom.querySelector('.section-delete-control')
    control.focus()

    control.dispatchEvent(new MouseEvent('click', { bubbles: true }))

    expect(document.activeElement).not.toBe(editor.view.dom)
    expect(editor.isFocused).toBe(false)
  })

  it('restores and removes the deleted section and key through undo and redo', () => {
    const editor = createEditor(`
      <p>Lead text</p>
      <h2 data-outline-item-key="city:history">History</h2>
      <p>History text</p>
      <h2 data-outline-item-key="city:geography">Geography</h2>
      <p>Geography text</p>
    `)

    editor.view.dom
      .querySelector('[aria-label="Delete History section"]')
      .dispatchEvent(new MouseEvent('click', { bubbles: true }))

    expect(getOutlineSectionKeys(editor.state.doc)).toEqual(new Set(['city:geography']))

    editor.commands.undo()

    expect(editor.getText()).toContain('History')
    expect(editor.getText()).toContain('History text')
    expect(getOutlineSectionKeys(editor.state.doc)).toEqual(
      new Set(['city:history', 'city:geography']),
    )

    editor.commands.redo()

    expect(editor.getText()).not.toContain('History')
    expect(getOutlineSectionKeys(editor.state.doc)).toEqual(new Set(['city:geography']))
  })
})
