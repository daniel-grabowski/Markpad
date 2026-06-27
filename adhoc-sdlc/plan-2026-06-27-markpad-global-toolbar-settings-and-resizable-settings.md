---
type: plan
name: markpad-global-toolbar-settings-and-resizable-settings
title: "Markpad: global toolbar settings and resizable Settings"
project: ""
keywords: []
created: 2026-06-27T14:07:01+02:00
updated: 2026-06-27T14:07:01+02:00
status: in-progress
---

## Summary

Zadanie dopina dwa rozdzielone toolbary w Markpad:

- nowy toolbar edycji tekstu zostaje jako osobny feature i zachowuje swoje ustawienia;
- istniejący globalny toolbar w belce okna dostaje własne ustawienia widoczności, kolejności i miejsca renderowania;
- Settings dostaje czytelny podział konfiguracji oraz możliwość zmiany rozmiaru okna.

Globalny toolbar ma zachować obecne reguły kontekstowe aplikacji: konfiguracja użytkownika nie może pokazać akcji tam, gdzie dana akcja nie ma sensu w aktualnym stanie.

## Mode

- brainstorming: off
- deep-code-verification: off
- test-execution: on
- plan-cove: off
- strategy-temper: off
- execution-cove: on

## Original Prompt

Dodac osobne ustawienia globalnego toolbaru na belce okna, zachowac nowy toolbar edycji tekstu jako osobna funkcje, rozdzielic je w Settings oraz umozliwic zmiane rozmiaru okna ustawien.

## Key Changes

1. Rozdzielić konfigurację toolbarów w Settings:
   - sekcja dla toolbaru edytora tekstu;
   - sekcja dla globalnego toolbaru aplikacji w belce okna;
   - osobne klucze settings/localStorage i osobne helpery konfiguracji.

2. Dodać model globalnego toolbaru:
   - katalog akcji dla belki okna: back, forward, reload, toc, fullWidth, live, sync, split, edit, find, zen, tabs, zoom, theme, settings;
   - kolejność akcji;
   - ukrywanie akcji;
   - miejsce akcji: bezpośrednio na belce albo w menu trzech kropek;
   - normalizacja starych/brakujących ustawień i dopisywanie nowych akcji po aktualizacji aplikacji.

3. Przepiąć TitleBar.svelte:
   - najpierw wyliczyć akcje dostępne kontekstowo, tak jak obecnie;
   - potem zastosować konfigurację użytkownika;
   - na końcu podzielić wynik na akcje inline i menu trzech kropek;
   - nie przywracać open_loc do globalnego toolbaru, bo pozostaje w menu kontekstowym zakładki.

4. Dopiąć UI konfiguracji:
   - drag-and-drop do zmiany kolejności;
   - przyciski góra/dół jako fallback dostępnościowy;
   - checkbox widoczności;
   - kontrolka miejsca: belka albo menu.

5. Umożliwić resize Settings:
   - domyślny rozmiar może zostać mały;
   - dodać min/max constraints;
   - zachować scroll wewnętrzny paneli.

## Test Plan

1. Testy helperów konfiguracji globalnego toolbaru:
   - domyślna kolejność i domyślne miejsce akcji;
   - normalizacja brakujących/starych ustawień;
   - ukrywanie;
   - podział na belkę i menu;
   - reorder.

2. Testy/source checks dla połączeń Svelte:
   - TitleBar używa ustawień globalnego toolbaru;
   - Settings pokazuje dwie rozdzielone sekcje toolbarów;
   - editor toolbar nadal korzysta ze swojej konfiguracji;
   - open_loc nie wraca do globalnego toolbaru.

3. Testy/style checks dla Settings resize:
   - modal ma resize enabled;
   - ma min/max size;
   - layout paneli dalej scrolluje zawartość.

4. Uruchomić:
   - npx tsx --test scripts/*.test.ts
   - npm run check

## Assumptions

1. Toolbar edytora zostaje jako nowy feature, bo to przydatna funkcja, ale musi być jasno oddzielony od toolbaru aplikacji.
2. Globalny toolbar zachowuje obecny domyślny wygląd po czystym starcie.
3. Użytkownik może przenieść akcję do menu trzech kropek albo ukryć ją całkowicie, ale reguły kontekstowe aplikacji są nadrzędne.
4. Settings pozostaje modalem w aplikacji, a nie osobnym natywnym oknem Tauri.
