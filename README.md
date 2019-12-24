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

On the web, SNJS objects will be available as on the global window, such as `window.protocolManager`.

If in a module environment, you can import it via:

```javascript
import { protocolManager } from 'snjs';
```

### Generating keys for user

#### New user (registration):

```javascript
protocolManager.createKeysAndAuthParams({identifier: email, password: password}).then((results) => {
  const keys = results.keys;
  const authParams = results.authParams;

  const serverPassword = keys.serverAuthenticationValue;
  const masterKey = keys.masterKey;
  const itemsMasterKey = keys.itemsMasterKey;
});
```

#### Existing user (sign in):

```javascript
let authParams = getPreviouslyCreatedAuthParams();
protocolManager.computeEncryptionKeys({password, authParams}).then((keys) => {
  const serverPassword = keys.serverAuthenticationValue;
  const masterKey = keys.masterKey;
  // itemsMasterKey is generated once then uploaded to server in encrypted form.
});
```

#### Key descriptions:
`serverPassword`: sent to the server for authentication.

`masterKey`: encrypts and decrypts keys. Not sent to server plainly.

`itemsMasterKey`: encrypts and decrypts items. Not sent to server plainly.

### Encrypting and decrypting items

Use `protocolManager` to encrypt and decrypt items. Use the `SFItemParams` as a wrapper over the item transformer. The `SFItemParams` class allows you to pass an `SFItem` object, encryption keys, and auth params, and will return the encrypted result.

#### Encrypt:

```javascript
let keys = getKeys(); // keys is a hash which should have properties mk and ak.
protocolManager.encryptItem({item, keys, authParams}).then(() => {
 // item.content is now encrypted
})
```

#### Decrypt:

```javascript
let keys = getKeys(); // keys is a hash which should have properties mk and ak.
protocolManager.decryptItem({item, keys}).then(() => {
 // item.content is now decrypted
})
```

## Notes
- SNJS uses an asynchronous API. All functions are asynchronous, and return immediately even if they have not finished. Add `.then()` to every call to be notified of the result, or use `await` if you don't want to use callbacks.
## Help
Join the #dev channel in [our Slack group](https://standardnotes.org/slack) for help and discussion.
