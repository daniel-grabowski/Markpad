---
type: plan
name: markdown-link-navigation-history
title: "Markdown link navigation history and open in new tab"
project: "markpad"
keywords: [navigation, history, links, tabs]
created: 2026-06-23T14:12:08+02:00
updated: 2026-06-23T14:12:08+02:00
status: in-progress
---

## Summary

Uzupełnić nawigację po linkach Markdown tak, żeby działała jak lekka historia przeglądarki w obrębie pojedynczej karty oraz żeby link do lokalnego pliku Markdown dało się otworzyć w nowej karcie z menu kontekstowego.

To nie jest nowy router. Kod ma wykorzystać istniejący `TabManager.history/historyIndex`, `navigate`, `goBack` i `goForward`, ale naprawić inicjalizację historii, wystawić Back/Forward w UI i ujednolicić obsługę nawigacji z linków, myszy i klawiatury.

## Mode

- brainstorming: ON - zakres i semantyka zostały ustalone rozmową: historia per karta, UI Back/Forward, prawy klik linku lokalnego Markdown -> nowa karta.
- deep-code-verification: ON - sprawdzono kod lokalnie oraz przez read-only explorera.
- test-execution: ON - implementacja ma mieć testy logiki historii/linków oraz lokalne sprawdzenia projektu.
- plan-cove: OFF - fakty planu opierają się na bezpośrednim przeglądzie kodu i wyniku explorera.
- strategy-temper: ON - plan został zahartowany pod dirty-tab, brakujące pliki, cross-file anchors i granice linków zewnętrznych.
- execution-cove: OFF - przy wykonaniu wystarczą testy, build/check i końcowy self-check z journalem.

## Key Changes

- Naprawić inicjalizację historii w `TabManager.addTab(path, content = '')`: nowa karta z realnym `path` powinna startować z `history: [path]`, a nie z treścią/pustym stringiem.
- Uporządkować kontrakt `TabManager` tak, żeby historia przechowywała wyłącznie ścieżki plików, a nie treść dokumentu.
- W `MarkdownViewer.svelte` wydzielić jeden helper nawigacji historii, np. `navigateFileHistory(direction: 'back' | 'forward')`, używany przez:
  - przyciski Back/Forward w pasku tytułu,
  - skróty `Alt+Left` / `Alt+Right`,
  - istniejące przyciski myszy 4/5.
- Przed `goBack/goForward` dodać guard dirty-tab przez istniejące `canCloseTab(activeTabId)`, żeby cofanie nie kasowało niezapisanych zmian przez zmianę ścieżki i `isDirty = false`.
- Dodać do `TitleBar.svelte` dwie akcje Back/Forward z disabled state z `tabManager.canGoBack/canGoForward`; wizualnie potraktować je jak małe narzędziowe przyciski, nie nową sekcję aplikacji.
- Dodać do menu kontekstowego dokumentu pozycję `Open in New Tab` tylko wtedy, gdy prawy klik jest na linku do lokalnego pliku Markdown rozpoznanym przez istniejące `getRelativeMarkdownTarget`.
- Dodać helper otwierający lokalny Markdown target w nowej karcie:
  - rozwiązuje ścieżkę tak samo jak obecny klik linku,
  - tworzy nową kartę i ładuje plik w tej karcie,
  - nie przełącza istniejącej karty docelowej zamiast tworzyć nową,
  - obsługuje hash po załadowaniu pliku tak jak obecne `openRelativeMarkdownTarget`.
- Nie zmieniać zachowania linków zewnętrznych: zwykły klik nadal otwiera przez `openUrl`, prawy klik nie dostaje `Open in New Tab` dla URL-i zewnętrznych w tym zakresie.
- Uzupełnić EN/PL etykiety menu/UI, z fallbackiem EN dla pozostałych języków.

## Test Plan

- Dodać małe testy TypeScript dla czystych helperów historii/linków, najlepiej poza `src/` jeśli używają `node:test`, żeby nie wciągać typów Node do `svelte-check`.
- Testy minimalne:
  - `addTab('/a.md')` inicjuje historię jako `['/a.md']`.
  - `navigate('/b.md')` dopisuje historię i ucina forward stack.
  - `goBack/goForward` zwracają poprawne ścieżki i nie wychodzą poza zakres.
  - helper rozpoznawania pozycji menu linku zwraca `Open in New Tab` tylko dla lokalnych plików Markdown, nie dla `https://...`, `#anchor` i linków bez rozszerzenia Markdown.
- Uruchomić `npx tsx --test ...` dla nowych testów.
- Uruchomić `npm run check`.
- Uruchomić `npm run build` po zmianach UI.
- Jeżeli wykonanie dotknie backendu Tauri, uruchomić `cargo test` w `src-tauri`; w planowanym wariancie backend nie powinien się zmieniać.
- Ręczny smoke w aplikacji/Tauri:
  - otworzyć `samples/testfile.md`,
  - kliknąć lokalny link Markdown do innego pliku i wrócić Back,
  - przejść Forward,
  - prawym przyciskiem kliknąć lokalny link Markdown i otworzyć go w nowej karcie,
  - sprawdzić, że link zewnętrzny nadal otwiera się poza aplikacją.

## Assumptions

- Historia ma być per karta, nie globalna dla całego okna.
- Back/Forward dla historii plików ma używać `Alt+Left` / `Alt+Right`; istniejące skróty przełączania kart pozostają bez zmian.
- Historia przewijania w obrębie dokumentu może pozostać pierwsza dla przycisków myszy 4/5, ale UI Back/Forward w pasku powinno oznaczać historię plików, a nie historię scrolla.
- `Open in New Tab` dotyczy tylko lokalnych targetów Markdown rozpoznanych przez obecny mechanizm linków względnych/absolutnych.
- Link z pliku niezapisanego bez absolutnej ścieżki nie ma bazy do rozwiązywania ścieżki względnej, więc pozycja menu powinna być niedostępna albo pominięta.
- Brakujący target nie może zamknąć ani przepisać karty źródłowej; błędne ładowanie nowej karty powinno zostawić użytkownika w przewidywalnym stanie.

## Tempered Risks

- Obecne `addTab(path)` wkłada do historii pustą treść zamiast ścieżki -> Back może prowadzić do `''` albo błędnego stanu -> naprawić inicjalizację historii i dodać test.
- Obecne `goBack/goForward` zmieniają `path` i ustawiają `isDirty = false` bez pytania -> można utracić niezapisany stan przez mysz/UI -> helper historii musi najpierw wywołać `canCloseTab`.
- `loadMarkdown(resolved, { navigate: true })` zmienia ścieżkę aktywnej karty przed realnym odczytem pliku -> brakujący plik może zamknąć kartę źródłową -> dla nowej karty i historii trzeba ograniczyć skutki błędu oraz nie używać ślepo tego samego przepływu bez testu brakującego pliku.
- Otwieranie w nowej karcie przez zwykłe `loadMarkdown(resolved)` może przełączyć istniejącą kartę zamiast utworzyć nową -> helper new-tab musi wymusić utworzenie nowej karty i ładowanie w niej.
- Cross-file hash (`other.md#section`) może zgubić scroll po załadowaniu -> helper new-tab musi po pełnym load wywołać istniejące `scrollToAnchorWhenReady`.
- Mieszanie historii scrolla i historii plików w jednym przycisku UI byłoby nieczytelne -> przyciski paska dotyczą historii plików; historia scrolla zostaje tylko w obecnej obsłudze myszy.

## Accepted Risks

- W pierwszym zakresie nie dodajemy menu `Open External Link` ani `Copy Link` dla URL-i zewnętrznych -> to osobna funkcja, obecne kliknięcie zewnętrznego linku już działa przez `openUrl`.
- Nie robimy pełnej historii przeglądarkowej obejmującej anchor/scroll/file w jednym modelu -> istnieje lokalna historia scrolla i osobna historia plików, a scalenie byłoby większą zmianą architektoniczną.
