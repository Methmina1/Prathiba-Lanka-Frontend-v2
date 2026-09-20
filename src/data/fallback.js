/**
 * Demo content, shown until the backend returns real rows (and whenever it is unreachable).
 * Replace freely - real data from /api/packages and /api/journal/published wins.
 *
 * There are no sample reviews here on purpose. A review is a claim that somebody travelled with the
 * agency and said something about it, so inventing one - even behind a "sample" notice - is not ours
 * to do. The reviews pages show an empty state until real ones arrive from /api/reviews.
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
    longDescription:
      'Eight days through the old kingdoms, with the rock fortress, the painted caves and two ruined capitals given the time they need.\n\nYou start in Colombo and drive north to Sigiriya, climbing early and spending the afternoon at Pidurangala for the view back onto it. Dambulla and Polonnaruwa fill the next two days - five painted caves, then a medieval city best covered by bicycle. Kandy closes the loop with the Temple of the Tooth and the drumming at the evening puja.\n\nFour-star hotels throughout, one long drive at each end, and room to add the tea country before you fly home.',
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
    longDescription:
      'A short trip built entirely around the parks, with two mornings in Yala and an afternoon at the Minneriya gathering.\n\nThe gate opens at half past five, so the first drive is in the dark and the second is in the last hour of light, when the animals move and the vehicles thin out. Between them there is lunch, a pool and not much else, which is the point.\n\nTented camps on the park boundary, a naturalist guide in the vehicle, and no driving off the track.',
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
    longDescription:
      'Five days in the hills, arranged around the train and the estates rather than the road.\n\nThe Kandy to Ella line does the hard work on day two: observation carriage, tea gardens to the window, and the Demodara loop. A factory walk follows the leaf from the weighing scale at the top of the building down to the sorting room at the bottom. Horton Plains takes the last morning, with World\u2019s End reached before the mist arrives.\n\nCold nights, short drives, and a planter\u2019s bungalow to come back to.',
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
    longDescription:
      'A week on the south coast with two bases and very little driving.\n\nGalle Fort first: the ramparts walked at sunset, the lighthouse, the Dutch Reformed Church and the streets behind them. Then east to Mirissa for whale watching from November to April, a surf lesson at Weligama if you want one, and the stilt fishermen working the shallows at Koggala on the way home.\n\nBeachfront hotels, breakfast that runs late, and one full day with nothing planned in it.',
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
