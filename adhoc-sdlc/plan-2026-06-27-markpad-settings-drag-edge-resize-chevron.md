---
type: plan
name: markpad-settings-drag-edge-resize-chevron
title: "Markpad: draggable settings modal, edge resize, and accordion chevrons"
project: "markpad"
keywords: [settings, modal, drag, resize, accordion, chevron, svelte]
created: 2026-06-27T17:14:54+02:00
updated: 2026-06-27T17:37:25+02:00
status: complete
---

## Summary

Cel: dopracować okno ustawień Markpada jako pełniejsze okno modalne: można je przeciągać za belkę nagłówka, zmieniać rozmiar z każdej krawędzi i rogu, a accordiony ustawień toolbarów mają widoczny chevron stanu.

Zakres pozostaje w `Settings.svelte` oraz testach wiringowych. Nie zmieniam modelu ustawień ani działania samych pasków narzędzi.

## Mode

- brainstorming: off
- deep-code-verification: off
- test-execution: on
- plan-cove: off
- strategy-temper: off
- execution-cove: on

## Original Prompt

$adhoc-sdlc plan i exec
To okno ustawień powinno mieć możliwość przeciągania za belkę i zmiany rozmiaru. Ciągnięcia za każdą krawędź. Dodatkowo ten akordeon, który jest w ustawieniach pasków narzędzi, powinien mieć taki szewron, który pokazuje, że to jest zwinięty rozwinięty.

## Key Changes

1. Dodać przeciąganie okna ustawień po nagłówku `.settings-header`, z ignorowaniem kliknięć w elementy interaktywne, np. przycisk zamknięcia.
2. Zastąpić pojedynczy uchwyt resize siatką 8 stref: top, right, bottom, left oraz 4 rogi; każda strefa korzysta z tego samego mechanizmu pointer/window events.
3. Utrzymać ograniczenia rozmiaru i położenia w viewport, żeby okno nie dało się wyciągnąć poza ekran.
4. Dodać chevron w summary accordionów toolbarów i styl zależny od `details[open]`.
5. Zachować natywne `<details>/<summary>` jako mechanizm accordionu.
6. Sprawdzić i zabezpieczyć testem, że etykiety używane przez przyciski ustawień toolbarów mają tłumaczenia we wszystkich językach dostępnych w aplikacji.

## Test Plan

1. Dopisać testy regresyjne w `scripts/toolbarCustomizationWiring.test.ts` i potwierdzić RED.
2. Po implementacji uruchomić test wiringowy toolbarów.
3. Uruchomić `npm run check`.
4. Uruchomić pełne testy TypeScript: `npx tsx --test scripts/*.test.ts`.
5. Uruchomić test tłumaczeń etykiet przycisków dla wszystkich `getSupportedLanguages()`.
6. Uruchomić `npm run build` i przeskanować log pod ostrzeżenia oraz błędy.
7. Zbudować Windows release przez `cargo-xwin`, odświeżyć `release/windows/Markpad_2.6.11_x64.exe` i `SHA256SUMS.txt`, sprawdzić checksumę.
8. Uruchomić `git diff --check`.

## Assumptions

1. "Za belkę" oznacza nagłówek ustawień z tytułem i przyciskiem zamknięcia; sam przycisk zamknięcia nie zaczyna przeciągania.
2. "Każda krawędź" obejmuje również rogi, bo w praktyce są oczekiwanym sposobem dwuwymiarowego resize.
3. Chevron jest wskaźnikiem wizualnym; stan expanded/collapsed nadal wynika natywnie z `<details open>`.
4. Po implementacji wymagany jest Windows portable release artifact, zgodnie z lokalną preferencją projektu.
