---
type: plan
name: frontmatter-keywords-tag-editor
title: "Markpad: edytowalne tagi keywords i ciaśniejszy front matter"
project: "markpad"
keywords: [frontmatter, keywords, tags, svelte, windows-release]
created: 2026-06-26T20:43:09+02:00
updated: 2026-06-26T20:43:09+02:00
status: in-progress
---

## Summary

Usprawnic edycje frontmatter w Markpad dla pola `keywords` z planow adhoc-sdlc: lista ma byc widoczna jako edytowalne tagi, z mozliwoscia usuniecia, edycji i dodania wartosci. Przy okazji scisnac formularz frontmatter tak, zeby etykieta i kontrolka byly blisko siebie, zamiast rozjezdzac sie na szerokim gridzie.

## Mode

- brainstorming: off
- deep-code-verification: off
- test-execution: on
- plan-cove: off
- strategy-temper: off
- execution-cove: on

## Original Prompt

testuję to na tym pliku: C:\dFLEX\trunk\adhoc-sdlc\plan-2026-06-26-dflex-logger-onoff-dir-synlog.md

we frontmatter jest pole `keywords` - Chcę, żeby to było, żeby to były edytowalne tagi. Czyli takie, że mogę usunąć tak przez kliknięcie w krzyżyk nacisnąć i go wyedytować lub dodać nowy. Etykiety i inputy W formularzu frontmatera, Mają zadaleko są odsunięte od siebie, powinny po prostu być. Mieć taką jakby margines, import od etykiety. Tak samo jak etykieta ma od lewej krawędzi.

## Key Changes

1. Dodac testowane helpery dla list frontmatter: normalizacja wartosci, dodawanie, usuwanie i edycja pojedynczego tagu.
2. Zmienic renderowanie pol listowych w `MarkdownViewer.svelte` z jednego tekstowego inputa na kontrolke tagow: chipy, przycisk usuwania, inline edit, input dodawania.
3. Skorygowac CSS frontmatter, szczegolnie szerokosc kolumn i `column-gap`, zeby odstep etykieta-kontrolka byl porownywalny z lewym paddingiem formularza.
4. Po testach przebudowac frontend i odswiezyc przenosny artefakt Windows x64, bo aktualna sesja testuje realny Windowsowy build Markpad.

## Test Plan

1. TDD: dopisac testy helperow list/tagow i najpierw zobaczyc ich blad.
2. Uruchomic `npx -y tsx --test scripts/*.test.ts`.
3. Uruchomic `npm run check`.
4. Uruchomic `npm run build`.
5. Zbudowac Windows x64 portable release i zaktualizowac `release/windows/SHA256SUMS.txt`.

## Assumptions

1. `keywords` jest standardowa lista YAML i mozna zapisac ja jako liste przez istniejacy `updateFrontMatterField`.
2. Ta sama kontrolka tagow moze obsluzyc wszystkie pola frontmatter rozpoznane jako `list`, nie tylko literalny klucz `keywords`.
3. Puste tagi sa ignorowane, a duplikaty dokladnie tej samej wartosci nie sa dodawane ponownie.
