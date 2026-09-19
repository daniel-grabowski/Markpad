---
type: plan
name: tab-directory-files-submenu
title: "Dynamiczne podmenu plików katalogu w menu zakładki"
project: "markpad"
keywords: [context-menu, directory-files, tabs, shift-click]
created: 2026-09-19T18:14:28+02:00
updated: 2026-09-19T18:14:28+02:00
status: in-progress
---

## Summary

Dodać do menu kontekstowego konkretnej zakładki zagnieżdżone podmenu „Pliki w katalogu”, budowane przy każdym otwarciu menu z bezpośrednich plików sąsiadujących z dokumentem tej zakładki. Lista obejmie formaty `.md`, `.markdown`, `.mdown`, `.mkd` i `.txt`, pominie bieżący dokument, a wybór pliku zawsze dopuści duplikaty: zwykła aktywacja otworzy nową kartę, natomiast aktywacja z Shiftem bezpiecznie zastąpi kartę źródłową.

## Original Prompt

dodaj do popup menu menu zalezne ktore w katalogu twartego dokumentu bedzie budowal dynamicznie na odstawie zawartosci plikow ktore markpad moze otworzyc. klikniecie na ement otwiera ten plik w nowej karcie. z wciśniętym shift (jesli dostepny skrot) otwiera w biezacej karcie

## Key Changes

1. **Ujednolicić kontrakt obsługiwanych plików i przygotowanie listy.** Wyeksportować współdzielony zestaw rozszerzeń/predykat z warstwy narzędziowej zamiast tworzyć kolejną lokalną kopię. Dodać czyste funkcje TypeScript, które filtrują wpisy do obsługiwanych plików, wykluczają ścieżkę dokumentu źródłowego z uwzględnieniem normalizacji Windows/UNC oraz sortują nazwy naturalnie (`numeric`, bez rozróżniania wielkości liter).
2. **Dodać bezpieczne listowanie plików rodzeństwa po stronie Tauri.** W `src-tauri/src/lib.rs` dodać typowaną komendę przyjmującą ścieżkę dokumentu, wyznaczającą katalog przez `Path::parent()` i zwracającą `{ name, path }` wyłącznie dla bezpośrednich plików. Pominąć katalogi oraz nazwy/ścieżki niemożliwe do bezstratnej reprezentacji; zarejestrować komendę bez zmiany istniejących uprawnień.
3. **Rozszerzyć wspólny komponent menu o prawdziwe podmenu.** `ContextMenuItem` otrzyma dzieci i callback aktywacji z informacją o modyfikatorach. `ContextMenu.svelte` ma zachować zgodność z obecnymi płaskimi użyciami, a dla zagnieżdżenia zapewnić role `menu`/`menuitem`, roving focus, Up/Down, Home/End, Right/Left, Enter/Space, Escape, hover, `aria-haspopup`/`aria-expanded`, powrót fokusu, odwracanie podmenu przy krawędzi oraz ograniczenie wysokości z przewijaniem. Shift ma działać zarówno dla kliknięcia, jak i Shift+Enter/Space.
4. **Zbudować dynamiczne podmenu dla zakładki klikniętej prawym przyciskiem.** `Tab.svelte` zapisze snapshot `tab.id` i `tab.path`, pokaże stan ładowania, wywoła nową komendę i zaktualizuje wyłącznie nadal otwarte, odpowiadające temu samemu żądaniu menu. Dla `HOME`, niezapisanej karty lub braku poprawnego katalogu podmenu będzie nieaktywne. Pusta lista i błąd odczytu dostaną osobne, nieaktywne komunikaty. Lista będzie odbudowywana przy każdym otwarciu menu, bez obserwatora katalogu.
5. **Obsłużyć otwieranie w warstwie właściciela kart.** `Tab.svelte` przekaże `sourceTabId`, pełną ścieżkę i tryb wynikający z Shifta do `MarkdownViewer.svelte`. Zwykła aktywacja zawsze utworzy nową, aktywną kartę — także dla pliku już otwartego. Shift najpierw przygotuje docelowy odczyt, następnie użyje istniejącej ochrony `canCloseTab(sourceTabId)` i dopiero po zgodzie atomowo zastąpi wskazaną kartę oraz ją aktywuje. Anulowanie lub błąd odczytu nie może zmienić źródłowej karty, utracić bufora ani pozostawić pustej nowej karty; powodzenie zachowa istniejącą semantykę historii, ostatnich plików, trybu edycji i watchera.
6. **Dodać teksty interfejsu.** Uzupełnić `i18n.ts` we wszystkich obsługiwanych językach o etykietę podmenu oraz stany ładowania, pustej listy i błędu, zgodnie z istniejącą strukturą tłumaczeń.

## Test Plan

- Dodać testy czystej logiki TypeScript: dozwolone rozszerzenia (również wielkie litery), odrzucanie katalogów/niewspieranych wpisów, wykluczenie źródła przy różnych separatorach i wielkości liter na Windows, naturalne sortowanie oraz mapowanie zwykłej aktywacji i Shifta na tryb otwarcia.
- Dodać testy Rust dla listowania plików rodzeństwa: pliki i podkatalogi, ścieżka w katalogu głównym, nazwy nie-UTF-8 tam, gdzie platforma na to pozwala, oraz brakujący/niedostępny katalog.
- Dodać lekki test wiring sprawdzający, że menu zakładki przekazuje identyfikator zakładki i modyfikator, a obsługa otwierania nadal przechodzi przez ochronę niezapisanych zmian.
- Uruchomić testy skryptowe przez dostępny runner TypeScript (`npx tsx --test scripts/*.test.ts` albo równoważny działający wariant w tym repozytorium), `npm run check`, `npm run build` oraz `cargo test --manifest-path src-tauri/Cargo.toml`.
- W działającej aplikacji Tauri sprawdzić wskaźnikiem i klawiaturą: menu zakładki aktywnej i nieaktywnej, zwykłe otwarcie, Shift+klik i Shift+Enter, Save/Discard/Cancel dla brudnej karty, duplikaty już otwartego pliku, pusty/duży katalog, plik usunięty po zbudowaniu menu oraz pozycjonowanie przy każdej krawędzi okna.

## Assumptions

- „Katalog otwartego dokumentu” oznacza katalog dokumentu zakładki klikniętej prawym przyciskiem, nawet jeśli nie jest ona aktywna; Shift zastępuje tę samą zakładkę, a pomyślnie otwarty cel staje się aktywny.
- Zakres jest płaski: wyłącznie pliki bezpośrednio w tym katalogu, bez rekursji i bez prezentowania podkatalogów.
- Obsługiwane w podmenu formaty to `.md`, `.markdown`, `.mdown`, `.mkd` i `.txt`; opcja „All Files” z dialogu systemowego nie jest traktowana jako deklaracja obsługi dowolnego pliku.
- Bieżący dokument jest ukryty na liście. Inne już otwarte pliki nie są deduplikowane, zgodnie z decyzją użytkownika.
- Brak odświeżania menu na żywo jest świadomym ograniczeniem: zawartość jest aktualizowana przy kolejnym otwarciu menu.
- Implementacja nie dodaje biblioteki pozycjonującej ani polyfilli; wykorzystuje istniejący model stałopozycyjnego menu i obliczenia względem viewportu, odpowiednie dla kontrolowanego WebView Tauri.

## Mode

- brainstorming: ON
- deep-code-verification: ON
- test-execution: ON
- plan-cove: ON
- strategy-temper: ON
- execution-cove: ON

## Tempered Risks

- Wynik wolnego listowania wraca po zamknięciu menu lub dla innej zakładki -> identyfikator żądania i snapshot `tab.id`/`path` blokują zastosowanie nieaktualnej odpowiedzi.
- Docelowy plik znika albo staje się nieczytelny po zbudowaniu listy -> otwarcie raportuje błąd i nie modyfikuje źródłowej karty ani nie zostawia osieroconej nowej karty.
- Shift zastępuje brudną kartę, a późniejszy krok zawodzi -> odczyt docelowy jest przygotowany przed potwierdzeniem zamknięcia, a commit stanu karty następuje dopiero po sukcesie i zgodzie użytkownika.
- Katalog zawiera setki plików lub menu otwiera się przy krawędzi -> podmenu ma limit wysokości, przewijanie oraz wybór strony na podstawie dostępnego viewportu.
- Ta sama ścieżka ma inną pisownię separatorów lub wielkości liter -> wykluczenie bieżącego dokumentu używa istniejącej normalizacji ścieżek zależnej od systemu.
- Dodanie zagnieżdżenia psuje menu dokumentu lub pustej części paska kart -> nowy kontrakt jest opcjonalny i objęty testem kompatybilności istniejących elementów płaskich.

## Accepted Risks

- Lista może zdezaktualizować się już po poprawnym zbudowaniu, ponieważ katalog nie jest obserwowany. Ryzyko jest akceptowalne: menu jest krótkotrwałe, a kliknięcie wykonuje ponowny odczyt i bezpiecznie obsługuje brak pliku.
