/**
 * Shared fixtures: a mocked API and a way to start a test already signed in.
 *
 * The app is built to work when the backend is silent, so most tests could run without any of this -
 * but mocking gives deterministic records to assert against (covers, counts, statuses).
 */
export const SESSION_KEY = 'prathibalanka.session'

const photo = (name) => `/images/sl/${name}`

export const ADMIN_SESSION = { token: 'test-admin-token', email: 'admin@test.com', role: 'ROLE_ADMIN', userId: 1 }
export const CUSTOMER_SESSION = { token: 'test-customer-token', email: 'traveller@example.com', role: 'ROLE_CUSTOMER', userId: 2 }

const packages = [
  {
    packageId: 41,
    title: 'Classical Heritage',
    destination: 'Cultural Triangle',
    durationDays: 8,
    price: 1290,
    maxCapacity: 12,
    status: 'ACTIVE',
    description: 'Sigiriya at sunrise and the cave temples of Dambulla.',
    // The write-up behind the "read the full description" button: paragraphs, split on blank lines.
    longDescription: [
      'Eight days through the old kingdoms, with the rock fortress and two ruined capitals.',
      'Dambulla and Polonnaruwa fill the middle days, then Kandy closes the loop.',
    ].join('\n\n'),
    // One line per day, the way the admin form and the rate-sheet importer write it.
    itinerary: [
      'Arrive in Colombo and transfer to Sigiriya.',
      'Sigiriya rock at first light, then the Dambulla cave temples.',
      'Polonnaruwa by bicycle, with the afternoon free by the tank.',
    ].join('\n'),
    imageUrl: photo('seed-package-heritage.jpg'),
  },
  {
    packageId: 42,
    title: 'Wild Heart',
    destination: 'Yala & Minneriya',
    durationDays: 6,
    price: 1080,
    maxCapacity: 8,
    status: 'ACTIVE',
    description: 'Dawn game drives for leopards and sloth bears.',
    imageUrl: photo('seed-package-wildlife.jpg'),
  },
]

const posts = [
  {
    journalId: 34,
    title: 'The turquoise coast: where to swim, and when',
    description: 'Two coasts and they take turns.',
    status: 'PUBLISHED',
    publishedAt: '2026-09-19T10:00:00',
    coverImageUrl: photo('hero-1.jpg'),
    // The map places a post by the places it names, so the fixtures name some: this one is Southern.
    content: 'First paragraph about Mirissa and Weligama.\n\nSecond paragraph about Galle.',
  },
  {
    journalId: 35,
    title: 'What you will actually see on a Sri Lankan safari',
    description: 'Leopards are the headline.',
    status: 'PUBLISHED',
    publishedAt: '2026-09-19T10:05:00',
    coverImageUrl: photo('hero-2.webp'),
    content: 'First paragraph about Yala.\n\nSecond paragraph about the elephants of Minneriya.',
  },
  {
    journalId: 36,
    title: 'Kandy, and the road up into the tea country',
    description: 'The hill capital and the estates above it.',
    status: 'PUBLISHED',
    publishedAt: '2026-09-19T10:10:00',
    coverImageUrl: photo('hero-3.jpg'),
    content: 'First paragraph about Kandy and the Temple of the Tooth.\n\nSecond about Nuwara Eliya.',
  },
]

const gallery = [
  { imageId: 1, imageUrl: photo('tile-1.jpg'), caption: 'Coast', mediaType: 'IMAGE', uploadedAt: '2026-09-19T10:00:00' },
  { imageId: 2, imageUrl: photo('tile-2.jpg'), caption: 'Hills', mediaType: 'IMAGE', uploadedAt: '2026-09-19T10:01:00' },
]

// The media library, as the backend returns it: uploaded files are stored as a path on the API
// (/media/<name>), not a URL the browser can resolve on its own.
const media = [
  {
    mediaId: 1,
    originalName: 'hero-1.jpg',
    title: 'Coast cover',
    url: '/media/11111111-1111-1111-1111-111111111111.jpg',
    mediaType: 'IMAGE',
    sizeBytes: 180224,
    uploadedAt: '2026-09-19T10:00:00',
  },
  {
    mediaId: 2,
    originalName: 'clip.mp4',
    title: 'Surf clip',
    url: '/media/22222222-2222-2222-2222-222222222222.mp4',
    mediaType: 'VIDEO',
    sizeBytes: 3145728,
    uploadedAt: '2026-09-19T10:05:00',
  },
]

// A response for the mocked API only, so the review cards have something to render in a browser
// test. The site itself ships no sample reviews: with a real backend and an empty table, the reviews
// pages show their empty state.
const reviews = [  {
    reviewId: 1,
    customerName: 'Test Traveller',
    rating: 5,
    comment: 'The train to Ella was the highlight.',
    packageTitle: 'Mist & Tea',
    createdAt: '2026-09-01T10:00:00',
  },
]

const bookings = [
  {
    bookingId: 7,
    pinCode: 'A1B2C3D4',
    status: 'PENDING',
    customerName: 'Traveller One',
    customerEmail: 'one@example.com',
    packageTitle: 'Classical Heritage',
    destination: 'Cultural Triangle',
    numTravelers: 2,
    preferredTravelDate: '2027-03-01',
  },
  {
    bookingId: 8,
    pinCode: 'E5F6A7B8',
    status: 'CONFIRMED',
    customerName: 'Traveller Two',
    customerEmail: 'two@example.com',
    packageTitle: 'Wild Heart',
    destination: 'Yala & Minneriya',
    numTravelers: 1,
    preferredTravelDate: '2027-04-01',
    confirmedPrice: 1080,
    confirmedDate: '2027-04-01',
  },
]

const queries = [
  {
    queryId: 3,
    name: 'Traveller One',
    email: 'one@example.com',
    phone: '+94 77 000 0001',
    subject: 'December availability',
    message: 'Is December a good time?',
    status: 'NEW',
    autoResponseSent: true,
    replySent: false,
    answeredOutside: false,
    submittedAt: '2026-09-19T10:00:00',
    enquiryUrl: '/enquiry/demo-token',
    messages: [],
  },
  {
    queryId: 4,
    name: 'Traveller Two',
    email: 'two@example.com',
    subject: 'Tea country in March',
    message: 'Could we see the tea country?',
    status: 'RESPONDED',
    autoResponseSent: true,
    replySent: true,
    answeredOutside: false,
    respondedByName: 'Prathibha Lanka Voyages',
    respondedAt: '2026-09-20T09:00:00',
    submittedAt: '2026-09-19T11:00:00',
    enquiryUrl: '/enquiry/demo-token-two',
    messages: [
      {
        messageId: 11,
        direction: 'AGENCY',
        body: 'Yes - March is the best month for it. Shall I send an itinerary?',
        authorName: 'Prathibha Lanka Voyages',
        emailed: true,
        createdAt: '2026-09-20T09:00:00',
      },
    ],
  },
  // The other two outcomes a reply can have. They are fixtures rather than decoration: an enquiry
  // answered from the agency's own inbox and one whose reply never left look identical in a status
  // column, and telling them apart is what the console has to do.
  {
    queryId: 5,
    name: 'Traveller Three',
    email: 'three@example.com',
    subject: 'Airport transfer',
    message: 'Can you arrange a transfer from Colombo?',
    status: 'RESPONDED',
    autoResponseSent: true,
    replySent: false,
    answeredOutside: true,
    respondedByName: 'Prathibha Lanka Voyages',
    respondedAt: '2026-09-20T12:00:00',
    submittedAt: '2026-09-20T10:00:00',
    enquiryUrl: '/enquiry/demo-token-three',
    messages: [
      {
        messageId: 13,
        direction: 'AGENCY',
        body: 'Rang them back about the airport transfer.',
        authorName: 'Prathibha Lanka Voyages',
        emailed: false,
        createdAt: '2026-09-20T12:00:00',
      },
    ],
  },
  {
    queryId: 6,
    name: 'Traveller Four',
    email: 'four@example.com',
    subject: 'Group of nine',
    message: 'Do you take groups of nine?',
    status: 'RESPONDED',
    autoResponseSent: true,
    replySent: false,
    answeredOutside: false,
    respondedByName: 'Prathibha Lanka Voyages',
    respondedAt: '2026-09-20T14:00:00',
    submittedAt: '2026-09-20T13:00:00',
    enquiryUrl: '/enquiry/demo-token-four',
    messages: [
      {
        messageId: 14,
        direction: 'AGENCY',
        body: 'The mail server refused it - send this one again.',
        authorName: 'Prathibha Lanka Voyages',
        emailed: false,
        createdAt: '2026-09-20T14:00:00',
      },
    ],
  },
]

/** What GET /api/enquiries/{token} answers: the customer's own view of enquiry 4. */
const enquiryView = {
  queryId: 4,
  name: 'Traveller Two',
  subject: 'Tea country in March',
  message: 'Could we see the tea country?',
  status: 'RESPONDED',
  awaitingReply: false,
  submittedAt: '2026-09-19T11:00:00',
  respondedAt: '2026-09-20T09:00:00',
  messages: [
    {
      messageId: 11,
      direction: 'AGENCY',
      body: 'Yes - March is the best month for it. Shall I send an itinerary?',
      authorName: 'Prathiba Lanka Voyages',
      createdAt: '2026-09-20T09:00:00',
    },
  ],
}

const content = {
  about: {
    section: 'ABOUT',
    payload: {
      hero: { eyebrow: 'About us', title: 'Arranged by people who live here', lede: 'A small Sri Lankan travel house.', scenery: 'train', image: '' },
      story: {
        eyebrow: 'Our story',
        heading: 'Fewer places. Longer looks.',
        lede: 'We started with one vehicle.',
        badgeTitle: 'Since 2014',
        badgeText: 'Arranging journeys from Kurunagala',
        scenery: 'tea',
        image: '',
        points: [{ title: 'One consultant per journey', text: 'The same person answers.' }],
      },
      values: { eyebrow: 'What we hold to', heading: 'Four things', items: [{ title: 'Local knowledge', text: 'Guides who grew up here.' }] },
      timeline: { eyebrow: 'Milestones', heading: 'How we got here', items: [{ year: '2014', title: 'One vehicle', text: 'Two guides and a van.' }] },
    },
  },
  contact: {
    section: 'CONTACT',
    payload: {
      hero: { eyebrow: 'Contact', title: 'Talk to us', lede: 'Tell us when you are coming.', scenery: 'coast', image: '' },
      cards: [
        { icon: 'whatsapp', label: 'WhatsApp', value: '+94 76 048 4088', href: 'https://wa.me/94760484088', note: 'Fastest way to reach us' },
        { icon: 'phone', label: 'Call', value: '+94 77 000 0000', href: 'tel:+94770000000', note: 'Answered 08:00 - 21:00' },
        { icon: 'mail', label: 'Email', value: 'hello@prathibalanka.lk', href: 'mailto:hello@prathibalanka.lk', note: 'Within a working day' },
      ],
      aside: { heading: 'Already sent a request?', text: 'Use your PIN.', mapLabel: 'Kurunagala, Sri Lanka' },
    },
  },
}

/** Routes every API call the app makes, including the console's. */
export async function mockApi(page) {
  await page.route('**/api/**', async (route) => {
    const url = new URL(route.request().url())
    const path = url.pathname
    const params = url.searchParams
    const json = (body, status = 200) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) })

    if (path === '/api/packages') return json(packages)
    if (path.startsWith('/api/packages/')) return json(packages.find((p) => String(p.packageId) === path.split('/').pop()) ?? packages[0])
    if (path === '/api/journal/published') return json(posts)
    if (path.startsWith('/api/journal/published/')) return json(posts[0])
    if (path === '/api/gallery') return json(gallery)
    if (path === '/api/reviews') return json(reviews)
    if (path.startsWith('/api/content/')) {
      const section = path.split('/').pop()
      return content[section] ? json(content[section]) : route.fulfill({ status: 404, body: '{}' })
    }

    // The console filters server-side, so the mock has to honour the query parameters - otherwise a
    // filter test passes while asserting nothing.
    if (path === '/api/admin/packages') return json(packages)
    if (path === '/api/admin/bookings') {
      const status = params.get('status')
      return json(status ? bookings.filter((booking) => booking.status === status) : bookings)
    }
    if (path === '/api/admin/queries') {
      const onlyNew = params.get('onlyNew') === 'true'
      return json(onlyNew ? queries.filter((query) => query.status === 'NEW') : queries)
    }
    if (path === '/api/admin/journal') return json(posts)
    if (path === '/api/admin/content') return json(Object.values(content))
    if (path === '/api/admin/media') {
      const type = params.get('type')
      return json(type ? media.filter((asset) => asset.mediaType === type) : media)
    }
    if (path === '/api/admin/media/limits') return json({ maxImageBytes: 10485760, maxVideoBytes: 62914560 })
    if (path === '/api/auth/login') return json({ ...ADMIN_SESSION, token: 'test-admin-token' })
    if (path === '/api/auth/register') return json({ ...CUSTOMER_SESSION })
    if (path.startsWith('/api/customer/bookings')) return json(bookings)
    if (path.startsWith('/api/bookings/track')) return json(bookings[0])

    // Requesting a journey: the public form. The mock answers the way the API does - 201 with a PIN
    // and the journey that was asked for - so the form's success state can be asserted.
    if (path === '/api/bookings/request') {
      const body = JSON.parse(route.request().postData() ?? '{}')
      const journey = packages.find((p) => String(p.packageId) === String(body.packageId)) ?? packages[0]
      return json(
        {
          bookingId: 501,
          pinCode: 'TESTPIN1',
          status: 'PENDING',
          customerName: body.contactName ?? CUSTOMER_SESSION.email,
          customerEmail: body.contactEmail ?? CUSTOMER_SESSION.email,
          packageTitle: journey.title,
          destination: journey.destination,
          numTravelers: body.numTravelers,
          preferredTravelDate: body.preferredTravelDate,
          specialRequests: body.specialRequests ?? null,
          confirmedPrice: null,
          confirmedDate: null,
        },
        201
      )
    }
    if (path === '/api/contact') return json({ queryId: 3, status: 'NEW', autoResponseSent: false }, 201)

    // The customer's own enquiry, opened by the token from their acknowledgement email. Unknown tokens
    // answer the way the API does - 404 - so the page's "we could not find it" state is reachable.
    if (path === '/api/enquiries/demo-token') {
      return json({ ...enquiryView, queryId: 3, subject: 'December availability', messages: [] })
    }
    if (path === '/api/enquiries/demo-token-two/messages') {
      const body = JSON.parse(route.request().postData() ?? '{}')
      return json(
        {
          ...enquiryView,
          awaitingReply: true,
          status: 'NEW',
          messages: [
            ...enquiryView.messages,
            {
              messageId: 12,
              direction: 'CUSTOMER',
              body: body.message,
              authorName: 'Traveller Two',
              createdAt: '2026-09-21T08:00:00',
            },
          ],
        },
        201
      )
    }
    if (path === '/api/enquiries/demo-token-two') return json(enquiryView)
    if (path.startsWith('/api/enquiries/')) return route.fulfill({ status: 404, contentType: 'application/json', body: '{}' })

    // Answering an enquiry. The PATCH mirrors the API's shape: the reply lands on the thread and the
    // panel is told whether it was emailed, answered by hand, or not sent at all.
    if (path.match(/^\/api\/admin\/queries\/\d+\/respond$/)) {
      const id = Number(path.split('/')[4])
      const body = JSON.parse(route.request().postData() ?? '{}')
      const original = queries.find((q) => q.queryId === id) ?? queries[0]
      return json({
        ...original,
        status: 'RESPONDED',
        respondedByName: 'Prathibha Lanka Voyages',
        respondedAt: '2026-09-21T09:00:00',
        replySent: false,
        answeredOutside: false,
        adminResponse: body.adminResponse,
        messages: [
          ...(original.messages ?? []),
          {
            messageId: 21,
            direction: 'AGENCY',
            body: body.adminResponse,
            authorName: 'Prathibha Lanka Voyages',
            emailed: false,
            createdAt: '2026-09-21T09:00:00',
          },
        ],
      })
    }
    if (path.match(/^\/api\/admin\/queries\/\d+\/answered-outside$/)) {
      const id = Number(path.split('/')[4])
      const body = JSON.parse(route.request().postData() ?? '{}')
      const original = queries.find((q) => q.queryId === id) ?? queries[0]
      return json({
        ...original,
        status: 'RESPONDED',
        respondedByName: 'Prathibha Lanka Voyages',
        respondedAt: '2026-09-21T09:05:00',
        replySent: false,
        answeredOutside: true,
        adminResponse: body.note || null,
        messages: [
          ...(original.messages ?? []),
          {
            messageId: 22,
            direction: 'AGENCY',
            body: body.note || null,
            authorName: 'Prathibha Lanka Voyages',
            emailed: false,
            createdAt: '2026-09-21T09:05:00',
          },
        ],
      })
    }

    return route.fulfill({ status: 404, contentType: 'application/json', body: '{}' })
  })
}

/** Starts the app already signed in, by seeding the same localStorage entry the app reads. */
export async function signIn(page, session) {
  await page.addInitScript(
    ([key, value]) => window.localStorage.setItem(key, JSON.stringify(value)),
    [SESSION_KEY, session],
  )
}

/** Uncaught exceptions in the page. Console noise from blocked requests is expected and ignored. */
export function collectPageErrors(page) {
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  return errors
}
