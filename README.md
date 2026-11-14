# norns-kit

Shared packages for the three Norn apps: **Urdr Reader** (reading), **Verdandi Writer**
(writing) and **Skuldr Social** (publishing and people). The apps live in their own repos and
depend on these packages from npm, under the `@norn-apps` scope.

See [PLAN.md](PLAN.md) for the cross-app plan: which app owns what, the shared stack and
look, and the roadmap.

## Packages

| Package | Contents | Status |
| --- | --- | --- |
| [`@norn-apps/config`](packages/config) | TypeScript, oxlint, Prettier and Vitest presets | 0.1.0, not yet published |
| `@norn-apps/ui` | Tokens, themes, fonts, components | Planned |
| `@norn-apps/lexicons` | AT Protocol record types (`app.skuldr.*`) | Planned; today in Skuldr's repo |
| `@norn-apps/formats` | Highlight export, deep links, share URL | Planned |
| `@norn-apps/fetch` | SSRF-safe fetch, Readability extraction | Planned |
| `@norn-apps/atproto` | OAuth client, identity, instance picker | Planned |

## Working on it

Requires Node 22.18+.

```bash
npm install
npm run check     # Prettier, oxlint, and the fixture app that uses every preset
npm run format    # rewrite files in the shared style
```

`fixtures/consumer` is a tiny private app that uses `@norn-apps/config` the way the Norn apps
do, so `npm run check` proves the presets resolve and pass. It isn't published.

To try a change in an app before publishing, install the local copy there
(`npm install ../norns-kit/packages/config`), then switch back to the published version
before committing.

## Releasing

Versions and changelogs are managed with [Changesets](https://github.com/changesets/changesets):

```bash
npm run changeset          # describe a change and pick patch, minor or major
npm run version-packages   # apply pending changesets: bump versions, write changelogs
npm run release            # run the checks, then publish new versions to npm
```

Publishing needs you signed in to npm (`npm login`) as a member of the `norn-apps`
organization.

## License

GPL-3.0-or-later ([LICENSE](LICENSE)), with an additional permission for app store
distribution ([LICENSE-EXCEPTION](LICENSE-EXCEPTION)). Contributions are accepted under the
same terms.
