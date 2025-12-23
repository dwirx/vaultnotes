# Requirements Document

## Introduction

Fitur ini meningkatkan manajemen vault key dengan menambahkan kemampuan untuk menyalin (copy) dan mengunduh (download) vault key dari dialog Account. Ini membantu pengguna menyimpan vault key mereka dengan aman setelah vault dibuat.

## Glossary

- **Vault_Key**: Kunci rahasia yang digunakan untuk mengenkripsi dan mendekripsi catatan dalam vault
- **Account_Dialog**: Dialog modal yang menampilkan informasi akun vault termasuk vault key
- **Clipboard**: Sistem penyimpanan sementara untuk menyalin teks
- **Download_File**: File teks yang berisi vault key untuk disimpan secara lokal

## Requirements

### Requirement 1: Copy Vault Key

**User Story:** As a user, I want to copy my vault key to clipboard, so that I can easily paste it somewhere safe for backup.

#### Acceptance Criteria

1. WHEN a user clicks the copy button next to the vault key, THE Account_Dialog SHALL copy the vault key to the clipboard
2. WHEN the vault key is successfully copied, THE Account_Dialog SHALL display visual feedback (checkmark icon) for 2 seconds
3. WHEN the vault key is successfully copied, THE Account_Dialog SHALL show a toast notification confirming the copy action
4. IF the clipboard operation fails, THEN THE Account_Dialog SHALL display an error toast notification

### Requirement 2: Download Vault Key

**User Story:** As a user, I want to download my vault key as a file, so that I can store it securely on my device.

#### Acceptance Criteria

1. WHEN a user clicks the download button, THE Account_Dialog SHALL generate a text file containing the vault key
2. WHEN generating the download file, THE Account_Dialog SHALL include the vault ID and vault key in a readable format
3. WHEN the download is triggered, THE Account_Dialog SHALL name the file with format "vault-key-{vaultId-prefix}.txt"
4. WHEN the download is successful, THE Account_Dialog SHALL show a toast notification confirming the download
5. THE Download_File SHALL contain a warning message about keeping the key secure

### Requirement 3: Account Dialog UI Enhancement

**User Story:** As a user, I want a clear and intuitive interface to manage my vault key, so that I can easily access copy and download functions.

#### Acceptance Criteria

1. THE Account_Dialog SHALL display the vault key in a monospace font for readability
2. THE Account_Dialog SHALL display copy and download buttons with clear icons
3. THE Account_Dialog SHALL provide hover states for interactive elements
4. WHILE the vault key is displayed, THE Account_Dialog SHALL show a security warning about keeping the key safe
5. THE Account_Dialog SHALL be accessible via a user icon button in the vault header
