// Run directly by Node (type stripping), checked with the node-script preset.
import { greet } from '../src/greet.ts'

process.stdout.write(`${greet('Verðandi')}\n`)
