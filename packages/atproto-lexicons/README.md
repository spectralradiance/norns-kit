# @norn-apps/atproto-lexicons

Draft [AT Protocol lexicons](https://atproto.com/specs/lexicon) for the Norn apps. Each lexicon
defines a record type that lives in a user's own repo. NSIDs are `app.skuldr.*`, from the
`skuldr.app` domain.

Not to be confused with Verdandi Writer's lexicon, which is your personal word list.

| NSID | What it is |
| --- | --- |
| `app.skuldr.feed.subscription` | A feed you follow, synced so your setup moves between instances. Opt-in, and public like every repo record. |
| `app.skuldr.page` | A page of your personal site, made of blocks: text, links, a gallery or a feed. The record key is the URL slug; `self` is the home page. |
| `app.skuldr.story` | A short-lived image or video. Its expiry is honoured by Skuldr instances only: the record is public, and others may keep copies. |
| `app.skuldr.gallery` | An ordered set of images with captions, with an optional fallback post for clients that don't know the type. |
| `app.skuldr.reel` | A short vertical video with a caption. |
| `app.skuldr.theme` | A site theme as design tokens only, no CSS or code, so any instance can render it safely. Key `self` is the active theme; other keys are shareable templates. |

**These are drafts.** Fields can still change until a lexicon is marked stable, so don't
publish records from them outside a test account yet.

## Use

```bash
npm install @norn-apps/atproto-lexicons
```

The JSON files are exported as they are:

```ts
import subscription from '@norn-apps/atproto-lexicons/lexicons/app/skuldr/feed/subscription.json' with { type: 'json' }
import { Lexicons } from '@atproto/lexicon'

const lexicons = new Lexicons([subscription])
lexicons.assertValidRecord('app.skuldr.feed.subscription', record)
```

Code generators such as `@atproto/lex-cli` take the files by path, from
`node_modules/@norn-apps/atproto-lexicons/lexicons/`.

## Changing a lexicon

The test parses every file with `@atproto/lexicon`, checks that each id matches its path, and
fails on any reference that doesn't resolve. References to other namespaces
(`com.atproto.repo.strongRef`, `app.bsky.embed.defs#aspectRatio`) are listed in the test on
purpose; add new ones there. Once records exist in the wild, only add optional fields: renaming
or removing one breaks every record already written.
