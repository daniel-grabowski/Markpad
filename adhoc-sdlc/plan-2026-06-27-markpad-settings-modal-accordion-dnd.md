---
type: plan
name: markpad-settings-modal-accordion-dnd
title: "Markpad: modal settings, accordion toolbar settings, and stable toolbar drag"
project: "markpad"
keywords: [settings, modal, toolbar, accordion, drag-drop, tauri, svelte]
created: 2026-06-27T16:04:04+02:00
updated: 2026-06-27T16:04:04+02:00
status: in-progress
---

## Summary

Cel: poprawić okno ustawień Markpada tak, żeby zachowywało się jak modal, a ustawienia pasków narzędzi były bardziej przewidywalne i wygodne.

Zakres jest ograniczony do komponentu ustawień i istniejących testów statycznych/wiringowych. Nie zmieniam modelu danych ustawień pasków narzędzi ani sposobu renderowania samych pasków w aplikacji.

## Mode

- brainstorming: off
- deep-code-verification: off
- test-execution: on
- plan-cove: off
- strategy-temper: off
- execution-cove: on

## Original Prompt

$adhoc-sdlc plan i exec
Okno ustawień nie jest modelem, a powinno być to znaczy można kliknąć gdziekolwiek poza nim i ono znika. To tak nie może działać, to musi być okno modalne. 
Drag drop ustawień w ogóle nie działa, jest ten sam problem co na drag drop zakładek, to znaczy, że łapie i jest cały czas tu zablokowany. 
Ustawienia pasków narzędzi powinno być w accordion - Gdzie domyślne grupy są zwinięte, czyli pasek aplikacji i pasek edycji tekstu.

## Key Changes

1. Usunąć light-dismiss z okna ustawień: kliknięcie w tło nie może wywoływać `onclose`; zamykanie zostaje przez przycisk zamknięcia i Escape.
2. Zastąpić natywny HTML drag/drop w ustawieniach pasków narzędzi mechaniką opartą o ruch myszy/pointera i `elementFromPoint`, zgodną z działającym wzorcem z listy zakładek.
3. Ustawić przeciąganie tylko na uchwycie kolejności, żeby kliknięcia w checkboxy, placement i przyciski góra/dół nie zaczynały dragowania.
4. Przebudować sekcje "Application toolbar" i "Editor toolbar" na accordiony oparte o `<details>/<summary>`, bez atrybutu `open`, więc domyślnie zwinięte.
5. Zachować istniejące opcje: widoczność, pozycję akcji paska aplikacji, reset i przyciski góra/dół.

## Test Plan

1. Najpierw dopisać testy regresyjne w `scripts/toolbarCustomizationWiring.test.ts` i uruchomić je, żeby potwierdzić RED.
2. Po implementacji uruchomić test wiringowy dla toolbarów.
3. Uruchomić `npm run check`.
4. Uruchomić cały zestaw testów TypeScript w `scripts/*.test.ts`.
5. Uruchomić `npm run build` i sprawdzić log pod kątem ostrzeżeń oraz błędów.
6. Zbudować release Windows przez `cargo-xwin`, skopiować `Markpad.exe` do `release/windows/Markpad_2.6.11_x64.exe`, odświeżyć `SHA256SUMS.txt` i sprawdzić checksumę.
7. Uruchomić `git diff --check`.

## Assumptions

1. Modalność oznacza brak zamykania po kliknięciu poza oknem. Escape może nadal zamykać okno, bo to standardowe zachowanie modalnego dialogu desktopowego.
2. Tauri WebView daje nowoczesne API DOM potrzebne do `elementFromPoint`, pointer/mouse events i `<details>/<summary>`.
3. Brak frameworka E2E w repo oznacza, że regresję zabezpieczamy testami wiringowymi i pełnym buildem; ręczne sprawdzenie w Windows będzie możliwe na wygenerowanym artefakcie.
