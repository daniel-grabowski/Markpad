import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
	getOpenTabAdjacentReorderMove,
	getOpenTabListItems,
	getOpenTabReorderMove,
} from '../src/lib/utils/tabListActions.js';

test('open tab list items expose title, path, dirty state, and active state', () => {
	const items = getOpenTabListItems(
		[
			{ id: 'one', title: 'README.md', path: '/repo/README.md', isDirty: false },
			{ id: 'two', title: 'Draft', path: '', isDirty: true },
			{ id: 'home', title: 'Home', path: 'HOME', isDirty: false },
		],
		'two'
	);

	assert.deepEqual(items, [
		{ id: 'one', title: 'README.md', pathLabel: '/repo/README.md', isDirty: false, isActive: false },
		{ id: 'two', title: 'Draft', pathLabel: '', isDirty: true, isActive: true },
		{ id: 'home', title: 'Home', pathLabel: '', isDirty: false, isActive: false },
	]);
});

test('open tab drag reorder move resolves source and target indexes', () => {
	const tabs = [
		{ id: 'one' },
		{ id: 'two' },
		{ id: 'three' },
	];

	assert.deepEqual(getOpenTabReorderMove(tabs, 'three', 'one'), { fromIndex: 2, toIndex: 0 });
	assert.deepEqual(getOpenTabReorderMove(tabs, 'one', 'three'), { fromIndex: 0, toIndex: 2 });
	assert.equal(getOpenTabReorderMove(tabs, 'two', 'two'), null);
	assert.equal(getOpenTabReorderMove(tabs, 'missing', 'one'), null);
	assert.equal(getOpenTabReorderMove(tabs, 'one', 'missing'), null);
});

test('open tab keyboard reorder move stops at list boundaries', () => {
	const tabs = [
		{ id: 'one' },
		{ id: 'two' },
		{ id: 'three' },
	];

	assert.deepEqual(getOpenTabAdjacentReorderMove(tabs, 'two', 'up'), { fromIndex: 1, toIndex: 0 });
	assert.deepEqual(getOpenTabAdjacentReorderMove(tabs, 'two', 'down'), { fromIndex: 1, toIndex: 2 });
	assert.equal(getOpenTabAdjacentReorderMove(tabs, 'one', 'up'), null);
	assert.equal(getOpenTabAdjacentReorderMove(tabs, 'three', 'down'), null);
	assert.equal(getOpenTabAdjacentReorderMove(tabs, 'missing', 'down'), null);
});
