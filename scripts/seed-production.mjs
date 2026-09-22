#!/usr/bin/env node
/**
 * Seed a production database from another instance: every journey, story, gallery item, photograph and
 * page of copy the agency already has.
 *
 *   node scripts/seed-production.mjs --from http://localhost:8080 --to https://prathibalanka.com
 *   node scripts/seed-production.mjs --from http://localhost:8080 --to https://<api> --dry-run
 *   node scripts/seed-production.mjs --from ... --to ... --only packages,journal
 *   node scripts/seed-production.mjs --from ... --to ... --to-password '<the target admin's password>'
 *
 * The two instances rarely share an administrator password - a laptop's admin comes from a
 * developer's environment, production's from whatever was set on its first boot. --admin-password
 * sets both; --from-password and --to-password override one side each, so the run does not depend on
 * the two agreeing. An environment variable called PRATHIBALANKA_ADMIN_PASSWORD is easy to have set
 * without knowing it, and it silently wins over BOOTSTRAP_ADMIN_PASSWORD - the flags win over both.
 *
 * Why a clone rather than a rewritten list of demo content: the agency's real catalogue came out of
 * their rate sheet, their stories and photographs came out of their console, and anything typed into a
 * script here is a second copy of the truth that drifts the first time somebody edits a price. This
 * reads the source instance through its own API and writes what it finds to the target, so "the data
 * that is on the site now" is exactly what lands in production.
 *
 * It is additive and idempotent - it never deletes and never overwrites:
 *
 *   media      skipped when a file with the same original name is already there
 *   packages   skipped when the title is already there (matched on title, like the demo seeder)
 *   journal    skipped on title; a post is published afterwards if it is published at the source
 *   gallery    skipped when its photograph is already in the target's gallery
 *   content    updated in place: About/Contact copy is replaced, because that is the point of it
 *
 * Photographs and clips are *copied*, not referenced: each media file is downloaded from the source and
 * uploaded to the target, and every URL that pointed at the old copy is rewritten to the new one -
 * including the ones buried inside the About and Contact page payloads. Run it twice and the second run
 * reports everything skipped, which is also how you can tell it worked.
 *
 * What it cannot move: customer accounts, bookings, enquiries and reviews. The API has no route that
 * creates a customer with a password (they register themselves) and none that writes a booking or an
 * enquiry, which is deliberate - those are records of things people did, not content. The admin account
 * comes from BOOTSTRAP_ADMIN_PASSWORD on the target's first boot. The script says so in its report
 * rather than pretending otherwise.
 */
import { parseArgs } from 'node:util'

const { values: options } = parseArgs({
  options: {
    from: { type: 'string' },
    to: { type: 'string' },
    'admin-email': { type: 'string' },
    'admin-password': { type: 'string' },
    'from-password': { type: 'string' },
    'to-password': { type: 'string' },
    only: { type: 'string' },
    'dry-run': { type: 'boolean', default: false },
  },
})

const from = (options.from ?? 'http://localhost:8080').replace(/\/+$/, '')
const to = (options.to ?? '').replace(/\/+$/, '')
const adminEmail =
  options['admin-email'] ??
  process.env.PRATHIBALANKA_ADMIN_EMAIL ??
  process.env.BOOTSTRAP_ADMIN_EMAIL ??
  'prathibhalankavoyages@gmail.com'
const adminPassword =
  options['admin-password'] ?? process.env.PRATHIBALANKA_ADMIN_PASSWORD ?? process.env.BOOTSTRAP_ADMIN_PASSWORD ?? ''
/** One password for both instances unless a side overrides it: they rarely match. */
const fromPassword = options['from-password'] ?? adminPassword
const toPassword = options['to-password'] ?? adminPassword
const dryRun = options['dry-run'] === true
const only = new Set(
  (options.only ?? 'media,packages,journal,gallery,content')
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean),
)

if (!to) {
  console.error('Missing --to. This script seeds a *target* instance from a source one:')
  console.error('  node scripts/seed-production.mjs --from http://localhost:8080 --to https://prathibalanka.com')
  process.exit(1)
}
if (!fromPassword || !toPassword) {
  console.error('No admin password for one of the instances. Set BOOTSTRAP_ADMIN_PASSWORD (the variable')
  console.error('the API creates the admin from) or pass --admin-password, plus --from-password /')
  console.error('--to-password when the two instances do not share one.')
  process.exit(1)
}
if (from === to) {
  console.error(`--from and --to are the same instance (${to}). Refusing to clone a database onto itself.`)
  process.exit(1)
}

const counts = { created: 0, skipped: 0, updated: 0, failed: 0 }
const problems = []
const note = (verb, what) => {
  counts[verb] += 1
  console.log(`  ${verb === 'created' ? '+' : verb === 'skipped' ? '·' : verb === 'updated' ? '~' : '!'} ${what}`)
}

/** One API call, with a token and the JSON body the API expects. */
async function call(base, path, { method = 'GET', token, body, form } = {}) {
  const response = await fetch(`${base}${path}`, {
    method,
    headers: {
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...(body ? { 'content-type': 'application/json' } : {}),
    },
    body: form ?? (body ? JSON.stringify(body) : undefined),
  })
  const text = await response.text()
  const payload = text ? JSON.parse(text) : null
  return { status: response.status, ok: response.ok, body: payload }
}

async function signIn(base, label, password) {
  const { status, body } = await call(base, '/api/auth/login', {
    method: 'POST',
    body: { email: adminEmail, password },
  })
  if (!body?.token) {
    console.error(`Could not sign in to the ${label} instance at ${base} as ${adminEmail} (${status}).`)
    console.error('Check the address and the email. The password is --admin-password, or the')
    console.error('--from-password / --to-password override for that side, or PRATHIBALANKA_ADMIN_PASSWORD')
    console.error('/ BOOTSTRAP_ADMIN_PASSWORD in the environment. An environment variable set months ago')
    console.error('wins over the one you exported in this shell, which is worth checking first.')
    process.exit(1)
  }
  console.log(`  signed in to the ${label} instance at ${base}`)
  return body.token
}

/**
 * Source media URL -> the URL it has on the target.
 *
 * Everything that references a photograph goes through this, so a picture that was
 * `/media/3f9c….jpg` on the laptop is whatever the target's own upload produced.
 */
const mediaMap = new Map()

/** Source package id -> target package id, for the gallery's links to a journey. */
const packageIdMap = new Map()

/** Rewrites a stored path: the media map first, then any absolute source URL. */
function rewrite(value) {
  if (typeof value !== 'string' || value === '') return value
  if (mediaMap.has(value)) return mediaMap.get(value)
  if (value.startsWith(`${from}/media/`)) {
    const path = value.slice(from.length)
    return mediaMap.get(path) ?? `${to}${path}`
  }
  return value
}

/** The same rewrite, through every string in a JSON payload (About and Contact copy). */
function rewriteDeep(value) {
  if (Array.isArray(value)) return value.map(rewriteDeep)
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, rewriteDeep(entry)]))
  }
  return rewrite(value)
}

// ---------------------------------------------------------------- media

async function copyMedia(sourceToken, targetToken) {
  console.log('\nphotographs and clips')
  const source = (await call(from, '/api/admin/media', { token: sourceToken })).body ?? []
  const target = (await call(to, '/api/admin/media', { token: targetToken })).body ?? []

  // Matched on the file's own name: the same photograph uploaded twice under two names is two
  // photographs as far as the library is concerned, and matching on size would collide.
  const alreadyThere = new Map(target.map((asset) => [asset.originalName, asset]))

  for (const asset of source) {
    const existing = alreadyThere.get(asset.originalName)
    if (existing) {
      mediaMap.set(asset.url, existing.url)
      note('skipped', `${asset.originalName} (already in the target library)`)
      continue
    }
    if (dryRun) {
      mediaMap.set(asset.url, asset.url)
      note('created', `${asset.originalName} (would upload ${Math.round((asset.sizeBytes ?? 0) / 1024)} KB)`)
      continue
    }

    try {
      const download = await fetch(`${from}${asset.url}`)
      if (!download.ok) throw new Error(`the source would not serve it (${download.status})`)
      const bytes = await download.arrayBuffer()

      const form = new FormData()
      form.append('file', new Blob([bytes], { type: asset.contentType ?? 'application/octet-stream' }), asset.originalName)
      if (asset.title) form.append('title', asset.title)

      const uploaded = await call(to, '/api/admin/media', { method: 'POST', token: targetToken, form })
      if (!uploaded.ok || !uploaded.body?.url) {
        throw new Error(`the target refused it (${uploaded.status}: ${uploaded.body?.message ?? 'no message'})`)
      }
      mediaMap.set(asset.url, uploaded.body.url)
      note('created', `${asset.originalName} -> ${uploaded.body.url}`)
    } catch (error) {
      counts.failed += 1
      problems.push(`media ${asset.originalName}: ${error.message}`)
      console.log(`  ! ${asset.originalName}: ${error.message}`)
    }
  }
}

// ---------------------------------------------------------------- packages

async function copyPackages(sourceToken, targetToken) {
  console.log('\njourneys')
  const source = (await call(from, '/api/admin/packages', { token: sourceToken })).body ?? []
  const target = (await call(to, '/api/admin/packages', { token: targetToken })).body ?? []
  const byTitle = new Map(target.map((pkg) => [pkg.title, pkg]))

  for (const pkg of source) {
    const existing = byTitle.get(pkg.title)
    if (existing) {
      packageIdMap.set(pkg.packageId, existing.packageId)
      note('skipped', `${pkg.title} (already there)`)
      continue
    }
    if (dryRun) {
      packageIdMap.set(pkg.packageId, pkg.packageId)
      note('created', `${pkg.title} (would create)`)
      continue
    }

    const created = await call(to, '/api/admin/packages', {
      method: 'POST',
      token: targetToken,
      body: {
        title: pkg.title,
        destination: pkg.destination,
        durationDays: pkg.durationDays,
        price: pkg.price,
        maxCapacity: pkg.maxCapacity,
        description: pkg.description,
        longDescription: pkg.longDescription,
        itinerary: pkg.itinerary,
        imageUrl: rewrite(pkg.imageUrl),
        status: pkg.status,
      },
    })
    if (!created.ok || !created.body?.packageId) {
      counts.failed += 1
      problems.push(`package ${pkg.title}: ${created.status} ${created.body?.message ?? ''}`)
      console.log(`  ! ${pkg.title}: ${created.status} ${created.body?.message ?? ''}`)
      continue
    }
    packageIdMap.set(pkg.packageId, created.body.packageId)
    note('created', `${pkg.title} (#${created.body.packageId})`)
  }
}

// ---------------------------------------------------------------- journal

async function copyJournal(sourceToken, targetToken) {
  console.log('\nstories')
  const source = (await call(from, '/api/admin/journal', { token: sourceToken })).body ?? []
  const target = (await call(to, '/api/admin/journal', { token: targetToken })).body ?? []
  const byTitle = new Map(target.map((post) => [post.title, post]))

  for (const post of source) {
    if (byTitle.has(post.title)) {
      note('skipped', `${post.title} (already there)`)
      continue
    }
    if (dryRun) {
      note('created', `${post.title} (would create as ${post.status})`)
      continue
    }

    const created = await call(to, '/api/admin/journal', {
      method: 'POST',
      token: targetToken,
      body: {
        title: post.title,
        description: post.description,
        content: post.content,
        coverImageUrl: rewrite(post.coverImageUrl),
        status: post.status ?? 'DRAFT',
        // Without this the API stamps "now" and the whole archive is dated the day of the import.
        publishedAt: post.publishedAt ?? null,
      },
    })
    if (!created.ok || !created.body?.journalId) {
      counts.failed += 1
      problems.push(`story ${post.title}: ${created.status} ${created.body?.message ?? ''}`)
      console.log(`  ! ${post.title}: ${created.status} ${created.body?.message ?? ''}`)
      continue
    }
    note('created', `${post.title} (${created.body.status})`)

    // The create endpoint was written for the console, which creates drafts and publishes them next;
    // a published story has to be published here too or production shows nothing.
    if ((post.status ?? '').toUpperCase() === 'PUBLISHED' && created.body.status !== 'PUBLISHED') {
      const published = await call(to, `/api/admin/journal/${created.body.journalId}/publish`, {
        method: 'PATCH',
        token: targetToken,
      })
      if (published.ok) note('updated', `${post.title} published`)
      else {
        counts.failed += 1
        problems.push(`publish ${post.title}: ${published.status}`)
        console.log(`  ! could not publish ${post.title} (${published.status})`)
      }
    }
  }
}

// ---------------------------------------------------------------- gallery

async function copyGallery(sourceToken, targetToken) {
  console.log('\ngallery')
  const source = (await call(from, '/api/gallery')).body ?? []
  const target = (await call(to, '/api/gallery')).body ?? []
  const existingUrls = new Set(target.map((item) => item.imageUrl))

  for (const item of source) {
    const url = rewrite(item.imageUrl)
    if (existingUrls.has(url)) {
      note('skipped', `${item.caption ?? item.packageTitle ?? url} (already in the gallery)`)
      continue
    }
    if (dryRun) {
      note('created', `${item.caption ?? item.packageTitle ?? url} (would add)`)
      continue
    }

    const created = await call(to, '/api/admin/gallery', {
      method: 'POST',
      token: targetToken,
      body: {
        imageUrl: url,
        caption: item.caption ?? null,
        mediaType: item.mediaType ?? 'IMAGE',
        packageId: item.packageId != null ? packageIdMap.get(item.packageId) ?? null : null,
      },
    })
    if (!created.ok) {
      counts.failed += 1
      problems.push(`gallery ${item.caption ?? url}: ${created.status} ${created.body?.message ?? ''}`)
      console.log(`  ! ${item.caption ?? url}: ${created.status} ${created.body?.message ?? ''}`)
      continue
    }
    existingUrls.add(url)
    note('created', `${item.caption ?? item.packageTitle ?? url}`)
  }
}

// ---------------------------------------------------------------- page content

async function copyContent(sourceToken, targetToken) {
  console.log('\nAbout and Contact copy')
  const source = (await call(from, '/api/admin/content', { token: sourceToken })).body ?? []

  for (const section of source) {
    const payload = rewriteDeep(section.payload)
    if (dryRun) {
      note('updated', `${section.section} (would replace ${Object.keys(payload ?? {}).length} blocks)`)
      continue
    }
    const saved = await call(to, `/api/admin/content/${section.section}`, {
      method: 'PUT',
      token: targetToken,
      body: { payload },
    })
    if (!saved.ok) {
      counts.failed += 1
      problems.push(`content ${section.section}: ${saved.status} ${saved.body?.message ?? ''}`)
      console.log(`  ! ${section.section}: ${saved.status} ${saved.body?.message ?? ''}`)
      continue
    }
    note('updated', `${section.section} (${Object.keys(payload ?? {}).length} blocks)`)
  }
}

// ---------------------------------------------------------------- run

console.log(`${dryRun ? 'Dry run: ' : ''}seeding ${to}`)
console.log(`from ${from}, as ${adminEmail}`)
console.log(`sections: ${[...only].join(', ')}`)

const sourceToken = await signIn(from, 'source', fromPassword)
const targetToken = await signIn(to, 'target', toPassword)

// Media first: everything else points at it.
if (only.has('media')) await copyMedia(sourceToken, targetToken)
if (only.has('packages')) await copyPackages(sourceToken, targetToken)
if (only.has('journal')) await copyJournal(sourceToken, targetToken)
if (only.has('gallery')) await copyGallery(sourceToken, targetToken)
if (only.has('content')) await copyContent(sourceToken, targetToken)

console.log('\n--------------------------------------------------')
console.log(
  `${dryRun ? 'would change' : 'done'}: ${counts.created} created, ${counts.updated} updated, ` +
    `${counts.skipped} already there, ${counts.failed} failed`,
)
if (mediaMap.size > 0) console.log(`${mediaMap.size} media files mapped to their new URLs`)
console.log(
  '\nNot moved, and not movable through the API: customer accounts (they register themselves),\n' +
    'bookings, enquiries and reviews. The target keeps its own; the admin comes from\n' +
    'BOOTSTRAP_ADMIN_PASSWORD on its first boot.',
)
if (problems.length) {
  console.log('\nWorth a look:')
  for (const problem of problems) console.log(`  - ${problem}`)
  process.exitCode = 1
}
