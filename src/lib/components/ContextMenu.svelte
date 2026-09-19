<script lang="ts" module>
	export type ContextMenuItem = {
		id?: string;
		label?: string;
		shortcut?: string;
		disabled?: boolean;
		icon?: 'folder' | 'file';
		onClick?: (event: MouseEvent | KeyboardEvent) => void;
		separator?: boolean;
		children?: ContextMenuItem[];
		loadChildren?: () => Promise<ContextMenuItem[]>;
		loadingLabel?: string;
		emptyLabel?: string;
		errorLabel?: string;
		retryLabel?: string;
		keepOpen?: boolean;
	};
</script>

<script lang="ts">
	import { tick } from 'svelte';
	import { getSubmenuPanelPosition, loadCachedMenuChildren, type MenuTriggerRect } from '../utils/contextMenuCascade.js';

	type MenuPanel = {
		items: ContextMenuItem[];
		x: number;
		y: number;
		parentDepth?: number;
		triggerIndex?: number;
		triggerItem?: ContextMenuItem;
		triggerRect?: MenuTriggerRect;
		focusWhenReady?: boolean;
	};

	let { show, x, y, items, onhide } = $props<{
		show: boolean;
		x: number;
		y: number;
		items: ContextMenuItem[];
		onhide: () => void;
	}>();

	let overlayEl = $state<HTMLDivElement>();
	let panels = $state<MenuPanel[]>([]);
	let innerWidth = $state(1000);
	let innerHeight = $state(1000);
	let sessionId = 0;
	let childLoadPromises = new WeakMap<ContextMenuItem, Promise<ContextMenuItem[]>>();
	let wasShowing = false;
	let previouslyFocused: HTMLElement | null = null;

	$effect(() => {
		if (show && !wasShowing) {
			wasShowing = true;
			sessionId += 1;
			childLoadPromises = new WeakMap();
			innerWidth = window.innerWidth;
			innerHeight = window.innerHeight;
			previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
			panels = [{ items, x, y }];
			void tick().then(() => {
				positionRootPanel();
				focusFirstItem(0);
			});
		} else if (!show && wasShowing) {
			wasShowing = false;
			sessionId += 1;
			panels = [];
		}
	});

	function hasSubmenu(item: ContextMenuItem): boolean {
		return item.children !== undefined || item.loadChildren !== undefined;
	}

	function panelElement(depth: number): HTMLDivElement | null {
		return overlayEl?.querySelector<HTMLDivElement>(`[data-menu-depth="${depth}"]`) ?? null;
	}

	function panelButtons(depth: number): HTMLButtonElement[] {
		return Array.from(overlayEl?.querySelectorAll<HTMLButtonElement>(`[data-panel-depth="${depth}"]`) ?? []);
	}

	function focusFirstItem(depth: number) {
		panelButtons(depth)[0]?.focus();
	}

	function positionRootPanel() {
		const node = panelElement(0);
		if (!node || !panels[0]) return;
		const margin = 8;
		panels[0] = {
			...panels[0],
			x: Math.min(Math.max(margin, x), Math.max(margin, innerWidth - node.offsetWidth - margin)),
			y: Math.min(Math.max(margin, y), Math.max(margin, innerHeight - node.offsetHeight - margin)),
		};
		panels = [...panels];
	}

	function positionChildPanel(depth: number) {
		const panel = panels[depth];
		const node = panelElement(depth);
		if (!panel?.triggerRect || !node) return;
		const position = getSubmenuPanelPosition(panel.triggerRect, node.offsetWidth, node.offsetHeight, innerWidth, innerHeight);
		panels[depth] = { ...panel, ...position };
		panels = [...panels];
	}

	function focusAdjacent(depth: number, current: EventTarget | null, offset: number) {
		const buttons = panelButtons(depth);
		if (buttons.length === 0) return;
		const currentIndex = Math.max(0, buttons.indexOf(current as HTMLButtonElement));
		buttons[(currentIndex + offset + buttons.length) % buttons.length]?.focus();
	}

	function hideMenu(restoreFocus = true) {
		sessionId += 1;
		panels = [];
		onhide();
		if (restoreFocus) void tick().then(() => previouslyFocused?.focus());
	}

	function setPanelItems(depth: number, panelItems: ContextMenuItem[]) {
		if (!panels[depth]) return;
		panels[depth] = { ...panels[depth], items: panelItems };
		panels = [...panels];
		void tick().then(() => positionChildPanel(depth));
	}

	async function loadPanelChildren(depth: number, item: ContextMenuItem, itemIndex: number, activeSession: number) {
		const childDepth = depth + 1;
		setPanelItems(childDepth, [{ label: item.loadingLabel ?? 'Loading…', disabled: true }]);
		try {
			const loaded = await loadCachedMenuChildren(
				childLoadPromises,
				item,
				() => item.loadChildren?.() ?? Promise.resolve([]),
			);
			if (!show || sessionId !== activeSession || panels[childDepth]?.triggerItem !== item) return;
			item.children = loaded;
			setPanelItems(childDepth, loaded.length > 0 ? loaded : [{ label: item.emptyLabel ?? 'Empty', disabled: true }]);
			if (panels[childDepth]?.focusWhenReady) void tick().then(() => focusFirstItem(childDepth));
		} catch (error) {
			console.error('Failed to load context submenu', error);
			if (!show || sessionId !== activeSession || panels[childDepth]?.triggerItem !== item) return;
			setPanelItems(childDepth, [
				{ label: item.errorLabel ?? 'Could not load', disabled: true },
				{
					label: item.retryLabel ?? 'Retry',
					keepOpen: true,
					onClick: () => void loadPanelChildren(depth, item, itemIndex, activeSession),
				},
			]);
			if (panels[childDepth]?.focusWhenReady) void tick().then(() => focusFirstItem(childDepth));
		}
	}

	function openSubmenu(depth: number, item: ContextMenuItem, itemIndex: number, trigger: HTMLElement, focusChild = false) {
		if (item.disabled || !hasSubmenu(item)) return;
		if (panels[depth + 1]?.triggerItem === item) {
			if (focusChild) {
				panels[depth + 1].focusWhenReady = true;
				panels = [...panels];
				if (item.children !== undefined) focusFirstItem(depth + 1);
			}
			return;
		}
		const activeSession = sessionId;
		const rect = trigger.getBoundingClientRect();
		const triggerRect = { left: rect.left, right: rect.right, top: rect.top };
		panels = panels.slice(0, depth + 1);
		panels.push({
			items: item.children ?? [{ label: item.loadingLabel ?? 'Loading…', disabled: true }],
			x: rect.right + 4,
			y: rect.top,
			parentDepth: depth,
			triggerIndex: itemIndex,
			triggerItem: item,
			triggerRect,
			focusWhenReady: focusChild,
		});
		void tick().then(() => {
			positionChildPanel(depth + 1);
			if (focusChild && item.children !== undefined) focusFirstItem(depth + 1);
		});
		if (item.children === undefined) void loadPanelChildren(depth, item, itemIndex, activeSession);
	}

	function activateItem(item: ContextMenuItem, event: MouseEvent | KeyboardEvent) {
		if (item.disabled || hasSubmenu(item)) return;
		item.onClick?.(event);
		if (!item.keepOpen) hideMenu(false);
	}

	function focusParent(depth: number) {
		const panel = panels[depth];
		if (depth === 0 || panel?.parentDepth === undefined || panel.triggerIndex === undefined) return;
		panels = panels.slice(0, depth);
		void tick().then(() => {
			overlayEl?.querySelector<HTMLButtonElement>(
				`[data-panel-depth="${panel.parentDepth}"][data-item-index="${panel.triggerIndex}"]`,
			)?.focus();
		});
	}

	function handleKeydown(event: KeyboardEvent, item: ContextMenuItem, depth: number, itemIndex: number) {
		if (event.key === 'Escape') {
			event.preventDefault();
			hideMenu();
			return;
		}
		if (event.key === 'Tab') {
			hideMenu(false);
			return;
		}
		if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
			event.preventDefault();
			focusAdjacent(depth, event.currentTarget, event.key === 'ArrowDown' ? 1 : -1);
			return;
		}
		if (event.key === 'Home' || event.key === 'End') {
			event.preventDefault();
			const buttons = panelButtons(depth);
			buttons[event.key === 'Home' ? 0 : buttons.length - 1]?.focus();
			return;
		}
		if (event.key === 'ArrowLeft' && depth > 0) {
			event.preventDefault();
			focusParent(depth);
			return;
		}
		if ((event.key === 'ArrowRight' || event.key === 'Enter') && hasSubmenu(item)) {
			event.preventDefault();
			openSubmenu(depth, item, itemIndex, event.currentTarget as HTMLElement, true);
			return;
		}
		if ((event.key === 'Enter' || event.key === ' ') && !hasSubmenu(item)) {
			event.preventDefault();
			activateItem(item, event);
		}
	}
</script>

<svelte:window bind:innerWidth bind:innerHeight />

{#if show}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div bind:this={overlayEl} class="context-menu-overlay" onclick={() => hideMenu()} oncontextmenu={(event) => { event.preventDefault(); hideMenu(); }}>
		{#each panels as panel, depth}
			<div
				class="context-menu"
				class:root-panel={depth === 0}
				data-menu-depth={depth}
				style="left: {panel.x}px; top: {panel.y}px;"
				onclick={(event) => event.stopPropagation()}
				oncontextmenu={(event) => { event.preventDefault(); event.stopPropagation(); }}
				role="menu"
				tabindex="-1">
				{#each panel.items as item, itemIndex}
					{#if item.separator}
						<div class="menu-separator" role="separator"></div>
					{:else}
						<div class="menu-item-wrapper" onmouseenter={(event) => hasSubmenu(item) ? openSubmenu(depth, item, itemIndex, event.currentTarget as HTMLElement) : (panels = panels.slice(0, depth + 1))}>
							<button
								class="menu-item"
								class:submenu-trigger={hasSubmenu(item)}
								class:status-item={item.disabled}
								role="menuitem"
								tabindex="-1"
								data-panel-depth={depth}
								data-item-index={itemIndex}
								aria-disabled={item.disabled ? 'true' : undefined}
								aria-haspopup={hasSubmenu(item) ? 'menu' : undefined}
								aria-expanded={hasSubmenu(item) ? panels[depth + 1]?.triggerIndex === itemIndex : undefined}
								onfocus={() => (panels = panels.slice(0, depth + 1))}
								onkeydown={(event) => handleKeydown(event, item, depth, itemIndex)}
								onclick={(event) => hasSubmenu(item) ? openSubmenu(depth, item, itemIndex, event.currentTarget as HTMLElement, true) : activateItem(item, event)}>
								{#if item.icon === 'folder'}
									<svg class="menu-icon" viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M1.5 3.5A1.5 1.5 0 0 1 3 2h3l1.5 1.5H13A1.5 1.5 0 0 1 14.5 5v6.5A1.5 1.5 0 0 1 13 13H3a1.5 1.5 0 0 1-1.5-1.5z" /></svg>
								{:else if item.icon === 'file'}
									<svg class="menu-icon" viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M3 1.5h6l4 4V14H3zm6 1.4V6h3.1z" /></svg>
								{/if}
								<span class="action-label" title={item.label}>{item.label}</span>
								{#if hasSubmenu(item)}
									<span class="submenu-arrow" aria-hidden="true">›</span>
								{:else if item.shortcut}
									<span class="menu-shortcut">{item.shortcut}</span>
								{/if}
							</button>
						</div>
					{/if}
				{/each}
			</div>
		{/each}
	</div>
{/if}

<style>
	.context-menu-overlay { position: fixed; inset: 0; z-index: 10005; }

	.context-menu {
		position: fixed;
		display: flex;
		flex-direction: column;
		align-items: stretch;
		gap: 1px;
		z-index: 10006;
		min-width: 220px;
		max-width: min(360px, calc(100vw - 16px));
		max-height: calc(100vh - 16px);
		overflow-y: auto;
		padding: 4px;
		background-color: var(--color-canvas-default);
		border: 1px solid var(--color-border-default);
		border-radius: 6px;
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
		font-family: var(--win-font);
		outline: none;
		animation: menuFade 0.1s ease-out;
	}

	.context-menu:not(.root-panel) { z-index: 10007; }
	@keyframes menuFade { from { opacity: 0; transform: scale(0.97); } to { opacity: 1; transform: scale(1); } }
	.menu-item-wrapper { display: block; }

	.menu-item {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
		min-height: 28px;
		padding: 6px 12px;
		color: var(--color-fg-default);
		background: transparent;
		border: none;
		border-radius: 4px;
		font-family: inherit;
		font-size: 13px;
		cursor: default;
	}

	.menu-item:hover:not(.status-item),
	.menu-item:focus-visible:not(.status-item) { background: var(--color-neutral-muted); outline: none; }
	.menu-item.status-item { opacity: 0.55; }
	.menu-icon { width: 14px; height: 14px; flex: 0 0 auto; color: var(--color-fg-muted); }

	.action-label {
		display: block;
		min-width: 0;
		flex: 1;
		overflow: hidden;
		text-align: left;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.menu-shortcut,
	.submenu-arrow { color: var(--color-fg-muted); white-space: nowrap; }
	.menu-shortcut { font-size: 12px; }
	.submenu-arrow { font-size: 18px; line-height: 12px; }
	.menu-separator { height: 1px; margin: 4px 0; background: var(--color-border-muted); }
</style>
