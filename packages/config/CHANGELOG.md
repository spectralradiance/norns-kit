# @norn-apps/config

## 0.1.1

### Patch Changes

- Allow Vitest 5 as well as 4. Installing the package next to the latest Vitest (5.1.0) failed
  with a peer dependency conflict, because 0.1.0 only allowed `^4.0.0`; the preset itself works
  unchanged on Vitest 5. The README now also says that Vitest 5 needs `vite` installed, and that
  oxlint only skips `node_modules` through `.gitignore` or the app's own config.
