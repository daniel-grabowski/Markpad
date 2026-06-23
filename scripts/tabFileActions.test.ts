import assert from 'node:assert/strict';
import { test } from 'node:test';

import { getTabExportActions, getTabFileActions, hasRealFilePath } from '../src/lib/utils/tabFileActions.js';

test('tab file actions are enabled for saved files', () => {
	const actions = getTabFileActions('/tmp/notes/example.md');

	assert.equal(hasRealFilePath('/tmp/notes/example.md'), true);
	assert.deepEqual(
		actions.map((action) => [action.id, action.labelKey, action.disabled]),
		[
			['copy-path', 'menu.copyFullPath', false],
			['open-location', 'menu.openFileLocation', false],
		]
	);
});

test('tab file actions are disabled for tabs without a real file path', () => {
	for (const path of ['', 'HOME']) {
		assert.equal(hasRealFilePath(path), false);
		assert.deepEqual(
			getTabFileActions(path).map((action) => [action.id, action.disabled]),
			[
				['copy-path', true],
				['open-location', true],
			]
		);
	}
});

test('tab export actions are enabled when a tab has preview content or a file path', () => {
	assert.deepEqual(
		getTabExportActions({ path: '', content: '<p>Draft</p>', rawContent: 'Draft' }).map((action) => [action.id, action.labelKey, action.disabled]),
		[
			['export-html', 'menu.exportHtml', false],
			['export-pdf', 'menu.exportPdf', false],
		]
	);
	assert.deepEqual(
		getTabExportActions({ path: '/tmp/notes/example.md', content: '', rawContent: '' }).map((action) => [action.id, action.disabled]),
		[
			['export-html', false],
			['export-pdf', false],
		]
	);
});

test('tab export actions are disabled for empty untitled and home tabs', () => {
	for (const tab of [
		{ path: '', content: '', rawContent: '' },
		{ path: 'HOME', content: '', rawContent: '' },
	]) {
		assert.deepEqual(
			getTabExportActions(tab).map((action) => [action.id, action.disabled]),
			[
				['export-html', true],
				['export-pdf', true],
			]
		);
	}
});
