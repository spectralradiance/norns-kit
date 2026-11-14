/**
 * Prettier preset for the Norn apps: no semicolons, single quotes, 100 columns.
 * Use it with `"prettier": "@norn-apps/config/prettier"` in package.json.
 *
 * @type {import('prettier').Config}
 */
const config = {
  semi: false,
  singleQuote: true,
  trailingComma: 'all',
  printWidth: 100,
}

export default config
