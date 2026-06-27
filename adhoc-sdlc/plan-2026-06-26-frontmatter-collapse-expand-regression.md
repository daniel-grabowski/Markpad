---
type: plan
name: frontmatter-collapse-expand-regression
title: "Markpad: naprawa rozwijania zwiniętego front matter"
project: "markpad"
keywords: [frontmatter, collapse, svelte, ui, regression]
created: 2026-06-26T20:14:56+02:00
updated: 2026-06-26T20:14:56+02:00
status: in-progress
---

## Summary

Naprawić regresję w panelu front matter: po kliknięciu zwijania nagłówek `Properties` ma pozostać aktywnym kontrolerem i kolejne kliknięcie ma ponownie rozwinąć zawartość. Zakres jest ograniczony do logiki/markupu panelu i testu regresyjnego dla stanu collapse/expand.

## Mode

- brainstorming: off
- deep-code-verification: off
- test-execution: on
- plan-cove: off
- strategy-temper: off
- execution-cove: on

## Original Prompt

$adhoc-sdlc plan i exec
jest błąd z renderowaniem frontmatter; po zwinięci nie da się rozwinąć.

## Key Changes

- Odtworzyć przyczynę na obecnym kodzie, bez zgadywania.
- Dodać mały test regresyjny dla przełączania stanu zwinięcia front matter.
- Zmienić minimalny fragment `MarkdownViewer.svelte` albo lokalny helper tak, żeby klik w zwinięty nagłówek zawsze wracał do stanu rozwiniętego.
- Zachować istniejący wygląd i edycję pól front matter.

## Test Plan

- Uruchomić test front matter w stanie RED przed poprawką.
- Uruchomić testy TS po poprawce.
- Uruchomić `npm run check`.
- Jeżeli zmiana dotyka renderowania Svelte, uruchomić też `npm run build` albo równoważny build frontendu.

## Assumptions

- Problem jest w interakcji panelu front matter po stronie Svelte/CSS, nie w parserze YAML.
- Nie zmieniam formatu zapisu YAML ani zachowania edycji pól.
- Nie buduję ponownie Windows release w ramach tej poprawki, chyba że użytkownik poprosi osobno.
