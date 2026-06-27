---
type: plan
name: markpad-settings-modal-resize-close-bug
title: "Markpad: fix settings modal resize and accidental close"
project: ""
keywords: []
created: 2026-06-27T15:22:23+02:00
updated: 2026-06-27T15:22:23+02:00
status: in-progress
---

## Summary

Naprawić zachowanie okna ustawień po ostatnim dodaniu resizable modal. Aktualnie modal ma natywne CSS `resize: both`, jest centrowany przez backdrop flexbox i dlatego podczas resize wygląda, jakby rozszerzał się jako całość. Dodatkowo klik generowany po przeciąganiu może zostać obsłużony przez backdrop light-dismiss i zamknąć ustawienia po puszczeniu myszy.

## Original Prompt

$adhoc-sdlc plan i exec
Okienku ustawień. Generalnie jakoś dziwnie się rozszerza tak jak ja bym ciągnął w jakąś tam stronę lewy czy dolny róg tak to to się rozszerza jako całość dziwnie to wygląda. Poza tym jak puszczę mysz to znika. Okno ustawień znika.

## Key Changes

1. Zastąpić natywne `resize: both` dedykowanym uchwytem resize w prawym dolnym rogu modala.
2. Podczas przeciągania zamrozić pozycję top-left modala i zmieniać tylko szerokość/wysokość, z tymi samymi limitami min/max względem viewportu.
3. Zabezpieczyć backdrop click tak, aby klik po zakończeniu resize nie zamykał ustawień.
4. Zaktualizować test źródłowy ustawień, żeby wykrywał dedykowany uchwyt resize i brak natywnego `resize: both`.
5. Odświeżyć Windows portable exe, bo w tym projekcie wynik ma być możliwy do sprawdzenia na Windows.

## Test Plan

1. `npm run check` musi zakończyć się z `0 errors` i `0 warnings`.
2. `npx tsx --test scripts/*.test.ts` musi przejść komplet testów.
3. `npm run build` musi zakończyć się bez warning/error w logu.
4. Windows build: `npm run tauri build -- --runner cargo-xwin --target x86_64-pc-windows-msvc --no-bundle --ci` musi zakończyć się bez warning/error w logu.
5. Odświeżyć `release/windows/Markpad_2.6.11_x64.exe` oraz `release/windows/SHA256SUMS.txt` i zweryfikować checksum.

## Assumptions

Mode:
- brainstorming: off
- deep-code-verification: off
- test-execution: on
- plan-cove: off
- strategy-temper: off
- execution-cove: on

Założenia:
- Nie przebudowuję całego systemu modal/dialog na natywny `<dialog>`, bo to byłby większy refactor. Obecny komponent ma własny focus trap i backdrop light-dismiss; poprawka ma być lokalna.
- Uchwyt resize działa z dolnego prawego rogu. Nie dodaję przeciągania okna ani resize z każdej krawędzi.
- Rozmiar modala nie musi być trwale zapisywany w ustawieniach; celem jest poprawne zachowanie w aktualnie otwartym oknie.
