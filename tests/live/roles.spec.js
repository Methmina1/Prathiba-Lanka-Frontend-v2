/**
 * Every role, every feature, against a real backend.
 *
 *   npm run test:roles                 # the API must be running; see the runner for the run id
 *   npm run test:roles -- --headed
 *   npm run test:roles -- -g "confirms"
 *
 * Why this exists next to the other suites:
 *
 *   scripts/api-tests.ps1 (backend)  every endpoint, from HTTP, with no browser
 *   tests/e2e (frontend)             every screen, in a browser, against a *mocked* API
 *   this file                        the two together - the real UI writing to the real database,
 *                                    walked through as the three people who use the site: a
 *                                    visitor, a customer, and a member of staff.
 *
 * Tests run in order but share nothing in memory: every one looks up what it needs by the run marker
 * (`E2E<id>`), because Playwright restarts the worker process after a failure. A test that needs
 * something an earlier test created will say so plainly when it cannot find it. That also means a
 * single step can be re-run on its own while working on it.
 *
 * It WRITES to the database it points at. Everything carries the marker and is deleted in the
 * cleanup at the end, which reports what it removed. PRATHIBALANKA_SKIP_CLEANUP=1 leaves it all in
 * place for inspection.
 */
import { spawnSync } from 'node:child_process'
import { expect, test } from '@playwright/test'

const API = process.env.LIVE_API_URL ?? 'http://localhost:8080'
const ADMIN_EMAIL = process.env.BOOTSTRAP_ADMIN_EMAIL ?? 'prathibhalankavoyages@gmail.com'
const ADMIN_PASSWORD = process.env.BOOTSTRAP_ADMIN_PASSWORD ?? ''
const RUN = process.env.LIVE_RUN_ID ?? 'E2EADHOC'
const DB_CONTAINER = process.env.LIVE_DB_CONTAINER ?? 'travel_agency_db'
const DB_USER = process.env.LIVE_DB_USER ?? 'travel_admin'
const DB_NAME = process.env.LIVE_DB_NAME ?? 'travel_agency'

/** What the run calls its own records. Nothing is identified by anything else. */
const MARK = {
  packageTitle: `E2E ${RUN} Test Journey`,
  postTitle: `E2E ${RUN} journal draft`,
  mediaName: `e2e-${RUN.toLowerCase()}.png`,
  reviewText: `E2E ${RUN} automated review - the itinerary was exactly as described.`,
  enquirySubject: `E2E ${RUN} enquiry`,
  customerEmail: `e2e-${RUN.toLowerCase()}@example.com`,
  customerPassword: 'Traveller@12345',
  guestEmail: `e2e-guest-${RUN.toLowerCase()}@example.com`,
}

/** 1x1 PNG - enough to exercise upload, storage and serving without shipping a fixture file. */
const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
)

/** Raw API helpers, for setting up or checking what the UI has just done. */
const json = (path, options) =>
  fetch(`${API}${path}`, options).then(async (response) => ({
    status: response.status,
    body: await response.json().catch(() => null),
  }))

const signIn = (email, password) =>
  json('/api/auth/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })

async function adminToken() {
  const { body } = await signIn(ADMIN_EMAIL, ADMIN_PASSWORD)
  if (!body?.token) throw new Error('Could not sign in as the administrator - is BOOTSTRAP_ADMIN_PASSWORD right?')
  return body.token
}

/** The packages this run created or booked, found by marker (never by remembered ids). */
async function findRunPackage() {
  const { body } = await json('/api/admin/packages', { headers: { authorization: `Bearer ${await adminToken()}` } })
  return (body ?? []).find((pkg) => String(pkg.title).includes(RUN)) ?? null
}

async function findRunBooking() {
  const token = await adminToken()
  const { body } = await json('/api/admin/bookings', { headers: { authorization: `Bearer ${token}` } })
  // Case-insensitive: the marker is upper case, the email addresses it appears in are lower case.
  const marker = RUN.toLowerCase()
  const mentions = (value) => String(value ?? '').toLowerCase().includes(marker)
  return (
    (body ?? []).find((booking) => mentions(booking.customerEmail)) ??
    (body ?? []).find((booking) => mentions(booking.specialRequests)) ??
    (body ?? []).find((booking) => mentions(booking.packageTitle)) ??
    null
  )
}

/** Signs a page in by seeding the same localStorage entry the app reads. */
async function signInOnPage(page, { email, password }) {
  const { body } = await signIn(email, password)
  if (!body?.token) throw new Error(`Could not sign in as ${email}: ${JSON.stringify(body)}`)
  await page.addInitScript((session) => {
    window.localStorage.setItem('prathibalanka.session', JSON.stringify(session))
  }, { token: body.token, email: body.email, role: body.role, userId: body.userId })
  return body
}

const asAdmin = (page) => signInOnPage(page, { email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
const asCustomer = (page) => signInOnPage(page, { email: MARK.customerEmail, password: MARK.customerPassword })

/** A second, independent browser page in the same server - a different visitor. */
const anotherVisitor = (page) => page.context().browser().newPage()

test.beforeAll(async () => {
  if (!ADMIN_PASSWORD) {
    throw new Error('Set BOOTSTRAP_ADMIN_PASSWORD (the variable the backend creates the admin from).')
  }
  const health = await fetch(`${API}/api/packages`).catch(() => null)
  if (!health?.ok) throw new Error(`No backend at ${API} - start it, then run again.`)
  console.log(`\n[live] ${RUN} against ${API}\n`)
})

// ------------------------------------------------------------------ visitor

test.describe('a visitor who has not signed in', () => {
  test('can read every public page', async ({ page }) => {
    const errors = []
    page.on('pageerror', (error) => errors.push(error.message))
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text())
    })

    await page.goto('/')
    await expect(page.locator('.hero h1')).toBeVisible()
    await expect(page.locator('#journeys .package-card')).toHaveCount(6)
    await expect(page.locator('.navbar__actions a[href="/plan"]')).toHaveCount(1)
    await expect(page.locator('.navbar__account')).toHaveCount(0)

    await page.goto('/journeys')
    await expect(page.locator('.package-card').first()).toBeVisible()
    // Wait for the API's list, not the sample one: the fallback holds four journeys and would make
    // the search below look like it widened the results.
    await expect(page.locator('.package-card h3 a').first()).toHaveAttribute('href', /\/journeys\/\d+$/)
    const allJourneys = await page.locator('.package-card').count()
    expect(allJourneys, 'the catalogue should be the real one').toBeGreaterThan(4)

    await page.getByLabel('Search journeys by destination').fill('Wildlife')
    await page.getByRole('button', { name: 'Search' }).click()
    await expect(page.locator('.results-line')).toContainText('journey')
    expect(await page.locator('.package-card').count(), 'search should narrow the list').toBeLessThan(
      allJourneys,
    )

    // a journey page: the write-up, a numbered itinerary, and a way to ask for it. Waiting for the
    // link to be a real id matters - the list falls back to the sample journeys when the API is slow.
    await page.goto('/journeys')
    const firstCard = page.locator('.package-card h3 a').first()
    await expect(firstCard).toHaveAttribute('href', /\/journeys\/\d+$/)
    await expect(page.locator('.package-card')).not.toHaveCount(0)
    await page.goto(await firstCard.getAttribute('href'))

    await expect(page.locator('.detail__story p').first()).toBeVisible()
    const days = page.locator('.days__item')
    await expect(days.first()).toBeVisible()
    // The agency's itineraries are written as "stop → stop → stop", so the first day opens into the
    // stops it is made of rather than one paragraph.
    await expect(days.first().locator('.days__steps li').first()).toBeVisible()
    expect(await days.first().locator('.days__steps li').count()).toBeGreaterThan(1)
    // The request button carries the journey in the URL, so the form opens with it chosen.
    expect(await page.locator('.quote-card a[href^="/plan"]').count()).toBeGreaterThan(0)
    // and the page offers WhatsApp about this particular journey
    await expect(page.locator('.quote-card__phone--whatsapp')).toHaveAttribute(
      'href',
      'https://wa.me/94760484088',
    )

    await page.goto('/journal')
    // The page opens on the map: the province map is the index, and the story cards come from a
    // province or from "Read all".
    await expect(page.locator('#island .province-map__shape')).toHaveCount(9)
    await page.getByRole('button', { name: /^Read all/ }).click()
    // the featured post is the link itself, not a card with a link inside it
    const featured = page.locator('a.feature-post')
    await expect(featured).toBeVisible()
    await page.goto(await featured.getAttribute('href'))
    await expect(page.locator('h1')).toBeVisible()

    await page.goto('/gallery')
    await expect(page.locator('.gallery-tile').first()).toBeVisible()

    await page.goto('/reviews')
    await expect(page.locator('h1')).toContainText('What people said')

    await page.goto('/about')
    await expect(page.locator('h1')).toBeVisible()

    await page.goto('/contact')
    await expect(page.locator('.contact-card', { hasText: 'Email' })).toContainText(
      'prathibhalankavoyages@gmail.com',
    )
    await expect(page.locator('.contact-card', { hasText: 'Office' })).toContainText('Kurunagala')

    // The WhatsApp number the client gave us, on the card, in the social band it sits in, and in the
    // bubble that follows a visitor around the site - all read from the one contact card the console
    // edits, which is what makes this worth asserting against the live database.
    await expect(page.locator('.contact-card', { hasText: 'WhatsApp' })).toContainText('+94 76 048 4088')
    const band = page.locator('#follow')
    await expect(band.getByRole('link', { name: /on WhatsApp/ })).toHaveAttribute(
      'href',
      'https://wa.me/94760484088',
    )
    await expect(band.getByRole('link', { name: /on TikTok/ })).toHaveAttribute(
      'href',
      'https://vm.tiktok.com/ZS9AyKrWS8DUb-bXcUA/',
    )
    await expect(page.getByRole('link', { name: /Message us on WhatsApp/ })).toHaveAttribute(
      'href',
      'https://wa.me/94760484088',
    )

    expect(errors, `console/page errors: ${errors.join(' | ')}`).toEqual([])
  })

  test('is kept out of the signed-in areas', async ({ page }) => {
    await page.goto('/account')
    await expect(page).toHaveURL(/\/login\?next=/)

    await page.goto('/admin')
    await expect(page).toHaveURL(/\/login\?next=%2Fadmin$/)
  })

  test('sends an enquiry, and an unknown PIN is reported as unknown', async ({ page }) => {
    await page.goto('/contact')
    await page.getByLabel('Your name').fill(`E2E Guest ${RUN}`)
    await page.getByLabel('Email').fill(MARK.guestEmail)
    await page.getByLabel('Subject').fill(MARK.enquirySubject)
    await page.getByLabel('What would you like to see?').fill('Automated check of the enquiry form.')
    await page.getByRole('button', { name: 'Send enquiry' }).click()
    // the success note specifically: a failure note would be a different class
    await expect(page.locator('.form-note--sent')).toContainText(/thank|received|reply/i)

    await page.goto('/plan')
    await page.locator('#pin-input').fill('ZZZZ9999')
    await page.locator('.pin button[type="submit"]').click()
    await expect(page.locator('.form-note--error')).toContainText('No booking found')
  })

  test('creates an account, and is signed in afterwards', async ({ page }) => {
    await page.goto('/register')
    await page.getByLabel('Full name').fill(`E2E Traveller ${RUN}`)
    await page.getByLabel('Email').fill(MARK.customerEmail)
    await page.getByLabel('Password').fill(MARK.customerPassword)
    await page.getByRole('button', { name: /create account/i }).click()

    await expect(page.locator('.navbar__account')).toBeVisible()
    await expect(page.locator('.navbar__auth')).toHaveText('Account')
  })
})

// ------------------------------------------------------------------ customer

test.describe('a customer who has signed in', () => {
  test('signs in, and the bar keeps their name to itself', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('Email').fill(MARK.customerEmail)
    await page.getByLabel('Password').fill(MARK.customerPassword)
    await page.getByRole('button', { name: /sign in/i }).click()

    await expect(page).toHaveURL(/\/account$/)
    await expect(page.locator('.navbar__account')).toBeVisible()
    const header = await page.locator('.site-header').innerText()
    expect(header).not.toContain('@')
    expect(header.toLowerCase()).not.toContain('e2e')
    await expect(page.locator('.navbar__signout')).toBeVisible()
  })

  test('requests a journey and is given a PIN', async ({ page }) => {
    await asCustomer(page)
    await page.goto('/account')
    await expect(page.getByRole('heading', { name: 'Request another journey' })).toBeVisible()

    const { body: packages } = await json('/api/packages')
    const target = packages.find((pkg) => pkg.title) ?? packages[0]

    await page.getByLabel('Journey', { exact: true }).selectOption(String(target.packageId))
    await page.getByLabel('Travellers').fill('2')
    await page.getByLabel('Preferred date').fill('2027-03-15')
    await page.getByLabel('Anything we should know?').fill(`E2E ${RUN} automated booking`)
    await page.getByRole('button', { name: 'Send request' }).click()

    const note = page.locator('.form-note--sent').first()
    await expect(note).toContainText('PIN')
    const message = await note.innerText()
    const pin = message.match(/PIN is ([A-Z0-9]{8})/i)?.[1] ?? message.match(/\b([A-Z0-9]{8})\b/)?.[1]
    expect(pin, `no PIN in "${message}"`).toBeTruthy()

    const row = page.locator('.booking-row').first()
    await expect(row).toContainText('PENDING')
    await expect(row).toContainText(pin)
    await expect(row).toContainText(target.title)
  })

  test('tracks that booking by PIN with no account', async ({ page }) => {
    const booking = await findRunBooking()
    expect(booking, `no booking for ${RUN} - did the booking request run?`).toBeTruthy()

    // a fresh, signed-out visitor
    await page.goto('/plan')
    await page.locator('#pin-input').fill(booking.pinCode)
    await page.locator('.pin button[type="submit"]').click()

    await expect(page.locator('.booking-result')).toContainText(booking.pinCode)
    await expect(page.locator('.booking-result')).toContainText(/PENDING|CONFIRMED/)
  })

  test('leaves a review, which appears on the public reviews page', async ({ page }) => {
    await asCustomer(page)
    await page.goto('/account')

    const { body: packages } = await json('/api/packages')
    await page.getByLabel('Journey (optional)').selectOption(String(packages[0].packageId))
    await page.getByRole('button', { name: '4 out of 5' }).click()
    await page.getByLabel('Your review').fill(MARK.reviewText)
    await page.getByRole('button', { name: 'Publish review' }).click()
    await expect(page.locator('.form-note--sent').last()).toContainText(/thank you/i)

    const visitor = await anotherVisitor(page)
    await visitor.goto('/reviews')
    await expect(visitor.locator('.review-card').first()).toContainText(MARK.reviewText)
    await visitor.close()
  })

  test('cannot reach the console', async ({ page }) => {
    await asCustomer(page)
    await page.goto('/admin')
    await expect(page.locator('h1')).toHaveText('Admin access required')
  })

  test('signs out from the bar', async ({ page }) => {
    await asCustomer(page)
    await page.goto('/')
    await page.locator('.navbar__signout').click()

    await expect(page.locator('.navbar__account')).toHaveCount(0)
    expect(await page.evaluate(() => window.localStorage.getItem('prathibalanka.session'))).toBeNull()

    // A page without the seeded session (the init script re-seeds on every navigation): the account
    // area is closed to them again.
    const stranger = await anotherVisitor(page)
    await stranger.goto('/account')
    await expect(stranger).toHaveURL(/\/login\?next=/)
    await stranger.close()
  })
})

// ------------------------------------------------------------------ staff

test.describe('a member of staff', () => {
  test('signs in and reads the dashboard', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('Email').fill(ADMIN_EMAIL)
    await page.getByLabel('Password').fill(ADMIN_PASSWORD)
    await page.getByRole('button', { name: /sign in/i }).click()

    // An administrator belongs in the console, not in the customer's account page.
    await expect(page).toHaveURL(/\/admin$/)
    await expect(page.locator('.admin__topbar h1')).toHaveText('Dashboard')
    await expect(page.locator('.adm-stat').first()).toBeVisible()
    // The marketing header and footer are not part of the console.
    await expect(page.locator('.site-header')).toHaveCount(0)
  })

  test('confirms the booking the customer made', async ({ page }) => {
    const booking = await findRunBooking()
    expect(booking, `no booking for ${RUN} - did the customer request one?`).toBeTruthy()

    await asAdmin(page)
    await page.goto('/admin/bookings')

    const row = page.locator('.adm-table tbody tr', { hasText: booking.pinCode })
    await expect(row).toBeVisible()
    await row.getByRole('button', { name: 'Confirm' }).click()

    const dialog = page.locator('.adm-dialog')
    await dialog.getByLabel('Agreed price (USD)').fill('2500')
    await dialog.getByLabel('Confirmed date').fill('2027-03-15')
    await dialog.getByRole('button', { name: 'Confirm booking' }).click()
    await expect(page.locator('.adm-notice')).toContainText(/confirmed/i)

    // The customer sees the decision, with the agreed price.
    const customer = await anotherVisitor(page)
    await asCustomer(customer)
    await customer.goto('/account')
    const theirRow = customer.locator('.booking-row', { hasText: booking.pinCode })
    await expect(theirRow).toContainText('CONFIRMED')
    await expect(theirRow).toContainText('2,500')
    await customer.close()
  })

  test('answers the enquiry the visitor sent', async ({ page }) => {
    await asAdmin(page)
    await page.goto('/admin/queries')

    const row = page.locator('.adm-table tbody tr', { hasText: MARK.enquirySubject })
    await expect(row, `no enquiry matching ${MARK.enquirySubject}`).toBeVisible()
    await expect(row).toContainText(`#`) // the reference staff quote back at the customer
    await row.getByRole('button', { name: 'Reply' }).click()

    const dialog = page.locator('.adm-dialog')
    // The dialog quotes what they asked, so the wrong enquiry cannot be answered by accident.
    await expect(dialog).toContainText('Automated check of the enquiry form.')
    await expect(dialog).toContainText(MARK.guestEmail)

    await dialog.getByLabel('Your reply').fill('Thanks - we will send an outline today.')
    await dialog.getByRole('button', { name: 'Send reply by email' }).click()

    // Saving sends it. The notice names the address it went to rather than claiming success blind.
    await expect(page.locator('.adm-notice')).toContainText('on its way to')
    await expect(dialog.locator('.adm-thread__body')).toContainText('we will send an outline today')

    // The panel's own Close, not the dialog header's: both are called Close, and only one of them is
    // inside the form.
    await dialog.locator('.adm-form__actions').getByRole('button', { name: 'Close' }).click()

    // Answered enquiries leave the waiting list, and the row says which of the three things happened -
    // emailed, written in the agency's own inbox, or not sent at all. Which one it is depends on the
    // transport this instance runs with, so the assertion is that it says one of them.
    await page.getByRole('button', { name: 'All' }).click()
    const replied = page.locator('.adm-table tbody tr', { hasText: MARK.enquirySubject })
    await expect(replied).toContainText(/Reply emailed|Answered from your inbox|Reply not sent/)
    await expect(replied).not.toContainText('They wrote again')
  })

  test('the customer reads the answer on their own page and writes back', async ({ page }) => {
    const token = await adminToken()
    const { body: queries } = await json('/api/admin/queries', {
      headers: { authorization: `Bearer ${token}` },
    })
    const enquiry = (queries ?? []).find((query) => String(query.subject).includes(RUN))
    expect(enquiry, `no enquiry matching ${MARK.enquirySubject}`).toBeTruthy()
    // Staff get the customer's link so it can be pasted into a reply written by hand.
    expect(enquiry.enquiryUrl, 'the API should hand staff the customer link').toContain('/enquiry/')

    // A different browser, nobody signed in: the token in the link is the whole credential.
    const visitor = await anotherVisitor(page)
    await visitor.goto(enquiry.enquiryUrl)
    await expect(visitor.locator('h1')).toContainText(MARK.enquirySubject)
    await expect(visitor.locator('.enquiry__meta')).toContainText(`#${enquiry.queryId}`)
    await expect(visitor.locator('.thread__item--agency')).toContainText('we will send an outline today')
    // Whether the agency's mail or a person sent it is the agency's business, not the customer's.
    await expect(visitor.locator('.thread__item--agency')).not.toContainText('emailed')

    await visitor.getByLabel('Your message').fill('Three of us now - does that change the price?')
    await visitor.getByRole('button', { name: 'Send message' }).click()

    await expect(visitor.locator('.form-note--sent')).toContainText(/with us/i)
    await expect(visitor.locator('.thread__item--customer')).toContainText('Three of us now')
    await expect(visitor.locator('.enquiry__head .pill')).toHaveText('Waiting for a reply')
    await visitor.close()

    // Writing again puts it back in front of staff, flagged, so the waiting list stays worth reading.
    await asAdmin(page)
    await page.goto('/admin/queries')
    const back = page.locator('.adm-table tbody tr', { hasText: MARK.enquirySubject })
    await expect(back, 'the follow-up should be waiting for a reply').toBeVisible()
    await expect(back).toContainText('They wrote again')
  })

  test('adds, edits and deactivates a package', async ({ page }) => {
    await asAdmin(page)
    await page.goto('/admin/packages')

    await page.getByRole('button', { name: 'New package' }).click()
    let dialog = page.locator('.adm-dialog')
    await dialog.getByLabel('Title').fill(MARK.packageTitle)
    await dialog.getByLabel('Destination').fill('Wildlife & Beach')
    await dialog.getByLabel('Duration (days)').fill('4')
    await dialog.getByLabel('Price per person (USD)').fill('777')
    await dialog.getByLabel('Short description').fill(`E2E ${RUN} test journey.`)
    await dialog.getByLabel('Full description').fill(`First paragraph for ${RUN}.\n\nSecond paragraph.`)
    await dialog.getByLabel('Itinerary').fill('Arrive and transfer.\nFull day of wildlife.\nDepart.')
    await dialog.getByRole('button', { name: 'Create package' }).click()
    await expect(page.locator('.adm-notice')).toContainText(/created/i)

    const row = () => page.locator('.adm-table tbody tr', { hasText: MARK.packageTitle })
    await expect(row()).toBeVisible()

    // it is on the public site straight away
    const visitor = await anotherVisitor(page)
    await visitor.goto('/journeys')
    await expect(visitor.locator('.package-card', { hasText: MARK.packageTitle })).toBeVisible()
    await visitor.close()

    await row().getByRole('button', { name: 'Edit' }).click()
    dialog = page.locator('.adm-dialog')
    await dialog.getByLabel('Price per person (USD)').fill('888')
    await dialog.getByRole('button', { name: 'Save changes' }).click()
    await expect(page.locator('.adm-notice')).toContainText(/updated/i)

    // Editing one field must not quietly empty the others: a full-replace PUT that arrives without a
    // field clears it, and this is the console path a person actually uses.
    const { body: edited } = await json('/api/admin/packages', {
      headers: { authorization: `Bearer ${await adminToken()}` },
    })
    const saved = edited.find((pkg) => pkg.title === MARK.packageTitle)
    expect(saved.longDescription, 'the full description survives an edit').toContain('Second paragraph')
    expect(saved.itinerary, 'the itinerary survives an edit').toContain('Full day of wildlife')
    expect(Number(saved.price)).toBe(888)

    await row().getByRole('button', { name: 'Deactivate' }).click()
    const after = await anotherVisitor(page)
    await after.goto('/journeys')
    await expect(after.locator('.package-card', { hasText: MARK.packageTitle })).toHaveCount(0)
    await after.close()

    // Deleting it is left to the cleanup: the customer's confirmed booking points at it, and the
    // backend refuses to delete a package a booking references (409) - behaviour worth keeping.
  })

  test('writes, publishes, unpublishes and deletes a journal post', async ({ page }) => {
    await asAdmin(page)
    await page.goto('/admin/journal')

    await page.getByRole('button', { name: 'New story' }).click()
    const dialog = page.locator('.adm-dialog')
    await dialog.getByLabel('Title').fill(MARK.postTitle)
    await dialog.getByLabel('Summary').fill(`E2E ${RUN} draft for the journal.`)
    await dialog.getByLabel('Story').fill(`A paragraph for ${RUN}.\n\nAnd a second one.`)
    await dialog.getByRole('button', { name: 'Create story' }).click()
    await expect(page.locator('.adm-notice')).toContainText(/created|saved/i)

    const row = () => page.locator('.adm-table tbody tr', { hasText: MARK.postTitle })
    await expect(row()).toContainText('DRAFT')

    await row().getByRole('button', { name: 'Publish' }).click()
    await expect(row()).toContainText('PUBLISHED')

    const visitor = await anotherVisitor(page)
    await visitor.goto('/journal')
    // The journal opens on the map, so the list of every story is behind this button. This is also
    // the assertion that a post an editor publishes actually reaches the public site.
    await visitor.getByRole('button', { name: /^Read all/ }).click()
    await expect(visitor.locator('.journal-card, .feature-post').filter({ hasText: MARK.postTitle }).first()).toBeVisible()
    await visitor.close()

    await row().getByRole('button', { name: 'Unpublish' }).click()
    await expect(row()).toContainText('DRAFT')

    await row().getByRole('button', { name: 'Delete' }).click()
    await page.locator('.adm-dialog').getByRole('button', { name: 'Delete' }).click()
    await expect(row()).toHaveCount(0)
  })

  test('uploads a file, then puts it in the gallery', async ({ page }) => {
    await asAdmin(page)
    await page.goto('/admin/media')
    await expect(page.locator('.adm-media-grid')).toBeVisible()
    const before = await page.locator('.adm-media-card').count()

    await page.locator('input[type="file"]').setInputFiles({
      name: MARK.mediaName,
      mimeType: 'image/png',
      buffer: PNG,
    })
    await expect(page.locator('.adm-notice')).toContainText(/uploaded/i, { timeout: 20_000 })

    const card = page.locator('.adm-media-card', { hasText: MARK.mediaName.replace('.png', '') })
    await expect(card).toBeVisible()
    await expect(page.locator('.adm-media-card')).toHaveCount(before + 1)
    // The thumbnail asks the API for the file, not the site (this shipped broken once).
    await expect(card.locator('img')).toHaveAttribute('src', /^https?:\/\/[^/]+\/media\//)

    await page.goto('/admin/gallery')
    await page.getByRole('button', { name: 'Add image or video' }).click()
    const dialog = page.locator('.adm-dialog')
    await dialog.getByRole('button', { name: /library/i }).click()
    await page.locator('.adm-media', { hasText: MARK.mediaName.replace('.png', '') }).click()
    await dialog.getByLabel('Caption').fill(`E2E ${RUN} gallery item`)
    await dialog.getByRole('button', { name: 'Add to gallery' }).click()
    await expect(page.locator('.adm-notice')).toContainText(/added|created|saved/i)

    const visitor = await anotherVisitor(page)
    await visitor.goto('/gallery')
    // the gallery is an even grid now: the item just added is one of the tiles, and clicking it opens
    // the viewer on that photograph
    const added = visitor.locator('.gallery-tile', { hasText: `E2E ${RUN} gallery` }).first()
    await expect(added).toBeVisible()
    await added.locator('.gallery-tile__open').click()
    await expect(visitor.locator('.lightbox__caption')).toContainText(`E2E ${RUN} gallery`)
    await visitor.keyboard.press('Escape')
    await expect(visitor.locator('.lightbox')).toBeHidden()
    await visitor.close()

    // put the gallery item and the file back
    const tile = page.locator('.adm-gallery__item', { hasText: `E2E ${RUN} gallery` }).first()
    await expect(tile, 'the gallery item should be listed in the console').toBeVisible()
    await tile.getByRole('button', { name: 'Delete' }).click()
    await page.locator('.adm-dialog').getByRole('button', { name: 'Remove' }).click()
    await expect(tile).toHaveCount(0)

    await page.goto('/admin/media')
    const uploaded = page.locator('.adm-media-card', { hasText: MARK.mediaName.replace('.png', '') })
    await uploaded.getByRole('button', { name: 'Delete' }).click()
    await page.locator('.adm-dialog').getByRole('button', { name: 'Delete' }).click()
    await expect(uploaded).toHaveCount(0)
  })

  test('edits the contact page and sees it on the public site', async ({ page }) => {
    await asAdmin(page)
    await page.goto('/admin/content')
    await page.getByRole('button', { name: 'Contact page' }).click()

    // By label, never by position: the cards are a list an editor adds to and reorders, and this
    // test used to read "the second Value field", which broke the moment WhatsApp was added. The
    // wait matters - the page fetches the content, so the list is empty for a moment after the tab.
    const cards = page.locator('.adm-repeat')
    await expect(cards.first()).toBeVisible()

    const cardValue = async (label) => {
      for (let index = 0; index < (await cards.count()); index += 1) {
        const card = cards.nth(index)
        if ((await card.getByLabel('Label').inputValue()) === label) return card.getByLabel('Value')
      }
      throw new Error(`no contact card labelled "${label}"`)
    }

    const office = await cardValue('Office')
    const original = await office.inputValue()
    expect(original, 'the office card should hold the agency address').toContain('Kurunagala')

    await office.fill(`Kurunagala E2E ${RUN}`)
    await page.getByRole('button', { name: 'Save page' }).click()
    await expect(page.locator('.adm-notice')).toContainText(/saved/i)

    const visitor = await anotherVisitor(page)
    await visitor.goto('/contact')
    await expect(visitor.locator('.footer__contact')).toContainText(`E2E ${RUN}`)
    await visitor.close()

    await office.fill(original)
    await page.getByRole('button', { name: 'Save page' }).click()
    await expect(page.locator('.adm-notice')).toContainText(/saved/i)
  })

  test('removes the review the customer left', async ({ page }) => {
    await asAdmin(page)
    await page.goto('/admin/reviews')

    const row = page.locator('.adm-table tbody tr', { hasText: MARK.reviewText })
    await expect(row, 'the customer review should be listed').toBeVisible()
    await row.getByRole('button', { name: 'Delete' }).click()
    await page.locator('.adm-dialog').getByRole('button', { name: 'Delete' }).click()
    await expect(row).toHaveCount(0)

    const visitor = await anotherVisitor(page)
    await visitor.goto('/reviews')
    await expect(visitor.locator('.review-card').filter({ hasText: MARK.reviewText })).toHaveCount(0)
    await visitor.close()
  })

  test('is not offered the booking flow, and the API refuses it', async ({ page }) => {
    await asAdmin(page)

    await page.goto('/')
    await expect(page.locator('.navbar__actions a[href="/plan"]')).toHaveCount(0)
    await expect(page.locator('.footer__links a[href="/plan"]')).toHaveCount(0)

    await page.goto('/plan')
    await expect(page.locator('h1')).toHaveText('Booking is for customers')

    // …and the endpoints agree, which is what actually protects the data.
    const { body } = await signIn(ADMIN_EMAIL, ADMIN_PASSWORD)
    const auth = { authorization: `Bearer ${body.token}`, 'content-type': 'application/json' }

    const booking = await json('/api/bookings/request', {
      method: 'POST',
      headers: auth,
      body: JSON.stringify({ packageId: 1, numTravelers: 2, preferredTravelDate: '2027-01-01' }),
    })
    expect(booking.status, 'an admin token must not be able to book').toBe(403)

    const review = await json('/api/reviews', {
      method: 'POST',
      headers: auth,
      body: JSON.stringify({ rating: 5, comment: 'E2E admin review' }),
    })
    expect(review.status, 'an admin token must not be able to review').toBe(403)

    const mine = await json('/api/customer/bookings', { headers: auth })
    expect(mine.status).toBe(403)
  })

  test('is sent to the console when signing in from the login page', async ({ page }) => {
    await page.goto('/login?next=/account')
    await page.getByLabel('Email').fill(ADMIN_EMAIL)
    await page.getByLabel('Password').fill(ADMIN_PASSWORD)
    await page.getByRole('button', { name: /sign in/i }).click()
    // An explicit next wins, even for staff: it is what the visitor asked for.
    await expect(page).toHaveURL(/\/account$/)
    // …and the account page, being customer-only, hands them on to the console.
    await expect(page).toHaveURL(/\/admin$/)
  })

  test('signs out from the bar', async ({ page }) => {
    await asAdmin(page)
    await page.goto('/')
    await page.locator('.navbar__signout').click()
    await expect(page.locator('.navbar__account')).toHaveCount(0)
    expect(await page.evaluate(() => window.localStorage.getItem('prathibalanka.session'))).toBeNull()
  })
})

// ------------------------------------------------------------------ cleanup

test.afterAll(async () => {
  if (process.env.PRATHIBALANKA_SKIP_CLEANUP === '1') {
    console.log(`\n[live] cleanup skipped - records from ${RUN} are still in the database\n`)
    return
  }

  const like = `%${RUN}%`
  // Order matters: email_log -> bookings -> packages, then the rest.
  //
  // Two things this has to get right. The marker is upper case while the email addresses it appears
  // in are lower case, so every comparison is `ilike`. And the customer books a *real* package from
  // the catalogue rather than the one this run created, so a booking is found by its customer as
  // well as by its package - looking only at the package leaves the booking behind, the customer
  // delete then fails on the foreign key, and the whole transaction rolls back.
  const sql = `
    begin;
    delete from email_log where booking_id in (
      select b.booking_id from booking_request b
      left join customer c on c.customer_id = b.customer_id
      left join travel_package p on p.package_id = b.package_id
      where c.email ilike '${like}' or p.title ilike '${like}'
    );
    delete from booking_request where booking_id in (
      select b.booking_id from booking_request b
      left join customer c on c.customer_id = b.customer_id
      left join travel_package p on p.package_id = b.package_id
      where c.email ilike '${like}' or p.title ilike '${like}'
    );
    delete from review where comment ilike '${like}';
    delete from gallery_image where caption ilike '${like}';
    delete from media_asset where original_name ilike '${like}';
    delete from journal_post where title ilike '${like}';
    delete from travel_package where title ilike '${like}';
    delete from contact_query where subject ilike '${like}' or email ilike '${like}';
    delete from customer where email ilike '${like}';
    commit;
  `

  const result = spawnSync(
    'docker',
    ['exec', DB_CONTAINER, 'psql', '-U', DB_USER, '-d', DB_NAME, '-c', sql],
    // 'inherit' rather than a pipe: the harness sandbox blocks capturing a child's output.
    { stdio: 'inherit' },
  )

  if (result.error || result.status !== 0) {
    console.log(
      `\n[live] could not clean up automatically (${result.error?.message ?? `exit ${result.status}`}).` +
        `\n       Remove the rows matching "${RUN}" by hand, or re-run with Docker up.\n`,
    )
    return
  }

  const { body: packages } = await json('/api/packages')
  const stragglers = (packages ?? []).filter((pkg) => String(pkg.title).includes(RUN))
  console.log(`\n[live] cleaned up every row matching ${RUN} (${stragglers.length} test packages left)\n`)
})
