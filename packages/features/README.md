## Packaging Components

Packaging a component will create a zip archive of dist assets, compute a checksum, and create a release on GitHub and upload the custom zip archive.

Note that checksums are based on the resulting zip archive, and that re-zipping the same files results in a different checksum. It is imperative that once checksums are computed, the respective .zip file is used as the distributable.

If a release already exists on GitHub, packaging will be skipped.

### Package all components:

```
yarn run package-components
```

### Package single component:

```
yarn run package-components org.standardnotes.code-editor
```