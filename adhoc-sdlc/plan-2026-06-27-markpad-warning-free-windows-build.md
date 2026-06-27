---
type: plan
name: markpad-warning-free-windows-build
title: "Markpad: warning-free Windows release build"
project: ""
keywords: []
created: 2026-06-27T14:25:12+02:00
updated: 2026-06-27T14:25:12+02:00
status: in-progress
---

## Summary

Po każdej zmianie funkcjonalnej Markpad musi dostać świeży Windows x64 portable EXE, bo to jest podstawowy sposób ręcznej weryfikacji na tej maszynie. Ten pakiet pracy domyka aktualną implementację przez:

- wyczyszczenie ostrzeżeń z frontendowego check/build;
- wykonanie Windows x64 no-bundle build przez cargo-xwin;
- skopiowanie artefaktu do `release/windows/Markpad_2.6.11_x64.exe`;
- odświeżenie `release/windows/SHA256SUMS.txt`.

Kryterium odbioru jest ostrzejsze niż wcześniej: komendy budujące mają mieć 0 błędów i 0 ostrzeżeń, nie tylko exit code 0.

## Mode

- brainstorming: off
- deep-code-verification: off
- test-execution: on
- plan-cove: off
- strategy-temper: off
- execution-cove: on

## Original Prompt

Zbudowac aplikacje pod Windows po zmianach i doprowadzic proces budowania do zera bledow oraz zera ostrzezen, bo Windows exe jest wymagane do sprawdzenia funkcji.

## Key Changes

1. Wyczyścić znane warningi Svelte/Vite bez zmiany zachowania UI:
   - a11y warnings w `Settings.svelte`, `TitleBar.svelte`, `ZoomOverlay.svelte`;
   - CSS compatibility warning dla number input;
   - dynamic import/static import conflicts dla Tauri API;
   - chunk-size warning przez jawne ustawienie limitu dla znanego ciężkiego bundle.

2. Zachować bieżące funkcje:
   - rozdzielone ustawienia toolbaru aplikacji i toolbaru edytora;
   - kontekstowe reguły globalnego toolbaru;
   - resizable Settings modal.

3. Zbudować Windows x64 portable release:
   - `npm run tauri build -- --runner cargo-xwin --target x86_64-pc-windows-msvc --no-bundle --ci`;
   - skopiować `src-tauri/target/x86_64-pc-windows-msvc/release/Markpad.exe` do `release/windows/Markpad_2.6.11_x64.exe`;
   - odświeżyć i sprawdzić `release/windows/SHA256SUMS.txt`.

## Test Plan

1. Uruchomić testy skryptowe:
   - `npx tsx --test scripts/*.test.ts`

2. Uruchomić frontend checks/build i zaakceptować tylko wynik bez warnings:
   - `npm run check`
   - `npm run build`

3. Uruchomić Windows build i zaakceptować tylko wynik bez warnings:
   - `npm run tauri build -- --runner cargo-xwin --target x86_64-pc-windows-msvc --no-bundle --ci`
   - `sha256sum -c SHA256SUMS.txt` w `release/windows`

4. Końcowy self-check:
   - `git diff --check`
   - potwierdzić, że docelowy exe istnieje i jest PE32+ x86-64.

## Assumptions

1. Domyślnym artefaktem jest portable Windows x64 EXE, nie instalator NSIS.
2. Nie zmieniamy `plugins.updater.pubkey`.
3. Linuxowe `cargo test` może nadal wymagać systemowego `pkg-config`, ale nie jest kryterium dla Windows release build w tej pracy.
4. Jeśli zewnętrzny tool wypisze ostrzeżenie mimo braku problemu w kodzie, traktujemy to jako blocker do rozwiązania albo jawnego wyciszenia w konfiguracji.
