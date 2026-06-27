---
type: plan
name: markpad-open-exported-file-prompt
title: "Markpad export: prompt to open exported file"
project: "markpad"
keywords: [export, html, pdf, opener, dialog]
created: 2026-06-27T13:06:43+02:00
updated: 2026-06-27T13:06:43+02:00
status: in-progress
---

## Summary

Po udanym eksporcie do pliku Markpad ma zapytać użytkownika, czy otworzyć zapisany plik w domyślnej aplikacji systemu. Zakres implementacji obejmuje kontrolowany eksport HTML, bo aplikacja zna tam ścieżkę wybraną w dialogu `save`.

Obecny eksport PDF używa `window.print()`, czyli systemowego/webviewowego dialogu drukowania. Markpad nie dostaje z niego ścieżki zapisanego PDF ani informacji, czy użytkownik faktycznie zapisał plik, więc nie będę dodawał fałszywego promptu "otwórz PDF" bez pliku do otwarcia. Jeśli PDF zostanie później przebudowany na kontrolowany eksport z własnym wyborem ścieżki, użyje tego samego helpera.

## Mode

- brainstorming: off (użytkownik zażądał `plan i execute`, decyzje rozstrzygnięte inline)
- deep-code-verification: off
- test-execution: on
- plan-cove: off
- strategy-temper: off
- execution-cove: off

## Original Prompt

Ten eksport do pliku czy to pdf czy htm powinien się zapytać czy otworzyć ten plik i otworzyć go w domyślnej aplikacji systemu.

## Key Changes

1. Dodać testowalny helper frontendu, który pyta o otwarcie zapisanego pliku i otwiera go przez natywny opener systemu.
2. Podłączyć helper po udanym eksporcie HTML, po obecnej obsłudze ostrzeżeń o brakujących obrazkach.
3. Dodać komunikat błędu, jeśli systemowy opener nie otworzy pliku.
4. Udokumentować w kodzie/planie ograniczenie obecnego eksportu PDF: brak znanej ścieżki z `window.print()`.

## Test Plan

1. Najpierw dodać test jednostkowy/helperowy, który failuje przed implementacją.
2. Uruchomić nowy test i potwierdzić czerwony stan.
3. Po implementacji uruchomić nowy test oraz istniejące testy skryptowe związane z eksportem.
4. Uruchomić `npm run check`.
5. Jeśli weryfikacja przejdzie, zbudować standalone Windows x64 executable zgodnie z lokalnym oczekiwaniem projektu.

## Assumptions

- Nie zmieniam modelu eksportu PDF w tym zadaniu; pełna obsługa PDF wymaga osobnego kontrolowanego eksportera z docelową ścieżką pliku.
- Prompt po eksporcie HTML ma używać natywnego dialogu Tauri i domyślnej aplikacji systemu, nie własnego webowego okna.
- Zmiana ma być wieloplatformowa: bez Windows-only API, z użyciem Tauri opener.
