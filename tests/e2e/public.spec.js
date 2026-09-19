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

test('the home page shows two rows of three journeys and a way to the rest', async ({ page }) => {
  await page.goto('/')

  const section = page.locator('#journeys')
  await expect(section.locator('.package-card')).toHaveCount(2) // the fixture API holds two
  await expect(section.locator('.grid')).toHaveClass(/grid--3/)

  // three per row: the first three cards share a top edge, any fourth would not
  const columns = await section.locator('.grid').evaluate((grid) => getComputedStyle(grid).gridTemplateColumns.split(' ').length)
  expect(columns).toBe(3)

  // the home cards carry no story button - that lives on the journeys page
  await expect(section.locator('.package-card__story')).toHaveCount(0)
  await expect(section.locator('.section-cta a')).toHaveText('See every journey')
})

test('a journey card opens the full description in a dialog', async ({ page }) => {
  const errors = collectPageErrors(page)
  await page.goto('/journeys')

  const trigger = page.locator('.package-card__story').first()
  await expect(trigger).toHaveText(/Read the full description/)
  await trigger.click()

  const dialog = page.locator('.story')
  await expect(dialog).toBeVisible()
  await expect(dialog.locator('#story-title')).toHaveText('Classical Heritage')
  await expect(dialog.locator('.story__meta')).toContainText('8 days')
  await expect(dialog.locator('.story__body p')).toHaveCount(2)
  await expect(dialog.locator('.story__body p').first()).toContainText('Eight days through the old kingdoms')
  await expect(dialog.getByRole('link', { name: 'Day-by-day itinerary' })).toBeVisible()

  // the page behind is frozen while it is open, and Escape puts it back
  await expect(page.locator('body')).toHaveCSS('overflow', 'hidden')
  await page.keyboard.press('Escape')
  await expect(dialog).toHaveCount(0)
  await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden')

  expect(errors, `uncaught errors: ${errors.join(' | ')}`).toEqual([])
})

test('the journey page prints the full write-up and the itinerary steps', async ({ page }) => {
  await page.goto('/journeys')
  await page.locator('.package-card h3 a').first().click()

  await expect(page.locator('.detail__story p')).toHaveCount(2)
  await expect(page.locator('.detail__story p').first()).toContainText('Eight days through the old kingdoms')
  await expect(page.locator('.itinerary li')).toHaveCount(3)

  // the header lede is the one-line summary, not the whole write-up
  await expect(page.locator('.page-hero__inner p')).toHaveText('Sigiriya at sunrise and the cave temples of Dambulla.')
})

test('the home page draws Sri Lanka out of its nine provinces', async ({ page }) => {
  const errors = collectPageErrors(page)
  await page.goto('/')

  const map = page.locator('#island .province-map')
  await expect(map.locator('path')).toHaveCount(9)
  await expect(page.locator('.island__pick')).toHaveCount(9)

  // The shapes have to add up to the island, not just sit near each other: sample a grid over the
  // paths and check the proportions of Sri Lanka (about 0.57 wide for its height) and that the land
  // fills roughly the share of the bounding box that the real island does (about 60%).
  const shape = await map.evaluate((svg) => {
    const [, , viewWidth, viewHeight] = svg.getAttribute('viewBox').split(/\s+/).map(Number)
    const paths = [...svg.querySelectorAll('path')]
    const canvas = document.createElement('canvas')
    canvas.width = 46
    canvas.height = 80
    const ctx = canvas.getContext('2d')
    ctx.setTransform(46 / viewWidth, 0, 0, 80 / viewHeight, 0, 0)

    const shapes = paths.map((path) => new Path2D(path.getAttribute('d')))
    let union = 0
    let sum = 0
    for (let y = 0; y < 80; y += 1) {
      for (let x = 0; x < 46; x += 1) {
        let hits = 0
        for (const candidate of shapes) if (ctx.isPointInPath(candidate, x + 0.5, y + 0.5)) hits += 1
        sum += hits
        union += hits > 0 ? 1 : 0
      }
    }

    const box = paths.reduce(
      (acc, path) => {
        const b = path.getBBox()
        return {
          left: Math.min(acc.left, b.x),
          top: Math.min(acc.top, b.y),
          right: Math.max(acc.right, b.x + b.width),
          bottom: Math.max(acc.bottom, b.y + b.height),
        }
      },
      { left: Infinity, top: Infinity, right: -Infinity, bottom: -Infinity },
    )

    return {
      aspect: (box.right - box.left) / (box.bottom - box.top),
      coverage: union / (46 * 80),
      overlap: (sum - union) / union,
    }
  })

  expect(shape.aspect, 'the island should be taller than it is wide, like Sri Lanka').toBeGreaterThan(0.5)
  expect(shape.aspect).toBeLessThan(0.65)
  expect(shape.coverage, 'the land should fill about 60% of the map box').toBeGreaterThan(0.5)
  expect(shape.coverage).toBeLessThan(0.72)
  expect(shape.overlap, 'provinces should tile the island, not overlap it').toBeLessThan(0.06)

  // Picking a province names it and its capital.
  await page.locator('.island__pick', { hasText: 'Northern' }).click()
  await expect(page.locator('.island__card h3')).toHaveText('Northern Province')
  await expect(page.locator('.island__capital')).toContainText('Jaffna')
  await expect(page.locator('.island__districts li')).toHaveCount(5)

  expect(errors, `uncaught errors: ${errors.join(' | ')}`).toEqual([])
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
