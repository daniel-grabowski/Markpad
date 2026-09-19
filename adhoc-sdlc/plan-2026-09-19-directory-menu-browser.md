---
type: plan
name: directory-menu-browser
title: "Przeglądanie katalogów i plików w menu zakładki"
project: "markpad"
keywords: [directory-menu, browser, context-menu, tauri]
created: 2026-09-19T18:56:58+02:00
updated: 2026-09-19T18:56:58+02:00
status: in-progress
---

## Summary

Rozszerzyć podmenu „Pliki w katalogu” do dynamicznej przeglądarki drzewa katalogów. Katalogi będą otwierały kolejne, leniwie ładowane panele menu, a obsługiwane pliki zachowają obecne otwieranie: zwykła aktywacja w nowej karcie, Shift w karcie źródłowej.

## Original Prompt

$adhoc-sdlc:adhoc-sdlc plan rekomendowane opcje - temper - i execute\nfajne, dodaj dynamikę do tego menu pokazując katalogi i pozwalając na przeglądanie katalogów i plików w menu

## Key Changes

1. Zastąpić backendowy kontrakt „tylko pliki rodzeństwa” bezpiecznym listowaniem pojedynczego poziomu katalogu:
   - wejście zawiera ścieżkę dokumentu źródłowego oraz opcjonalny katalog potomny;
   - wynik rozróżnia plik i katalog;
   - backend kanonizuje ścieżki, ogranicza przeglądanie do katalogu dokumentu, pomija symlinki/junctions i wpisy nie-UTF-8;
   - frontend pozostaje źródłem prawdy dla obsługiwanych rozszerzeń plików.
2. Rozbudować logikę listy menu:
   - katalogi przed plikami, naturalne sortowanie bez rozróżniania wielkości liter;
   - bieżący dokument wykluczony na każdym poziomie;
   - katalogi widoczne nawet wtedy, gdy po otwarciu okażą się puste;
   - brak pozycji `..` i brak wyjścia powyżej katalogu dokumentu.
3. Przebudować `ContextMenu` na ogólną kaskadę osobnych paneli:
   - rekurencyjny model `children`/`loadChildren` i cache na czas jednego otwarcia menu;
   - stany loading/empty/error per katalog oraz możliwość ponowienia po błędzie;
   - osobna ścieżka otwartych gałęzi i ochrona przed spóźnionymi odpowiedziami async;
   - pomiar paneli i pozycjonowanie `fixed` z odwracaniem w lewo oraz korektą pionową przy krawędziach viewportu.
4. Dokończyć pełny kontrakt klawiatury/ARIA dla dowolnej głębokości:
   - góra/dół, Home/End w aktywnym panelu;
   - prawo/Enter otwiera katalog, lewo wraca o poziom;
   - Enter/Space aktywuje plik i przekazuje Shift;
   - Escape oraz Tab zamykają całość i przywracają właściwy fokus.
5. Zachować bezpieczny tor otwierania plików i semantykę zakładki źródłowej z poprzedniej funkcji. Nie zmieniać zachowania duplikatów ani ochrony niezapisanych zmian.
6. Po przejściu weryfikacji wykonać pełny Tauri Windows x64 release build, odświeżyć `release/windows/Markpad_2.6.11_x64.exe` oraz `SHA256SUMS.txt`.

## Test Plan

- Testy Rust: plik/katalog, tylko jeden poziom, pomijanie symlinków, blokada wyjścia poza katalog bazowy, brakujący katalog.
- Testy czystej logiki TypeScript: katalogi przed plikami, filtrowanie rozszerzeń tylko dla plików, wykluczenie dokumentu i naturalne sortowanie.
- Testy kontrolera kaskady: cache, współbieżne żądania, spóźniona odpowiedź po zamknięciu/zmianie gałęzi, retry po błędzie.
- Testy pozycjonowania panelu przy wszystkich krawędziach oraz dla wysokiej listy.
- Test wiring/kontraktu klawiatury na co najmniej trzech poziomach; ręczny smoke test ograniczony możliwościami środowiska Tauri.
- `npx -y tsx --test scripts/*.test.ts`, `npm run check`, `npm run build`, `cargo check --target x86_64-pc-windows-gnu` oraz możliwe testy Rust.
- Pełny build `npm run tauri build -- --runner cargo-xwin --target x86_64-pc-windows-msvc --no-bundle --ci`, kontrola PE32+, sumy SHA-256 i obecności nowego kontraktu w binarium.

## Assumptions

- „Przeglądanie katalogów” oznacza kaskadowe podmenu schodzące wyłącznie w dół od katalogu otwartego dokumentu; nie pokazujemy rodzica ani całego systemu plików.
- Katalogi są ładowane leniwie, po otwarciu gałęzi; nie wykonujemy kosztownego skanowania rekurencyjnego.
- Pokazujemy wszystkie zwykłe katalogi, ale tylko pliki obsługiwane przez obecny predykat Markpad (`.md`, `.markdown`, `.mdown`, `.mkd`, `.txt`).
- Symlinki i junctions nie są elementami przeglądarki, aby uniknąć cykli oraz wyjścia poza katalog bazowy.
- Użytkownik polecił użyć rekomendowanych opcji, Temper i od razu wykonać plan; nie ma otwartych decyzji wymagających zatrzymania.
- Runtime nie udostępnia natywnego trackera zadań. Za wcześniejszą zgodą użytkownika na obejście tej bramki checklista wykonania będzie utrzymywana inkrementalnie w dzienniku SDLC.

## Mode

- brainstorming: ON
- deep-code-verification: ON
- test-execution: ON
- plan-cove: ON
- strategy-temper: ON
- execution-cove: ON

## Tempered Risks

- Spóźniona odpowiedź katalogu A po przejściu do B mogłaby nadpisać widok -> loader jest związany z sesją menu i konkretną gałęzią; nieaktualne wyniki są ignorowane.
- Symlink/junction mógłby utworzyć cykl lub wyprowadzić poza korzeń -> backend nie zwraca symlinków i dodatkowo sprawdza kanoniczną ścieżkę żądanego katalogu względem kanonicznego katalogu dokumentu.
- Głębokie menu mogłoby mieszać fokus między panelami -> każdy panel ma własną listę elementów, indeks fokusu i relację rodzic-dziecko.
- Panel mógłby zostać obcięty przez przewijającego rodzica -> poziomy są osobnymi panelami `position: fixed`, mierzonymi i ograniczanymi do viewportu.
- Bardzo duże drzewo mogłoby zablokować UI -> backend zwraca zawsze jeden poziom, a każdy panel ma niezależne przewijanie.
- Błąd katalogu nie może zamknąć całego menu ani zatruć cache -> błąd jest stanem konkretnej gałęzi i pozwala na retry.
- Rozbudowa wspólnego menu mogłaby popsuć płaskie menu dokumentu/listy kart -> istniejące elementy bez dzieci zachowują niezmieniony kontrakt, a test wiring obejmie wszystkie użycia.

## Accepted Risks

- Brak pełnego automatycznego testu DOM w działającym WebView: repo nie ma Playwrighta ani frameworka testów komponentowych. Zachowanie zostanie pokryte testami czystej maszyny stanu/pozycjonowania, type-checkiem, buildem i dostępnym smoke testem.
