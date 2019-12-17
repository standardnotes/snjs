# SNJS

SNJS is a client-side JavaScript library for [Standard Notes](https://standardnotes.org) that contains shared JavaScript logic for mobile, web, and desktop.

This library can be used in any JavaScript environment, including web, desktop, native, and mobile (via [React Native](https://github.com/standardnotes/mobile/blob/master/src/lib/snjs.js)).

## Installation

`npm install --save snjs`

## Integrating in a web app

1. Import these two files in your page, either via a packager like Grunt or Webpack, or via regular HTML script tags:

```javascript
<script src="snjs.js"></script>
```

## Usage

On the web, SNJS objects will be available as on the global window, such as `window.cryptoManager`.

If in a module environment, you can import it via:

```javascript
import { cryptoManager } from 'snjs';
```

### Generating keys for user

#### New user (registration):

```javascript
cryptoManager.generateInitialKeysAndAuthParamsForUser(email, password).then((results) => {
  let keys = results.keys;
  let authParams = results.authParams;

  let serverPassword = keys.pw;
  let encryptionKey = keys.mk;
  let authenticationKey = keys.ak;
});
```

#### Existing user (sign in):

```javascript
let authParams = getPreviouslyCreatedAuthParams();
cryptoManager.computeEncryptionKeysForUser(password, authParams).then((keys) => {
  let serverPassword = keys.pw;
  let encryptionKey = keys.mk;
  let authenticationKey = keys.ak;
});
```

#### Key descriptions:
`pw`: sent to the server for authentication.

`mk`: encrypts and decrypts items. Never sent to the server.

`ak`: authenticates the encryption and decryption of items. Never sent to the server.

### Encrypting and decrypting items

Use `cryptoManager` to encrypt and decrypt items. Use the `SFItemParams` as a wrapper over the item transformer. The `SFItemParams` class allows you to pass an `SFItem` object, encryption keys, and auth params, and will return the encrypted result.

#### Encrypt:

```javascript
let keys = getKeys(); // keys is a hash which should have properties mk and ak.
cryptoManager.encryptItem(item, keys, authParams).then(() => {
 // item.content is now encrypted
})
```

#### Decrypt:

```javascript
let keys = getKeys(); // keys is a hash which should have properties mk and ak.
cryptoManager.decryptItem(item, keys).then(() => {
 // item.content is now decrypted
})
```

## Notes
- SNJS uses an asynchronous API. All functions are asynchronous, and return immediately even if they have not finished. Add `.then()` to every call to be notified of the result, or use `await` if you don't want to use callbacks.
## Help
Join the #dev channel in [our Slack group](https://standardnotes.org/slack) for help and discussion.
