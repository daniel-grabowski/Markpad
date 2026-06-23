---
type: plan
name: open-tabs-list-and-tab-export-actions
title: "Lista otwartych kart, zwężanie kart i eksport z menu karty"
project: "markpad"
keywords: [tabs, export, ui]
created: 2026-06-23T16:48:05+02:00
updated: 2026-06-23T16:48:05+02:00
status: in-progress
---

## Summary

Dodajemy trzy usprawnienia pracy z kartami w Markpad: rozwijaną listę otwartych plików/kart, ustawienie pozwalające zwężać karty tak, aby mieściły się w dostępnym pasku, oraz akcje eksportu HTML/PDF w menu kontekstowym konkretnej karty.

## Key Changes

- W `TabList.svelte` dodać przycisk listy otwartych kart z dropdownem pokazującym tytuł, stan aktywny/brudny oraz ścieżkę, z możliwością przełączenia aktywnej karty.
- Dodać ustawienie `fitTabsToWidth` w `settings.svelte.ts`, używane przez pasek kart do przełączania między obecnym przewijaniem a trybem zwężania kart w widocznej szerokości.
- W `Tab.svelte` dodać klasy/układ dla zwężanych kart i dodać pozycje eksportu HTML/PDF do menu kontekstowego zakładki.
- Dodać małe testy logiki dla listy kart/akcji menu, bez dużego testu UI.
- Uzupełnić klucze tłumaczeń dla nowych etykiet w `i18n.ts`.

## Test Plan

- Dodać i uruchomić testy TypeScript dla helperów akcji/listy kart.
- Uruchomić istniejące testy związane z akcjami kart: `npx tsx --test scripts/tabFileActions.test.ts`.
- Uruchomić `npm run check`.
- Uruchomić `git diff --check`.

## Assumptions

- Lista otwartych plików ma być lekka i dostępna z paska kart jako dropdown, a nie jako nowy boczny panel.
- Tryb "karty mieszczą się na ekranie" będzie opcją globalną w ustawieniach i menu paska kart; domyślnie pozostanie wyłączony, żeby nie zmienić obecnego zachowania użytkownikom.
- Eksport z menu karty ma eksportować wskazaną kartę. Jeżeli użytkownik kliknie eksport na nieaktywnej karcie, karta zostanie najpierw aktywowana i zostanie wywołany istniejący mechanizm eksportu.
- Nie tworzymy nowego mechanizmu eksportu ani osobnych ścieżek zapisu; używamy istniejących komend/eventów aplikacji.

## Mode

- brainstorming: off, przyjęto bez dodatkowych pytań zgodnie z prośbą o plan i wykonanie.
- deep-code-verification: off, weryfikacja kodu wykonana lokalnie przez głównego agenta.
- test-execution: on.
- plan-cove: off.
- strategy-temper: off.
- execution-cove: off, zostaje finalny self-check i weryfikacja komend.
