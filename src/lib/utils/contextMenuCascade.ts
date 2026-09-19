export type MenuTriggerRect = {
	left: number;
	right: number;
	top: number;
};

export function loadCachedMenuChildren<TItem extends object, TResult>(
	cache: WeakMap<TItem, Promise<TResult>>,
	item: TItem,
	loader: () => Promise<TResult>,
): Promise<TResult> {
	const cached = cache.get(item);
	if (cached) return cached;
	const pending = loader().catch((error) => {
		cache.delete(item);
		throw error;
	});
	cache.set(item, pending);
	return pending;
}

export function getSubmenuPanelPosition(
	trigger: MenuTriggerRect,
	panelWidth: number,
	panelHeight: number,
	viewportWidth: number,
	viewportHeight: number,
	margin = 8,
	gap = 4,
): { x: number; y: number } {
	const maxX = Math.max(margin, viewportWidth - panelWidth - margin);
	const maxY = Math.max(margin, viewportHeight - panelHeight - margin);
	const rightX = trigger.right + gap;
	const leftX = trigger.left - panelWidth - gap;
	const preferredX = rightX + panelWidth <= viewportWidth - margin ? rightX : leftX;

	return {
		x: Math.min(Math.max(margin, preferredX), maxX),
		y: Math.min(Math.max(margin, trigger.top), maxY),
	};
}
