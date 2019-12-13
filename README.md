# SNJS

SNJS is a client-side JavaScript library for [Standard Notes](https://standardnotes.org) that contains shared JavaScript logic for mobile, web, and desktop.

This library can be used in any JavaScript environment, including web, desktop, native, and mobile (via [React Native](https://github.com/standardnotes/mobile/blob/master/src/lib/snjs.js)).

## Installation

`npm install --save snjs`

## Integrating in a web app

1. Import these two files in your page, either via a packager like Grunt or Webpack, or via regular HTML script tags:

```javascript
<script src="regenerator.js"></script>
<script src="snjs.js"></script>
```

(`regenerator.js` is only required in web environments. If in native environment, install the package independently via `npm install --save regenerator-runtime` and include it in your build.)

## Usage

On the web, `SNJS` will be available as a global window variable accessible via `window.SNJS` or just `SNJS`.

If in a module environment, you can import it via:

```javascript
import { StandardNotes } from 'snjs';
let SNJS = new StandardNotes();
```

### Generating keys for user

#### New user (registration):

```javascript
SNJS.crypto.generateInitialKeysAndAuthParamsForUser(email, password).then((results) => {
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
SNJS.crypto.computeEncryptionKeysForUser(password, authParams).then((keys) => {
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

Use `SNJS.itemTransformer` to encrypt and decrypt items. Use the `SFItemParams` as a wrapper over the item transformer. The `SFItemParams` class allows you to pass an `SFItem` object, encryption keys, and auth params, and will return the encrypted result.

#### Encrypt:

```javascript
let keys = getKeys(); // keys is a hash which should have properties mk and ak.
SNJS.itemTransformer.encryptItem(item, keys, authParams).then(() => {
 // item.content is now encrypted
})
```

#### Decrypt:

```javascript
let keys = getKeys(); // keys is a hash which should have properties mk and ak.
SNJS.itemTransformer.decryptItem(item, keys).then(() => {
 // item.content is now decrypted
})
```

## Notes
- SNJS uses an asynchronous API. All functions are asynchronous, and return immediately even if they have not finished. Add `.then()` to every call to be notified of the result, or use `await` if you don't want to use callbacks.
## Help
Join the #dev channel in [our Slack group](https://standardnotes.org/slack) for help and discussion.
