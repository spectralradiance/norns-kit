# @norn-apps/config

## 0.1.2

### Patch Changes

- Turn off two oxlint rules that flagged correct code in Urdr Reader. The base preset now allows
  side-effect imports such as `import './index.css'` (`import/no-unassigned-import`). The react
  preset no longer asks for a native tag in place of an ARIA role (`jsx-a11y/prefer-tag-over-role`):
  it wanted `fieldset` for a `role="group"` button row and `<dialog>` for a custom sheet, swaps
  that change layout and behaviour without making either more accessible.

## 0.1.1

### Patch Changes

- Allow Vitest 5 as well as 4. Installing the package next to the latest Vitest (5.1.0) failed
  with a peer dependency conflict, because 0.1.0 only allowed `^4.0.0`; the preset itself works
  unchanged on Vitest 5. The README now also says that Vitest 5 needs `vite` installed, and that
  oxlint only skips `node_modules` through `.gitignore` or the app's own config.
