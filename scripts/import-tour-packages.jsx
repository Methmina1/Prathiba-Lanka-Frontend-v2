/**
 * Imports the tour packages from the rate sheet into the backend, through the admin API.
 *
 *   npm run import:packages -- <packages.json> [--prune]
 *
 * The JSON comes from scripts/extract-tour-packages.ps1, which reads the workbook. Packages are
 * matched on title, so running it again updates what the sheet already contains rather than
 * duplicating it; `--prune` also removes packages the sheet no longer lists.
 *
 * What the sheet gives and how it maps onto the API:
 *
 *   package name        -> title
 *   experience          -> destination. The full "locations covered" list is 174 characters for the
 *                          island-wide tours, which is longer than the destination column and turns
 *                          the journey card's pill and the detail page's eyebrow into a paragraph, so
 *                          the short category goes there and every stop is listed in the description.
 *                          A tier prefix ("Luxury: Cultural, Wildlife ...") is dropped, because the
 *                          accommodation tier is already spelled out in the description.
 *   days                -> durationDays
 *   base price          -> price, taken from the package sheet rather than the overview, because the
 *                          two disagree and the sheet is the one with the itinerary and hotels
 *   day-by-day          -> itinerary, one line per day, numbered by the front end
 *   hotel table         -> the hotels and the accommodation tier, summarised in the description
 *   -                   -> imageUrl is left empty; set covers from the admin console
 */
import { readFile } from 'node:fs/promises'
import { api } from '../src/api/client.js'
import { adminApi } from '../src/api/admin.js'

const [file, ...flags] = process.argv.slice(2)
if (!file) {
  console.error('usage: npm run import:packages -- <packages.json> [--prune]')
  process.exit(1)
}
const prune = flags.includes('--prune')

// The extractor runs under Windows PowerShell, whose "Set-Content -Encoding UTF8" writes a byte
// order mark; JSON.parse() refuses it, so strip one if it is there.
const sheet = JSON.parse((await readFile(file, 'utf8')).replace(/^\uFEFF/, ''))
const overview = new Map((sheet.overview ?? []).map((row) => [row.number, row]))

const titleCase = (value) =>
  value
    .replace(/[^\x20-\x7E]/g, ' ')            // the sheet prefixes names with emoji
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
    .replace(/\b[a-z]/g, (letter) => letter.toUpperCase())
    .replace(/\bAnd\b/g, 'and')

/** "🏝  PEARL TRAIL  —  Classic Sri Lanka Highlights" -> "Pearl Trail" */
const packageTitle = (heading) => titleCase(heading.split('\u2014')[0])

/** "$1,100" -> 1100 */
const money = (value) => Number(String(value ?? '').replace(/[^0-9.]/g, '')) || null

const tidy = (value) => String(value ?? '').replace(/\s*·\s*/g, ' · ').replace(/\s+/g, ' ').trim()

/** "Luxury: Cultural, Wildlife & Beach" -> "Cultural, Wildlife & Beach" */
const experience = (value) => tidy(value).replace(/^(luxury|ultimate)\s*:\s*/i, '')

const days = (value) => Number(String(value ?? '').match(/(\d+)\s*Day/i)?.[1]) || null

const login = await api.login('admin@test.com', 'Admin@12345')
const token = login.token
if (!token) throw new Error('no admin token - is the backend running?')

const existing = await adminApi.listPackages(token)
const byTitle = new Map(existing.map((pkg) => [pkg.title, pkg]))

console.log(`Importing ${sheet.packages.length} packages from ${file}\n`)

const imported = []
for (const entry of sheet.packages) {
  const title = packageTitle(entry.heading)
  const subtitle = entry.heading.split('\u2014')[1]?.trim() ?? ''
  const matchesUnesco = entry.days.some((day) => /unesco/i.test(day.text ?? ''))
  const overviewRow = overview.get(entry.number)
  const tier = tidy(entry.accommodation ?? overviewRow?.accommodation)

  const stays = entry.stays
    .map((stay) => stay.hotel)
    .filter(Boolean)
    .map((hotel) => hotel.replace(/\s*★+\s*$/, ''))

  const description = [
    `${subtitle} · ${experience(entry.experience)} · ${tidy(entry.duration)}.`,
    `Visiting ${tidy(entry.locations)}.`,
    matchesUnesco ? 'Includes UNESCO World Heritage sites.' : null,
    stays.length > 0 ? `Stays: ${stays.join(', ')}.` : null,
    tier ? `Accommodation tier: ${tier}.` : null,
    'Price per person on double sharing; international airfare, visa fees and personal expenses are not included.',
  ]
    .filter(Boolean)
    .join(' ')

  const payload = {
    title,
    destination: experience(entry.experience),
    durationDays: entry.days.length || days(entry.duration),
    price: money(entry.price),
    maxCapacity: null,
    description,
    itinerary: entry.days.map((day) => day.text).join('\n'),
    imageUrl: '',
    status: 'ACTIVE',
  }

  const match = byTitle.get(title)
  const saved = match
    ? await adminApi.updatePackage(token, match.packageId, payload)
    : await adminApi.createPackage(token, payload)
  imported.push(title)

  const priceNote =
    overviewRow && money(overviewRow.price) !== payload.price
      ? `   (overview sheet says $${overviewRow.price})`
      : ''

  console.log(
    `  ${match ? 'updated' : 'created'}  ${saved.title.padEnd(26)} ${String(payload.durationDays).padStart(2)} days  ` +
      `$${String(payload.price).padStart(4)}  ${String(entry.days.length).padStart(2)} itinerary lines  ` +
      `${payload.destination}${priceNote}`,
  )
}

if (prune) {
  console.log('')
  const gallery = await api.getGallery()
  for (const pkg of await adminApi.listPackages(token)) {
    if (imported.includes(pkg.title)) continue

    // A journey the gallery still points at cannot be deleted - the reference is what the backend
    // refuses. Drop those gallery items first; the files stay in the media library, so the
    // photographs can be re-linked to a journey from the console at any time.
    for (const item of gallery.filter((row) => row.packageId === pkg.packageId)) {
      await adminApi.deleteImage(token, item.imageId)
      console.log(`  unlinked ${pkg.title} -> gallery item ${item.imageId}`)
    }

    try {
      await adminApi.deletePackage(token, pkg.packageId)
      console.log(`  removed  ${pkg.title}`)
    } catch (problem) {
      console.log(`  kept     ${pkg.title} (${problem.message})`)
    }
  }
}

console.log(`\nDone. ${(await adminApi.listPackages(token)).length} packages in the catalogue.`)
