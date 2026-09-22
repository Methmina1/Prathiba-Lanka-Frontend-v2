import { expect, test } from '@playwright/test'
import { ADMIN_SESSION, CUSTOMER_SESSION, collectPageErrors, mockApi, signIn } from './fixtures'

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

test('the header never says who is signed in, and signing out leaves', async ({ page }) => {
  await signIn(page, CUSTOMER_SESSION)
  await page.goto('/')

  const header = page.locator('.site-header')
  // A way into the account, and a way out - never the address, and never the name behind it.
  await expect(header.locator('.navbar__auth')).toHaveText('Account')
  await expect(header).not.toContainText('traveller')
  await expect(header).not.toContainText('@')

  await header.getByRole('button', { name: 'Sign out' }).click()

  await expect(page).toHaveURL(/\/$/)
  await expect(header.locator('.navbar__account')).toHaveCount(0)
  await expect(header.locator('.navbar__actions .btn')).toHaveText('Plan your trip')
  expect(await page.evaluate(() => window.localStorage.getItem('prathibalanka.session'))).toBeNull()
})

test('an administrator gets the console, not their address, in the header', async ({ page }) => {
  await signIn(page, ADMIN_SESSION)
  await page.goto('/')

  const header = page.locator('.site-header')
  await expect(header.locator('.navbar__auth')).toHaveText('Console')
  await expect(header).not.toContainText('admin@test.com')
  await expect(header.getByRole('button', { name: 'Sign out' })).toBeVisible()
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
  // The page opens on the map; the stories are behind this button (or behind a province).
  await page.getByRole('button', { name: /^Read all/ }).click()
  // the newest post is the featured one, the rest follow as cards - both carry their cover
  await expect(page.locator('.feature-post')).toContainText('The turquoise coast')
  await expect(page.locator('.feature-post__media img')).toHaveAttribute('src', '/images/sl/hero-1.jpg')
  await expect(page.locator('.journal-card').first()).toContainText('Sri Lankan safari')
  await expect(page.locator('.journal-card__media img').first()).toHaveAttribute('src', '/images/sl/hero-2.webp')

  await page.goto('/gallery')
  // one square tile per gallery row, with the caption written underneath it
  await expect(page.locator('.gallery-grid__cell')).toHaveCount(2)
  await expect(page.locator('.gallery-tile__media img').first()).toBeVisible()
  await expect(page.locator('.gallery-tile__caption').first()).toHaveText('Coast')
})

test('a journey detail page opens from a card', async ({ page }) => {
  await page.goto('/journeys')
  await page.locator('.package-card h3 a').first().click()
  await expect(page.locator('h1')).toHaveText('Classical Heritage')
  await expect(page.locator('.detail__main')).toContainText('About this journey')

  // The itinerary is one line per day and every day is a dropdown: three lines, three days.
  const days = page.locator('.days__item')
  await expect(days).toHaveCount(3)
  await expect(days.first().locator('.days__button')).toContainText('Day 01')
  await expect(days.first().locator('.days__button')).toContainText('Arrive in Colombo')

  // The first day starts open; the rest stay closed until they are asked for.
  await expect(days.first().locator('.days__panel-inner')).toBeVisible()
  await expect(days.last().locator('.days__panel-inner')).toBeHidden()
  await expect(days.last().locator('.days__panel-inner')).toContainText('Polonnaruwa by bicycle')

  await days.last().locator('.days__button').click()
  await expect(days.last().locator('.days__panel-inner')).toBeVisible()
  await expect(days.last().locator('.days__button')).toHaveAttribute('aria-expanded', 'true')

  // And "Open all days" opens every one of them at once.
  await page.getByRole('button', { name: 'Open all days' }).click()
  await expect(days.nth(1).locator('.days__panel-inner')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Close all days' })).toBeVisible()

  // No price is published anywhere on the page.
  expect(await page.locator('.detail__side').innerText()).not.toContain('$')
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

test('the journey page prints the full write-up and the itinerary days', async ({ page }) => {
  await page.goto('/journeys')
  await page.locator('.package-card h3 a').first().click()

  await expect(page.locator('.detail__story p')).toHaveCount(2)
  await expect(page.locator('.detail__story p').first()).toContainText('Eight days through the old kingdoms')
  await expect(page.locator('.days__item')).toHaveCount(3)

  // The header lede is the one-line summary, not the whole write-up
  await expect(page.locator('.page-hero__inner p')).toHaveText('Sigiriya at sunrise and the cave temples of Dambulla.')
})

test('no journey card shows a price', async ({ page }) => {
  await page.goto('/journeys')
  await expect(page.locator('.package-card').first()).toBeVisible()

  const cards = await page.locator('.package-card').allInnerTexts()
  const withPrices = cards.filter((text) => text.includes('$') || /from\s+\d/i.test(text))
  expect(withPrices, `cards still showing a price: ${withPrices.join(' | ')}`).toEqual([])
})

test('the journal page draws Sri Lanka out of its nine provinces', async ({ page }) => {
  const errors = collectPageErrors(page)
  await page.goto('/journal')

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

  // Picking a province names it, describes it, and lists the journeys whose itinerary goes through it.
  await page.getByRole('button', { name: 'Northern', exact: true }).click()
  await expect(page.locator('.island__card h3')).toHaveText('Northern Province')
  await expect(page.locator('.island__capital')).toContainText('Jaffna')
  await expect(page.locator('.island__about')).toContainText('Tamil-speaking')
  await expect(page.locator('.island__districts li')).toHaveCount(5)
  await expect(page.locator('.island__journeys h4')).toHaveText('No fixed journey stops here yet')

  // The fixture catalogue has a Cultural Triangle journey, which is Central.
  await page.getByRole('button', { name: 'Central', exact: true }).click()
  await expect(page.locator('.island__about')).toContainText('The tea country')
  await expect(page.locator('.island__journeys h4')).toHaveText('1 journey through Central')
  const journey = page.locator('.island__journey').first()
  await expect(journey).toContainText('Classical Heritage')
  await expect(journey.locator('.island__journey-meta')).toContainText('of 8 days here')

  // …and it is a way into the catalogue, not decoration.
  await journey.click()
  await expect(page).toHaveURL(/\/journeys\/41$/)
  await expect(page.locator('h1')).toHaveText('Classical Heritage')

  expect(errors, `uncaught errors: ${errors.join(' | ')}`).toEqual([])
})

test('a province can be held, so the pointer can leave the map', async ({ page }) => {
  await page.goto('/journal')
  await page.locator('#island').scrollIntoViewIfNeeded()

  const card = page.locator('.island__card h3')
  const hold = page.locator('.island__hold')
  const map = page.locator('.province-map')

  // Hovering a shape follows the pointer, and nothing is held.
  const moveTo = async (name) => {
    // The pointer has to land on the shape, so the point is measured against the live layout and
    // then checked with elementFromPoint: content above the map (hero, cards, images) settles at its
    // own pace, and a stale coordinate silently hovers a different province - or the sticky header.
    for (let attempt = 0; attempt < 6; attempt += 1) {
      const point = await page.evaluate((label) => {
        const path = document.querySelector(`.province-map__shape[aria-label="${label} Province"]`)
        const box = path.getBBox()
        const matrix = path.getScreenCTM()
        const svg = path.ownerSVGElement
        const svgPoint = svg.createSVGPoint()
        // A concave province's bounding-box centre can sit outside it, so find a point well inside.
        for (let ring = 1; ring <= 10; ring += 1) {
          for (let y = 0; y <= 20; y += 1) {
            for (let x = 0; x <= 20; x += 1) {
              const candidate = { x: box.x + (box.width * x) / 20, y: box.y + (box.height * y) / 20 }
              if (!path.isPointInFill(candidate)) continue
              const margin = 3 * ring
              const inside =
                path.isPointInFill({ x: candidate.x + margin, y: candidate.y }) &&
                path.isPointInFill({ x: candidate.x - margin, y: candidate.y }) &&
                path.isPointInFill({ x: candidate.x, y: candidate.y + margin }) &&
                path.isPointInFill({ x: candidate.x, y: candidate.y - margin })
              if (!inside) continue
              svgPoint.x = candidate.x
              svgPoint.y = candidate.y
              const screen = svgPoint.matrixTransform(matrix)
              const x0 = Math.round(screen.x)
              const y0 = Math.round(screen.y)
              // Only accept a point that the document agrees is over this province.
              const hit = document.elementFromPoint(x0, y0)
              if (hit === path) return { x: x0, y: y0, onTarget: true }
              return { x: x0, y: y0, onTarget: false, hit: hit?.getAttribute?.('aria-label') ?? hit?.tagName }
            }
          }
        }
        return null
      }, name)

      if (point?.onTarget) {
        await page.mouse.move(point.x, point.y)
        return
      }
      // The section moved under the measurement, or something is covering it: settle and try again.
      await page.locator('.province-map').scrollIntoViewIfNeeded()
      await page.waitForTimeout(200)
    }
    throw new Error(`could not land the pointer on ${name} Province`)
  }

  await moveTo('Central')
  await expect(card).toHaveText('Central Province')
  await expect(hold).toHaveText('Hold')

  // Clicking holds it: the pointer can then cross the other provinces without changing the panel.
  await page.getByRole('button', { name: 'Central', exact: true }).click()
  await expect(hold).toHaveText('Held')
  await expect(map).toHaveAttribute('data-held', 'central')

  await moveTo('Uva')
  await expect(card).toHaveText('Central Province')
  await moveTo('Western')
  await expect(card).toHaveText('Central Province')

  // Clicking it again lets go, and the map follows the pointer once more.
  await page.getByRole('button', { name: 'Central', exact: true }).click()
  await expect(hold).toHaveText('Hold')
  await expect(map).toHaveAttribute('data-held', '')

  await moveTo('Uva')
  await expect(card).toHaveText('Uva Province')
})

test('the About page shows the photo that ships with the site', async ({ page }) => {
  await page.goto('/about')
  await expect(page.locator('.page-hero__media img')).toHaveAttribute('src', '/images/sl/page-about.jpg')
  await expect(page.locator('.philosophy__frame img')).toHaveAttribute('src', '/images/sl/about-story.jpg')
})

test('the Request button opens the form with its journey already chosen', async ({ page }) => {
  await page.goto('/journeys')
  await page.locator('.package-card__meta a[href^="/plan"]').first().click()

  // The journey travels in the URL, and the field is filled in for you.
  await expect(page).toHaveURL(/\/plan\?package=\d+/)
  const form = page.locator('#request')
  await expect(form.locator('#bookingPackage')).toHaveValue('41')
  await expect(form.locator('#bookingPackage option:checked')).toHaveText(/Classical Heritage/)

  // A visitor without an account gives a name and an email...
  await form.getByLabel('Your name').fill('Ada Traveller')
  await form.getByLabel('Email').fill('ada@example.com')
  await form.getByLabel('Travellers').fill('3')
  await form.getByLabel('Preferred date').fill('2027-03-04')
  await form.getByRole('button', { name: 'Request this journey' }).click()

  // ...and comes back with the PIN that tracks it.
  const sent = page.locator('.plan__form--sent')
  await expect(sent).toBeVisible()
  await expect(sent.locator('.booking-pin__value')).toHaveText('TESTPIN1')
  await expect(sent).toContainText('Classical Heritage')
  await expect(sent).toContainText('3 travellers')
})

test('the journal page opens on the map, and a province brings its stories up', async ({ page }) => {
  await page.goto('/journal')

  // At first: the map, and no story cards at all.
  await expect(page.locator('#island .province-map')).toBeVisible()
  await expect(page.locator('.journal-card')).toHaveCount(0)
  await expect(page.locator('#province-notes')).toHaveCount(0)

  // Choosing a province brings up what was written about it, with its cover.
  await page.getByRole('button', { name: 'Central', exact: true }).click()
  const notes = page.locator('#province-notes')
  await expect(notes).toBeVisible()
  await expect(notes).toContainText('Central Province')
  await expect(notes.locator('.journal-card').first()).toContainText('Kandy')
  await expect(notes.locator('.journal-card__media img').first()).toBeVisible()

  // Another province swaps the stories for that province's.
  await page.getByRole('button', { name: 'Southern', exact: true }).click()
  const southern = page.locator('#province-notes')
  await expect(southern).toContainText('Southern Province')
  await expect(southern.locator('.journal-card').first()).not.toContainText('Kandy')

  // And letting go puts the page back to the map alone.
  await page.getByRole('button', { name: 'Let go of Southern' }).click()
  await expect(page.locator('#province-notes')).toHaveCount(0)
})

test('the whole journal is still reachable from the map', async ({ page }) => {
  await page.goto('/journal')
  await expect(page.locator('.feature-post')).toHaveCount(0)

  await page.getByRole('button', { name: /^Read all 3 stories$/ }).click()
  await expect(page.locator('.feature-post')).toBeVisible()
  await expect(page.locator('.journal-card')).toHaveCount(2)
})

test('a 404 renders the island photograph, not a blank band', async ({ page }) => {
  await page.goto('/this-path-does-not-exist')
  await expect(page.locator('h1')).toHaveText('This path leads nowhere')
  await expect(page.locator('.page-hero__media img')).toHaveAttribute('src', '/images/sl/not-found.jpg')
})

test('the customer opens their enquiry from the email link, and writes back', async ({ page }) => {
  // The token in the link is the credential: no account, no sign-in. Reached the way the email
  // reaches it, which is why this is a URL test rather than a click-through.
  await page.goto('/enquiry/demo-token-two')

  await expect(page.locator('h1')).toHaveText('Tea country in March')
  await expect(page.locator('.enquiry__meta')).toContainText('#4')
  await expect(page.locator('.enquiry__head .pill')).toHaveText('Answered')
  await expect(page.locator('.enquiry__sent')).toHaveText('Could we see the tea country?')

  // The agency's answer, and nothing about how it was sent - that is the agency's business.
  const answer = page.locator('.thread__item--agency')
  await expect(answer.locator('.thread__body')).toContainText('March is the best month for it')
  await expect(answer).not.toContainText('emailed')

  // Writing again: their message joins the thread and the enquiry goes back to waiting.
  await page.getByLabel('Your message').fill('Four of us, if that changes the price.')
  await page.getByRole('button', { name: 'Send message' }).click()

  await expect(page.locator('.form-note--sent')).toContainText('your message is with us')
  await expect(page.locator('.thread__item--customer .thread__body')).toContainText('Four of us')
  await expect(page.locator('.enquiry__head .pill')).toHaveText('Waiting for a reply')
})

test('an enquiry link that does not work says so, and offers a way through', async ({ page }) => {
  await page.goto('/enquiry/not-a-real-token')

  // Explaining the likely cause, because the usual one is an email client splitting the URL in two.
  await expect(page.locator('.form-note--error')).toContainText('could not find that enquiry')
  await expect(page.getByRole('link', { name: /Send us a message/ })).toHaveAttribute('href', '/contact')
})

test('a customer is sent to the review form, and a visitor to sign in', async ({ page }) => {
  // Signed out: the reviews page offers the way in, and it is not /plan any more - that page has the
  // enquiry form and the PIN tracker, and no review form at all.
  await page.goto('/reviews')
  const signedOut = page.getByRole('link', { name: 'Sign in to write a review' })
  await expect(signedOut).toHaveAttribute('href', '/login?next=/account')

  // Signed in: the same page points straight at the form.
  await signIn(page, CUSTOMER_SESSION)
  await page.goto('/reviews')
  const write = page.getByRole('link', { name: 'Write a review' })
  await expect(write).toHaveAttribute('href', '/account#review')
  await write.click()

  // The form is on the account page, and it is the page's own effect that brings it into view.
  await expect(page).toHaveURL(/\/account#review$/)
  const form = page.locator('#review')
  await expect(form).toBeVisible()
  await expect(form.locator('h3')).toHaveText('Leave a review')
  await expect(form.getByRole('button', { name: 'Publish review' })).toBeVisible()
})

test('the gallery is an even grid, and a photograph opens full size', async ({ page }) => {
  await page.goto('/gallery')

  await expect(page.locator('.gallery-tile')).toHaveCount(2)

  // Nothing hangs at an angle any more: every tile is the same, evenly sized square, and the caption
  // is written underneath the picture rather than across it.
  const boxes = await page.locator('.gallery-tile__media').evaluateAll((nodes) =>
    nodes.map((node) => {
      const box = node.getBoundingClientRect()
      return { w: Math.round(box.width), h: Math.round(box.height) }
    })
  )
  expect(
    new Set(boxes.map((box) => `${box.w}x${box.h}`)).size,
    'every tile should be the same size'
  ).toBe(1)
  expect(boxes[0].w, 'a tile should be square').toBe(boxes[0].h)

  // The swap from the shipped photographs to the ones the API returns replaces the tiles, so both
  // measurements are taken from one tile once its caption is there - reading them across the swap was
  // how this went flaky.
  const firstTile = page.locator('.gallery-tile').first()
  await expect(firstTile.locator('.gallery-tile__caption')).toHaveText('Coast')
  const media = await firstTile.locator('.gallery-tile__media').boundingBox()
  const caption = await firstTile.locator('.gallery-tile__caption').boundingBox()
  expect(caption.y, 'the caption should sit below the picture').toBeGreaterThanOrEqual(
    media.y + media.height
  )

  // Clicking a photograph opens the viewer, where the arrows move through the same set.
  await page.locator('.gallery-tile__open').first().click()
  const viewer = page.locator('.lightbox')
  await expect(viewer).toBeVisible()
  await expect(viewer.locator('.lightbox__caption')).toHaveText('Coast')
  await expect(viewer.locator('.lightbox__count')).toHaveText('1 / 2')

  await page.keyboard.press('ArrowRight')
  await expect(viewer.locator('.lightbox__caption')).toHaveText('Hills')
  await expect(viewer.locator('.lightbox__count')).toHaveText('2 / 2')

  // The buttons do the same as the keys, and the arrows on the backdrop stay inside the viewport.
  const next = viewer.getByRole('button', { name: 'Next photograph' })
  const prev = viewer.getByRole('button', { name: 'Previous photograph' })
  for (const button of [next, prev]) {
    const box = await button.boundingBox()
    expect(box.x, 'an arrow should not sit off the edge of the screen').toBeGreaterThanOrEqual(0)
    expect(box.x + box.width).toBeLessThanOrEqual(page.viewportSize().width)
  }
  await prev.click()
  await expect(viewer.locator('.lightbox__caption')).toHaveText('Coast')
  await expect(viewer.locator('.lightbox__count')).toHaveText('1 / 2')

  // The last one wraps round to the first, so the viewer is never a dead end.
  await page.keyboard.press('ArrowLeft')
  await expect(viewer.locator('.lightbox__caption')).toHaveText('Hills')

  // Escape closes it, and the page behind is scrollable again.
  await page.keyboard.press('Escape')
  await expect(viewer).toBeHidden()
  await expect
    .poll(() => page.evaluate(() => document.body.style.overflow))
    .not.toBe('hidden')
})

test('the contact page carries the social accounts and the motion', async ({ page }) => {
  await page.goto('/contact')

  // Scoped to the band: the footer links the same accounts, with the same labels.
  const band = page.locator('#follow')
  const facebook = band.getByRole('link', { name: 'Prathibha Lanka Voyages on Facebook' })
  const instagram = band.getByRole('link', { name: '@prathibha_lanka_voyeages on Instagram' })
  const tiktok = band.getByRole('link', { name: 'Prathibha Lanka Voyages on TikTok' })
  const whatsapp = band.getByRole('link', { name: 'Message Prathibha Lanka Voyages on WhatsApp' })
  await expect(facebook).toHaveAttribute('href', 'https://www.facebook.com/share/1KcQJzpSRF/')
  await expect(instagram).toHaveAttribute('href', 'https://www.instagram.com/prathibha_lanka_voyeages/')
  await expect(tiktok).toHaveAttribute('href', 'https://www.tiktok.com/@prathibha_lanka_voyages')
  await expect(whatsapp).toHaveAttribute('href', 'https://wa.me/94760484088')
  await expect(facebook).toHaveAttribute('rel', /noreferrer/)
  await expect(facebook).toHaveAttribute('target', '_blank')
  await expect(band).toContainText('+94 76 048 4088')
  await expect(page.locator('.social-note')).toContainText('A message reaches us faster')

  // The effects layer is really applied: the aurora behind the cards animates, and a social card is
  // tilted and straightens under the pointer.
  const drift = await page
    .locator('.contact-main')
    .evaluate((node) => getComputedStyle(node, '::before').animationName)
  expect(drift).toBe('contact-drift-a')

  const tilt = await instagram.evaluate((node) => getComputedStyle(node).transform)
  expect(tilt, 'the social cards should be tilted').not.toBe('none')
  await instagram.hover()
  await expect
    .poll(async () => instagram.evaluate((node) => getComputedStyle(node).transform))
    .not.toBe(tilt)
})

test('the WhatsApp bubble follows a visitor, and stays out of the account pages', async ({ page }) => {
  await page.goto('/')
  const fab = page.getByRole('link', { name: /Message us on WhatsApp/ })
  await expect(fab).toBeVisible()
  await expect(fab).toHaveAttribute('href', 'https://wa.me/94760484088')
  await expect(fab).toHaveAttribute('target', '_blank')

  // It is on the pages a customer-to-be reads...
  await page.goto('/journeys')
  await expect(fab).toBeVisible()

  // ...and not on the sign-in or account pages.
  await page.goto('/login')
  await expect(fab).toHaveCount(0)
  await signIn(page, CUSTOMER_SESSION)
  await page.goto('/account')
  await expect(fab).toHaveCount(0)
})

test('a journey page offers WhatsApp about that journey', async ({ page }) => {
  await page.goto('/journeys')
  await page.locator('.package-card h3 a').first().click()

  const whatsapp = page.locator('.quote-card__phone--whatsapp')
  await expect(whatsapp).toBeVisible()
  await expect(whatsapp).toHaveAttribute('href', 'https://wa.me/94760484088')
  await expect(whatsapp).toContainText('+94 76 048 4088')
})
