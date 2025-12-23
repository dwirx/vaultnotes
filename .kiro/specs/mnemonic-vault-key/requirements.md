# Requirements Document

## Introduction

Fitur ini mengubah sistem vault key dari format base64 menjadi mnemonic phrase (kata-kata acak yang mudah dibaca seperti "increase dial sustain slush chaos chest art ketchup cry gauge box tray"). Mnemonic phrase lebih mudah dibaca, ditulis, dan disimpan oleh pengguna dibandingkan string acak.

## Glossary

- **Mnemonic_Phrase**: Serangkaian kata-kata acak (12 kata) yang merepresentasikan vault key
- **BIP39_Wordlist**: Daftar 2048 kata standar yang digunakan untuk generate mnemonic
- **Vault_Key**: Kunci rahasia untuk enkripsi/dekripsi catatan, sekarang dalam format mnemonic
- **Entropy**: Data acak yang dikonversi menjadi mnemonic phrase

## Requirements

### Requirement 1: Generate Mnemonic Phrase

**User Story:** As a user, I want my vault key to be generated as a mnemonic phrase, so that I can easily read, write, and remember it.

#### Acceptance Criteria

1. WHEN a new vault is created, THE System SHALL generate a 12-word mnemonic phrase as the vault key
2. THE Mnemonic_Phrase SHALL use words from a standard English wordlist
3. THE Mnemonic_Phrase SHALL provide at least 128 bits of entropy for security
4. WHEN generating mnemonic, THE System SHALL use cryptographically secure random number generation

### Requirement 2: Mnemonic to Key Conversion

**User Story:** As a user, I want to sign in using my mnemonic phrase, so that I can access my encrypted notes.

#### Acceptance Criteria

1. WHEN a user enters a mnemonic phrase, THE System SHALL convert it to a cryptographic key for encryption/decryption
2. THE System SHALL validate that the mnemonic phrase contains exactly 12 words
3. THE System SHALL validate that all words in the mnemonic are from the valid wordlist
4. IF the mnemonic is invalid, THEN THE System SHALL display a clear error message
5. FOR ALL valid mnemonic phrases, converting to key and back SHALL produce the same mnemonic (round-trip)

### Requirement 3: Updated Create Vault UI

**User Story:** As a user, I want to see my mnemonic phrase clearly displayed when creating a vault, so that I can write it down safely.

#### Acceptance Criteria

1. WHEN a vault is created, THE UI SHALL display the mnemonic phrase in a clear, readable format
2. THE UI SHALL display a security warning about keeping the phrase safe
3. THE UI SHALL provide a "Create note" button to proceed after viewing the phrase
4. THE UI SHALL display the phrase with proper spacing between words
5. THE UI SHALL show explanatory text about what the vault key is and why it's important

### Requirement 4: Updated Sign In UI

**User Story:** As a user, I want to enter my mnemonic phrase to sign in, so that I can access my vault.

#### Acceptance Criteria

1. THE Sign_In_Page SHALL provide a text input for entering the mnemonic phrase
2. WHEN the user enters a valid mnemonic, THE System SHALL sign them into their vault
3. IF the mnemonic is invalid, THEN THE System SHALL show an error message
4. THE UI SHALL accept mnemonic phrases with flexible spacing (multiple spaces, newlines)
