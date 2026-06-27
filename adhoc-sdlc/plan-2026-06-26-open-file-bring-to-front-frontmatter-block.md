---
type: plan
name: open-file-bring-to-front-frontmatter-block
title: "Markpad: bring-to-front przy otwieraniu plikow i blok front matter"
project: "markpad"
keywords: [tauri, focus, frontmatter, markdown, obsidian]
created: 2026-06-26T19:23:47+02:00
updated: 2026-06-26T19:23:47+02:00
status: in-progress
---

## Summary

Cel: poprawić dwa zachowania Markpada bez przebudowy całego pipeline'u renderowania Markdown.

1. Gdy plik jest otwierany przez skojarzenie `.md`, dwuklik albo kolejne uruchomienie aplikacji z argumentem pliku, główne okno ma zostać pokazane, odminimalizowane i przeniesione na pierwszy plan przed/razem z załadowaniem pliku. Samo `set_focus()` nie wystarcza, bo obecnie ścieżka single-instance emituje `file-path` i wywołuje tylko focus (`src-tauri/src/lib.rs:861-888`), a ścieżka macOS `Opened` robi analogicznie tylko `emit` + `set_focus()` (`src-tauri/src/lib.rs:1157-1170`).
2. YAML front matter na początku dokumentu ma być renderowany jako blok metadanych w stylu Obsidian: czytelny podgląd pól, elegancka edycja wartości i możliwość zwinięcia do jednej linii. Nie może trafiać do TOC ani zachowywać się jak seria nagłówków dokumentu.

Implementacja powinna trzymać się istniejących granic: Rust obsługuje okno i komendy Tauri, a frontendowy `processMarkdownHtml()` odpowiada za przekształcenia DOM podglądu po konwersji Markdown (`src/lib/utils/markdown.ts:480-730`). Edycja metadanych powinna aktualizować `rawContent` aktywnej karty, tak jak inne interakcje edycyjne, żeby istniejący mechanizm dirty/save/autosave dalej działał.

## Original Prompt

Problem 1: kiedy Markpad laduje plik przez skojarzenie .md / dwuklik, aplikacja ma zawsze pokazac okno i przeniesc je na pierwszy plan, takze gdy jest zwinieta lub ukryta. Problem 2: YAML front matter na poczatku planow ma nie renderowac sie jako sciana naglowkow; ma byc renderowany jak blok metadanych w stylu Obsidian, z eleganckim podgladem, edycja i zwijaniem do jednej linii.

## Key Changes

1. Dodać w `src-tauri/src/lib.rs` mały helper aktywacji głównego okna, używany we wszystkich wejściach pliku:
   - pobrać `main` przez `get_webview_window("main")`,
   - wykonać co najmniej `show()`, `unminimize()` i `set_focus()`,
   - ignorować pojedyncze błędy tak jak obecny kod, ale bez paniki na brak okna tam, gdzie można bezpiecznie użyć `if let Some(window)`.
2. Podmienić rozproszone aktywacje okna:
   - callback `tauri_plugin_single_instance` po `emit("file-path", ...)`,
   - `RunEvent::Opened` na macOS po `emit("file-path", ...)`,
   - startup z argumentem pliku w `setup`,
   - komendę `show_window`, aby robiła pełne bring-to-front, nie tylko `show()`.
3. Wydzielić logikę front matter do osobnego modułu frontendowego, np. `src/lib/utils/frontMatter.ts`:
   - rozpoznawać tylko blok YAML od pierwszej linii dokumentu, ograniczony `---` ... `---`;
   - parsować YAML strukturalnie, nie ręcznie po dwukropkach; jeśli będzie dodana zależność, preferować lekkie `yaml`;
   - zwracać zakres znaków/linii, oryginalny tekst front matter, sparsowane pola i informację o błędzie parsowania.
4. Zmienić renderowanie Markdown tak, aby front matter nie był wysyłany do Comrak jako zwykły Markdown:
   - przy renderze wykrywać i usunąć front matter z treści przekazywanej do `render_markdown` / `open_markdown_preview` albo po konwersji zastąpić wynik pierwszego bloku kontrolowanym HTML-em; preferowane jest usunięcie przed konwersją, bo eliminuje fałszywe nagłówki i wpisy TOC;
   - do podglądu dokleić semantyczny blok `<section class="frontmatter-panel">` przed właściwym HTML dokumentu.
5. Dodać UI bloku front matter w `MarkdownViewer.svelte`:
   - nagłówek jednej linii: etykieta typu `Properties`, licznik pól i chevron;
   - zwinięcie do jednej linii, przechowywane per karta albo per plik w stanie frontendowym;
   - tabela/lista pól w stylu Obsidian, z etykietami po lewej i wartościami po prawej;
   - edycja wartości top-level: string/number/bool/date jako input, lista jako edytowalna lista/tagi albo textarea, obiekty zagnieżdżone jako read-only/raw na start;
   - zapis edycji przez złożenie nowego front matter i `tabManager.updateTabRawContent(...)`, a potem ponowne renderowanie podglądu.
6. Dodać style w `src/styles.css`, korzystając z istniejących tokenów i wzorców zwijania/calloutów (`.foldable-content-wrapper`, `.markdown-alert`) zamiast nowej palety lub osobnej dekoracyjnej karty.
7. Zachować tryb raw:
   - w edytorze Monaco front matter nadal jest zwykłym tekstem pliku;
   - UI podglądu nie ukrywa błędów YAML: jeśli parsowanie się nie uda, pokazuje kompaktowy komunikat i pozwala wrócić do ręcznej edycji w edytorze.

## Test Plan

1. Testy logiki front matter:
   - dodać `scripts/frontMatter.test.ts` na `node:test`;
   - przypadki: brak front matter, poprawny blok z polami z przykładu `adhoc-sdlc`, pusta lista, wartości z cudzysłowami, błędny YAML, `---` występujące później w dokumencie, front matter z CRLF;
   - test aktualizacji wartości i zachowania reszty dokumentu bez zmian.
2. Testy istniejącej aplikacji frontendowej:
   - `npm run check`;
   - uruchomić testy skryptowe w `scripts/*.test.ts` zgodnie z lokalnym wzorcem, np. `node --test scripts/*.test.ts` jeśli obecny setup je obsługuje.
3. Testy Rust/Tauri:
   - `cd src-tauri && cargo check`;
   - `cd src-tauri && cargo test`.
4. Smoke ręczny/UI:
   - uruchomić `npm run tauri dev`, otworzyć plik z front matter podobny do planu `adhoc-sdlc`;
   - sprawdzić, że front matter nie tworzy nagłówków/TOC, blok jest czytelny, zwija się do jednej linii, edycja pola zmienia surowy Markdown i oznacza kartę jako dirty;
   - sprawdzić plik z błędnym YAML i plik bez front matter.
5. Smoke bring-to-front:
   - na dostępnej platformie uruchomić aplikację, zminimalizować/ukryć okno i otworzyć plik Markdown z zewnątrz;
   - potwierdzić, że aktywne okno jest pokazane i plik trafia do właściwej karty;
   - jeśli środowisko nie pozwala wiarygodnie sprawdzić skojarzenia `.md`, odnotować to w journalu i zweryfikować przynajmniej ścieżkę argumentu/single-instance tam, gdzie da się ją uruchomić.

## Assumptions

1. Zakres front matter to YAML tylko na samym początku dokumentu. Bloki `---` w środku Markdown nie są metadanymi.
2. Pierwsza wersja edycji obsługuje top-level YAML properties. Zagnieżdżone obiekty mogą być pokazane jako read-only/raw, żeby nie udawać pełnego Obsidian Properties.
3. Do edycji strukturalnego YAML można dodać małą zależność frontendową, jeśli lokalny parser ręczny groziłby utratą danych lub błędnym zapisem.
4. Bring-to-front ma być best-effort na każdej platformie. Windows jest najważniejszy dla skojarzenia `.md`, ale ścieżki Linux/macOS nie powinny regresować.
5. Nie zmieniamy formatu plików użytkownika poza świadomą edycją front matter przez użytkownika.

## Mode

- brainstorming: OFF
- deep-code-verification: OFF
- test-execution: ON
- plan-cove: ON
- strategy-temper: ON
- execution-cove: ON

## Plan CoVe

- Sprawdzone: `tauri-plugin-single-instance` już odbiera kolejne uruchomienia i emituje `file-path`, ale nie pokazuje/odminimalizowuje okna przed `set_focus()`.
- Sprawdzone: frontend słucha `file-path` i wywołuje `loadMarkdown(filePath)`, więc fix okna nie wymaga zmiany kontraktu eventu.
- Sprawdzone: render po stronie frontendowej przechodzi przez `processMarkdownHtml()`, gdzie już istnieją transformacje calloutów, tasków i zwijanych nagłówków.
- Sprawdzone: Tauri 2.10.2 ma metody `show()`, `unminimize()` i `set_focus()` na `Window`/`WebviewWindow` w lokalnym cache crate.
- Niepotwierdzone przed implementacją: dokładne zachowanie focus stealing na Windows przy skojarzeniu pliku zależy od systemu i musi być zweryfikowane smoke testem.

## Tempered Risks

- Okno zminimalizowane lub ukryte -> samo `set_focus()` nie pokazuje aplikacji -> użytkownik nie widzi załadowanego pliku -> helper musi wykonywać `show()` i `unminimize()` przed `set_focus()`.
- Front matter wysłany do Comrak jako Markdown -> pola YAML stają się nagłówkami i trafiają do TOC -> front matter trzeba wykryć przed budową HTML dokumentu albo usunąć z HTML zanim powstaną foldable headings.
- Edycja YAML przez ad hoc split po `:` -> utrata cudzysłowów, list, dat albo komentarzy -> użyć parsera YAML i jasno ograniczyć edycję nietypowych struktur.
- Błędny YAML -> panel edycji mógłby zapisać uszkodzony dokument -> przy błędzie parsowania pokazać bezpieczny komunikat i nie oferować strukturalnego zapisu.
- Zmiana `rawContent` z panelu -> łatwo ominąć dirty/autosave -> użyć istniejącego mechanizmu aktualizacji karty i renderu, nie osobnej ścieżki zapisu pliku.

## Accepted Risks

- Pełna zgodność z Obsidian Properties nie jest celem pierwszej iteracji, bo wymagałaby osobnych typów pól, aliasów, walidacji i zachowania komentarzy YAML. Akceptowany zakres to praktyczny, czytelny blok metadanych z edycją top-level wartości.
- Bring-to-front pozostaje częściowo zależny od polityk OS/window managera. Kod ma wykonać komplet dostępnych akcji Tauri, a wynik potwierdzić smoke testem na realnym środowisku.
