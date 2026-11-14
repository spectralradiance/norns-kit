# @norn-apps/config

Shared TypeScript, oxlint, Prettier and Vitest presets for the Norn apps (Urdr Reader,
Verdandi Writer and Skuldr Social), so all three are checked the same way.

```bash
npm install -D @norn-apps/config typescript oxlint prettier vitest
```

## TypeScript

Extend the preset that matches where the code runs:

| Preset | For |
| --- | --- |
| `tsconfig/react.json` | React in the browser, bundled by Vite |
| `tsconfig/node.json` | Bundled Node code: Electron main and preload, servers built by Vite |
| `tsconfig/node-script.json` | Scripts Node runs directly (`node scripts/build.ts`), with `nodenext` resolution |
| `tsconfig/base.json` | Anything else, such as a Cloudflare Worker (add its types) |

```json
{
  "extends": "@norn-apps/config/tsconfig/react.json",
  "compilerOptions": { "types": ["vite/client"] },
  "include": ["src"]
}
```

All presets are strict, use `verbatimModuleSyntax` and `erasableSyntaxOnly`, allow `.ts`
extensions in imports, and don't emit (Vite or Node does that). `types` starts empty, so list
the ambient types each project needs (`vite/client`, `node`, `@cloudflare/workers-types`).

A program only sees the types of its own preset: a Node script can't import a module that
uses `document`. Keep browser-only code in its own files.

## oxlint

oxlint resolves `extends` as a path relative to the config file, so point it into
`node_modules`:

```json
{
  "extends": ["./node_modules/@norn-apps/config/oxlint/react.json"]
}
```

oxlint skips what `.gitignore` lists, so make sure it lists `node_modules/`. An
`ignorePatterns` inside these presets would have no effect: oxlint only reads ignore
patterns from the app's own config.

- `oxlint/base.json`: the correctness rules as errors and suspicious ones as warnings, with
  the TypeScript, unicorn, oxc and import plugins. Side-effect imports (`import './index.css'`)
  are allowed.
- `oxlint/react.json`: base plus the React and jsx-a11y plugins, with the rules of hooks as
  errors and missing effect dependencies as warnings. `prefer-tag-over-role` is off: it asks for
  `fieldset` in place of a `role="group"` button row and `<dialog>` in place of a custom sheet.
  Both swaps change layout and behaviour without making anything more accessible.

## Prettier

No semicolons, single quotes, trailing commas, 100 columns. In `package.json`:

```json
{ "prettier": "@norn-apps/config/prettier" }
```

Add `*.md` to `.prettierignore` if your Markdown is hand-formatted: Prettier pads every table
column.

## Vitest

```ts
import base from '@norn-apps/config/vitest'
import { defineConfig, mergeConfig } from 'vitest/config'

export default mergeConfig(base, defineConfig({}))
```

It finds `*.test.ts(x)` under `src/`, `scripts/` and `worker/`, runs in Node, and restores
mocks after each test. It works with Vitest 4 and 5. Vitest 5 needs `vite` installed alongside
it (`npm install -D vite`).

## License

GPL-3.0-or-later, with an additional permission for app store distribution (see
`LICENSE-EXCEPTION`).
