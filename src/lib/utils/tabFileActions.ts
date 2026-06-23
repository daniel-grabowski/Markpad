export type TabFileActionId = 'copy-path' | 'open-location';
export type TabExportActionId = 'export-html' | 'export-pdf';

export type TabFileAction = {
	id: TabFileActionId;
	labelKey: string;
	disabled: boolean;
};

export type TabExportAction = {
	id: TabExportActionId;
	labelKey: string;
	disabled: boolean;
};

export type ExportableTab = {
	path: string;
	content: string;
	rawContent: string;
};

export function hasRealFilePath(path: string): boolean {
	return path !== '' && path !== 'HOME';
}

export function canExportTab(tab: ExportableTab): boolean {
	return hasRealFilePath(tab.path) || tab.content !== '' || tab.rawContent !== '';
}

export function getTabFileActions(path: string): TabFileAction[] {
	const disabled = !hasRealFilePath(path);

	return [
		{ id: 'copy-path', labelKey: 'menu.copyFullPath', disabled },
		{ id: 'open-location', labelKey: 'menu.openFileLocation', disabled },
	];
}

export function getTabExportActions(tab: ExportableTab): TabExportAction[] {
	const disabled = !canExportTab(tab);

	return [
		{ id: 'export-html', labelKey: 'menu.exportHtml', disabled },
		{ id: 'export-pdf', labelKey: 'menu.exportPdf', disabled },
	];
}
