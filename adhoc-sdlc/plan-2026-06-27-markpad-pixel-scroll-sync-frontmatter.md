---
type: plan
name: markpad-pixel-scroll-sync-frontmatter
title: "Markpad: pixel-based synchronized scrolling with frontmatter"
project: "markpad"
keywords: [scroll, sync, frontmatter, pixels, editor, preview]
created: 2026-06-27T18:06:14+02:00
updated: 2026-06-27T18:26:00+02:00
status: done
---

## Summary

Synchronizowane przewijanie editor-preview w Markpad ma przestać mapować po numerach linii i `data-sourcepos` jako mechanizm runtime. To mapowanie jest błędne, gdy:

- dokument ma YAML frontmatter renderowany jako osobny panel,
- panel frontmatter jest zwinięty lub rozwinięty,
- edytor i podgląd mają różne wielkości czcionki lub inny layout.

Nowy model synchronizacji ma używać graficznej pozycji w pikselach. Pozycja przewijania będzie opisana jako segment `frontmatter` albo `body` oraz proporcja w tym segmencie. Każda strona sama przelicza tę pozycję na własny `scrollTop`, używając rzeczywistych wysokości DOM/Monaco.

## Original Prompt

Poprawić synchronizowane przewijanie: obecne mapowanie po liniach/sourcepos nie bierze pod uwagę zwiniętego/rozwiniętego frontmatter ani różnych wielkości czcionek między edytorem i renderem. Synchronizacja ma liczyć graficzną pozycję w pikselach.

## Key Changes

- Zmienić kontrakt `Editor.svelte -> MarkdownViewer.svelte` z `(line, ratio)` na `{ section, ratio }`.
- W edytorze obliczać koniec frontmatter w pikselach przez Monaco (`getTopForLineNumber` dla pierwszej linii body).
- W podglądzie obliczać koniec frontmatter z rzeczywistej wysokości `.frontmatter-panel`, więc stan collapsed/expanded jest uwzględniany automatycznie.
- Mapować `frontmatter` i `body` osobno, żeby wysoki/niski panel frontmatter nie rozjeżdżał pozycji treści.
- Zostawić `getPreviewScrollAnchor` tylko do zapamiętywania anchor line zakładki, nie do dwukierunkowej synchronizacji scrolla.
- Zachować guard przed pętlą zwrotną programatycznych scrolli.

## Test Plan

- Zaktualizować `scripts/previewScrollSync.test.ts`, aby wymagał pikselowego kontraktu `ScrollSyncPosition` i zabraniał użycia `syncScrollToLine` w synchronizacji preview-editor.
- Uruchomić test kontraktowy najpierw na czerwono.
- Uruchomić `npm run check`.
- Uruchomić `cargo test --release --target x86_64-pc-windows-gnu --no-run` w `src-tauri`; natywne Linux `cargo test` wymaga brakujących w WSL bibliotek GTK/WebKit.
- Uruchomić pełny zestaw `npx -y tsx --test scripts/*.test.ts`.
- Zbudować frontend i Windows portable release.

## Assumptions

- Synchronizacja runtime ma być optycznie stabilna, nie semantycznie przywiązana do konkretnych linii Markdown.
- `data-sourcepos` nadal może być użyte do zapamiętywania anchor line dla istniejącego mechanizmu przywracania pozycji.
- Dla dokumentów bez frontmatter cały scroll jest traktowany jako segment `body`.
