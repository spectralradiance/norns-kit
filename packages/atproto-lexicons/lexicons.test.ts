import { readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { Lexicons, parseLexiconDoc, type LexiconDoc } from '@atproto/lexicon'
import { describe, expect, it } from 'vitest'

const root = path.join(import.meta.dirname, 'lexicons')
const files = readdirSync(root, { recursive: true, encoding: 'utf8' })
  .filter((f) => f.endsWith('.json'))
  .map((f) => f.replaceAll('\\', '/'))
  .toSorted()

const docs = files.map((file) => ({
  file,
  doc: parseLexiconDoc(JSON.parse(readFileSync(path.join(root, file), 'utf8'))),
}))

// Lexicons from other namespaces that ours may point at. Add to this list deliberately.
const EXTERNAL = new Set(['com.atproto.repo.strongRef', 'app.bsky.embed.defs#aspectRatio'])

function refsIn(value: unknown): string[] {
  if (Array.isArray(value)) return value.flatMap(refsIn)
  if (!value || typeof value !== 'object') return []
  return Object.entries(value).flatMap(([key, v]) => {
    if (key === 'ref' && typeof v === 'string') return [v]
    if (key === 'refs' && Array.isArray(v)) return v.filter((r) => typeof r === 'string')
    return refsIn(v)
  })
}

describe('lexicons', () => {
  it('ships the expected documents', () => {
    expect(files).toEqual([
      'app/skuldr/feed/subscription.json',
      'app/skuldr/gallery.json',
      'app/skuldr/page.json',
      'app/skuldr/reel.json',
      'app/skuldr/story.json',
      'app/skuldr/theme.json',
    ])
  })

  it.each(docs)('$file has an id that matches its path', ({ file, doc }) => {
    expect(`${doc.id.replaceAll('.', '/')}.json`).toBe(file)
  })

  it('resolves every reference, or names it as external', () => {
    const lexicons = new Lexicons(docs.map((d) => d.doc))
    const unresolved = docs.flatMap(({ doc }: { doc: LexiconDoc }) =>
      refsIn(doc.defs)
        // Parsing rewrites refs as lex: URIs; local ones may still start with #.
        .map((ref) => ref.replace(/^lex:/, ''))
        .map((ref) => (ref.startsWith('#') ? `${doc.id}${ref}` : ref))
        .filter((ref) => !EXTERNAL.has(ref) && !lexicons.getDef(ref)),
    )
    expect(unresolved).toEqual([])
  })

  it('validates a feed subscription record', () => {
    const lexicons = new Lexicons(docs.map((d) => d.doc))
    const nsid = 'app.skuldr.feed.subscription'
    const record = {
      $type: nsid,
      source: { $type: `${nsid}#rssSource`, url: 'https://example.com/feed.xml' },
      tags: ['News'],
      createdAt: '2026-11-13T12:00:00.000Z',
    }
    expect(() => lexicons.assertValidRecord(nsid, record)).not.toThrow()
    expect(() => lexicons.assertValidRecord(nsid, { ...record, createdAt: 'yesterday' })).toThrow()
    expect(() =>
      lexicons.assertValidRecord(nsid, { $type: nsid, createdAt: record.createdAt }),
    ).toThrow()
  })
})
