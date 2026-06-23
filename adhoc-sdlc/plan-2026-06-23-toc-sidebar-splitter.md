---
type: plan
name: toc-sidebar-splitter
title: "Resizable table of contents sidebar"
project: "markpad"
keywords: [toc, sidebar, splitter]
created: 2026-06-23T15:56:11+02:00
updated: 2026-06-23T15:56:11+02:00
status: in-progress
---

## Summary

Dodac splitter do sidebaru spisu tresci w Markpad, zeby uzytkownik mogl zmieniac jego szerokosc zamiast korzystac ze stalego `240px`.

## Key Changes

- Zastapic stale `TOC_WIDTH = 240` stanowa szerokoscia sidebaru ToC.
- Zapamietac szerokosc w `localStorage`, z bezpieczna wartoscia domyslna.
- Dodac uchwyt `role="separator"` na krawedzi miedzy trescia a ToC, dzialajacy po lewej i prawej stronie sidebaru.
- Obslugiwac przeciaganie przez Pointer Events oraz klawiature przez strzalki, Home i End.
- Uzyc tej samej szerokosci dla overlay, pinned ToC, paddingu layoutu i animacji wysuwania.

## Test Plan

- Uruchomic `npm run check`.
- Sprawdzic finalny diff pod katem spojnosci: brak pozostalych stalych `240px` sterujacych szerokoscia ToC, splitter ma role separator i ograniczenia min/max.

## Assumptions

- Tryby: brainstorming=off, deep-code-verification=off, test-execution=on, plan-cove=off, strategy-temper=off, execution-cove=off.
- Wspolna szerokosc dla ToC po lewej i prawej stronie jest wystarczajaca; nie dodajemy osobnych ustawien per strona.
- Zakres dotyczy sidebaru ToC w `MarkdownViewer.svelte` i dopasowania `Toc.svelte`; nie zmieniamy ustawien aplikacji ani panelu Settings.
- Minimalna szerokosc 180px i maksymalna 420px powinny utrzymac czytelnosc oraz nie zabierac nadmiernie miejsca dokumentowi.
