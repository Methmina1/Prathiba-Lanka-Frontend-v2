import { expect, test } from '@playwright/test'
import { ADMIN_SESSION, CUSTOMER_SESSION, collectPageErrors, mockApi, signIn } from './fixtures'

test.beforeEach(async ({ page }) => {
  await mockApi(page)
})

test('a signed-out visitor is sent to the login page', async ({ page }) => {
  await page.goto('/admin')
  await expect(page).toHaveURL(/\/login\?next=%2Fadmin$/)
})

test('a customer is told the console needs an administrator', async ({ page }) => {
  await signIn(page, CUSTOMER_SESSION)
  await page.goto('/admin')

  await expect(page.locator('h1')).toHaveText('Admin access required')
  await expect(page.getByRole('link', { name: 'Go to my account' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Sign out' })).toBeVisible()
})

test('an admin reaches every console screen', async ({ page }) => {
  const errors = collectPageErrors(page)
  await signIn(page, ADMIN_SESSION)

  const screens = [
    ['/admin', 'Dashboard'],
    ['/admin/bookings', 'Bookings'],
    ['/admin/queries', 'Contact queries'],
    ['/admin/packages', 'Packages'],
    ['/admin/journal', 'Journal'],
    ['/admin/gallery', 'Gallery'],
    ['/admin/media', 'Media library'],
    ['/admin/content', 'About and Contact pages'],
    ['/admin/reviews', 'Reviews'],
  ]

  for (const [path, heading] of screens) {
    await page.goto(path)
    await expect(page.locator('.admin__topbar h1')).toHaveText(heading)
    await expect(page.locator('.admin__sidebar')).toContainText('Admin console')
  }

  expect(errors, `uncaught errors: ${errors.join(' | ')}`).toEqual([])
})

test('the dashboard stat cards stack instead of colliding', async ({ page }) => {
  // This is the regression the console shipped with: the label, the figure and the breakdown are
  // spans, and with no layout on the card they sat on one line and overlapped.
  await signIn(page, ADMIN_SESSION)
  await page.goto('/admin')

  const cards = page.locator('.adm-stat')
  await expect(cards).toHaveCount(8)

  for (let i = 0; i < 8; i += 1) {
    const card = cards.nth(i)
    const parts = await card.locator('.adm-stat__label, .adm-stat__value, .adm-stat__meta').evaluateAll((nodes) =>
      nodes.map((node) => {
        const box = node.getBoundingClientRect()
        return { text: node.textContent.trim().slice(0, 30), top: box.top, bottom: box.bottom, left: box.left, right: box.right }
      }),
    )

    expect(parts.length).toBeGreaterThan(0)
    for (let p = 1; p < parts.length; p += 1) {
      const previous = parts[p - 1]
      const current = parts[p]
      // no vertical overlap between consecutive lines
      expect(current.top, `card ${i + 1}: "${current.text}" overlaps "${previous.text}"`).toBeGreaterThanOrEqual(
        previous.bottom - 0.5,
      )
    }
    // and the text starts at a sensible size, not collapsed
    const valueBox = card.locator('.adm-stat__value')
    if (await valueBox.count()) {
      expect((await valueBox.boundingBox()).height).toBeGreaterThan(20)
    }
  }
})

test('the console lists the records the API returns', async ({ page }) => {
  await signIn(page, ADMIN_SESSION)

  await page.goto('/admin/bookings')
  // the PENDING filter is on by default and the mock answers it, so only the pending one is listed
  await expect(page.locator('.adm-table tbody tr')).toHaveCount(1)
  await expect(page.locator('.adm-table')).toContainText('A1B2C3D4')

  await page.goto('/admin/queries')
  await expect(page.locator('.adm-table')).toContainText('December availability')

  await page.goto('/admin/packages')
  await expect(page.locator('.adm-table')).toContainText('Classical Heritage')
  await expect(page.locator('.adm-table')).toContainText('Wild Heart')
})

test('a status filter refetches and changes the table', async ({ page }) => {
  await signIn(page, ADMIN_SESSION)
  await page.goto('/admin/bookings')
  await expect(page.locator('.adm-table tbody tr')).toHaveCount(1)

  await page.getByRole('button', { name: 'Confirmed' }).click()
  await expect(page.locator('.adm-table')).toContainText('E5F6A7B8')
  await expect(page.locator('.adm-table')).not.toContainText('A1B2C3D4')

  await page.getByRole('button', { name: 'Rejected' }).click()
  await expect(page.locator('.adm-empty')).toBeVisible()
})

test('the sidebar moves between screens and the console keeps its own chrome', async ({ page }) => {
  await signIn(page, ADMIN_SESSION)
  await page.goto('/admin')

  await page.locator('.admin__nav a', { hasText: 'Media library' }).click()
  await expect(page).toHaveURL(/\/admin\/media$/)
  await expect(page.locator('.admin__topbar h1')).toHaveText('Media library')

  // the marketing header and footer belong to the public site, not here
  await expect(page.locator('.site-header')).toHaveCount(0)
  await expect(page.locator('.site-footer')).toHaveCount(0)
})

test('the page content editor shows both sections and their fields', async ({ page }) => {
  await signIn(page, ADMIN_SESSION)
  await page.goto('/admin/content')

  // every repeating block has its own "Title" field, so scope to the page-header card
  const pageHeader = page.locator('.adm-card').filter({ has: page.locator('h2', { hasText: 'Page header' }) })

  await expect(page.locator('.adm-segmented button', { hasText: 'About page' })).toBeVisible()
  await expect(pageHeader.getByLabel('Title', { exact: true })).toHaveValue('Arranged by people who live here')
  await expect(page.locator('.adm-card__head', { hasText: 'Story highlights' })).toBeVisible()

  await page.getByRole('button', { name: 'Contact page' }).click()
  await expect(pageHeader.getByLabel('Title', { exact: true })).toHaveValue('Talk to us')
  await expect(page.locator('.adm-card__head', { hasText: 'Aside panel' })).toBeVisible()
  await expect(page.locator('.adm-card__head', { hasText: 'Story highlights' })).toHaveCount(0)
  // no photograph chosen for this section, so no preview is rendered
  await expect(page.locator('.adm-preview')).toHaveCount(0)
})
