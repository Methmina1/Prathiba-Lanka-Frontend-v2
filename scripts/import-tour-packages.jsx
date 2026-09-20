/**
 * Imports the tour packages from the rate sheet into the backend, through the admin API.
 *
 *   npm run import:packages -- <packages.json> [--prune] [--copy <copy.json>]
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
 *
 * data/package-copy.json then replaces the generated wording with the copy written for the site:
 * `summary` becomes the description (two lines on a card, no more) and `story` becomes the
 * longDescription behind the "read the full description" dialog and on the journey page. A package
 * the copy file does not mention keeps the generated description and gets no long one.
 *
 * `cover` names a photograph in public/images/sl. It is uploaded to the media library once and
 * linked, and only when the package has no cover yet, so a cover chosen in the console is never
 * overwritten by a later run.
 */
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { api } from '../src/api/client.js'
import { adminApi } from '../src/api/admin.js'

const here = dirname(fileURLToPath(import.meta.url))
const photoDir = join(here, '..', 'public', 'images', 'sl')

// Sign in as the agency's admin. As with the seeder, the password comes from the environment -
// BOOTSTRAP_ADMIN_PASSWORD is the variable the backend creates the account from - so no password is
// committed here.
const adminEmail =
  process.env.PRATHIBALANKA_ADMIN_EMAIL ?? process.env.BOOTSTRAP_ADMIN_EMAIL ?? 'prathibhalankavoyages@gmail.com'
const adminPassword = process.env.PRATHIBALANKA_ADMIN_PASSWORD ?? process.env.BOOTSTRAP_ADMIN_PASSWORD ?? ''
if (!adminPassword) {
  console.error(
    'No admin password.\n' +
      'Set BOOTSTRAP_ADMIN_PASSWORD (the variable the backend creates the admin account from),\n' +
      'or PRATHIBALANKA_ADMIN_PASSWORD, and run again.',
  )
  process.exit(1)
}

const args = process.argv.slice(2)
const flags = new Set()
let copyFile = join(here, '..', 'data', 'package-copy.json')
let file = null

for (let index = 0; index < args.length; index += 1) {
  const arg = args[index]
  if (arg === '--copy') {
    copyFile = args[index + 1]
    index += 1
  } else if (arg.startsWith('--')) {
    flags.add(arg)
  } else if (!file) {
    file = arg
  }
}

if (!file) {
  console.error('usage: npm run import:packages -- <packages.json> [--prune] [--copy <copy.json>]')
  process.exit(1)
}
const prune = flags.has('--prune')

// The extractor runs under Windows PowerShell, whose "Set-Content -Encoding UTF8" writes a byte
// order mark; JSON.parse() refuses it, so strip one if it is there.
const sheet = JSON.parse((await readFile(file, 'utf8')).replace(/^\uFEFF/, ''))
const overview = new Map((sheet.overview ?? []).map((row) => [row.number, row]))
const copy = JSON.parse((await readFile(copyFile, 'utf8')).replace(/^\uFEFF/, ''))
delete copy._note

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

const login = await api.login(adminEmail, adminPassword)
const token = login.token
if (!token) throw new Error(`could not sign in as ${adminEmail} - is the backend running?`)

const existing = await adminApi.listPackages(token)
const byTitle = new Map(existing.map((pkg) => [pkg.title, pkg]))

/**
 * Uploads a cover photograph unless the media library already holds one with that file name, so
 * re-running does not fill the library with copies of the same picture.
 */
const CONTENT_TYPES = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' }

const media = await adminApi.listMedia(token)
const upload = async (fileName, title) => {
  const already = media.find((asset) => asset.originalName === fileName)
  if (already) return already

  const type = CONTENT_TYPES[fileName.slice(fileName.lastIndexOf('.')).toLowerCase()]
  if (!type) throw new Error(`No content type known for ${fileName}`)
  const bytes = await readFile(join(photoDir, fileName))
  const asset = await adminApi.uploadMedia(token, new File([bytes], fileName, { type }), title)
  media.push(asset)
  return asset
}

console.log(`Importing ${sheet.packages.length} packages from ${file}`)
console.log(`Copy from ${copyFile}\n`)

const imported = []
for (const entry of sheet.packages) {
  const title = packageTitle(entry.heading)
  const subtitle = entry.heading.split('\u2014')[1]?.trim() ?? ''
  const matchesUnesco = entry.days.some((day) => /unesco/i.test(day.text ?? ''))
  const overviewRow = overview.get(entry.number)
  const tier = tidy(entry.accommodation ?? overviewRow?.accommodation)
  const written = copy[title]

  const stays = entry.stays
    .map((stay) => stay.hotel)
    .filter(Boolean)
    .map((hotel) => hotel.replace(/\s*★+\s*$/, ''))

  // Used only for a journey the copy file has nothing to say about: a factual line assembled from
  // the sheet, so a new package is never blank on the card.
  const generated = [
    `${subtitle} · ${experience(entry.experience)} · ${tidy(entry.duration)}.`,
    `Visiting ${tidy(entry.locations)}.`,
    matchesUnesco ? 'Includes UNESCO World Heritage sites.' : null,
    stays.length > 0 ? `Stays: ${stays.join(', ')}.` : null,
    tier ? `Accommodation tier: ${tier}.` : null,
    'Price per person on double sharing; international airfare, visa fees and personal expenses are not included.',
  ]
    .filter(Boolean)
    .join(' ')

  const match = byTitle.get(title)

  const payload = {
    title,
    destination: experience(entry.experience),
    durationDays: entry.days.length || days(entry.duration),
    price: money(entry.price),
    maxCapacity: null,
    description: written?.summary ?? generated,
    longDescription: written?.story ?? null,
    itinerary: entry.days.map((day) => day.text).join('\n'),
    status: 'ACTIVE',
  }

  // A cover is only attached when the package has none: whatever staff picked in the console wins.
  if (!match?.imageUrl && written?.cover) {
    const asset = await upload(written.cover, `${title} cover`)
    payload.imageUrl = asset.url
  }

  const saved = match
    ? await adminApi.updatePackage(token, match.packageId, payload)
    : await adminApi.createPackage(token, payload)
  imported.push(title)

  const priceNote =
    overviewRow && money(overviewRow.price) !== payload.price
      ? `   (overview sheet says $${overviewRow.price})`
      : ''
  const coverNote = payload.imageUrl ? '  cover' : match?.imageUrl ? '  cover kept' : '  no cover'

  console.log(
    `  ${match ? 'updated' : 'created'}  ${saved.title.padEnd(26)} ${String(payload.durationDays).padStart(2)} days  ` +
      `$${String(payload.price).padStart(4)}  ${String(entry.days.length).padStart(2)} lines  ` +
      `${written ? `${String(written.summary.length).padStart(3)}+${String(written.story.length).padStart(4)} chars copy` : 'generated copy     '}` +
      `${coverNote}${priceNote}`,
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
