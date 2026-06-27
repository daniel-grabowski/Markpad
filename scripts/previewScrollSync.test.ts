import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const markdownViewer = readFileSync('src/lib/MarkdownViewer.svelte', 'utf8');

test('preview scroll sync uses a resilient source-position anchor for editor sync', () => {
	assert.match(markdownViewer, /type PreviewScrollAnchor/);
	assert.match(markdownViewer, /function getPreviewScrollAnchor\(target: HTMLElement\)/);
	assert.match(markdownViewer, /const anchor = getPreviewScrollAnchor\(target\);[\s\S]*editorPane\.syncScrollToLine\(anchor\.line, anchor\.ratio\)/);
	assert.match(markdownViewer, /const anchor = getPreviewScrollAnchor\(target\);[\s\S]*tabManager\.updateTabAnchorLine\(tabManager\.activeTabId, anchor\.line\)/);
	assert.doesNotMatch(markdownViewer, /if \(!sourcepos\) break/);
});
