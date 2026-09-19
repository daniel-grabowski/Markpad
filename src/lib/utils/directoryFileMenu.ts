import { hasMarkdownLinkExtension, normalizeComparableMarkdownPath } from './markdownLinks.js';

export type DirectoryMenuEntry = {
	name: string;
	path: string;
	isDirectory: boolean;
};

export type DirectoryFileOpenMode = 'new-tab' | 'replace-tab';

export function getDirectoryMenuEntries(
	entries: DirectoryMenuEntry[],
	sourcePath: string,
	osType: string,
): DirectoryMenuEntry[] {
	const normalizedSource = normalizeComparableMarkdownPath(sourcePath, osType);
	const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });

	return entries
		.filter((entry) => entry.isDirectory || hasMarkdownLinkExtension(entry.path))
		.filter((entry) => normalizeComparableMarkdownPath(entry.path, osType) !== normalizedSource)
		.sort((left, right) => Number(right.isDirectory) - Number(left.isDirectory) || collator.compare(left.name, right.name));
}

export function getDirectoryFileOpenMode(event: { shiftKey: boolean }): DirectoryFileOpenMode {
	return event.shiftKey ? 'replace-tab' : 'new-tab';
}
