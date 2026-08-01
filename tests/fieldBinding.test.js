// @vitest-environment jsdom

import { Editor, Extension } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { afterEach, describe, expect, it } from 'vitest'
import {
  FIELD_BINDING_SYNC_META,
  FieldBinding,
} from '../src/extensions/fieldBinding.js'
import { ScaffoldBindingMark } from '../src/extensions/scaffoldBindingMark.js'
import { findBoundFields, findScaffoldFields } from '../src/utils/scaffoldFields.js'

const editors = []
const syncCountKey = new PluginKey('fieldBindingSyncCount')
const SyncCounter = Extension.create({
  name: 'fieldBindingSyncCounter',
  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: syncCountKey,
        state: {
          init: () => 0,
          apply: (tr, count) => count + (tr.getMeta(FIELD_BINDING_SYNC_META) ? 1 : 0),
        },
      }),
    ]
  },
})

function marked(key, placeholder, text = placeholder) {
  return `<span data-scaffold-binding="${key}" data-scaffold-placeholder="${placeholder}">${text}</span>`
}

function createEditor(content, options = {}) {
  const editor = new Editor({
    extensions: [StarterKit, ScaffoldBindingMark, FieldBinding, SyncCounter],
    content,
    ...options,
  })
  editors.push(editor)
  return editor
}

function texts(editor, key) {
  return findBoundFields(editor.state.doc)
    .filter((field) => field.key === key)
    .map((field) => field.text)
}

function replaceWholeField(editor, field, value, time = Date.now()) {
  editor.commands.setTextSelection({ from: field.from, to: field.to })
  editor.view.dispatch(editor.state.tr.insertText(value, field.from, field.to).setTime(time))
}

function commit(editor) {
  expect(editor.commands.commitFieldBinding()).toBe(true)
}

afterEach(() => {
  editors.splice(0).forEach((editor) => editor.destroy())
})

describe('bound scaffold field discovery', () => {
  it('returns contiguous marked ranges and exposes keys on unfilled prompts', () => {
    const editor = createEditor(
      `<p>${marked('country:subject-name', '[Country name]')} and ${marked('country:subject-name', '[Country name]', 'India')}</p>`,
    )

    expect(findBoundFields(editor.state.doc).map(({ key, placeholder, text }) => ({
      key,
      placeholder,
      text,
    }))).toEqual([
      {
        key: 'country:subject-name',
        placeholder: '[Country name]',
        text: '[Country name]',
      },
      { key: 'country:subject-name', placeholder: '[Country name]', text: 'India' },
    ])
    expect(findScaffoldFields(editor.state.doc)[0].bindingKey).toBe('country:subject-name')
  })
})

describe('ScaffoldBindingMark boundaries', () => {
  it('does not extend an answered binding when typing immediately after it', () => {
    const answer = marked('country:subject-name', '[Country name]', 'India')
    const editor = createEditor(`<p>${answer}</p>`)
    const field = findBoundFields(editor.state.doc)[0]

    editor.commands.setTextSelection(field.to)
    editor.commands.insertContent(' is in Asia')

    expect(editor.getText()).toBe('India is in Asia')
    expect(texts(editor, 'country:subject-name')).toEqual(['India'])
  })

  it('does not carry an answered binding into a paragraph split at its end', () => {
    const answer = marked('country:subject-name', '[Country name]', 'India')
    const editor = createEditor(`<p>${answer}</p>`)
    const field = findBoundFields(editor.state.doc)[0]

    editor.commands.setTextSelection(field.to)
    expect(editor.commands.splitBlock()).toBe(true)
    editor.commands.insertContent('Next paragraph')

    expect(editor.getText({ blockSeparator: '\n' })).toBe('India\nNext paragraph')
    expect(texts(editor, 'country:subject-name')).toEqual(['India'])
  })
})

describe('FieldBinding', () => {
  it('synchronizes one Country name across all existing linked sections', () => {
    const prompt = marked('country:subject-name', '[Country name]')
    const editor = createEditor(`<p>${prompt}</p><p>${prompt}</p><p>${prompt}</p><p>${prompt}</p>`)

    replaceWholeField(editor, findBoundFields(editor.state.doc)[0], 'India')
    commit(editor)

    expect(texts(editor, 'country:subject-name')).toEqual(['India', 'India', 'India', 'India'])
  })

  it('normalizes surrounding whitespace in the source and every linked copy', () => {
    const prompt = marked('country:subject-name', '[Country name]')
    const editor = createEditor(`<p>${prompt}</p><p>${prompt}</p>`)

    replaceWholeField(editor, findBoundFields(editor.state.doc)[0], ' India ')
    commit(editor)

    expect(texts(editor, 'country:subject-name')).toEqual(['India', 'India'])
  })

  it('clears active state so a second semantic fact can synchronize', () => {
    const name = marked('software:subject-name', '[Software name]')
    const year = marked('software:release-year', '[year]')
    const editor = createEditor(`<p>${name} ${year}</p><p>${name} ${year}</p>`)

    replaceWholeField(editor, findBoundFields(editor.state.doc)[0], 'Firefox')
    commit(editor)
    replaceWholeField(editor, findBoundFields(editor.state.doc).find((field) => field.key.endsWith('release-year')), '2004')
    commit(editor)

    expect(texts(editor, 'software:subject-name')).toEqual(['Firefox', 'Firefox'])
    expect(texts(editor, 'software:release-year')).toEqual(['2004', '2004'])
  })

  it('commits the first fact when the editor selects and fills a second fact', () => {
    const name = marked('software:subject-name', '[Software name]')
    const year = marked('software:release-year', '[year]')
    const editor = createEditor(`<p>${name} ${year}</p><p>${name} ${year}</p>`)

    replaceWholeField(editor, findBoundFields(editor.state.doc)[0], 'Firefox')
    const firstYear = findBoundFields(editor.state.doc).find((field) =>
      field.key.endsWith('release-year'),
    )
    editor.commands.setTextSelection({ from: firstYear.from, to: firstYear.to })
    editor.commands.insertContent('2004')
    editor.commands.setTextSelection(
      findBoundFields(editor.state.doc).find((field) => field.key.endsWith('subject-name')).from,
    )

    expect(texts(editor, 'software:subject-name')).toEqual(['Firefox', 'Firefox'])
    expect(texts(editor, 'software:release-year')).toEqual(['2004', '2004'])
  })

  it('corrects every copy when an answered linked value is wholly replaced', () => {
    const answer = marked('country:subject-name', '[Country name]', 'India')
    const editor = createEditor(`<p>${answer}</p><p>${answer}</p>`)

    replaceWholeField(editor, findBoundFields(editor.state.doc)[1], 'Bhutan')
    commit(editor)

    expect(texts(editor, 'country:subject-name')).toEqual(['Bhutan', 'Bhutan'])
    expect(editor.commands.undo()).toBe(true)
    expect(texts(editor, 'country:subject-name')).toEqual(['India', 'India'])
    expect(editor.commands.redo()).toBe(true)
    expect(texts(editor, 'country:subject-name')).toEqual(['Bhutan', 'Bhutan'])
  })

  it('groups a paste-style whole-field replacement into one Undo and Redo', () => {
    const prompt = marked('country:subject-name', '[Country name]')
    const editor = createEditor(`<p>${prompt}</p><p>${prompt}</p>`)
    const field = findBoundFields(editor.state.doc)[0]
    editor.commands.setTextSelection({ from: field.from, to: field.to })

    editor.commands.insertContent('India')
    commit(editor)

    expect(texts(editor, 'country:subject-name')).toEqual(['India', 'India'])
    expect(editor.commands.undo()).toBe(true)
    expect(texts(editor, 'country:subject-name')).toEqual(['[Country name]', '[Country name]'])
    expect(editor.commands.redo()).toBe(true)
    expect(texts(editor, 'country:subject-name')).toEqual(['India', 'India'])
  })

  it('hydrates a linked prompt inserted after commitment from the document answer', () => {
    const prompt = marked('country:subject-name', '[Country name]')
    const editor = createEditor(`<p>${prompt}</p><p>${prompt}</p>`)
    replaceWholeField(editor, findBoundFields(editor.state.doc)[0], 'India')
    commit(editor)

    editor
      .chain()
      .insertContentAt(editor.state.doc.content.size, `<p>${prompt}</p>`)
      .command(({ tr }) => {
        tr.setMeta('outlineInsertion', true)
        return true
      })
      .run()

    expect(texts(editor, 'country:subject-name')).toEqual(['India', 'India', 'India'])
  })

  it('groups deliberately slow typing and synchronization into one Undo and Redo', () => {
    const prompt = marked('country:subject-name', '[Country name]')
    const editor = createEditor(`<p>Before</p><p>${prompt}</p><p>${prompt}</p>`)
    const field = findBoundFields(editor.state.doc)[0]
    replaceWholeField(editor, field, 'I', 1_000)
    editor.view.dispatch(editor.state.tr.insertText('n').setTime(3_000))
    editor.view.dispatch(editor.state.tr.insertText('d').setTime(5_000))
    editor.view.dispatch(editor.state.tr.insertText('i').setTime(7_000))
    editor.view.dispatch(editor.state.tr.insertText('a').setTime(9_000))
    commit(editor)

    expect(texts(editor, 'country:subject-name')).toEqual(['India', 'India'])
    expect(editor.commands.undo()).toBe(true)
    expect(texts(editor, 'country:subject-name')).toEqual(['[Country name]', '[Country name]'])
    expect(editor.commands.redo()).toBe(true)
    expect(texts(editor, 'country:subject-name')).toEqual(['India', 'India'])
  })

  it('keeps typing at the active answer end in the same linked value', () => {
    const prompt = marked('country:subject-name', '[Country name]')
    const editor = createEditor(`<p>${prompt}</p><p>${prompt}</p>`)
    replaceWholeField(editor, findBoundFields(editor.state.doc)[0], 'India')

    editor.commands.setTextSelection(findBoundFields(editor.state.doc)[0].to)
    editor.commands.insertContent('X')
    commit(editor)

    expect(texts(editor, 'country:subject-name')).toEqual(['IndiaX', 'IndiaX'])
  })

  it('commits on selection-away as one Undo and Redo event', () => {
    const prompt = marked('country:subject-name', '[Country name]')
    const editor = createEditor(`<p>${prompt}</p><p>${prompt}</p>`)
    replaceWholeField(editor, findBoundFields(editor.state.doc)[0], 'India')

    editor.commands.setTextSelection(findBoundFields(editor.state.doc)[1].from)

    expect(texts(editor, 'country:subject-name')).toEqual(['India', 'India'])
    expect(editor.commands.undo()).toBe(true)
    expect(texts(editor, 'country:subject-name')).toEqual(['[Country name]', '[Country name]'])
    expect(editor.commands.redo()).toBe(true)
    expect(texts(editor, 'country:subject-name')).toEqual(['India', 'India'])
  })

  it('does not bind ambiguous years, near-match country variants, or partial edits', () => {
    const prompt = marked('country:subject-name', '[Country name]')
    const editor = createEditor(`<p>${prompt} [year] [country/region]</p><p>${prompt} [year]</p>`)
    const first = findBoundFields(editor.state.doc)[0]
    editor.commands.setTextSelection({ from: first.from + 1, to: first.to - 1 })
    editor.commands.insertContent('Partial')
    editor.commands.setTextSelection(editor.state.doc.content.size)

    expect(texts(editor, 'country:subject-name')[1]).toBe('[Country name]')
    expect(editor.getText()).toContain('[year] [country/region]')
  })

  it('commits explicitly without moving the caret and appends one tagged sync transaction', () => {
    const prompt = marked('country:subject-name', '[Country name]')
    const editor = createEditor(`<p>${prompt}</p><p>${prompt}</p>`)
    replaceWholeField(editor, findBoundFields(editor.state.doc)[0], 'India')
    const caret = editor.state.selection.from

    commit(editor)

    expect(editor.state.selection.from).toBe(caret)
    expect(texts(editor, 'country:subject-name')).toEqual(['India', 'India'])
    expect(syncCountKey.getState(editor.state)).toBe(1)
  })

  it('does not hydrate from an answer that was deleted from the document', () => {
    const prompt = marked('country:subject-name', '[Country name]')
    const editor = createEditor(`<p>${prompt}</p><p>${prompt}</p>`)
    replaceWholeField(editor, findBoundFields(editor.state.doc)[0], 'India')
    commit(editor)

    editor.commands.selectAll()
    editor.commands.deleteSelection()
    editor
      .chain()
      .insertContent(prompt)
      .command(({ tr }) => {
        tr.setMeta('outlineInsertion', true)
        return true
      })
      .run()

    expect(texts(editor, 'country:subject-name')).toEqual(['[Country name]'])
  })

  it('hydrates after deletion is undone because the answer is back in the document', () => {
    const prompt = marked('country:subject-name', '[Country name]')
    const editor = createEditor(`<p>${prompt}</p><p>${prompt}</p>`)
    replaceWholeField(editor, findBoundFields(editor.state.doc)[0], 'India')
    commit(editor)

    editor.commands.selectAll()
    editor.commands.deleteSelection()
    expect(findBoundFields(editor.state.doc)).toEqual([])
    expect(editor.commands.undo()).toBe(true)
    expect(texts(editor, 'country:subject-name')).toEqual(['India', 'India'])

    editor
      .chain()
      .insertContentAt(editor.state.doc.content.size, `<p>${prompt}</p>`)
      .command(({ tr }) => {
        tr.setMeta('outlineInsertion', true)
        return true
      })
      .run()

    expect(texts(editor, 'country:subject-name')).toEqual(['India', 'India', 'India'])
  })

  it('leaves late prompts untouched when existing marked answers conflict', () => {
    const india = marked('country:subject-name', '[Country name]', 'India')
    const bhutan = marked('country:subject-name', '[Country name]', 'Bhutan')
    const prompt = marked('country:subject-name', '[Country name]')
    const editor = createEditor(`<p>${india}</p><p>${bhutan}</p>`)

    editor
      .chain()
      .insertContentAt(editor.state.doc.content.size, `<p>${prompt}</p>`)
      .command(({ tr }) => {
        tr.setMeta('outlineInsertion', true)
        return true
      })
      .run()

    expect(texts(editor, 'country:subject-name')).toEqual(['India', 'Bhutan', '[Country name]'])
  })
})
