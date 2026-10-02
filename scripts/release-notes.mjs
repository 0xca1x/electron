import { readFileSync } from 'node:fs'

const { version } = JSON.parse(readFileSync('apps/desktop/package.json', 'utf8'))

if (process.env.GITHUB_REF_NAME !== `v${version}`) {
  throw new Error(`Release tag must match package.json version: v${version}`)
}

const sections = readFileSync('CHANGELOG.md', 'utf8').split(/^## /m)
const matches = sections.slice(1).filter(section => section.split(/\r?\n/, 1)[0].trim() === version)

if (matches.length !== 1) {
  throw new Error(`CHANGELOG.md must contain exactly one "## ${version}" section`)
}

const notes = matches[0].split(/\r?\n/).slice(1).join('\n').trim()

if (!notes.split(/\r?\n/).some(line => line.trim() && !line.trim().startsWith('#'))) {
  throw new Error(`CHANGELOG.md has no release notes for ${version}`)
}

console.log(notes)
