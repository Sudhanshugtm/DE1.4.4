// @vitest-environment jsdom

import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import { afterEach, describe, expect, it } from 'vitest'
import SectionHeading from '../src/extensions/sectionHeading.js'
import { findSectionRange, getOutlineSectionKeys } from '../src/extensions/sectionDeleteControls.js'

const editors = []

function createEditor(content) {
  const editor = new Editor({
    extensions: [StarterKit.configure({ heading: false }), SectionHeading],
    content,
  })
  editors.push(editor)

  return editor
}

afterEach(() => {
  editors.splice(0).forEach((editor) => editor.destroy())
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
