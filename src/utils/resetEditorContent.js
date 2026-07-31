import { EditorState } from '@tiptap/pm/state'

export function resetEditorContent(editor) {
  if (!editor?.view) {
    return false
  }

  const doc = editor.schema.topNodeType.createAndFill()
  const state = EditorState.create({
    schema: editor.schema,
    plugins: editor.state.plugins,
    doc,
  })

  editor.view.updateState(state)

  return true
}
