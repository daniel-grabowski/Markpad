---
type: plan
name: ctrl-t-new-file-shortcut
title: "Fix Ctrl+T New File Shortcut"
project: "markpad"
keywords: [shortcut, new-file, tauri]
created: 2026-06-23T18:20:45+02:00
updated: 2026-06-23T18:20:45+02:00
status: in-progress
---

## Summary

Naprawić skrót `Ctrl/Cmd+T` tak, aby tworzył nową pustą zakładkę edytora, czyli zachowywał się jak akcja `New File` z menu/przycisku. Obecnie ścieżka `keydown` dla `Ctrl+T` wywołuje `tabManager.addHomeTab()`, co aktywuje zakładkę HOME zamiast nowego pliku.

## Key Changes

- Zmienić obsługę `Ctrl/Cmd+T` w `src/lib/MarkdownViewer.svelte`, żeby używała istniejącej funkcji `handleNewFile()`.
- Zachować osobno `Ctrl/Cmd+Shift+T` jako cofnięcie zamkniętej zakładki.
- Nie ruszać natywnego macOS menu Tauri, bo `menu-file-new` już mapuje się na `handleNewFile()`.

## Test Plan

- Wykonać statyczny self-check diffu: `Ctrl/Cmd+T` musi trafiać w `handleNewFile()`, a `Ctrl/Cmd+Shift+T` ma dalej trafiać w `handleUndoCloseTab()`.
- Uruchomić `npm run check`, o ile lokalne zależności i SvelteKit pozwolą na typecheck w tym checkoutcie.

## Assumptions

- Tryby `adhoc-sdlc` przyjęte z domyślnej konfiguracji projektu: `brainstorming=OFF`, `deep-code-verification=OFF`, `test-execution=OFF`, `plan-cove=OFF`, `strategy-temper=OFF`, `execution-cove=OFF`; mimo tego wykonuję root-cause debugging i końcowy self-check.
- Zgłoszony skrót dotyczy zwykłego `Ctrl+T` na Windows/Linux albo analogicznego `Cmd+T` w ścieżce JS; na macOS natywny accelerator jest już obsłużony przez `menu-file-new`.

## Mode

- `brainstorming`: OFF
- `deep-code-verification`: OFF
- `test-execution`: OFF
- `plan-cove`: OFF
- `strategy-temper`: OFF
- `execution-cove`: OFF
