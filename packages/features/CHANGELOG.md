# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## 1.12.2 (2021-12-22)


### Bug Fixes

* path to prettier ignore definitions ([cb9649d](https://github.com/standardnotes/snjs/commit/cb9649d0cbab36d17cbc610ae0518b1785662901))





## 1.12.1 (2021-12-22)


### Bug Fixes

* gpg signing with CI StandardNotes user ([d72f61c](https://github.com/standardnotes/snjs/commit/d72f61c23cd15b31d37340cc756d16526634b9ee))





# 1.12.0 (2021-12-22)


### Bug Fixes

* add "Markdown Math" to features and permissions list, also add missing fields for CloudLink ([#389](https://github.com/standardnotes/snjs/issues/389)) ([66b1392](https://github.com/standardnotes/snjs/commit/66b13922b573ac81fc822cec8861126193e11de4))
* add new props to features type ([#458](https://github.com/standardnotes/snjs/issues/458)) ([7a3e911](https://github.com/standardnotes/snjs/commit/7a3e9114414646a564a4de0879d68a801686e34f))
* export feature identifier ([fc55d5c](https://github.com/standardnotes/snjs/commit/fc55d5cba9218548f2effdbb3d1456d4539398ad))
* make borderColor snake-cased in features list ([#413](https://github.com/standardnotes/snjs/issues/413)) ([d96237c](https://github.com/standardnotes/snjs/commit/d96237c81288aa35d3f1e7757f0a2c4143a5fe29))
* make features package independent of auth ([#371](https://github.com/standardnotes/snjs/issues/371)) ([cfb9e7d](https://github.com/standardnotes/snjs/commit/cfb9e7d5820f5fbb40f9aa253cd4f1a60049ca9d))
* make remaining camel-cased feature keys to be snake-cased ([#416](https://github.com/standardnotes/snjs/issues/416)) ([98fe4c8](https://github.com/standardnotes/snjs/commit/98fe4c82e6d8da8d2922d01b984e2bd15d5a34db))
* missing exports for permission model ([044744b](https://github.com/standardnotes/snjs/commit/044744bbf61ad4f294896cb2fd80e310ef025c01))
* replace permissions with features in auth token ([#373](https://github.com/standardnotes/snjs/issues/373)) ([739c956](https://github.com/standardnotes/snjs/commit/739c95604bd119a893d0d43dd2b35794cb5cb770))
* two factor auth feature id ([98720b8](https://github.com/standardnotes/snjs/commit/98720b83e93b383b703d008a66828ad250a2e50c))
* versioning and package dependencies ([#509](https://github.com/standardnotes/snjs/issues/509)) ([fe1df94](https://github.com/standardnotes/snjs/commit/fe1df94eff3e90bcf9ba0cf45bdc44ac49204c71))


### Features

* add deprecation_message to feature description ([19113db](https://github.com/standardnotes/snjs/commit/19113db0213962b04b9d53f4ddd03377a1ad653f))
* add feature identifier to features ([05d4951](https://github.com/standardnotes/snjs/commit/05d49511f744d5ba0b130780aeb26760bda8e62b))
* add features data ([#369](https://github.com/standardnotes/snjs/issues/369)) ([1094bea](https://github.com/standardnotes/snjs/commit/1094beabeed272db6f91332523b8a521de41f170))
* Add Focus Mode feature ([#487](https://github.com/standardnotes/snjs/issues/487)) ([7f22590](https://github.com/standardnotes/snjs/commit/7f2259003e150db83f0182c9878493ce775360cc))
* add missing features ([693048b](https://github.com/standardnotes/snjs/commit/693048bccfce57df7b88f8f87c1e3ccbe34fd93a))
* add role name to features and refactor package structure ([#481](https://github.com/standardnotes/snjs/issues/481)) ([3651629](https://github.com/standardnotes/snjs/commit/365162948127653d2f199f9f8660123edfe24682))
* editor note and file types ([#456](https://github.com/standardnotes/snjs/issues/456)) ([8b9d264](https://github.com/standardnotes/snjs/commit/8b9d264f465227d5ca846969b1a1885382b583ad))
* features instead of permissions ([#385](https://github.com/standardnotes/snjs/issues/385)) ([b53e967](https://github.com/standardnotes/snjs/commit/b53e967297bc472ed11aed79af79d0ae5b36d101))
* map only some features to items ([#404](https://github.com/standardnotes/snjs/issues/404)) ([7f521ef](https://github.com/standardnotes/snjs/commit/7f521efe621d3f2128881aed8a31bf7bd2399a74))
* Remove "No Distraction" as it's replaced by Focused Writing ([#506](https://github.com/standardnotes/snjs/issues/506)) ([527e676](https://github.com/standardnotes/snjs/commit/527e67673652721ebc947c752815c12007f8d263))
* remove ContentType from features in favor of common ([#402](https://github.com/standardnotes/snjs/issues/402)) ([ba0ac62](https://github.com/standardnotes/snjs/commit/ba0ac62fd2631541cd0aa615e9163af1b59fd824))
* upgrade node engine versions to latest active LTS ([#462](https://github.com/standardnotes/snjs/issues/462)) ([686fc15](https://github.com/standardnotes/snjs/commit/686fc15030d302b474ebb7ef1cd4dcc48ec42359))


### Reverts

* Revert "refactor: make features depend on snjs" ([c0dfdc1](https://github.com/standardnotes/snjs/commit/c0dfdc110de5b73967fb9b3a3d93ba4cf872d24f))
