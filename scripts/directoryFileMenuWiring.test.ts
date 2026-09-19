import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { getSupportedLanguages, translations, type LanguageCode } from '../src/lib/utils/i18n.js';

const contextMenu = readFileSync('src/lib/components/ContextMenu.svelte', 'utf8');
const tab = readFileSync('src/lib/components/Tab.svelte', 'utf8');
const markdownViewer = readFileSync('src/lib/MarkdownViewer.svelte', 'utf8');
const rustBackend = readFileSync('src-tauri/src/lib.rs', 'utf8');

function getDirectTranslation(lang: LanguageCode, key: string): string | undefined {
	let current: unknown = translations[lang];
	for (const part of key.split('.')) {
		if (!current || typeof current !== 'object' || !(part in current)) return undefined;
		current = (current as Record<string, unknown>)[part];
	}
	return typeof current === 'string' ? current : undefined;
}

test('context menu exposes nested children and modifier-aware activation', () => {
	assert.match(contextMenu, /children\?: ContextMenuItem\[\]/);
	assert.match(contextMenu, /loadChildren\?: \(\) => Promise<ContextMenuItem\[\]>/);
	assert.match(contextMenu, /onClick\?: \(event: MouseEvent \| KeyboardEvent\) => void/);
	assert.match(contextMenu, /aria-haspopup=.*menu/);
	assert.match(contextMenu, /ArrowRight/);
	assert.match(contextMenu, /ArrowLeft/);
	assert.match(contextMenu, /event\.key === 'Tab'/);
	assert.match(contextMenu, /getSubmenuPanelPosition/);
});

test('tab context menu lazily loads directories and emits the selected source tab and mode', () => {
	assert.match(tab, /invoke<DirectoryMenuEntry\[\]>\('list_directory_entries'/);
	assert.match(tab, /getDirectoryMenuEntries/);
	assert.match(tab, /loadChildren/);
	assert.match(tab, /isDirectory/);
	assert.match(tab, /getDirectoryFileOpenMode/);
	assert.match(tab, /sourceTabId/);
	assert.match(tab, /menu-tab-open-directory-file/);
});

test('viewer handles directory file requests through the unsaved-change guard', () => {
	assert.match(markdownViewer, /listen\('menu-tab-open-directory-file'/);
	assert.match(markdownViewer, /canCloseTab\(request\.sourceTabId\)/);
	assert.match(markdownViewer, /request\.mode === 'replace-tab'/);
});

test('backend registers the bounded directory-entry command', () => {
	assert.match(rustBackend, /fn list_directory_entries\(/);
	assert.match(rustBackend, /list_directory_entries,/);
	assert.match(rustBackend, /requested\.starts_with\(&root\)/);
});

test('directory submenu states are translated for every supported language', () => {
	const keys = [
		'menu.filesInDirectory',
		'menu.loadingDirectoryFiles',
		'menu.noDirectoryFiles',
		'menu.directoryFilesError',
	];
	const missing = getSupportedLanguages().flatMap(({ code }) =>
		keys.filter((key) => getDirectTranslation(code, key) === undefined).map((key) => `${code}:${key}`),
	);

	assert.deepEqual(missing, []);
});
