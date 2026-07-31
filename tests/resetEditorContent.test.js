// @vitest-environment jsdom

import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import { redoDepth, undoDepth } from '@tiptap/pm/history';
import { afterEach, describe, expect, it } from 'vitest';
import { resetEditorContent } from '../src/utils/resetEditorContent.js';

const editors = [];

afterEach(() => {
	editors.splice(0).forEach((editor) => editor.destroy());
});

describe('resetEditorContent', () => {
	it('replaces content and history with a fresh empty editor state', () => {
		const editor = new Editor({
			extensions: [ StarterKit ],
			content: '<p></p>',
		});
		editors.push(editor);

		editor.commands.insertContent('Draft text');
		expect(undoDepth(editor.state)).toBeGreaterThan(0);

		expect(resetEditorContent(editor)).toBe(true);
		expect(editor.getHTML()).toBe('<p></p>');
		expect(undoDepth(editor.state)).toBe(0);
		expect(redoDepth(editor.state)).toBe(0);
		expect(editor.commands.undo()).toBe(false);
	});
});
