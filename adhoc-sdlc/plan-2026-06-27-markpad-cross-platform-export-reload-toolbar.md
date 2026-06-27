---
type: plan
name: markpad-cross-platform-export-reload-toolbar
title: "Markpad cross-platform export, reload, and toolbar"
project: "markpad"
keywords: [export, html, images, frontmatter, reload, toolbar, cross-platform]
created: 2026-06-27T12:21:35+02:00
updated: 2026-06-27T12:42:27+02:00
status: done
---

## Summary

Implement the hardened Markpad plan for three user-visible areas:

1. Export HTML must be generated from a detached render of the source Markdown,
   not from the currently mounted preview DOM. Local images must be embedded as
   data URLs in standalone output, static frontmatter must render without live
   form controls, and local Markdown links must be rewritten to HTML.
2. Reload/Open must add a manual Reload from Disk command with dirty-state
   protection, F5 shortcut, and a preview-safe Ctrl/Cmd+O path. Existing
   single-instance bring-to-front behavior is treated as already implemented
   but covered by source regression checks.
3. The editor must expose a compact formatting toolbar while editing/split view
   is visible. Toolbar buttons delegate to Monaco editor actions instead of
   duplicating formatting logic in MarkdownViewer or TitleBar.

## Original Prompt

Implement hardened cross-platform plan for HTML export images/frontmatter/links, reload/open behavior, and editor toolbar.

## Key Changes

- Add test coverage first for export path/link/frontmatter helpers and for
  reload/open/toolbar integration anchors.
- Add a Rust Tauri command that reads a local file and returns a MIME-correct
  data URL for export embedding.
- Refactor frontend export into pure helper functions plus async DOM post
  processing for images and local Markdown links.
- Add manual reload hooks in the native menu, titlebar, keyboard handler, and
  MarkdownViewer flow.
- Add Monaco formatting actions plus an editor toolbar component that calls the
  editor instance.

## Test Plan

- Run targeted new Node tests red before implementation.
- Run `npx -y tsx --test scripts/*.test.ts` after implementation.
- Run `npm run check`.
- Run `cargo test` in `src-tauri` if the local WSL dependencies permit it.
- Run Windows release-oriented build and copy the standalone exe to
  `release/windows/Markpad_2.6.11_x64.exe` when successful.

## Assumptions

- No recursive multi-document export is implemented in this iteration.
- Remote HTTP(S) and existing `data:` image URLs remain unchanged in exported
  HTML.
- macOS native File/Open remains the primary Cmd+O path; the frontend handler
  covers Windows/Linux preview contexts.
- Cross-platform runtime proof for macOS/Linux relies on existing CI matrix
  unless separately run on those systems.
