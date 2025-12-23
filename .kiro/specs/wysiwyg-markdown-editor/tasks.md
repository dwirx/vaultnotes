# Implementation Plan: WYSIWYG Markdown Editor

## Overview

Implementasi WYSIWYG editor menggunakan Tiptap untuk menggantikan textarea di NoteEditor. Editor akan mendukung markdown shortcuts dan menyimpan data sebagai markdown string.

## Tasks

- [x] 1. Install Tiptap dependencies
  - Install `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/pm`
  - Install `tiptap-markdown` untuk markdown import/export
  - Install `@tiptap/extension-placeholder` untuk placeholder text
  - _Requirements: 1.1, 2.1-2.10_

- [x] 2. Create TiptapEditor component
  - [x] 2.1 Create base TiptapEditor component with useEditor hook
    - Create `src/components/TiptapEditor.tsx`
    - Configure StarterKit with heading levels 1-3, lists, blockquote, code
    - Configure Markdown extension for import/export
    - Configure Placeholder extension
    - _Requirements: 1.1, 1.3, 2.1-2.10, 6.1-6.3_

  - [x] 2.2 Add markdown import/export functions
    - Implement `setMarkdownContent` to load markdown into editor
    - Implement `getMarkdownContent` to export editor content as markdown
    - _Requirements: 1.2, 3.1, 3.2_

  - [ ]* 2.3 Write property test for markdown round-trip
    - **Property 1: Markdown Round-Trip Consistency**
    - **Validates: Requirements 1.2, 3.1, 3.2, 3.4**

- [x] 3. Add ProseMirror styling
  - Create CSS styles for `.ProseMirror` class
  - Style headings (h1, h2, h3) with appropriate sizes
  - Style lists (bullet and numbered)
  - Style blockquotes with left border
  - Style code blocks and inline code
  - Ensure comfortable padding and line-height
  - _Requirements: 5.1, 5.5_

- [x] 4. Refactor NoteEditor to use TiptapEditor
  - [x] 4.1 Replace textarea with TiptapEditor component
    - Remove textarea element
    - Add TiptapEditor with content prop from note
    - Wire onChange to autosave logic
    - _Requirements: 1.4, 4.1_

  - [x] 4.2 Implement autosave with debounce
    - Use existing 500ms debounce pattern
    - Update save status indicators (Saving..., Saved)
    - Handle save errors with toast
    - _Requirements: 4.1-4.4_

  - [ ]* 4.3 Write property test for search compatibility
    - **Property 2: Search Compatibility**
    - **Validates: Requirements 3.3**

- [x] 5. Implement View Source feature
  - [x] 5.1 Add MarkdownSourceDialog component
    - Create dialog to display raw markdown
    - Add copy to clipboard button
    - _Requirements: 7.2, 7.3_

  - [x] 5.2 Add View Source menu option
    - Add "View Source" or "Copy Markdown" to existing menu
    - Wire to open MarkdownSourceDialog
    - _Requirements: 7.1_

- [x] 6. Responsive layout adjustments
  - Ensure max-width container on desktop
  - Ensure full-width on mobile
  - Test caret positioning with heading changes
  - _Requirements: 5.2, 5.3, 5.4_

- [x] 7. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
