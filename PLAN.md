# The Norn Apps: Shared Plan

Nov 13, 2026 · Matthew Cooper

## Overview

*The Norn Apps: Feature Boundaries* (Nov 12) decided what each app is for. This plan covers
the rest: moving features to the app that owns them, putting all three on one stack and
one look, and the roadmap for each app after that.

- **Urdr Reader** (once Echtra): where you take things in.
- **Verdandi Writer** (once Ogma): where you write.
- **Skuldr Social** (once rhyza): where you publish and talk with people.

Each app repo's own `PLAN.md` carries its scope and phases. This document, kept in
`norns-kit`, is the cross-app layer on top of them.

## Where things stand

| | Urdr | Verdandi | Skuldr |
| --- | --- | --- | --- |
| Shape | Vite SPA + Cloudflare Worker | Electron app + Python sidecar | Next.js server app + feed worker |
| React | 19.3 | 19.3 | 19.3 |
| TypeScript | 6.0 | 6.0 | 5.9 |
| Build | Vite 8 | electron-vite 5 (Vite 7) | Next 16 |
| Routing | React Router 8 | none (one window) | Next App Router |
| Remote data | TanStack Query | IPC to main process | Server components and actions |
| Local data | Dexie (IndexedDB) | Files + `node:sqlite` | Postgres via Drizzle (PGlite in dev) |
| Styling | Tailwind v4 + typography | Tailwind v4 (no reset) + a 2,160-line stylesheet | Hand-written CSS, no Tailwind |
| Components | Lucide | Radix + Lucide | None |
| Lint | oxlint | ESLint 10 | None |
| Tests | None | Vitest (24 files) | None |
| Validation | None | None | zod 4 |
| License | None | None | GPL-3.0-or-later |

The three already share more than they differ: React 19, TypeScript, CSS-variable themes
with light and dark, warm off-white backgrounds, npm and Node 22. The gaps are Skuldr's
framework and styling, the tooling, and token names.

## 1. Redistributing features

Moves are listed in the order to do them. Each move ends with removing the feature from the
app it left, so nothing lives in two places for long.

| # | Feature | From | To | Code today | Notes |
| --- | --- | --- | --- | --- | --- |
| 1 | SSRF-safe fetch | Skuldr | `packages/fetch` | `lib/feeds/safe-fetch.ts` | Urdr's Worker and Skuldr's link previews both use it. In a Cloudflare Worker the private-address checks work differently (no DNS lookup), so the package needs a Worker variant. |
| 2 | RSS/Atom parsing and feed discovery | Skuldr | Urdr | `lib/feeds/rss.ts`, `service.ts`, `text.ts`, `types.ts` | `rss-parser` needs Node, so it won't run in the Worker or browser. Switch to `fast-xml-parser` (already a Skuldr dependency). Merge it with Urdr's own Substack parser (`social/substack.ts`) so there's one parser. |
| 3 | Substack | Urdr (Reading Room) | Urdr (feeds) | `social/substack.ts`, `worker/substack.ts` | Stays in Urdr, but as a normal feed source instead of a social one. |
| 4 | OPML import and export | Skuldr | Urdr | `lib/feeds/opml.ts` | Keep Skuldr's export until your subscriptions have moved: export OPML from Skuldr, import it into Urdr. |
| 5 | Tags, filter rules | Skuldr | Urdr | `lib/feeds/filters.ts`, the `filters` and `sources` pages | They move from Postgres tables to Dexie tables. The filter matcher is plain TS and ports as is. |
| 6 | Source directory and search | Skuldr | Urdr | `lib/directory`, `scripts/build-directory.ts` | The bundled directory becomes a static file in Urdr. "Feeds others here follow" has no equivalent without a server, so it's dropped. |
| 7 | Timeline, grid and magazine layouts | Skuldr | Urdr | Skuldr's home page | Rebuild with the shared components (section 3) rather than copying the old CSS. |
| 8 | Full text, image proxy | Skuldr (planned) | Urdr | — | Built new in Urdr's Worker. |
| 9 | Bluesky accounts and feeds | Skuldr (as sources) | Skuldr (as people) | `lib/feeds/bsky.ts` | Stays in Skuldr. "A source" becomes "someone you follow", shown in a home timeline with threads. |
| 10 | Bluesky Reading Room | Urdr | Skuldr | `social/bluesky.ts`, `sources.ts`, `ReadingRoomPage.tsx` | Skuldr's timeline replaces it. Urdr keeps `match.ts` and `ConversationPanel.tsx` for the per-book panel, with posts opening in Skuldr (or bsky.app if Skuldr isn't set up). |
| 11 | Share to Bluesky | Urdr | Skuldr | `quotes.ts` compose-intent link | Points at Skuldr's share URL once it exists; the compose intent stays as the fallback. |
| 12 | Quotes | Urdr | Urdr (highlights) | `features/quotes` | Becomes highlights with notes and the Verdandi export format. |
| 13 | Feed subscription record | Skuldr lexicons | Urdr (opt-in sync) | `app.skuldr.feed.subscription` | Stays in the shared lexicons package; gets Urdr's own namespace when Urdr's sync is built. |
| 14 | Dictionary | Verdandi | Verdandi + a hosted lookup | `wiktionary.db` | One hosted copy serves Urdr's quick lookup and Verdandi on web and mobile, where the 1 GB database can't be bundled. Desktop Verdandi keeps the local file. |
| 15 | Long-form page text | Skuldr (page builder) | Verdandi | — | Skuldr's builder edits layout and short copy; long pages are written in Verdandi and arrive as drafts. |

Newsletter inboxes move to Urdr's "later" list, and Mastodon waits on the open question
of feeds versus people.

## 2. One stack

### Target

| Layer | Choice | Change needed |
| --- | --- | --- |
| Language | TypeScript 6.0, strict | Skuldr upgrades from 5.9 |
| UI | React 19.3, Tailwind v4, Radix primitives, Lucide icons | Skuldr adopts Tailwind, Radix and Lucide; Urdr adds Radix |
| Build | Vite | Verdandi stays on Vite 7 until electron-vite supports Vite 8 |
| Routing | React Router 8 | Skuldr moves to it in framework mode (decided below); Verdandi adds it for its web build if needed |
| Remote data | TanStack Query | Skuldr and Verdandi's web build |
| Validation | zod 4 | For handoff formats, settings files, lexicon records and API input, in all three |
| Local data | Dexie in browsers and Capacitor; SQLite on desktop and server | Unchanged. Each app keeps the store that suits it |
| Server | Postgres + Drizzle (Skuldr only) | Unchanged |
| Lint and format | oxlint + Prettier, configs from `@norn-apps/config` | Verdandi moves from ESLint; Skuldr adds both; nobody has a formatter today |
| Tests | Vitest; Playwright for web builds later | Urdr and Skuldr start with the code that moves (filters, OPML, parsers) |
| Desktop | Electron 44 + electron-vite | Urdr and Skuldr shells copy Verdandi's setup |
| Mobile | Capacitor | All three |
| Hosting | Cloudflare Workers for static apps; Docker + Caddy for Skuldr | Verdandi's web build hosts like Urdr |
| Runtime | Node 22.18+, npm workspaces | Same `engines` field everywhere |
| AI | Python sidecar (FastAPI) | Verdandi only |

### Skuldr's framework

**Decided (Nov 13): React Router 8 framework mode on Vite.** The switch happens with the
removal of the feed UI (Phase 3). What it costs, and how to cover it:

- **Image resizing for galleries:** there's no `next/image`, so add a resize endpoint
  (`sharp`) behind a cache, or Cloudflare Images.
- **A JSON API for the desktop and mobile apps:** their bundled single-page build calls
  the instance. They'd need this with Next.js too.
- **More JavaScript on public pages** than with server components. Fine for small
  personal sites; revisit if pages get heavy.

The options that were weighed:

- **Keep Next.js 16.** It works today and gives server rendering for public sites. But its
  router, data loading and build are unlike the other two. Shared components need
  `"use client"` boundaries, and the Capacitor app can only load a remote URL.
- **Move to React Router 8 framework mode on Vite (recommended).** It's the same router and
  build as Urdr. It still server-renders public `/@handle` pages, which personal sites
  need for search and link previews, and it builds an SPA for the desktop and mobile
  shells. The timing is good: most of Skuldr's current UI is the feed reader, which is being
  deleted anyway. The OAuth routes, session and Drizzle code carry over. Only the pages and
  server actions are rewritten.

### Repo layout

**Decided (Nov 13): three repos stay separate.** The shared code goes in a fourth repo,
`norns-kit`, which holds only packages and this plan.

```
urdr-reader/      the reader       (was echtra)
verdandi-writer/  the writer       (was ogma)
skuldr-social/    the social app   (was rhyza)
norns-kit/        npm workspaces: packages/ui, config, atproto-lexicons, formats, fetch, atproto
                  plus this plan (PLAN.md)
```

- **Publishing:** the packages are published to the public npm registry under a scope you
  own, and the apps depend on them by version like any other library. Public npm needs no
  auth token for installs, so Cloudflare deploys and CI work unchanged. (GitHub Packages
  needs a token even to install public packages. npm can't install one folder of a Git repo,
  so Git dependencies don't work for a workspace.)
- **Versions:** Changesets in `norns-kit` for version bumps and changelogs. Apps upgrade when
  they choose to, so one app can't break another.
- **Working across repos:** while changing a package and an app together, point the app at
  the local copy (`npm install ../norns-kit/packages/ui`, or `npm link`), then switch back to
  the published version before committing.
- **Handoff formats are versioned on the wire.** Separately released apps can be on
  different versions, so every highlight export, deep link and share URL carries a format
  version (`v=1`). Readers accept older versions and ignore fields they don't know.
- **Lexicons** live in `norns-kit` as `@norn-apps/atproto-lexicons`, moved out of Skuldr
  because Verdandi and Urdr need them too.
- **Config:** `@norn-apps/config` keeps tooling in step: each repo's tsconfig, oxlint and
  Prettier configs extend it, so one version bump updates all three.

### Shared packages

All in `norns-kit`, published under the `@norn-apps` scope on npm.

| Package | Contents | Used by |
| --- | --- | --- |
| `@norn-apps/ui` | Tokens, themes, fonts, base reset, components, app shell | All three |
| `@norn-apps/config` | tsconfig, oxlint, Prettier and Vitest presets | All three |
| `@norn-apps/atproto-lexicons` | AT Protocol record types, zod validators, Markdown → page rich text. Named for the protocol so it isn't mistaken for Verdandi's lexicon, its personal word list | Skuldr, Verdandi (publish), Urdr (sync) |
| `@norn-apps/formats` | Highlight export format, deep-link URL builders and parsers, share-URL builder | All three |
| `@norn-apps/fetch` | SSRF-safe fetch (Node and Worker variants), Readability extraction | Urdr, Skuldr |
| `@norn-apps/atproto` | OAuth client setup, identity, instance picker | Skuldr, later Urdr |

### License

**Decided (Nov 13): GPL-3.0-or-later everywhere**, for all three apps (including
Verdandi's sidecar) and `norns-kit`. Book text, Wikipedia, Wiktionary data and fonts keep
their own licenses; those are data, not code.

**The App Store catch.** Apple's App Store terms add usage restrictions that the FSF
considers incompatible with the GPL (this is why VLC was pulled from iOS in 2011). As the
only copyright holder you can still ship your own apps there, because the license binds the
people you give the code to, not you. Once someone else contributes code, their part is
GPL-only, and shipping it on iOS needs their permission.

**Decided (Nov 13): an App Store exception.** Each repo has a `LICENSE-EXCEPTION` file: a
GPLv3 section 7 additional permission to distribute through app stores despite their usage
rules, as long as the source stays freely available elsewhere and the listing or the app
says where. Contributions are accepted under the GPL plus this permission, and the READMEs
say so. `norns-kit` gets the same file when it's created. The `license` fields stay
`GPL-3.0-or-later`, because SPDX has no identifier for a custom exception. Have someone
with licensing experience read the text before the first iOS release.

Google Play and desktop code signing have no such conflict.

## 3. One look

The three apps already look like relatives: warm off-white paper, near-black ink, one
accent, light and dark. The plan makes that deliberate. **Same base, same type, same
components. Each Norn keeps her own accent.**

### Accent per Norn

| App | Accent today (light / dark) | Meaning |
| --- | --- | --- |
| Urdr | amber `#8a4b14` / `#e0a15e` | what has been: aged paper, old gold |
| Verdandi | green `#3f6b5a` / `#8fbfa8` | what is becoming: growth |
| Skuldr | blue `#2f5bd3` / `#7d9cff` | what shall be: the open sky |

Urdr's and Verdandi's accents are already muted to the same degree. Skuldr's blue is much
brighter. Tone it down to match; Verdandi's Slate accent (`#4a6a9b` / `#88a8d8`) is a ready
candidate.

### Tokens

One set of names, defined in `@norn-apps/ui`, read by Tailwind through `@theme inline` (as
Urdr and Verdandi already do):

| Token | Urdr today | Verdandi today | Skuldr today |
| --- | --- | --- | --- |
| `--bg` | `--bg` | `--bg` | `--bg` |
| `--raised` (cards, popovers) | `--surface` | `--raised` | `--surface` |
| `--sunken` (sidebars, wells) | `--surface-2` | `--surface` | — |
| `--border` | `--border` | `--border` | `--border` |
| `--text` | `--fg` | `--text` | `--text` |
| `--muted` | `--muted` | `--muted` | `--muted` |
| `--accent`, `--accent-text` | `--accent`, `--accent-fg` | `--accent` | `--accent`, `--accent-text` |
| `--link` | `--link` | — | — |
| `--highlight`, `--selection` | `--highlight` | `--selection` | — |
| `--ok`, `--warn`, `--danger` | — | `--ok`, `--warn`, `--bad` | `--ok`, `--danger` |
| `--radius` | — | — | `--radius` |

App-specific tokens stay in the app (Verdandi's syntax and code colors, Urdr's
`--reader-*` settings).

### Themes

Urdr's reading themes and Verdandi's palettes become one model: a **scheme** and a
**palette**.

- **Scheme:** System, Light, Dark, Black. Black is the true-black dark mode for OLED phones,
  from Urdr.
- **Palette:** Default, Paper, Slate, Mono. Palettes change the neutrals; the app's accent
  stays, except in Mono. Paper merges Urdr's Sepia and Verdandi's Parchment, which are
  already nearly the same.
- Urdr's current themes map directly: light = Default/Light, sepia = Paper/Light,
  dark = Default/Dark, black = Default/Black.
- The neutral base is the one Urdr and Skuldr already share (`#fbfaf7` light).
- One attribute on `<html>` for each: `data-scheme` and `data-palette`.

Skuldr's public sites are separate: they use the user's own theme record, not the app's
chrome.

### Type

All fonts are bundled through Fontsource, so every platform looks the same. Today Verdandi
asks for Source Serif 4 and Cascadia Mono without bundling them, so macOS, Linux and phones
fall back to Georgia and Consolas.

- **UI:** Inter Variable (Urdr already bundles it).
- **Reading and writing:** Literata Variable by default, with Source Serif 4, EB Garamond
  and Atkinson Hyperlegible as options in both Urdr and Verdandi.
- **Mono:** Cascadia Code (open source, so it can be bundled).

### Components and shell

- `@norn-apps/ui` components: Button, IconButton, Input, Select, Dialog, Menu, ContextMenu,
  Tabs, Toast (with Verdandi's undo pattern), Popover, Tooltip. Radix underneath, Tailwind
  on top, Lucide icons.
- **Appearance settings:** one shared panel for scheme, palette, fonts and text size, so the
  setting looks and works the same in every app.
- **App shell:** the same header height, sidebar width, spacing scale and focus styles. The
  header has a small Norn switcher linking to the other two apps when they're installed or
  configured.
- **Shortcuts:** the same keys for the same jobs. Ctrl+D looks up a word (Verdandi's
  existing key, and Urdr's quick lookup), Ctrl+, opens settings, Ctrl+F finds in the page,
  Ctrl+Shift+F searches everything, Ctrl+K opens a command palette.
- **Marks:** three app icons in one style, each in its Norn's accent.

### Adopting it

- **Urdr:** rename tokens, swap themes for scheme + palette, add Radix. Small.
- **Verdandi:** rename tokens, bundle fonts, then move pieces of the 2,160-line stylesheet
  into shared components over time. Turn on the shared reset last, since Verdandi
  deliberately left Tailwind's reset out.
- **Skuldr:** built on the shared kit from the start of its UI rebuild; the hand-written CSS
  goes with the feed pages.

## 4. Roadmap across the apps

Ordered so each step lands in the shape the next one expects. Cheap shared groundwork
comes first; the feed move comes before Skuldr's rebuild because the rebuild deletes the
feed UI.

**Phase 0 — Groundwork**
- [x] Decide: three repos plus `norns-kit`
- [x] Decide: Skuldr moves to React Router 8 framework mode
- [x] Decide: GPL-3.0-or-later everywhere; LICENSE added to Urdr and Verdandi
- [x] Add the App Store exception (`LICENSE-EXCEPTION`) to all three repos
- [x] Decide: npm scope `@norn-apps`
- [x] Create the `@norn-apps` organization on npmjs.com (Nov 13)
- [x] Register the domain: `skuldr.app` (Nov 13). Turn on auto-renew; the record names
      depend on it forever
- [x] Move lexicons from `app.rhyza.*` to `app.skuldr.*` (Nov 13, branch
      `lexicons/app-skuldr` in Skuldr). The feed subscription record moved too
      (`app.skuldr.feed.subscription`); it gets Urdr's own namespace when Urdr's sync is built
- [ ] Point `skuldr.app` at your instance; later add the `_lexicon` DNS records so other
      apps can look up the schemas
- [x] Rename the GitHub repos and folders to `urdr-reader`, `verdandi-writer`, `skuldr-social`
- [x] Rename Urdr and Skuldr in code (Nov 13). Urdr copies its old `echtra` browser database
      across on first open. Its Worker is `urdr-reader`, deployed Nov 13 at
      urdr-reader.matthewrcooper4.workers.dev; no `echtra` Worker had been deployed, so no
      readers' data was left at an old address. Skuldr's cookie rename signs
      everyone in once more; Docker instances from before the rename set `POSTGRES_USER` and
      `POSTGRES_DB` to `rhyza`
- [ ] Rename Verdandi in code once its work in progress is committed: package and product
      name, the `%APPDATA%\Ogma` profile (copy it across on first launch), `OGMA_*`
      environment variables (keep reading the old ones), `.ogma/` folders and the `ogma_ai`
      sidecar
- [x] Create `norns-kit` with Changesets and move this plan into it (Nov 13)
- [x] `@norn-apps/config` 0.1.0: TypeScript presets (base, react, node, node-script), oxlint
      (base, react), Prettier and Vitest, checked by a fixture app
- [x] Move the lexicons from Skuldr into `norns-kit` as `@norn-apps/atproto-lexicons` (Nov 13),
      with a test that parses each one and resolves its references
- [x] Create the `norns-kit` repo on GitHub ([spectralradiance/norns-kit](https://github.com/spectralradiance/norns-kit), Nov 13)
- [x] Publish `@norn-apps/config` to npm (Nov 14): 0.1.0, then 0.1.1 to allow Vitest 5, then
      0.1.2 turning off two rules that flagged correct code
- [x] Publish `@norn-apps/atproto-lexicons` 0.1.0 to npm (Nov 13)
- [x] Adopt `@norn-apps/config` in Urdr and Skuldr: TypeScript 6, oxlint, Prettier, Vitest
- [ ] Adopt `@norn-apps/config` in Verdandi, once its work in progress is committed

**Phase 1 — Shared look**
- [ ] `@norn-apps/ui`: tokens, scheme + palette themes, bundled fonts, first components,
      appearance panel
- [ ] Urdr and Verdandi adopt the tokens and themes

**Phase 2 — Feed engine to Urdr** (moves 1–8 in section 1)
- [ ] `@norn-apps/fetch` with a Worker variant
- [ ] Urdr: one feed parser, sources, OPML, tags, filters, directory, layouts
- [ ] Urdr: full text from feeds, then the Readability fallback and image proxy
- [ ] Move your subscriptions over by OPML
- [ ] Skuldr: remove the feed sources, pages and worker

**Phase 3 — Skuldr connects** (moves 9–11)
- [ ] Rebuild Skuldr on React Router 8 framework mode and the shared kit, porting OAuth,
      sessions and Drizzle; drop Next.js
- [ ] A JSON API for Skuldr's desktop and mobile builds; image resizing for galleries
- [ ] People you follow, home timeline, threads, composing posts and replies
- [ ] Share URL; Urdr and Verdandi point at it
- [ ] Urdr shrinks the Reading Room to the book conversation panel

**Phase 4 — Handoffs** (move 12)
- [ ] `@norn-apps/formats`: highlight format and deep links, each with a format version
- [ ] Urdr highlights and export; Verdandi import and `verdandi://` links
- [ ] Hosted dictionary lookup; Urdr's quick lookup uses it (move 14)

**Phase 5 — Platforms**
- [ ] Verdandi's editor package; Git sync; macOS and Linux builds
- [ ] Electron shells for Urdr and Skuldr, from Verdandi's setup
- [ ] Capacitor for all three; Verdandi web and mobile builds
- [ ] Apple and Google developer accounts, Windows signing, macOS notarization

**Phase 6 — Publishing** (move 15)
- [ ] Skuldr's page builder and page record are stable
- [ ] Verdandi's publish action sends drafts to Skuldr

## 5. Future plans for each app

Beyond the phases above. Items marked *idea* aren't in any plan yet.

### Urdr Reader
- **Next:** feed engine, full text, highlights with Verdandi export.
- **Then:** EPUB import, Wikipedia, offline reading, text-to-speech, reading stats, on-demand
  Gutenberg import, in-book search. Grow the hosted library from 18 titles to a few hundred.
- **Later:** private sync across devices, LibriVox pairing, sacred-texts.com, newsletter inbox.
- *Idea:* "save to Urdr" from the system share sheet on phones and desktop, so any article
  you find elsewhere lands in Urdr's full-text view.
- *Idea:* parallel texts for mythology (original and translation side by side), using the
  shared position model.

### Verdandi Writer
- **Next:** finish the work in progress (section moves, document titles), highlight import,
  `verdandi://` links.
- **Then:** the shared editor package, Git sync, macOS and Linux, web and mobile with the
  hosted dictionary.
- **Later:** publish to Skuldr, embedding-based related notes, DOCX export, AI on mobile
  through your desktop's model, the deferred MCP server for working on the workspace.

### Skuldr Social
- **Next:** domain and lexicon move, feed removal and the move to React Router, people and
  timeline, the composer, the share URL.
- **Then:** the personal site and page builder, Verdandi drafts, galleries, an ActivityPub
  bridge.
- **Later:** stories and reels, audience controls, moderation and admin, custom feed
  generators, templates, custom domains per site, a Jetstream AppView once custom records
  need to be found by others.

## Decisions

| Decision | Recommendation | Blocks |
| --- | --- | --- |
| One monorepo or three repos | **Decided:** three repos plus `norns-kit` | — |
| Lexicon domain | **Decided:** `skuldr.app`, so records are `app.skuldr.*` | — |
| npm scope for the shared packages | **Decided:** `@norn-apps` (free on Nov 13; `@norns` was taken) | — |
| Skuldr's framework | **Decided:** React Router 8 framework mode | — |
| License | **Decided:** GPL-3.0-or-later everywhere | — |
| App Store and the GPL | **Decided:** App Store exception (`LICENSE-EXCEPTION`) | — |
| Feed fetching in Urdr | Cloudflare Worker | Phase 2 |
| Mastodon | Open: feeds in Urdr or people in Skuldr | Later |
| AI site editing in Skuldr | Open: narrow layout-only AI, or none | Skuldr Phase 3 |
| Highlights sync to the PDS | Opt-in and labelled public, or another sync | Urdr sync |
| Verdandi → Skuldr transport | Open: API call or open Skuldr with the draft | Phase 6 |
