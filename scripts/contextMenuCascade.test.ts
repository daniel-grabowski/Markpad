import assert from 'node:assert/strict';
import { test } from 'node:test';

import { getSubmenuPanelPosition, loadCachedMenuChildren } from '../src/lib/utils/contextMenuCascade.js';

test('places a submenu to the right when it fits', () => {
	assert.deepEqual(
		getSubmenuPanelPosition({ left: 100, right: 280, top: 60 }, 220, 300, 1000, 700),
		{ x: 284, y: 60 },
	);
});

test('flips a submenu left and clamps it vertically at viewport edges', () => {
	assert.deepEqual(
		getSubmenuPanelPosition({ left: 850, right: 990, top: 650 }, 260, 400, 1000, 700),
		{ x: 586, y: 292 },
	);
});

test('clamps oversized panels to the viewport margin', () => {
	assert.deepEqual(
		getSubmenuPanelPosition({ left: 4, right: 104, top: -30 }, 1200, 900, 1000, 700),
		{ x: 8, y: 8 },
	);
});

test('coalesces concurrent child loads for the same menu item', async () => {
	const cache = new WeakMap<object, Promise<string[]>>();
	const item = {};
	let calls = 0;
	const loader = async () => {
		calls += 1;
		return ['child'];
	};

	const [first, second] = await Promise.all([
		loadCachedMenuChildren(cache, item, loader),
		loadCachedMenuChildren(cache, item, loader),
	]);

	assert.equal(calls, 1);
	assert.deepEqual(first, ['child']);
	assert.deepEqual(second, ['child']);
});

test('evicts a rejected child load so it can be retried', async () => {
	const cache = new WeakMap<object, Promise<string[]>>();
	const item = {};
	let calls = 0;
	const loader = async () => {
		calls += 1;
		if (calls === 1) throw new Error('temporary');
		return ['recovered'];
	};

	await assert.rejects(loadCachedMenuChildren(cache, item, loader));
	assert.deepEqual(await loadCachedMenuChildren(cache, item, loader), ['recovered']);
	assert.equal(calls, 2);
});
