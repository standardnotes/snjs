# SNJS

SNJS is a client-side JavaScript library for [Standard Notes](https://standardnotes.org) that contains shared logic for all Standard Notes clients.

## Installation

`npm install --save snjs`

## Integrating in module environment

```javascript
import { SNApplication } from 'snjs';
```

## Integrating in non-module web environment

```javascript
<script src="snjs.js"></script>
Object.assign(window, SNLibrary);
```

## Usage

1. Initialize an application:

```javascript
const serverUrl = getServerURL();
const deviceInterface = new DeviceInterfaceSubclass();
const app = new SNApplication({
   deviceInterface: deviceInterface,
   environment: Environments.Web,
   platform: Platforms.MacWeb,
   host: serverUrl
});
```

2. Launch the application:

```javascript
 await app.prepareForLaunch({
   callbacks: {
     requiresChallengeResponses: (handleChallengeResponses) => {

     },
     handleChallengeFailures: (responses) => {
       
     }
   },
 });
 await application.launch();
```

Once the app is launched, you may perform any app-related functions, including:

### Signing into an account

```javascript
app.signIn({
  email, 
  password
}).then((response) => {

});
```

### Registering a new account

```javascript
app.register({
  email, 
  password
}).then((response) => {

});
```

### Lock the app with a passcode

```javascript
app.setPasscode(somePasscode).then(() => {

});
```

### Create a note

```javascript
const item = await app.createItem({
  contentType: ContentTypes.Note, 
  content: {
    title: 'Ideas',
    text: 'Coming soon.'
  }
});
/** Save the item both locally and sync with server */
await app.saveItem({ item: item });
```

### Stream notes

```javascript
app.streamItems({
  contentType: ContentTypes.Note, 
  stream: ({ notes }) => {
    reloadUI(notes);
  }
});
```

## Building

1. `npm install`
2. `npm run start` or `npm run bundle`.

## Tests

Tests must be run in the browser due to WebCrypto dependency.

1. `node test-server.js`
2. Open browser to `http://localhost:9001/test/test.html`.

_Note:_ Many tests involve registering for a new account as part of the `beforeEach` block for that test suite. Each account registration call takes close to 1 second, as key generation with Argon2 is tuned to take close to 1 second. However, this will depend on machine performance. If a test fails due to timeout being exceeded, please increase the timeout for that test.

## Notes
- SNJS uses an asynchronous API. All functions are asynchronous, and return immediately even if they have not finished. Add `.then()` to every call to be notified of the result, or use `await` if you don't want to use callbacks.
- 
## Help
Join the #dev channel in [our Slack group](https://standardnotes.org/slack) for help and discussion.
