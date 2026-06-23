export type OpenTabListSource = {
	id: string;
	title: string;
	path: string;
	isDirty: boolean;
};

export type OpenTabListItem = {
	id: string;
	title: string;
	pathLabel: string;
	isDirty: boolean;
	isActive: boolean;
};

export type OpenTabReorderMove = {
	fromIndex: number;
	toIndex: number;
};

export function getOpenTabListItems(tabs: OpenTabListSource[], activeTabId: string | null): OpenTabListItem[] {
	return tabs.map((tab) => ({
		id: tab.id,
		title: tab.title,
		pathLabel: tab.path === '' || tab.path === 'HOME' ? '' : tab.path,
		isDirty: tab.isDirty,
		isActive: tab.id === activeTabId,
	}));
}

export function getOpenTabReorderMove(tabs: Pick<OpenTabListSource, 'id'>[], draggedId: string, targetId: string): OpenTabReorderMove | null {
	const fromIndex = tabs.findIndex((tab) => tab.id === draggedId);
	const toIndex = tabs.findIndex((tab) => tab.id === targetId);

	if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) {
		return null;
	}

	return { fromIndex, toIndex };
}

export function getOpenTabAdjacentReorderMove(tabs: Pick<OpenTabListSource, 'id'>[], tabId: string, direction: 'up' | 'down'): OpenTabReorderMove | null {
	const fromIndex = tabs.findIndex((tab) => tab.id === tabId);
	if (fromIndex === -1) return null;

	const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1;
	if (toIndex < 0 || toIndex >= tabs.length) return null;

	return { fromIndex, toIndex };
}
