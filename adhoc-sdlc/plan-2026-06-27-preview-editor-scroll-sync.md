---
type: plan
name: preview-editor-scroll-sync
title: "Markpad: synchronize preview scroll back to editor"
project: "markpad"
keywords: [scroll, sync, preview, editor, svelte]
created: 2026-06-27T17:51:27+02:00
updated: 2026-06-27T17:59:44+02:00
status: done
---

## Summary

Naprawić synchronizację przewijania w widoku split: przewijanie edytora już przesuwa podgląd, ale przewijanie podglądu nie przesuwa edytora w sposób niezawodny.

Root-cause z odczytu kodu: `handleScroll` w `MarkdownViewer.svelte` wywołuje `syncEditorToPreviewScroll`, ale aktualny algorytm wybiera kotwicę tylko wtedy, gdy punkt `scrollTop + 60` leży dokładnie wewnątrz top-level elementu z `data-sourcepos`. Przy marginesach między blokami, panelu frontmatter albo elementach bez `data-sourcepos` funkcja kończy się bez przewinięcia edytora.

Zakres: mała poprawka w algorytmie kotwicy scrolla i test wiringowy. Bez zmiany ustawień, UI toggle ani modelu zakładek.

## Mode

- brainstorming: off
- deep-code-verification: off
- test-execution: on
- plan-cove: off
- strategy-temper: off
- execution-cove: on

## Original Prompt

$adhoc-sdlc
Znalazłem takiego baga śmiesznego do synchronicznego synchronizowane tego skrotu przewijania 2 okien, czyli okna te. Owego i i podglądu mianowicie jeżeli s kroluje okno tekstowe to działa to dobrze, ale jak skontroluję okno podglądu to okno tekstu nie jest synchronizowane.

## Key Changes

1. Wydzielić helper wyboru kotwicy preview scrolla, który zwraca linię i ratio dla aktywnego lub najbliższego elementu z `data-sourcepos`.
2. Użyć helpera w `syncEditorToPreviewScroll`, żeby przewijanie podglądu wywoływało `editorPane.syncScrollToLine(...)` także wtedy, gdy anchor trafia w margines albo element bez `data-sourcepos`.
3. Użyć tego samego helpera w `handleScroll` do aktualizacji `anchorLine`, żeby nie utrzymywać dwóch rozbieżnych algorytmów.
4. Zostawić guard `isProgrammaticScroll`, żeby przewijanie wygenerowane przez edytor nie powodowało pętli zwrotnej.
5. Po implementacji odświeżyć Windows portable release artifact.

## Test Plan

1. Dopisać test regresyjny w `scripts/reloadOpenToolbar.test.ts` albo osobnym skrypcie, który wymusza obecność helpera i użycie go przez `syncEditorToPreviewScroll` oraz `handleScroll`.
2. Uruchomić test RED i potwierdzić, że obecny kod go oblał.
3. Po implementacji uruchomić targetowany test.
4. Uruchomić pełne testy skryptowe: `npx tsx --test scripts/*.test.ts`.
5. Uruchomić `npm run check`.
6. Uruchomić `npm run build` i przeskanować log pod warning/error.
7. Zbudować Windows release przez `cargo-xwin`, skopiować `Markpad.exe` do `release/windows/Markpad_2.6.11_x64.exe`, odświeżyć `SHA256SUMS.txt` i sprawdzić checksumę.
8. Uruchomić `git diff --check`.

## Assumptions

1. Błąd dotyczy trybu split, gdzie edytor i podgląd są widoczne równocześnie.
2. Synchronizacja preview -> editor powinna używać tej samej semantyki co editor -> preview: linia źródłowa plus ratio w viewport.
3. Nie wprowadzamy `scrollend`, bo synchronizacja ma reagować w trakcie przewijania; guidance web potwierdza, że ciężką pracę należy ograniczać w `scroll`, więc helper pozostaje lekki i oparty o istniejące metadane DOM.
4. Natywne `cargo test` w tym WSL może nadal być zablokowane przez brak `pkg-config`/OpenSSL/fontconfig dev packages; wymaganym artefaktem w tym repo pozostaje Windows x64 portable `.exe`.
