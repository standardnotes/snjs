# Protocol Specification

## 004

The 004 protocol upgrade centers around a system that makes it easy and painless to upgrade to a future protocol version.

### Key Management

There are three main concepts when it comes to keys:

1. A root key
2. A root key wrapper
3. Items keys

- A root key is based off an account's user-inputted password. There exists only one root key per account.
- A root key wrapper _wraps_ a root key (encrypts it) with an additional layer. This is a local-only construct, and translates directly as an 'app passcode' feature.
- An items key is used to encrypt items. There can exist many items keys. Each items key is encrypted with the root key. When the root key changes, all items keys must be re-encrypted using the new root key.


#### Key Generation Flow

1. User registers with an email and a `password`.
2. `password` is run through KDF (argon2) to generate 512 bit key, which is then split in two, as part of a single `rootKey`.
   1. The first half is labeled as the `masterKey`.
   2. The second half is labeled as the `serverKey`.
3. Client registers user account with server with `email` and `rootKey.serverPassword`.
4. Client creates new random 256-bit key `itemsKey`. This key is encrypted directly with `rootKey.masterKey`, and the encrypted `itemsKey` is assigned a UUID and uploaded to the user's account.

#### Encryption Flow

Then _for each_ item (such as a note) the client wants to encrypt:
1. Client generates random 256-bit `item_key` (note: singular, not plural). 
2. Client encrypts note content with `item_key`.
3. Client encrypts `item_key` with default `itemsKey` as `enc_item_key`.
4. Client notes `itemsKey` UUID and associates it with encrypted item payload as `items_key_id`, and uploads item to server.

The decryption flow is as follows:
1. Client retrieves `itemsKey` matching `items_key_id` of item.
2. Client decrypts item's `enc_item_key` as `item_key` using found `itemsKey`.
3. Client decrypts item's content using `item_key`.

#### Password change or protocol upgrade flow

When a user changes their password, or when a new protocol version is available:

1. Client generates new `rootKey` using account identifier and password, and thus generates new `rootKey.masterKey` and `rootKey.serverPassword` and `keyParams`, which include the protocol version and other public information used to guide clients on generating the `rootKey` given a user password.
2. Client submits new `rootKey.serverPassword` to server. Note that the changing the `serverPassword` does not necessarily invalidate a user's session. Sessions are handled through a separate server specification.
3. Client retrieves all `itemsKeys` and encrypts them with `rootKey.masterKey`. All `itemsKeys` are then re-uploaded to server. Note that `itemsKey`s are immutable and their inner key does not change. The key is only re-encrypted using the new `masterKey`.

This flow means that when a new protocol version is available or when a user changes their password, we do not need to re-encrypt all their data, but instead only a handful of keys.

#### Key Rotation

By default, upgrading an account's protocol version will create a new `itemsKey` for that version, and that key will be used to encrypt all data going forward. To prevent large-scale data modification that may take hours to complete, any data encrypted with a previous `itemsKey` will be re-encrypted with the new key _progressively_, and not all at once. This progressive re-encryption occurs when an item is explicitely modified by the user, or when the application detects available bandwidth to modify items in bulk in the background (without user interaction).

When changing the account password:

- If a new protocol version is available, changing the account password will also upgrade to the latest protocol version and thus generates a new default `itemsKey`.
- If no new protocol version is available, or if the user is already using the latest version, changing the account password generates a new `rootKey`, but does not generate a new `itemsKey`, unless the user explicitely chooses an option to "Rotate encryption keys". If the user chooses to rotate encryption keys, a new `itemsKey` will be generated and used as the default items encryption key, and will also be used to progressively re-encrypt previous data.

### Root Key Wrapping

Root key wrapping is a local-only construct that pertains to how the root key is stored locally. By default, and with no root key wrapping, the `rootKey` is stored on the device keychain. Only the `rootKey.masterKey` is stored locally; the `rootKey.serverPassword` is never stored locally, and is only used for initial account registration. If no keychain is available (web browsers), the `rootKey` is stored in storage in necessarily plain format.

Root key wrapping allows the client to encrypt the `rootKey` before storing it to disk. Wrapping a root key consists of:

1. Client asks user to choose a "local passcode".
2. The local passcode is run through the same key generation flow as account registration (using KDF) to generate a separate new root key known as the `rootKeyWrappingKey` (which likewise consists of a `masterKey` and an unused `serverPassword`).
3. The `rootKeyWrappingKey` is used to encrypt the `rootKey` as `wrappedRootKey`. The `wrappedRootKey` (along with `rootKeyWrapperKeyParams`) is stored directly in storage, and the keychain is cleared of previous unwrapped `rootKey`. (Some keychains have fixed payload size limit, so an encrypted payload may not always fit. For this reason `wrappedRootKey` is stored directly in storage.)

To unwrap a root key:

1. Clients displays an "Enter your local passcode" prompt to user.
2. Client runs user-inputted password through key generation scheme (using stored `rootKeyWrapperKeyParams`) to generate a temporary `rootKeyWrappingKey`.
3. Client attempts to decrypt `wrappedRootKey` using `rootKeyWrappingKey`. If the decryption process succeeds (no errors are thrown), the client successfully unlocks application, and keeps the unwrapped `rootKey` in application memory to aid in encryption and decryption of items.

The purpose of root key wrapping is many-fold:
1. To allow for secure storage of root key when no secure keychain is available (i.e web browsers).
2. Even in cases when a keychain is available, root key wrapping allows users to choose an arbitrary password to protect their storage with.
3. To allow for encryption of local storage.
4. To allow applications to introduce cryptographically-backed UI-level app locking.

When a root key is wrapped, no information about the wrapper is ever persisted locally beyond the `keyParams` for the wrapper. This includes any sort of hash for verification of the correctness of the entered local passcode. That is, when a user enters a local passcode, we know it is correct not because we compare one hash to another, but by whether it succeeds in decrypting some encrypted payload.

### Storage

There exists three types of storage:

1. Value storage: values such as user preferences, session token, and other app-specific values.
2. Payload storage: encrypted item payloads (such as notes and tags).
3. Root key storage: the primary root key.

How data is stored depends on different key scenarios.

**Scenario A**: No root key and no root key wrapper (no account and no passcode):
Value storage: plain, unencrypted
Payload storage: plain, unencrypted
Root key storage: not applicable

**Scenario B**: Root key but no root key wrapper (account but no passcode):
Value storage: Encrypted with root key
Payload storage: Encrypted with root key
Root key storage: 
    - With device keychain: stored plainly in secure keychain
    - With no device keychain: stored plainly in device storage

**Scenario C**: Root key and root key wrapper (account and passcode):
Value storage: Encrypted with root key
Payload storage: Encrypted with root key
Root key storage: stored encrypted in device storage

**Scenario D**: No root key but root key wrapper (no account but passcode):
Value storage: Encrypted with root key wrapper
Payload storage: Encrypted with root key wrapper
Root key storage: not applicable

### Cryptography Specifics

**Key Derivation:**

|--------------------|----------|
| Algorithm          | Argon2id |
| Memory (Bytes)     | 67108864 |
| Iterations         | 5        |
| Parallelism        | 1        |
| Salt Length (Bits) | 128      |
| Output Key (Bits)  | 512      |

**Encryption:**

|--------------------|--------------------|
| Algorithm          | XChaCha20+Poly1305 |
| Key Length (Bits)  | 256                |
| Nonce Length (Bits)| 192                |

#### Root Key Derivation Flow - Specifics

Given a user `identifier` (email) and `password` (user password):
1. Generate a random salt `seed`, 256 bits (`hex`).
2. Generate `salt`:
   1. `hash = SHA256Hex('identifier:seed')`
   2. `salt = hash.substring(0, 32)`
3. Generate `derivedKey = argon2(password, salt, ITERATIONS, MEMORY, OUTPUT_LENGTH) `
4. Generate `rootKey = {masterKey: derivedKey.firstHalf, serverPassword: derivedKey.secondHalf, version: '004'}`

#### Items Key Generation Flow
1. Generate random `hex` string `key`, 256 bits.
2. Create `itemsKey = {itemsKey: key, version: '004'`}`

#### Encryption - Specifics

An encrypted payload consists of:
- `items_key_id`: The UUID of the `itemsKey` used to encrypt `enc_item_key`.
- `content`: An encrypted protocol string joined by colons `:` of the following parts:
  - protocol version
  - encryption nonce
  - ciphertext
- `enc_item_key`: An encrypted protocol string joined by colons `:` of the following parts:
  - protocol version
  - encryption nonce
  - ciphertext

Encrypting an item, such as a note:

1. Generate a random 256-bit key `item_key` (in `hex` format).
2. Encrypt `item.content` as `content` using `item_key` following the instructions "Encrypting a string using the 004 scheme" below.
3. Encrypt `item_key` as `enc_item_key` using the the default `itemsKey.itemsKey` following the instructions "Encrypting a string using the 004 scheme" below.
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
  ```javascript
  ciphertext = XChaCha20Poly1305(string_to_encrypt, encryption_key, nonce, aad)
  ```
4.  Generate the final result by combining components into a `:` separated string:
  ```
  result = ['004', nonce, ciphertext].join(':')
  ```