# SNJS

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lerna.js.org/)

SNJS is a client-side JavaScript library for [Standard Notes](https://standardnotes.com) that contains shared logic for all Standard Notes clients.

## Introduction

SNJS is a shared library for use in all Standard Notes clients (desktop, web, and mobile). Its role is to extract any business or data logic from client code, so that clients are mostly responsible for UI-level code, and don’t have to think about encryption and key management, or even authentication or storage specifics. Extracting the code into a shared library also prevents us from having to write the same critical code on multiple platforms.

The entry point of SNJS is the [`SNApplication`](packages/snjs/lib/application.ts) class. The application class is a complete unit of application functionality. Theoretically, many instances of an application can be created, each with its own storage namespace and memory state. This can allow clients to support multiple user accounts.

An application must be supplied a custom subclass of [DeviceInterface](packages/snjs/lib/device_interface.ts). This allows the library to generalize all behavior a client will need to perform throughout normal client operation, such as saving data to a local database store, saving key/values, and accessing the keychain.

On Web platforms SNJS interacts with [`sncrypto`](https://github.com/standardnotes/snjs/tree/packages/sncrypto-common) to perform operations as mentioned in the [specification](https://github.com/standardnotes/snjs/blob/master/packages/snjs/specification.md) document. This includes operations like key generation and data encryption.

SNJS also interacts with a Standard Notes [syncing server](https://github.com/standardnotes/syncing-server-js), which is a zero-knowledge data and sync store that deals with encrypted data, and never learns of client secrets or sensitive information.

## Installation

`yarn add snjs`

## Integrating in module environment

```javascript
import { SNApplication } from 'snjs';
```

## Integrating in non-module web environment

```javascript
<script src="snjs.js"></script>
Object.assign(window, SNLibrary);
```

## Building

1. `yarn install --pure-lockfile`
2. `yarn start` to start Webpack in development mode (watches changes), or `yarn build` to create dist files.

## Tests

### E2E Tests
Ensure you have [Docker](https://www.docker.com) and [Docker Compose](https://docs.docker.com/compose/install/) installed before running tests.

From the root of the repository, run:

```
# Starts browser-navigable web page
yarn run start:e2e:mocha

# Starts backend servers
yarn run start:e2e:docker
```

Then choose between the following run options:

- Run tests in the command line:
  ```
  yarn run test:e2e:dev
  ```

- Run tests in the browser: Open `http://localhost:9002/packages/snjs/mocha/test.html`.

### Unit Tests

From the root of the repository, run:

```
yarn run test:unit
```

## Help
Join the #dev channel in [our Slack group](https://standardnotes.com/slack) or [Discord](https://standardnotes.com/discord) for help and discussion.
