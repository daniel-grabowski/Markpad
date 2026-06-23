---
type: plan
name: open-tabs-list-drag-reorder
title: "Drag reorder in open tabs preview list"
project: "markpad"
keywords: [tabs, drag-drop, reorder]
created: 2026-06-23T17:10:59+02:00
updated: 2026-06-23T17:10:59+02:00
status: in-progress
---

## Summary

Dodac zmiane kolejnosci kart bezposrednio w liscie podgladu otwartych kart. Lista ma modyfikowac ten sam porzadek `tabManager.tabs`, ktory jest uzywany przez pasek kart i zapisywany w stanie aplikacji.

## Key Changes

- Rozszerzyc `src/lib/utils/tabListActions.ts` o mala funkcje obliczajaca poprawny docelowy indeks przy przenoszeniu karty.
- Rozszerzyc menu "Open Tabs" w `src/lib/components/TabList.svelte` o drag-and-drop na pozycjach listy.
- Dodac dostepna alternatywe klawiaturowa: przy aktywnej pozycji listy strzalka w gore/dol z modyfikatorem przenosi karte o jedna pozycje.
- Zachowac dotychczasowy klik w pozycje listy jako wybor aktywnej karty.
- Nie dodawac zewnetrznej biblioteki drag-and-drop.

## Test Plan

- Uruchomic testy utili dotyczace listy kart, w tym nowy test obliczania reorder.
- Uruchomic `npm run check`.
- Uruchomic frontendowy build.
- Zbudowac portable Windows release EXE jako `release/windows/Markpad_<version>_x64.exe`.

## Assumptions

- Zmiana kolejnosci w liscie podgladu ma zmieniac globalna kolejnosc kart, nie tylko lokalne sortowanie w menu.
- Drag-and-drop dotyczy otwartej listy podgladu; nie zmienia istniejacego drag na pasku kart.
- Dla klawiatury przyjmujemy `Alt+ArrowUp` i `Alt+ArrowDown`, zeby nie przejmowac zwyklych strzalek wykorzystywanych do nawigacji/fokusu.

## Mode

- brainstorming: off; zastosowano lekki inline brainstorm i przyjete zalozenia bez blokowania wykonania.
- deep-code-verification: off; kontekst sprawdzony lokalnie w `TabList.svelte`, `tabs.svelte.ts` i `tabListActions.ts`.
- test-execution: on.
- plan-cove: off.
- strategy-temper: off.
- execution-cove: off.
