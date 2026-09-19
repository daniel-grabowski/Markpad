import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
	getDirectoryMenuEntries,
	getDirectoryFileOpenMode,
} from '../src/lib/utils/directoryFileMenu.js';

test('filters sibling entries to supported files and excludes the source path', () => {
	const entries = [
		{ name: 'Archive', path: 'C:\\Notes\\Archive', isDirectory: true },
		{ name: 'Current.md', path: 'C:\\Notes\\Current.md', isDirectory: false },
		{ name: 'Guide.MARKDOWN', path: 'C:\\Notes\\Guide.MARKDOWN', isDirectory: false },
		{ name: 'plain.txt', path: 'C:\\Notes\\plain.txt', isDirectory: false },
		{ name: 'image.png', path: 'C:\\Notes\\image.png', isDirectory: false },
	];

	assert.deepEqual(
		getDirectoryMenuEntries(entries, 'c:/notes/current.md', 'windows'),
		[
			{ name: 'Archive', path: 'C:\\Notes\\Archive', isDirectory: true },
			{ name: 'Guide.MARKDOWN', path: 'C:\\Notes\\Guide.MARKDOWN', isDirectory: false },
			{ name: 'plain.txt', path: 'C:\\Notes\\plain.txt', isDirectory: false },
		],
	);
});

test('sorts directories before files and sorts each group naturally', () => {
	const entries = [
		{ name: 'note10.md', path: '/notes/note10.md', isDirectory: false },
		{ name: 'Folder10', path: '/notes/Folder10', isDirectory: true },
		{ name: 'Note2.md', path: '/notes/Note2.md', isDirectory: false },
		{ name: 'folder2', path: '/notes/folder2', isDirectory: true },
		{ name: 'note1.md', path: '/notes/note1.md', isDirectory: false },
	];

	assert.deepEqual(
		getDirectoryMenuEntries(entries, '/notes/current.md', 'linux').map((entry) => entry.name),
		['folder2', 'Folder10', 'note1.md', 'Note2.md', 'note10.md'],
	);
});

test('maps the Shift modifier to replacing the source tab', () => {
	assert.equal(getDirectoryFileOpenMode({ shiftKey: false }), 'new-tab');
	assert.equal(getDirectoryFileOpenMode({ shiftKey: true }), 'replace-tab');
});
