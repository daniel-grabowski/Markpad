---
type: handoff
name: ctrl-t-new-file-shortcut
title: "Markpad Ctrl+T fix and Windows exe release handoff"
project: "markpad"
keywords: [ctrl-t, new-file, windows, release]
created: 2026-06-24T11:27:21+02:00
updated: 2026-06-24T11:27:21+02:00
status: in-progress
---

## Goal

Domknąć i bezpiecznie przekazać pracę nad Markpad po naprawie skrótu Ctrl+T oraz po skorygowaniu artefaktu Windows release. Oczekiwany rezultat to poprawka w kodzie plus przenośny artefakt `release/windows/Markpad_2.6.11_x64.exe` jako pojedynczy plik exe do przekazania użytkownikowi, bez promowania instalatora NSIS.

## Current Progress

Zmieniono `src/lib/MarkdownViewer.svelte`: obsługa `Ctrl/Cmd+T` wywołuje teraz `handleNewFile()` zamiast `tabManager.addHomeTab()`. To odpowiada zachowaniu przycisku plus na toolbarze i usuwa objaw otwierania strony głównej ze spinnerem.

Powiązany plan z `pack --intent handoff`: `/home/dgrabowski/projects/Markpad/adhoc-sdlc/plan-2026-06-23-ctrl-t-new-file-shortcut.md`. Nie czytaj ręcznie plików `adhoc-sdlc/`; używaj helpera `pack` albo `/adhoc-sdlc:resume`.

Zbudowany i podmieniony artefakt release: `release/windows/Markpad_2.6.11_x64.exe`, rozmiar `12210176` bajtów, checksum w `release/windows/SHA256SUMS.txt`: `459db094b80c943a9677f95d2b9431083f428ef79fece43ccac28a8ef264c5bc`.

Ostatni poprawny build Windows powstał komendą:

```bash
npm run tauri build -- --runner cargo-xwin --target x86_64-pc-windows-msvc --no-bundle --ci
```

Weryfikacja wykonana w tej sesji:

- `npm run check` przeszło wcześniej: 0 errors, istniejące ostrzeżenia.
- `npm run build` przeszło wcześniej z istniejącymi ostrzeżeniami Vite/Svelte.
- Pełny `npm run tauri build -- --runner cargo-xwin --target x86_64-pc-windows-msvc --no-bundle --ci` zakończył się sukcesem i wskazał `src-tauri/target/x86_64-pc-windows-msvc/release/Markpad.exe`.
- `sha256sum -c SHA256SUMS.txt` przechodzi dla docelowego katalogu `release/windows`.
- `file release/windows/Markpad_2.6.11_x64.exe`: `PE32+ executable (GUI) x86-64, for MS Windows`.
- `objdump` nie znalazł importu `WebView2Loader.dll` ani `VCRUNTIME`.
- `strings` potwierdził obecność osadzonych assetów produkcyjnych Svelte/Tauri: `_app/immutable/entry/start...` i `_app/immutable/entry/app...`.

Aktualny worktree jest brudny celowo: zmieniony kod skrótu, zmieniony `release/windows/Markpad_2.6.11_x64.exe`, zmieniony `release/windows/SHA256SUMS.txt`, oraz pliki `adhoc-sdlc` z planem/journalem/handoffem. Nie commitowano.

## What Worked

Pełny Tauri CLI build z runnerem `cargo-xwin` jest właściwą ścieżką dla release exe w WSL:

```bash
npm run tauri build -- --runner cargo-xwin --target x86_64-pc-windows-msvc --no-bundle --ci
```

MSVC target linkuje WebView2 loader statycznie, więc nie powstaje wymóg dokładania `WebView2Loader.dll` obok release exe. Rozmiar poprawnego artefaktu wrócił do około 12 MB, co odróżnia go od błędnego 7 MB artefaktu z gołego Cargo.

Najprostsza poprawka skrótu była lokalna i spójna z istniejącym handlerem nowego pliku: `Ctrl/Cmd+T` powinien używać `handleNewFile()`.

## What Didn't Work

Nie powtarzać gołego:

```bash
cargo xwin build --release --target x86_64-pc-windows-msvc --bin Markpad
```

Ten wariant tworzy poprawny format PE, ale omija część pipeline Tauri. Powstał artefakt około 7.3 MB i użytkownik zgłosił realny błąd runtime: aplikacja próbowała wejść na `localhost`, co kończyło się `ERR_CONNECTION_REFUSED`.

Nie używać GNU Windows target jako finalnego "jednego exe". Build `x86_64-pc-windows-gnu` wymagał bocznego `WebView2Loader.dll`, więc nie spełniał oczekiwania użytkownika.

Nie forsować `RUSTFLAGS='-C target-feature=+crt-static'` z `cargo-xwin` w tym środowisku. Linker `lld-link` zgłaszał brakujące symbole CRT (`strlen`, `roundf`, `malloc`, `free`, itd.), zarówno przy `cdylib`, jak i przy samym binarnym targetcie po tymczasowym zdjęciu `cdylib`.

Nie traktować samej obecności stringa `http://localhost:1420` w binarce jako dowodu błędu. Tauri zapisuje w konfiguracji także `devUrl`; istotna różnica to pełny Tauri build z osadzonymi `_app/immutable/...` assetami i właściwym rozmiarem artefaktu.

Nie udało się uruchomić Windows GUI lokalnie pod WSL, bo `wine` nie jest zainstalowany.

## Next Steps

1. Na maszynie Windows uruchomić `release/windows/Markpad_2.6.11_x64.exe` i potwierdzić, że nie próbuje ładować `localhost:1420`.
2. W aplikacji sprawdzić ręcznie: `Ctrl+T` tworzy nową zakładkę/nowy plik, a `Ctrl+Shift+T` nadal działa jako przywracanie zamkniętej karty.
3. Sprawdzić przycisk plus na toolbarze jako kontrolę porównawczą zachowania nowego pliku.
4. Jeśli runtime Windows jest OK, przygotować commit obejmujący `src/lib/MarkdownViewer.svelte`, `release/windows/Markpad_2.6.11_x64.exe`, `release/windows/SHA256SUMS.txt` oraz właściwe pliki `adhoc-sdlc`.
5. Jeśli Windows nadal pokaże `localhost refused`, nie zgadywać: zebrać konkretny URL/stack/runtime log i porównać build z `src-tauri/target/x86_64-pc-windows-msvc/release/Markpad.exe` oraz docelowym `release/windows/Markpad_2.6.11_x64.exe`.

## Suggested Skills

adhoc-sdlc:resume, adhoc-sdlc:history, superpowers:systematic-debugging, superpowers:verification-before-completion, dev-modify
