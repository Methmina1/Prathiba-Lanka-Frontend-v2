/**
 * Bundled copy for the editable pages. The backend seeds the same text (see
 * src/main/resources/content/*.json), so these defaults only show while the API is unreachable or
 * when a field has been left out - a page never renders blank.
 */
export const ABOUT_DEFAULTS = {
  hero: {
    eyebrow: 'About us',
    title: 'Arranged by people who live here',
    lede: 'PrathibaLanka is a small Sri Lankan travel house. We build private journeys for travellers who would rather see four places properly than fourteen badly.',
    scenery: 'train',
  },
  story: {
    eyebrow: 'Our story',
    heading: 'Fewer places. Longer looks.',
    lede: 'We started with one vehicle and a list of places we loved. That has not really changed: we still plan every journey by hand, and we still send people to the guesthouses we would send our own families to.',
    badgeTitle: 'Since 2014',
    badgeText: 'Arranging journeys from Colombo',
    scenery: 'tea',
    points: [
      {
        title: 'One consultant per journey',
        text: 'The person who plans your trip is the person who answers when you write.',
      },
      {
        title: 'On the ground, always',
        text: 'A local number that is answered day or night, for the whole of your stay.',
      },
    ],
  },
  values: {
    eyebrow: 'What we hold to',
    heading: 'Four things we do not compromise on',
    items: [
      {
        title: 'Local knowledge, not a script',
        text: 'Our guides grew up with these roads, temples and tea estates. They will tell you when to go, and when not to.',
      },
      {
        title: 'Private by default',
        text: 'No shared coaches, no strangers at breakfast. Your vehicle, your guide, your pace.',
      },
      {
        title: 'Priced in the open',
        text: 'One figure per person, agreed before you travel. No commission stops, no surprise extras.',
      },
      {
        title: 'Care for the island',
        text: 'Family-run stays, plastic-free journeys and wildlife viewed at a respectful distance.',
      },
    ],
  },
  timeline: {
    eyebrow: 'Milestones',
    heading: 'How we got here',
    items: [
      {
        year: '2014',
        title: 'A single vehicle in Colombo',
        text: 'Two guides, one van and a notebook of favourite guesthouses along the south coast.',
      },
      {
        year: '2017',
        title: 'The hill country routes',
        text: 'We mapped the tea line properly - which carriage, which side, which stops are worth the walk.',
      },
      {
        year: '2021',
        title: 'Wildlife done quietly',
        text: 'Long relationships with park trackers, and a firm rule about keeping our distance.',
      },
      {
        year: 'Today',
        title: 'A small team, still on the road',
        text: 'We keep the number of journeys per season low enough that every traveller gets a real consultant.',
      },
    ],
  },
}

export const CONTACT_DEFAULTS = {
  hero: {
    eyebrow: 'Contact',
    title: 'Talk to us',
    lede: 'Tell us roughly when you are coming and what you would like to see. A consultant replies with a draft itinerary and a price.',
    scenery: 'coast',
  },
  // A card with an empty value cannot be saved (the content validator requires one), so "no phone
  // number yet" means no phone card: add it back from Admin -> Contact when there is a number.
  cards: [
    {
      icon: 'mail',
      label: 'Email',
      value: 'prathibhalankavoyages@gmail.com',
      href: 'mailto:prathibhalankavoyages@gmail.com',
      note: 'Replies within one working day',
    },
    {
      icon: 'map',
      label: 'Office',
      value: 'Colombo, Sri Lanka',
      note: 'Visits by appointment',
    },
    {
      icon: 'clock',
      label: 'Response time',
      value: 'Under 24 hours',
      note: 'Usually the same afternoon',
    },
  ],
  aside: {
    heading: 'Already sent a request?',
    text: 'Every enquiry gets an eight-character PIN. Use it to follow the progress of your booking at any time - no account needed.',
    mapLabel: 'Colombo, Sri Lanka',
  },
}

export const PAGE_DEFAULTS = {
  about: ABOUT_DEFAULTS,
  contact: CONTACT_DEFAULTS,
}

const isPlainObject = (value) =>
  value !== null && typeof value === 'object' && !Array.isArray(value)

/**
 * Fills gaps in `incoming` from `fallback`, one level at a time. Lists are taken whole: a saved
 * list is the list, so removing a value card actually removes it.
 */
export function mergeDefaults(fallback, incoming) {
  if (!isPlainObject(incoming)) return fallback
  const merged = { ...fallback }
  for (const [key, value] of Object.entries(incoming)) {
    if (value === null || value === undefined) continue
    merged[key] = isPlainObject(value) && isPlainObject(fallback[key])
      ? mergeDefaults(fallback[key], value)
      : value
  }
  return merged
}
