/**
 * Uses the DOM, so only the React preset compiles it. Node scripts must not import this
 * file: the node-script preset has no DOM types and rejects it.
 */
export function pageTitle(): string {
  return typeof document === 'undefined' ? '' : document.title
}
