## Packaging Components

Packaging a component will create a zip archive of dist assets, compute a checksum, and create a release on GitHub and upload the custom zip archive.

Note that checksums are based on the resulting zip archive, and that re-zipping the same files results in a different checksum. It is imperative that once checksums are computed, the respective .zip file is used as the distributable.

If a release already exists on GitHub, packaging will be skipped.

**Important:** Be sure to have `GH_TOKEN` exported in your env in order for the GitHub CLI tool to function properly.

### Package all components:

```
yarn run package-components
```

### Package single component:

```
yarn run package-components org.standardnotes.code-editor
```

### Releasing an update to a component:

1. Bump the version of the feature in `snjs/packages/features/src/Domain/Feature/Features.ts`
2. Run `yarn build` inside `snjs/packages/features`
3. Bump the version of the component in `snjs/packages/components/package.json`
4. Run `yarn run package-components org.standardnotes.feature-identifier`
