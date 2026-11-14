import { describe, expect, it } from 'vitest'
import { pageTitle } from './dom.ts'
import { greet } from './greet.ts'

describe('greet', () => {
  it('greets by name', () => {
    expect(greet('Urðr')).toBe('Hello, Urðr')
  })

  it('falls back when the name is blank', () => {
    expect(greet('  ')).toBe('Hello, reader')
  })

  it('has no page title outside a browser', () => {
    expect(pageTitle()).toBe('')
  })
})
