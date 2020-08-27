# Protocol Specification | v004

The 004 protocol upgrade centers around a system that makes it easy and painless to upgrade to a future protocol version, as well as more modern cryptographic primitives.

## Introduction

The Standard Notes Protocol describes a set of procedures that ensure client-side encryption of data in such a way that makes it impossible for the server, which houses the data, to read or decrypt the data. It treats the server as a dumb data-store that simply saves and returns values on demand.

Even in scenarios when the server is under active attack, clients should be fully protected, and cannot be tricked into revealing any sensitive information.

The client and server communicate under two common procedures: authentication, and syncing.

Authentication is a one-time transfer of information between client and server. In short, clients generate a long secret key by stretching a user-inputted password using a KDF. The first half of that key is kept locally as the "master key" and is never revealed to the server. The second half of that key is sent to the server as the "account server password".

The master key is then used to encrypt an arbitrary number of items keys. Items keys are generated randomly and not based on the account password. Items keys are used to encrypt syncable data, like notes, tags, and user preferences. Items keys themselves are also synced to user accounts, and are encrypted directly with the master key.

When a user's master key changes, all items keys must be re-encrypted with the new master key. Accounts should generally have one items key per protocol version, so even in the event where many protocol upgrades are created, only a few KB of data must be re-encrypted when a user's credentials change (as opposed to completely re-encrypting many megabytes or gigabytes of data).

Data is also encrypted client-side for on-device storage. When an account is present, all local data is encrypted by default, including simple key-value storage (similar to a localStorage-like store). Persistence stores are always encrypted with the account master key, and the master key is stored in the device's secure keychain (when available).

Clients also have the option of configuring an application passcode, which wraps the account master key with an additional layer of encryption. Having a passcode enabled is referred to as having a "root key wrapper" enabled. When a root key is wrapped, it is stored in local storage as an encrypted payload, and the keychain is bypassed. This allows for secure key storage even in environments that don't expose a keychain, such as web browsers.

This document delineates client-side procedures for key management and generation, data encryption, and storage encryption. Concepts related to server syncing and server session management are outside the scope of this document. This document however wholly covers any values that a server would receive, so even though syncing and server session management is out of scope, the procedures outlined in this document should guarantee that no secret value is ever revealed to the server.

## Key Management

**There are three main concepts as related to keys:**

1. **A root key**—based on an account's user-inputted password. There exists only one root key per account.
2. **A root key wrapper**—_wraps_ a root key (encrypts it) with an additional layer. This is a local-only construct, and translates directly as an "application passcode" feature.
3. **Items keys**—used to encrypt items. There can exist many items keys, and one items key can encrypt many items. Each items key is encrypted with the root key. When the root key changes, all items keys must be re-encrypted using the new root key.

### Key Generation Flow

1. User registers with an email (`identifier`) and a `password`.
2. `password` is run through a KDF to generate a key, which is then split in two, as part of a single `rootKey`.
   1. The first half is the `masterKey`.
   2. The second half is the `serverPassword`.
3. Client registers user account with server using `email` and `rootKey.serverPassword`.
4. Client creates new random key `itemsKey`. This key is encrypted directly with `rootKey.masterKey`, and the encrypted `itemsKey` is assigned a UUID and uploaded to the user's account. (Each `itemsKey` is a traditional item, just like a note or tag.)

### Password change or protocol upgrade flow

**When a user changes their password, or when a new protocol version is available:**

1. Client generates new `rootKey` using account identifier and password, and thus generates new `rootKey.masterKey`, `rootKey.serverPassword`, and `keyParams`, which include the protocol version and other public information used to guide clients on generating the `rootKey` given a user password.
2. Client submits new `rootKey.serverPassword` and `keyParams` to server. Note that the changing the `serverPassword` does not necessarily invalidate a user's session. Sessions management is outside of the scope of this document.
3. Client loops through all `itemsKeys` and re-encrypts them with new `rootKey.masterKey`. All `itemsKeys` are then re-uploaded to server. Note that `itemsKeys` are immutable and their inner key never changes. The key is only re-encrypted using the new `masterKey`.

This flow means that when a new protocol version is available or when a user changes their password, we do not need to re-encrypt all their data, but instead only a handful of keys.

### Key Rotation

By default, upgrading an account's protocol version will create a new `itemsKey` for that version, and that key will be used to encrypt all data going forward. To prevent large-scale data modification that may take hours to complete, any data encrypted with a previous `itemsKey` will be re-encrypted with the new `itemsKey` progressively, and not all at once. This progressive re-encryption occurs when an item is explicitly modified by the user. Applications can also be designed to bulk-modify items during idle-capacity, without user interaction.

**When changing the account password:**

- If a new protocol version is available, changing the account password will also upgrade to the latest protocol version and thus generates a new default `itemsKey`.
- If no new protocol version is available, or if the user is already using the latest version, changing the account password generates a new `rootKey`, as well as generates a new `itemsKey`. The new `itemsKey` will be used as the default items encryption key, and will also be used to progressively re-encrypt previous data. Generating a new `itemsKey` on password change ensures backward secrecy in the case the previous account password is compromised.

## Encryption Flow

_For each_ item (such as a note) the client wants to encrypt:
1. Client generates random `item_key` (note: singular. Not related to `itemsKey`).
2. Client encrypts note content with `item_key`.
3. Client encrypts `item_key` with default `itemsKey` as `enc_item_key`.
4. Client notes `itemsKey` UUID and associates it with encrypted item payload as `items_key_id`, and uploads payload to server.

To decrypt an item payload:
1. Client retrieves `itemsKey` matching `items_key_id` of payload.
2. Client decrypts item's `enc_item_key` as `item_key` using `itemsKey`.
3. Client decrypts item's content using `item_key`.

## Authentication

Registering for an account involves generating a `rootKey` and respective `keyParams`, according to the key generation flow above. The key parameters are uploaded to the server, and include:

- unique identifier (email)
- salt seed
- protocol version

To sign into an account, clients first make a request to the server to retrieve the key params for a given email. This endpoint is public and non-authenticated (unless the account has two-factor authentication enabled). The client then uses the retrieved key params to generate a `rootKey`, and uses the `rootKey.serverPassword` to authenticate the account.

Note that by default, the client trusts the protocol version the server reports. The client uses this protocol version to determine which cryptographic primitives (and their parameters) to use for key generation. This raises the question of, what happens if a malicious server underreports an account's version in order to weaken key generation parameters? For example, if a user's account is 004, but the server reports 002, the client will proceed to generate a `serverPassword` using outdated primitives.

There are two safeguards against this scenario:

1. Older protocol versions are expired and become no longer supported after a certain period.
2. Clients may sign in with a flag known as "strict sign in" (SSI). SSI ensures that the client _always_ signs in with the client-side _hardcoded latest version_ of the protocol. For example, if a client with SNJS 004 support attempts to sign in with SSI enabled, and the server reports a protocol version of 002 for a given account, the client will refuse this sign-in, and will not proceed with key generation. SSI is a user-controlled option. Clients cannot be programmed to default to SSI, as otherwise, users would be unable to sign in to their account whenever a new protocol version is available.

## Root Key Wrapping

Root key wrapping is a local-only construct that pertains to how the root key is stored locally. By default, and with no root key wrapping, the `rootKey` is stored in the secure device keychain. Only the `rootKey.masterKey` is stored locally; the `rootKey.serverPassword` is never stored locally, and is only used for initial account registration. If no keychain is available (web browsers), the `rootKey` is stored in storage in necessarily plain format.

Root key wrapping allows the client to encrypt the `rootKey` before storing it to disk. Wrapping a root key consists of:

1. Client asks user to choose a "local passcode".
2. The local passcode is run through the same key generation flow as account registration (using a random UUID as the account identifier, in place of an email) to generate a separate new root key known as the `rootKeyWrappingKey` (which likewise consists of a `masterKey` and an unused `serverPassword`).
3. The `rootKeyWrappingKey` is used to encrypt the `rootKey` as `wrappedRootKey`. The `wrappedRootKey` (along with `wrappingKeyKeyParams`) is stored directly in storage, and the keychain is cleared of previous unwrapped `rootKey`. (Some keychains have fixed payload size limit, so an encrypted payload may not always fit. For this reason `wrappedRootKey` is always stored directly in storage.)

**To unwrap a root key:**

1. Client displays an "Enter your local passcode" prompt to user.
2. Client runs user-inputted password through key generation scheme (using stored `wrappingKeyKeyParams`) to generate a temporary `rootKeyWrappingKey`.
3. Client attempts to decrypt `wrappedRootKey` using `rootKeyWrappingKey`. If the decryption process succeeds (no errors are thrown), the client successfully unlocks application, and keeps the unwrapped `rootKey` in application memory to aid in encryption and decryption of items (or rather `itemsKeys`, to be exact).

**The purpose of root key wrapping is many-fold:**

1. To allow for secure storage of root key when no secure keychain is available (i.e web browsers).
2. Even in cases when a keychain is available, root key wrapping allows users to choose an arbitrary password to protect their storage with.
3. To allow for encryption of local storage.
4. To allow applications to introduce cryptographically-backed UI-level app locking.

When a root key is wrapped, no information about the wrapper is persisted locally or in memory beyond the `keyParams` for the wrapper. This includes any sort of hash for verification of the correctness of the entered local passcode. That is, when a user enters a local passcode, we know it is correct not because we compare one hash to another, but by whether it succeeds in decrypting some encrypted payload.

## Storage

**There exists three types of storage:**

1. **Value storage**—values such as user preferences, session token, and other app-specific values.
2. **Payload storage**—encrypted item payloads (such as notes and tags).
3. **Root key storage**—the primary root key.

How data is stored depends on different key scenarios.

### Scenario A
_No root key and no root key wrapper (no account and no passcode)_
- **Value storage**: Plain, unencrypted
- **Payload storage**: Plain, unencrypted
- **Root key storage**: Not applicable

### Scenario B
_Root key but no root key wrapper (account but no passcode):_
- **Value storage**: Encrypted with root key
- **Payload storage:** Encrypted with root key
- **Root key storage**:
    - With device keychain: Plainly in secure keychain
    - With no device keychain: Plainly in device storage

### Scenario C
_Root key and root key wrapper (account and passcode):_
- **Value storage**: Encrypted with root key
- **Payload storage**: Encrypted with root key
- **Root key storage**: Encrypted in device storage

### Scenario D
_No root key but root key wrapper (no account but passcode):_
- **Value storage**: Encrypted with root key wrapper
- **Payload storage**: Encrypted with root key wrapper
- **Root key storage**: Not applicable

## 003 Migration

For the most part, SNJS does not branch off into different modes of behavior for different protocol versions (apart from the version specific operators). This means that new constructs in 004, like items keys, are also used in 003. This is accomplished via migrations that are performed when the application detects older data state.

In particular, when SNJS detects a pre-existing 003 account (before the user even has the chance to perform the protocol upgrade), a migration will be triggered that creates a default `itemsKey` using the account's current `rootKey.masterKey`:

```
itemsKey = { itemsKey: rootKey.masterKey, version: '003' }
```

This `itemsKey` is encrypted as usual using `rootKey.masterKey`, and synced to the user's account. When the user eventually performs the 004 upgrade (by entering their account password when prompted), a new `itemsKey` will be created as a default for 004. However, their previously created 003 `itemsKey` will continue to exist, so that data previously encrypted with 003 will still be decryptable.

## Cryptography Specifics

**Key Derivation:**

| Name               | Value    |
|--------------------|----------|
| Algorithm          | Argon2id |
| Memory (Bytes)     | 67108864 |
| Iterations         | 5        |
| Parallelism        | 1        |
| Salt Length (Bits) | 128      |
| Output Key (Bits)  | 512      |

**Encryption:**

| Name               | Value              |
|--------------------|--------------------|
| Algorithm          | XChaCha20+Poly1305 |
| Key Length (Bits)  | 256                |
| Nonce Length (Bits)| 192                |

### Root Key Derivation Flow - Specifics

Given a user `identifier` (email) and `password` (user password):
1. Generate a random salt `seed`, 256 bits (`hex`).
2. Generate `salt`:
   1. `hash = SHA256Hex('identifier:seed')`
   2. `salt = hash.substring(0, 32)`
3. Generate `derivedKey = argon2(password, salt, ITERATIONS, MEMORY, OUTPUT_LENGTH) `
4. Generate `rootKey` as:
   ```
    {
      masterKey: derivedKey.firstHalf,
      serverPassword: derivedKey.secondHalf,
      version: '004'
    }
    ```
5. For account registration, `identifier`, `seed`, `serverPassword`, and `version` must be uploaded to the server.

**Understanding the salt `seed`:**

Our threat model is intended to distrust the server as much as possible. For this reason, we do not want to blindly trust whatever salt value a server returns to us. For example, a malicious server may attempt to mass-weaken user security by sending the same salt for every user account, and observe what interesting results the clients send back. Instead,  clients play a more significant role in salt generation, and use the value the user inputs into the email field for salt generation.

At this point we have `salt = generateSalt(email)`. However, we'd ideally like to make this value more unique. Emails are globally unique, but well-known in advance. We could introduce more variability by also including the protocol version in salt computation, such as `salt = generateSalt(email, version)`, but this could also be well-accounted for in advance.

The salt `seed` serves as a way to make it truly impossible to know a salt for an account ahead of time, without first interacting with the server the account is hosted on. While retrieving a `seed` for a given account is a public, non-authorized operation, users who configure two-factor authentication can proceed to lock this operation so that a proper 2FA code is required to retrieve the salt `seed`. Salts are thus computed via `salt = generateSalt(email, seed)`.

### Items Key Generation Flow
1. Generate random `hex` string `key`, 256 bits.
2. Create `itemsKey = {itemsKey: key, version: '004'}`

### Encryption - Specifics

An encrypted payload consists of:
- `items_key_id`: The UUID of the `itemsKey` used to encrypt `enc_item_key`.
- `enc_item_key`: An encrypted protocol string joined by colons `:` of the following components:
  - protocol version
  - encryption nonce
  - ciphertext
- `content`: An encrypted protocol string joined by colons `:` of the following components:
  - protocol version
  - encryption nonce
  - ciphertext

**Procedure to encrypt an item (such as a note):**

1. Generate a random 256-bit key `item_key` (in `hex` format).
2. Encrypt `item.content` as `content` using `item_key` following the instructions _"Encrypting a string using the 004 scheme"_ below.
3. Encrypt `item_key` as `enc_item_key` using the the default `itemsKey.itemsKey` following the instructions _"Encrypting a string using the 004 scheme"_ below.
4. Generate an encrypted payload as:
    ```
    {
        items_key_id: itemsKey.uuid,
        enc_item_key: enc_item_key,
        content: content
    }
    ```

### Encrypting a string using the 004 scheme:

Given a `string_to_encrypt`, an `encryption_key`, and an item's `uuid`:

1.  Generate a random 192-bit string called `nonce`.
2.  Generate additional authenticated data as `aad = JSON.stringify({ u: uuid, v: '004' })`
3.  Encrypt `string_to_encrypt` using `XChaCha20+Poly1305:Base64`, `encryption_key`, `nonce`, and `aad`:
  ```
  ciphertext = XChaCha20Poly1305(string_to_encrypt, encryption_key, nonce, aad)
  ```
4.  Generate the final result by combining components into a `:` separated string:
  ```
  result = ['004', nonce, ciphertext].join(':')
  ```