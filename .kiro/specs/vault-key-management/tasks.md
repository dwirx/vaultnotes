# Implementation Plan: Vault Key Management

## Overview

Implementasi fitur copy dan download vault key pada Account Dialog menggunakan React + TypeScript dengan shadcn/ui components.

## Tasks

- [x] 1. Create utility functions for vault key operations
  - [x] 1.1 Create `generateVaultKeyFileContent()` function in `src/lib/vault-utils.ts`
    - Generate formatted text content with vault ID, vault key, and security warning
    - Include timestamp in the output
    - _Requirements: 2.1, 2.2, 2.5_
  - [x] 1.2 Create `downloadTextFile()` function
    - Use Blob and URL.createObjectURL for file download
    - Generate filename with format `vault-key-{vaultId-prefix}.txt`
    - _Requirements: 2.3_
  - [ ]* 1.3 Write property test for file content completeness
    - **Property 3: Download File Content Completeness**
    - **Validates: Requirements 2.1, 2.2, 2.5**
  - [ ]* 1.4 Write property test for filename format
    - **Property 4: Download Filename Format**
    - **Validates: Requirements 2.3**

- [x] 2. Create AccountDialog component
  - [x] 2.1 Create `src/components/AccountDialog.tsx` component
    - Use shadcn Dialog component as base
    - Display vault ID and vault key with monospace font
    - Add security warning message
    - _Requirements: 3.1, 3.4_
  - [x] 2.2 Implement copy functionality with visual feedback
    - Add copy button with Copy/Check icons
    - Show checkmark for 2 seconds after successful copy
    - Show toast notification on success/error
    - _Requirements: 1.1, 1.2, 1.3, 1.4_
  - [x] 2.3 Implement download functionality
    - Add download button with Download icon
    - Trigger file download on click
    - Show toast notification on success
    - _Requirements: 2.1, 2.3, 2.4_
  - [ ]* 2.4 Write property test for visual feedback state transition
    - **Property 2: Visual Feedback State Transition**
    - **Validates: Requirements 1.2**

- [x] 3. Integrate AccountDialog into Vault page
  - [x] 3.1 Add user icon button to Vault header
    - Replace or add to existing header actions
    - Use User icon from lucide-react
    - _Requirements: 3.5_
  - [x] 3.2 Wire up AccountDialog with vault context
    - Pass vaultId, vaultKey from useVault hook
    - Handle sign out action
    - _Requirements: 3.2, 3.3_

- [x] 4. Checkpoint - Ensure all functionality works
  - Ensure copy and download work correctly
  - Verify toast notifications appear
  - Ask the user if questions arise

## Notes

- Tasks marked with `*` are optional property-based tests
- Using existing shadcn/ui Dialog component for consistency
- Clipboard API requires HTTPS in production (works on localhost)
