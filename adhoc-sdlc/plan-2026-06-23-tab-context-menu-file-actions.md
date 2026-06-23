---
type: plan
name: tab-context-menu-file-actions
title: "Tab context menu file actions"
project: ""
keywords: []
created: 2026-06-23T12:55:43+02:00
updated: 2026-06-23T12:55:43+02:00
status: in-progress
---

## Summary

Dodaję do menu kontekstowego karty pliku dwie akcje: kopiowanie pełnej ścieżki pliku do schowka oraz otwarcie lokalizacji pliku w systemowym eksploratorze.

## Mode

- brainstorming: OFF - wymaganie jest konkretne, warianty są niskiego ryzyka.
- deep-code-verification: OFF - lokalnie zweryfikowałem właścicielskie pliki bez subagenta.
- test-execution: ON - uruchomię dostępne sprawdzenia projektu i mały test logiki menu, jeśli środowisko pozwoli.
- plan-cove: OFF - plan opiera się na bezpośrednio sprawdzonych plikach.
- strategy-temper: OFF - brak migracji, danych lub zmian architektury.
- execution-cove: OFF - końcowy self-check będzie oparty o diff, journal i komendy weryfikacyjne.

## Key Changes

- Dodać helper budujący akcje zależne od ścieżki pliku, żeby logika była możliwa do sprawdzenia poza komponentem Svelte.
- Rozszerzyć `Tab.svelte` o pozycje `Copy Full Path` i `Open File Location` w menu kontekstowym karty.
- Wyłączyć nowe pozycje dla kart bez prawdziwej ścieżki (`''`, `HOME`).
- Uzupełnić tłumaczenia dla nowych etykiet co najmniej w EN/PL, z fallbackiem EN dla pozostałych języków.

## Test Plan

- Najpierw dodać test helpera menu, uruchomić go i potwierdzić oczekiwany błąd przed implementacją.
- Po implementacji uruchomić test helpera ponownie.
- Uruchomić `npm run check`.
- Jeśli zmiany dotkną Rust, uruchomić `cargo test` w `src-tauri`; w aktualnym planie Rust nie powinien się zmienić.

## Assumptions

- Istniejące komendy Tauri `clipboard_write_text` i `open_file_folder` są właściwym mechanizmem dla tych akcji.
- `open_file_folder` przyjmuje pełną ścieżkę pliku i używa `opener::reveal`, czyli pokazuje lokalizację wskazanego pliku.
- Karta z `path === ''` jest nowym/niezapisanym plikiem, a `path === 'HOME'` jest kartą startową, więc nie ma ścieżki do kopiowania ani katalogu do otwarcia.
