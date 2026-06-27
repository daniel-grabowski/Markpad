---
type: plan
name: markpad-customizable-editor-toolbar
title: "Markpad editor toolbar customization"
project: "markpad"
keywords: [toolbar, settings, drag-drop, editor, kebab]
created: 2026-06-27T13:22:16+02:00
updated: 2026-06-27T13:22:16+02:00
status: in-progress
---

## Summary

Mały pasek narzędzi edytora ma dostać konfigurację widoczności i kolejności pozycji. Konfiguracja będzie dostępna w `Settings > Editor`, zapisywana w `localStorage` i oparta o stabilne ID akcji edytora, a nie o tekst etykiet. Zmienianie kolejności ma działać przez drag-and-drop oraz przez przyciski góra/dół jako dostępny fallback.

Z górnego paska / menu overflow z trzema kropkami ma zniknąć akcja `Open file location`, ponieważ ta sama funkcja jest już dostępna w menu kontekstowym zakładki i nie powinna dublować się w tym miejscu.

## Mode

- brainstorming: off (dyskusja wykonana inline; użytkownik doprecyzował zakres)
- deep-code-verification: off
- test-execution: on
- plan-cove: off
- strategy-temper: off
- execution-cove: off

## Original Prompt

Aplikacje ma taki mały toolbar, ale kolejność tych przycisków na toolbarze nie jest właściwa. Chcę włączać/wyłączać pozycje na toolbarze, zmieniać ich układ, najlepiej drag'n'drop jak w menu zakładek. Z popup menu toolbaru/kebaba ma zniknąć opcja otwórz lokalizację, bo jest już w prawokliku zakładki.

## Key Changes

1. Wydzielić katalog definicji narzędzi toolbaru edytora z domyślną kolejnością i helperami normalizacji konfiguracji.
2. Dodać do `SettingsStore` zapis/odczyt `editorToolbarOrder` i `editorToolbarHidden` oraz operacje: ukryj/pokaż, przesuń, przenieś po drag-and-drop, reset.
3. Przerobić `EditorToolbar.svelte`, żeby renderował narzędzia według konfiguracji zamiast statycznej tablicy.
4. Dodać w `Settings > Editor` sekcję konfiguracji toolbaru: checkbox widoczności, drag-and-drop reorder, przyciski góra/dół, reset.
5. Usunąć `Open file location` z górnego toolbar/kebab overflow menu, bez usuwania z menu kontekstowego zakładki.

## Test Plan

1. Dodać testy helperów toolbaru przed implementacją i potwierdzić czerwony stan.
2. Po implementacji uruchomić testy skryptowe `npx tsx --test scripts/*.test.ts`.
3. Uruchomić `npm run check`.
4. Uruchomić Windows x64 no-bundle build i odświeżyć `release/windows/Markpad_2.6.11_x64.exe` oraz `SHA256SUMS.txt`.

## Assumptions

- Nie dodaję zewnętrznej biblioteki DnD; wystarczy natywny HTML drag/drop plus przyciski dla dostępności.
- Konfiguracja ma ignorować nieznane/stare ID i automatycznie dopinać nowe narzędzia z domyślnej listy.
- Pełne tłumaczenie nazw wszystkich narzędzi nie jest celem tego kroku; UI ma zachować obecne nazwy toolbaru i dodać tylko brakujące etykiety ustawień.
