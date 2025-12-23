# Implementation Plan: Mnemonic Vault Key

## Overview

Implementasi sistem mnemonic phrase untuk vault key, menggantikan format base64 dengan 12 kata acak yang mudah dibaca.

## Tasks

- [ ] 1. Create mnemonic module
  - [ ] 1.1 Create `src/lib/mnemonic.ts` with BIP39 wordlist
    - Include 2048-word English wordlist
    - Export wordlist as constant
    - _Requirements: 1.2_
  - [ ] 1.2 Implement `generateMnemonic()` function
    - Generate 128-bit entropy using crypto.getRandomValues
    - Convert to 12 words from wordlist
    - _Requirements: 1.1, 1.4_
  - [ ] 1.3 Implement `validateMnemonic()` function
    - Check word count is exactly 12
    - Check all words are in wordlist
    - Return validation result with error message
    - _Requirements: 2.2, 2.3, 2.4_
  - [ ] 1.4 Implement `normalizeMnemonic()` function
    - Trim whitespace, convert to lowercase
    - Replace multiple spaces/newlines with single space
    - _Requirements: 4.4_
  - [ ]* 1.5 Write property test for mnemonic generation
    - **Property 1: Generated Mnemonic Structure**
    - **Validates: Requirements 1.1, 1.2**
  - [ ]* 1.6 Write property test for validation correctness
    - **Property 2: Mnemonic Validation Correctness**
    - **Validates: Requirements 2.2, 2.3**

- [ ] 2. Update crypto module for mnemonic support
  - [ ] 2.1 Update `generateVaultKey()` to return mnemonic
    - Use generateMnemonic() instead of random bytes
    - _Requirements: 1.1_
  - [ ] 2.2 Update `deriveKey()` to accept mnemonic
    - Normalize mnemonic before derivation
    - Convert mnemonic to bytes for PBKDF2
    - _Requirements: 2.1_
  - [ ]* 2.3 Write property test for key derivation consistency
    - **Property 4: Key Derivation Consistency**
    - **Validates: Requirements 2.1**

- [ ] 3. Update CreateVault page UI
  - [ ] 3.1 Redesign CreateVault page layout
    - Match design from screenshot
    - Display "Keep your vault key safe" heading
    - Show explanatory text about vault key
    - _Requirements: 3.1, 3.5_
  - [ ] 3.2 Display mnemonic phrase in styled box
    - Show 12 words in readable format
    - Use monospace/code styling
    - _Requirements: 3.1, 3.4_
  - [ ] 3.3 Add "Create note" button
    - Navigate to vault after clicking
    - _Requirements: 3.3_
  - [ ] 3.4 Add account icon button
    - Show account dialog on click
    - _Requirements: 3.2_

- [ ] 4. Update SignIn page for mnemonic input
  - [ ] 4.1 Update SignIn page input
    - Change to textarea for mnemonic input
    - Accept flexible whitespace
    - _Requirements: 4.1, 4.4_
  - [ ] 4.2 Add validation and error display
    - Validate mnemonic on submit
    - Show clear error messages
    - _Requirements: 4.2, 4.3_

- [ ] 5. Update AccountDialog for mnemonic display
  - [ ] 5.1 Update AccountDialog to show mnemonic
    - Display vault key as mnemonic phrase
    - Update copy/download functions
    - _Requirements: 3.1_

- [ ] 6. Checkpoint - Test all functionality
  - Create new vault and verify mnemonic is shown
  - Sign out and sign in with mnemonic
  - Verify copy and download work
  - Ask the user if questions arise

## Notes

- Tasks marked with `*` are optional property-based tests
- BIP39 wordlist is standard and well-tested
- Existing encrypted notes will need the original key format (backward compatibility consideration)
