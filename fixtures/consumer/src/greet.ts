/** Plain logic with no browser or Node APIs, so both presets can compile it. */
export function greet(name: string): string {
  return `Hello, ${name.trim() || 'reader'}`
}
