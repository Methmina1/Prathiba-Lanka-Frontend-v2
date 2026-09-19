import { expect, test } from '@playwright/test'
import { ADMIN_SESSION, mockApi, signIn } from './fixtures'

test.use({ viewport: { width: 390, height: 844 }, isMobile: false })

test.beforeEach(async ({ page }) => {
  await mockApi(page)
})

test('the phone header keeps the logo, the CTA and the menu button', async ({ page }) => {
  await page.goto('/')

  // the load intro renders its own copies of the mark, so scope to the header's
  await expect(page.locator('.site-header .brand__mark')).toBeVisible()
  await expect(page.locator('.navbar__toggle')).toBeVisible()
  // below 560px the CTA moves into the drawer, so the bar does not crowd
  await expect(page.locator('.navbar__actions .btn')).toBeHidden()
  await expect(page.locator('.site-header .nav')).toBeHidden()
})

test('the drawer opens and holds the navigation', async ({ page }) => {
  await page.goto('/')
  await page.locator('.navbar__toggle').click()

  const drawer = page.locator('.mobile-menu')
  await expect(drawer).toHaveClass(/is-open/)
  await expect(drawer.locator('a', { hasText: 'Journeys' }).first()).toBeVisible()
  await expect(drawer.locator('.mobile-menu__track')).toContainText('Track your booking')
  await expect(drawer.locator('a.btn')).toContainText('Plan your trip')
  // no sign-in entry in the drawer either - it lives on the plan page
  await expect(drawer).not.toContainText('Sign in')

  await drawer.locator('nav a', { hasText: 'Gallery' }).click()
  await expect(page).toHaveURL(/\/gallery$/)
  await expect(drawer).not.toHaveClass(/is-open/)
})

test('the hero fits the phone without sideways scroll', async ({ page }) => {
  await page.goto('/')

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  expect(overflow, 'the page scrolls horizontally').toBeLessThanOrEqual(1)

  const hero = await page.locator('.hero').boundingBox()
  expect(hero.width).toBeLessThanOrEqual(390)
  await expect(page.locator('.hero h1')).toBeVisible()
})

test('the console stacks on a phone and the sidebar becomes a drawer', async ({ page }) => {
  await signIn(page, ADMIN_SESSION)
  await page.goto('/admin')

  // the stat grid collapses to one column, so no card is squeezed
  const cardWidths = await page.locator('.adm-stat').evaluateAll((nodes) => nodes.map((n) => n.getBoundingClientRect().width))
  expect(new Set(cardWidths.map((w) => Math.round(w))).size).toBe(1)

  const toggle = page.locator('.admin__menu-toggle')
  await expect(toggle).toBeVisible()
  await toggle.click()
  await expect(page.locator('.admin__sidebar')).toHaveClass(/is-open/)

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  expect(overflow, 'the console scrolls horizontally').toBeLessThanOrEqual(1)
})
