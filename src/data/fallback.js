/**
 * Demo content, shown until the backend returns real rows (and whenever it is unreachable).
 * Replace freely - real data from /api/packages, /api/journal/published and /api/reviews wins.
 */

export const fallbackPackages = [
  {
    packageId: 'demo-1',
    title: 'Classical Heritage',
    destination: 'Cultural Triangle',
    durationDays: 8,
    price: 1290,
    maxCapacity: 12,
    description:
      'Sigiriya at sunrise, the cave temples of Dambulla, the ancient city of Polonnaruwa and the lake at Kandy.',
    status: 'ACTIVE',
    scenery: 'temple',
  },
  {
    packageId: 'demo-2',
    title: 'Wild Heart',
    destination: 'Yala & Minneriya',
    durationDays: 6,
    price: 1080,
    maxCapacity: 8,
    description:
      'Dawn game drives for leopards and sloth bears, then the great elephant gathering on the Minneriya tank.',
    status: 'ACTIVE',
    scenery: 'safari',
  },
  {
    packageId: 'demo-3',
    title: 'Mist & Tea',
    destination: 'Hill Country',
    durationDays: 5,
    price: 940,
    maxCapacity: 10,
    description:
      'The Kandy to Ella line, tea factory walks, Horton Plains at first light and cool nights in a planter bungalow.',
    status: 'ACTIVE',
    scenery: 'tea',
  },
  {
    packageId: 'demo-4',
    title: 'Southern Serenity',
    destination: 'Galle & Mirissa',
    durationDays: 7,
    price: 1150,
    maxCapacity: 14,
    description:
      'A Dutch fort, whale-watching off Mirissa, stilt fishermen at dusk and slow mornings on a quiet stretch of coast.',
    status: 'ACTIVE',
    scenery: 'coast',
  },
]

export const fallbackJournal = [
  {
    journalId: 'demo-1',
    title: 'When to visit Sri Lanka: a season-by-season guide',
    description:
      'Two monsoons, two coasts and a hill country that behaves like a third climate. Here is how to pick your window.',
    status: 'PUBLISHED',
    publishedAt: '2026-08-18T09:00:00',
    scenery: 'coast',
  },
  {
    journalId: 'demo-2',
    title: 'Climbing Sigiriya without the crowds',
    description: 'The rock opens at 6.30am. Go then, and you will have the mirror wall almost to yourself.',
    status: 'PUBLISHED',
    publishedAt: '2026-07-02T09:00:00',
    scenery: 'temple',
  },
  {
    journalId: 'demo-3',
    title: 'A short history of Ceylon tea',
    description: 'How a coffee blight in the 1870s turned a hillside of failed coffee into the world’s finest tea.',
    status: 'PUBLISHED',
    publishedAt: '2026-06-11T09:00:00',
    scenery: 'tea',
  },
]

export const fallbackReviews = [
  {
    reviewId: 'demo-1',
    customerName: 'Anna & Piet',
    rating: 5,
    comment:
      'Nine days, no decisions to make, and a guide who knew every temple guard by name. The train to Ella was the highlight.',
    packageTitle: 'Mist & Tea',
  },
  {
    reviewId: 'demo-2',
    customerName: 'Marta Ruiz',
    rating: 5,
    comment:
      'We saw three leopards in two mornings. Everything was arranged quietly in the background, which is exactly what we wanted.',
    packageTitle: 'Wild Heart',
  },
  {
    reviewId: 'demo-3',
    customerName: 'The Oberoi family',
    rating: 4,
    comment:
      'Beautifully paced for our children, and the stilt fishermen at sunset was worth the whole trip on its own.',
    packageTitle: 'Southern Serenity',
  },
]

export const trustBadges = [
  { icon: 'shield', title: 'SLTDA registered', text: 'Licensed operator, insured vehicles' },
  { icon: 'compass', title: 'Private journeys', text: 'Your own guide and chauffeur' },
  { icon: 'clock', title: '24/7 in-island support', text: 'A real number, day and night' },
  { icon: 'leaf', title: 'Low-impact travel', text: 'Local stays and local guides' },
]

export const sustainabilityPoints = [
  { title: 'Plastic-free journeys', text: 'Refillable bottles and filtered water in every vehicle.' },
  { title: 'Local first', text: 'Family-run guesthouses, home kitchens and village guides.' },
  { title: 'Wildlife respect', text: 'No elephant rides, no baiting, generous distance kept.' },
  { title: 'Quiet seasons', text: 'We move with the weather, not against it.' },
]

export const faqs = [
  {
    q: 'How does a PrathibaLanka journey work?',
    a: 'You send a request with your dates and interests. A consultant replies with a draft itinerary and a price, usually within one working day. Once you are happy, we confirm the booking and send your PIN.',
  },
  {
    q: 'What is the PIN for?',
    a: 'Every request gets an eight-character PIN. Use the track panel on this page to follow the status of your booking at any time - no account needed.',
  },
  {
    q: 'Can the itinerary be changed?',
    a: 'Yes. Everything we publish is a starting point. Add a day in the hills, swap a safari for a cooking class, or slow the whole thing down.',
  },
  {
    q: 'When is the best time to visit?',
    a: 'The west and south coasts are best from December to April, the east coast from May to September. The cultural triangle and hill country work all year.',
  },
]
