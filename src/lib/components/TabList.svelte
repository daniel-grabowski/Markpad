<script lang="ts">
	import { type Tab as TabData, tabManager } from '../stores/tabs.svelte.js';
	import Tab from './Tab.svelte';
	import ContextMenu, { type ContextMenuItem } from './ContextMenu.svelte';
	import { t } from '../utils/i18n.js';
	import { settings } from '../stores/settings.svelte.js';
	import {
		getOpenTabAdjacentReorderMove,
		getOpenTabListItems,
		getOpenTabReorderMove,
	} from '../utils/tabListActions.js';
	import { emit } from '@tauri-apps/api/event';

	import { flip } from 'svelte/animate';
	import { tick } from 'svelte';

	let {
		onnewTab,
		ondetach,
		showHome = false,
		ontabclick,
		oncloseTab,
	} = $props<{
		onnewTab: () => void;
		ondetach?: (tabId: string) => void;
		showHome?: boolean;
		ontabclick?: () => void;
		oncloseTab?: (id: string) => void;
	}>();

	let scrollContainer = $state<HTMLElement | null>(null);
	let showLeftArrow = $state(false);
	let showRightArrow = $state(false);
	let openTabsMenuOpen = $state(false);
	let openTabsMenuLeft = $state(0);
	let openTabsMenuTop = $state(0);
	let openTabItems = $derived(getOpenTabListItems(tabManager.tabs, tabManager.activeTabId));
	let openTabsDraggingId = $state<string | null>(null);
	let openTabsDragOverId = $state<string | null>(null);
	let openTabsJustDragged = false;
	let openTabsDragState = $state<{
		tabId: string;
		startY: number;
		isDragging: boolean;
	} | null>(null);

	// Drag state
	let draggingId = $state<string | null>(null);
	let justDragged = false;
	let dragState = $state<{
		startX: number;
		currentX: number;
		currentY: number;
		initialRect: DOMRect;
		tab: TabData;
		isDragging: boolean;
	} | null>(null);

	let tabListContextMenu = $state<{
		show: boolean;
		x: number;
		y: number;
		items: ContextMenuItem[];
	}>({
		show: false,
		x: 0,
		y: 0,
		items: [],
	});

	function handleMouseDown(e: MouseEvent, tab: TabData, element: HTMLElement) {
		if (e.button !== 0) return;
		e.stopPropagation();
		e.preventDefault();

		const rect = element.getBoundingClientRect();
		dragState = {
			startX: e.clientX,
			currentX: e.clientX,
			currentY: e.clientY,
			initialRect: rect,
			tab: tab,
			isDragging: false,
		};

		window.addEventListener('mousemove', handleWindowMouseMove);
		window.addEventListener('mouseup', handleWindowMouseUp);
	}

	function handleWindowMouseMove(e: MouseEvent) {
		if (!dragState || !scrollContainer) return;

		if (!dragState.isDragging) {
			if (Math.abs(e.clientX - dragState.startX) > 5) {
				dragState.isDragging = true;
				draggingId = dragState.tab.id;
			} else {
				return;
			}
		}

		dragState.currentX = e.clientX;
		dragState.currentY = e.clientY;

		const containerRect = scrollContainer.getBoundingClientRect();
		const scrollZone = 50;
		if (e.clientX < containerRect.left + scrollZone) {
			scrollContainer.scrollLeft -= 10;
		} else if (e.clientX > containerRect.right - scrollZone) {
			scrollContainer.scrollLeft += 10;
		}

		const children = Array.from(scrollContainer.children) as HTMLElement[];
		let closestIndex = -1;
		let minDist = Infinity;

		children.forEach((child, index) => {
			if (!child.classList.contains('tab-item-wrapper')) return;

			const rect = child.getBoundingClientRect();
			const center = rect.left + rect.width / 2;
			const dist = Math.abs(e.clientX - center);

			if (dist < minDist) {
				minDist = dist;
				closestIndex = index;
			}
		});

		if (closestIndex !== -1) {
			const currentIndex = tabManager.tabs.findIndex((t) => t.id === draggingId);
			if (currentIndex !== -1 && currentIndex !== closestIndex) {
				tabManager.reorderTabs(currentIndex, closestIndex);
			}
		}
	}

	function handleWindowMouseUp() {
		if (dragState?.isDragging) {
			justDragged = true;
			setTimeout(() => {
				justDragged = false;
			}, 50);
		}

		draggingId = null;
		dragState = null;
		window.removeEventListener('mousemove', handleWindowMouseMove);
		window.removeEventListener('mouseup', handleWindowMouseUp);
	}

	$effect(() => {
		const activeId = tabManager.activeTabId;
		if (activeId && scrollContainer && !draggingId) {
			const index = tabManager.tabs.findIndex((t) => t.id === activeId);
			if (index !== -1) {
				tick().then(() => {
					setTimeout(() => {
						if (!scrollContainer) return;

						if (index === tabManager.tabs.length - 1) {
							scrollContainer.scrollTo({ left: 99999, behavior: 'smooth' });
							return;
						}

						const tabElements = scrollContainer.children;
						if (tabElements[index]) {
							const el = tabElements[index] as HTMLElement;
							el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
						}
					}, 150);
				});
			}
		}
	});

	function handleContainerContextMenu(e: MouseEvent) {
		if (e.target !== e.currentTarget && !(e.target as HTMLElement).classList.contains('tab-list-spacer')) return;
		e.preventDefault();

		const currentLang = settings.language;
		tabListContextMenu = {
			show: true,
			x: e.clientX,
			y: e.clientY,
			items: [
				{ label: t('menu.newFile', currentLang), shortcut: 'Ctrl+T', onClick: () => emit('menu-tab-new') },
				{ label: t('menu.undoCloseTab', currentLang), shortcut: 'Ctrl+Shift+T', onClick: () => emit('menu-tab-undo') },
				{ separator: true },
				{ label: `${settings.fitTabsToWidth ? '✓ ' : ''}${t('menu.fitTabsToWidth', currentLang)}`, onClick: () => settings.toggleFitTabsToWidth() },
			]
		};
	}

	function selectTab(tabId: string) {
		if (openTabsJustDragged) return;

		tabManager.setActive(tabId);
		closeOpenTabsMenu();
		ontabclick?.();
	}

	function clearOpenTabsDragState() {
		openTabsDraggingId = null;
		openTabsDragOverId = null;
		openTabsDragState = null;
	}

	function closeOpenTabsMenu() {
		openTabsMenuOpen = false;
		clearOpenTabsDragState();
	}

	function markOpenTabsDragged() {
		openTabsJustDragged = true;
		setTimeout(() => {
			openTabsJustDragged = false;
		}, 50);
	}

	function focusOpenTabItem(tabId: string) {
		tick().then(() => {
			const item = Array.from(document.querySelectorAll<HTMLButtonElement>('.open-tab-item'))
				.find((button) => button.dataset.openTabId === tabId);
			item?.focus();
		});
	}

	function reorderOpenTab(draggedId: string, targetId: string) {
		const move = getOpenTabReorderMove(tabManager.tabs, draggedId, targetId);
		if (!move) return false;

		tabManager.reorderTabs(move.fromIndex, move.toIndex);
		focusOpenTabItem(draggedId);
		return true;
	}

	function handleOpenTabMouseDown(e: MouseEvent, tabId: string) {
		if (e.button !== 0) return;

		e.stopPropagation();
		e.preventDefault();

		openTabsDragState = {
			tabId,
			startY: e.clientY,
			isDragging: false,
		};

		window.addEventListener('mousemove', handleOpenTabWindowMouseMove);
		window.addEventListener('mouseup', handleOpenTabWindowMouseUp);
	}

	function handleOpenTabWindowMouseMove(e: MouseEvent) {
		if (!openTabsDragState) return;

		e.preventDefault();
		if (!openTabsDragState.isDragging) {
			if (Math.abs(e.clientY - openTabsDragState.startY) <= 4) return;

			openTabsDragState.isDragging = true;
			openTabsDraggingId = openTabsDragState.tabId;
		}

		const target = document.elementFromPoint(e.clientX, e.clientY);
		const item = target instanceof HTMLElement
			? target.closest<HTMLButtonElement>('.open-tab-item')
			: null;
		const targetId = item?.dataset.openTabId;

		if (!targetId || targetId === openTabsDragState.tabId) {
			openTabsDragOverId = null;
			return;
		}

		openTabsDragOverId = targetId;
		reorderOpenTab(openTabsDragState.tabId, targetId);
	}

	function handleOpenTabWindowMouseUp() {
		const didDrag = openTabsDragState?.isDragging ?? false;

		if (didDrag) {
			markOpenTabsDragged();
		}

		clearOpenTabsDragState();
		window.removeEventListener('mousemove', handleOpenTabWindowMouseMove);
		window.removeEventListener('mouseup', handleOpenTabWindowMouseUp);
	}

	function handleOpenTabItemKeyDown(e: KeyboardEvent, tabId: string) {
		if (!e.altKey || (e.key !== 'ArrowUp' && e.key !== 'ArrowDown')) return;

		e.preventDefault();
		e.stopPropagation();

		const move = getOpenTabAdjacentReorderMove(tabManager.tabs, tabId, e.key === 'ArrowUp' ? 'up' : 'down');
		if (!move) return;

		tabManager.reorderTabs(move.fromIndex, move.toIndex);
		focusOpenTabItem(tabId);
	}

	function toggleOpenTabsMenu(e: MouseEvent) {
		e.stopPropagation();
		const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
		const menuWidth = Math.min(360, window.innerWidth - 24);
		openTabsMenuLeft = Math.max(12, Math.min(rect.right - menuWidth, window.innerWidth - menuWidth - 12));
		openTabsMenuTop = rect.bottom + 4;
		openTabsMenuOpen = !openTabsMenuOpen;
		if (!openTabsMenuOpen) {
			clearOpenTabsDragState();
		}
	}

	function handleWindowClick() {
		closeOpenTabsMenu();
	}

	function handleWindowKeyDown(e: KeyboardEvent) {
		if (e.key === 'Escape') closeOpenTabsMenu();
	}
</script>

<svelte:window onclick={handleWindowClick} onkeydown={handleWindowKeyDown} />

<div class="tab-list-wrapper" class:fit-tabs={settings.fitTabsToWidth}>
	<div class="scroll-viewport">
		<div class="scroll-shadow left" class:visible={showLeftArrow}></div>

		<div
			bind:this={scrollContainer}
			class="tab-list-container"
			data-tauri-drag-region
			role="tablist"
			tabindex="-1"
			oncontextmenu={handleContainerContextMenu}
			onwheel={(e) => {
				if (e.deltaY !== 0) {
					e.preventDefault();
					e.currentTarget.scrollLeft += e.deltaY;
				}
			}}>
			{#each tabManager.tabs as tab, i (tab.id)}
				<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
				<div
					class="tab-item-wrapper"
					animate:flip={{ duration: 200 }}
					role="listitem"
					class:drag-opacity={draggingId === tab.id}
					onmousedown={(e) => handleMouseDown(e, tab, e.currentTarget as HTMLElement)}>
					<Tab
						{tab}
						isActive={!showHome && tabManager.activeTabId === tab.id}
						isLast={i === tabManager.tabs.length - 1}
						fitToWidth={settings.fitTabsToWidth}
						onclick={() => {
							if (justDragged) return;
							tabManager.setActive(tab.id);
							ontabclick?.();
						}}
						onclose={() => oncloseTab?.(tab.id)} />
				</div>
			{/each}
		</div>

		{#if draggingId && dragState}
			<div class="drag-proxy" style:left="{dragState.initialRect.left + (dragState.currentX - dragState.startX)}px" style:top="{dragState.initialRect.top}px">
				<Tab tab={dragState.tab} isActive={!showHome && tabManager.activeTabId === dragState.tab.id} onclick={() => {}} onclose={() => {}} />
			</div>
		{/if}

		<div class="scroll-shadow right" class:visible={showRightArrow}></div>
	</div>

	<div class="open-tabs-container">
		<button
			class="open-tabs-btn"
			class:active={openTabsMenuOpen}
			onclick={toggleOpenTabsMenu}
			onmousedown={(e) => e.preventDefault()}
			title={t('tooltip.openTabs', settings.language)}
			aria-label={t('tooltip.openTabs', settings.language)}>
			<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<line x1="8" y1="6" x2="21" y2="6"></line>
				<line x1="8" y1="12" x2="21" y2="12"></line>
				<line x1="8" y1="18" x2="21" y2="18"></line>
				<circle cx="3.5" cy="6" r="1"></circle>
				<circle cx="3.5" cy="12" r="1"></circle>
				<circle cx="3.5" cy="18" r="1"></circle>
			</svg>
		</button>

		{#if openTabsMenuOpen}
			<div class="open-tabs-menu show-dropdown" style="left: {openTabsMenuLeft}px; top: {openTabsMenuTop}px;">
				<div class="open-tabs-header">{t('menu.openTabs', settings.language)}</div>
				{#each openTabItems as item (item.id)}
					<button
						class="open-tab-item"
						class:active={item.isActive}
						class:drag-source={openTabsDraggingId === item.id}
						class:drag-over={openTabsDragOverId === item.id}
						data-open-tab-id={item.id}
						onclick={(e) => {
							e.stopPropagation();
							selectTab(item.id);
						}}
						onmousedown={(e) => handleOpenTabMouseDown(e, item.id)}
						onkeydown={(e) => handleOpenTabItemKeyDown(e, item.id)}>
						<span class="open-tab-state" class:dirty={item.isDirty}></span>
						<span class="open-tab-text">
							<span class="open-tab-title">{item.title}</span>
							{#if item.pathLabel}
								<span class="open-tab-path">{item.pathLabel}</span>
							{/if}
						</span>
					</button>
				{/each}
				<div class="open-tabs-divider"></div>
				<button class="open-tab-option" onclick={() => settings.toggleFitTabsToWidth()}>
					<span class="open-tab-check">{settings.fitTabsToWidth ? '✓' : ''}</span>
					<span>{t('menu.fitTabsToWidth', settings.language)}</span>
				</button>
			</div>
		{/if}
	</div>

	<button class="new-tab-btn" onclick={onnewTab} onmousedown={(e) => e.preventDefault()} title={`${t('tooltip.newTab', settings.language)} (Ctrl+T)`}>
		<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
			><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
	</button>

	<div class="tab-list-spacer" data-tauri-drag-region></div>
</div>

<style>
	.tab-list-wrapper {
		display: flex;
		align-items: center;
		height: 100%;
		overflow: hidden;
		flex: 1;
		min-width: 0;
	}

	.scroll-viewport {
		position: relative;
		display: flex;
		flex: 0 1 auto;
		height: 100%;
		overflow: hidden;
		min-width: 0;
		max-width: 100%;
	}

	.tab-list-wrapper.fit-tabs .scroll-viewport {
		flex: 1 1 auto;
	}

	.scroll-shadow {
		position: absolute;
		top: 0;
		bottom: 0;
		width: 40px;
		z-index: 20;
		pointer-events: none;
		opacity: 0;
		transition: opacity 0.2s ease;
	}

	.scroll-shadow.visible {
		opacity: 1;
	}

	.scroll-shadow.left {
		left: 0;
		background: linear-gradient(to right, var(--color-canvas-default), transparent);
	}

	.scroll-shadow.right {
		right: 0;
		background: linear-gradient(to left, var(--color-canvas-default), transparent);
	}

	.tab-list-container {
		display: flex;
		flex-direction: row;
		align-items: center;
		overflow-x: auto;
		overflow-y: hidden;
		gap: 4px;
		height: 100%;
		padding-left: 10px;
		scroll-behavior: smooth;

		scrollbar-width: none;
		-ms-overflow-style: none;
	}

	.tab-list-wrapper.fit-tabs .tab-list-container {
		flex: 1 1 auto;
		overflow-x: hidden;
	}

	.tab-list-container::-webkit-scrollbar {
		display: none;
	}

	.new-tab-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		margin: 4px 4px 4px 4px;
		border: none;
		background: transparent;
		color: var(--color-fg-muted);
		border-radius: 8px;
		cursor: pointer;
		flex-shrink: 0;
		transition:
			background 0.1s,
			color 0.1s;
		z-index: 21;
	}

	.new-tab-btn:hover {
		background: var(--color-neutral-muted);
		color: var(--color-fg-default);
	}

	.open-tabs-container {
		position: relative;
		flex-shrink: 0;
		z-index: 22;
	}

	.open-tabs-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		margin: 4px 0 4px 4px;
		border: none;
		background: transparent;
		color: var(--color-fg-muted);
		border-radius: 8px;
		cursor: pointer;
		transition:
			background 0.1s,
			color 0.1s;
	}

	.open-tabs-btn:hover,
	.open-tabs-btn.active {
		background: var(--color-neutral-muted);
		color: var(--color-fg-default);
	}

	.open-tabs-menu.show-dropdown {
		position: fixed;
		display: flex;
		flex-direction: column;
		width: min(360px, calc(100vw - 24px));
		max-height: min(460px, calc(100vh - 64px));
		overflow-y: auto;
		padding: 6px;
		background-color: var(--color-canvas-default);
		border: 1px solid var(--color-border-default);
		border-radius: 6px;
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
		font-family: var(--win-font);
		z-index: 10006;
	}

	.open-tabs-header {
		padding: 6px 8px 8px;
		color: var(--color-fg-muted);
		font-size: 11px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0;
	}

	.open-tab-item,
	.open-tab-option {
		position: relative;
		display: flex;
		align-items: center;
		gap: 8px;
		width: 100%;
		border: none;
		background: transparent;
		color: var(--color-fg-default);
		border-radius: 4px;
		padding: 7px 8px;
		font-family: inherit;
		text-align: left;
		cursor: default;
	}

	.open-tab-item {
		cursor: grab;
		user-select: none;
	}

	.open-tab-item:active {
		cursor: grabbing;
	}

	.open-tab-item::before {
		content: '';
		width: 6px;
		height: 16px;
		flex: 0 0 6px;
		opacity: 0.55;
		background-image: radial-gradient(circle, var(--color-fg-muted) 1px, transparent 1px);
		background-position: center;
		background-size: 3px 4px;
	}

	.open-tab-item:hover,
	.open-tab-item.active,
	.open-tab-option:hover {
		background: var(--color-neutral-muted);
	}

	.open-tab-item.drag-source {
		opacity: 0.45;
	}

	.open-tab-item.drag-over {
		background: color-mix(in srgb, var(--color-accent-fg) 14%, transparent);
		box-shadow: inset 2px 0 0 var(--color-accent-fg);
	}

	.open-tab-item:focus-visible {
		outline: 2px solid var(--color-accent-fg);
		outline-offset: -2px;
	}

	.open-tab-state {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		flex: 0 0 auto;
	}

	.open-tab-state.dirty {
		background: var(--color-fg-muted);
	}

	.open-tab-item.active .open-tab-state {
		background: var(--color-accent-fg);
	}

	.open-tab-text {
		display: flex;
		flex-direction: column;
		gap: 2px;
		min-width: 0;
		flex: 1;
	}

	.open-tab-title,
	.open-tab-path {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.open-tab-title {
		font-size: 13px;
	}

	.open-tab-path {
		color: var(--color-fg-muted);
		font-size: 11px;
	}

	.open-tabs-divider {
		height: 1px;
		background: var(--color-border-muted);
		margin: 6px 0;
	}

	.open-tab-check {
		width: 12px;
		color: var(--color-accent-fg);
		text-align: center;
	}

	.tab-list-spacer {
		flex: 1;
		height: 100%;
		min-width: 20px;
	}

	.tab-item-wrapper {
		transition: opacity 0.1s;
		flex: 0 0 auto;
		min-width: 0;
	}

	.tab-list-wrapper.fit-tabs .tab-item-wrapper {
		flex: 1 1 0;
	}

	.tab-item-wrapper.drag-opacity {
		opacity: 0;
		pointer-events: none;
	}

	.drag-proxy {
		position: fixed;
		z-index: 10000;
		pointer-events: none;
		opacity: 0.9;
		will-change: left, top;
	}
</style>

<ContextMenu {...tabListContextMenu} onhide={() => tabListContextMenu.show = false} />
