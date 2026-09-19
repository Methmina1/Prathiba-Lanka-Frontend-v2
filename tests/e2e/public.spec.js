import { expect, test } from '@playwright/test'
import { collectPageErrors, mockApi } from './fixtures'

test.beforeEach(async ({ page }) => {
  await mockApi(page)
})

test('home renders the hero carousel with its own photographs', async ({ page }) => {
  const errors = collectPageErrors(page)
  await page.goto('/')

  const hero = page.locator('.hero')
  await expect(hero).toBeVisible()
  await expect(hero.locator('h1')).toHaveText('Turquoise water, warm the whole year')
  await expect(hero.locator('.eyebrow')).toHaveText('The coast')

  // all four slides are in the DOM, one visible at a time
  await expect(hero.locator('.hero__slide')).toHaveCount(4)
  await expect(hero.locator('.hero__slide.is-active')).toHaveCount(1)
  await expect(hero.locator('.hero__dot')).toHaveCount(4)

  // and every slide's image actually loads (WebP included)
  const images = await hero.locator('.hero__slide img').evaluateAll((nodes) =>
    nodes.map((node) => ({ src: node.getAttribute('src'), loaded: node.complete && node.naturalWidth > 0 })),
  )
  expect(images.map((i) => i.src)).toEqual([
    '/images/sl/hero-1.jpg',
    '/images/sl/hero-2.webp',
    '/images/sl/hero-3.jpg',
    '/images/sl/hero-4.jpg',
  ])
  for (const image of images) expect(image.loaded, `${image.src} did not load`).toBe(true)

  expect(errors, `uncaught errors: ${errors.join(' | ')}`).toEqual([])
})

test('the hero carousel advances and the dots switch slides', async ({ page }) => {
  await page.goto('/')
  const hero = page.locator('.hero')

  await hero.locator('.hero__dot').nth(1).click()
  await expect(hero.locator('h1')).toHaveText('Leopards, herds and real wilderness')
  await expect(hero.locator('.hero__slide').nth(1)).toHaveClass(/is-active/)

  await hero.locator('.hero__dot').nth(2).click()
  await expect(hero.locator('h1')).toHaveText('Two thousand years, still standing')

  await hero.locator('.hero__dot').nth(3).click()
  await expect(hero.locator('h1')).toHaveText('Evenings that end in gold')
})

test('the header offers no sign-in link, and the footer carries the staff link', async ({ page }) => {
  await page.goto('/')

  const header = page.locator('.site-header')
  await expect(header.locator('a.navbar__auth')).toHaveCount(0)
  await expect(header).not.toContainText('Sign in')
  await expect(header.locator('.navbar__actions .btn')).toHaveText('Plan your trip')

  await expect(page.locator('.site-footer a.footer__admin')).toHaveText('Admin sign in')
})

test('the plan page is where a visitor signs in', async ({ page }) => {
  await page.goto('/plan')

  const panel = page.locator('.plan__account')
  await expect(panel).toBeVisible()
  await expect(panel).toContainText('It is optional')
  await panel.getByRole('link', { name: 'Sign in' }).click()

  await expect(page).toHaveURL(/\/login$/)
  await expect(page.locator('h1')).toHaveText('Sign in')
})

test('journeys, journal and gallery render their covers from the API', async ({ page }) => {
  await page.goto('/journeys')
  const card = page.locator('.package-card').first()
  await expect(card).toContainText('Classical Heritage')
  await expect(card.locator('.package-card__media img')).toHaveAttribute('src', '/images/sl/seed-package-heritage.jpg')

  await page.goto('/journal')
  // the newest post is the featured one, the rest follow as cards - both carry their cover
  await expect(page.locator('.feature-post')).toContainText('The turquoise coast')
  await expect(page.locator('.feature-post__media img')).toHaveAttribute('src', '/images/sl/hero-1.jpg')
  await expect(page.locator('.journal-card').first()).toContainText('Sri Lankan safari')
  await expect(page.locator('.journal-card__media img').first()).toHaveAttribute('src', '/images/sl/hero-2.webp')

  await page.goto('/gallery')
  await expect(page.locator('.mosaic__tile')).toHaveCount(2)
  await expect(page.locator('.mosaic__tile img').first()).toBeVisible()
})

test('a journey detail page opens from a card', async ({ page }) => {
  await page.goto('/journeys')
  await page.locator('.package-card h3 a').first().click()
  await expect(page.locator('h1')).toHaveText('Classical Heritage')
  await expect(page.locator('.detail__main')).toContainText('About this journey')

  // the itinerary is one line per day, so three lines are three numbered steps and not one blob
  const steps = page.locator('.itinerary li')
  await expect(steps).toHaveCount(3)
  await expect(steps.first()).toContainText('Arrive in Colombo')
  await expect(steps.last()).toContainText('Polonnaruwa by bicycle')
})

test('the About page shows the photo that ships with the site', async ({ page }) => {
  await page.goto('/about')
  await expect(page.locator('.page-hero__media img')).toHaveAttribute('src', '/images/sl/page-about.jpg')
  await expect(page.locator('.philosophy__frame img')).toHaveAttribute('src', '/images/sl/about-story.jpg')
})

test('a 404 renders the island photograph, not a blank band', async ({ page }) => {
  await page.goto('/this-path-does-not-exist')
  await expect(page.locator('h1')).toHaveText('This path leads nowhere')
  await expect(page.locator('.page-hero__media img')).toHaveAttribute('src', '/images/sl/not-found.jpg')
})
