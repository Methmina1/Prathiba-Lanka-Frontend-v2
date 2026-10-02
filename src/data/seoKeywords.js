/**
 * Sri Lanka travel keyword taxonomy for on-page SEO.
 *
 * This is the single source of truth for the keywords the site targets. It is used two ways:
 *   - at build/runtime time, to write per-page <title>, meta description and H1s; and
 *   - as a reference when writing copy, so the same phrase is used on its target page and not
 *     scattered across pages that would then compete with each other (see PrathibhaLanka_SEO_Keywords.docx).
 *
 * IMPORTANT ON VOLUMES
 *   There are no measured monthly search volumes here. Search volume is Google/Ahrefs/Semrush data and
 *   is not available without those tools; inventing numbers would be worse than omitting them. Priority
 *   instead reflects how commercial the query is and how realistic the site is to rank for it, the same
 *   basis the agency's own keyword doc used. Tier is the search-intent shape, not a number:
 *
 *     head     - one or two words, very broad, most competitive (e.g. "Sri Lanka tour")
 *     body     - the useful middle: a place, a length or a theme (e.g. "Yala safari")
 *     longtail - a full question or a specific combination (e.g. "7 day Sri Lanka itinerary with kids")
 *
 *   priority 1 = use first, 2 = build next, 3 = optional/trust/geo.
 *
 * Expansion path to ~1000 (done mechanically, not by hand-padding): every destination gets the
 * matrix  [things to do | tour | itinerary | best time | hotels | travel guide | attractions | day trip]
 * and every duration gets  [5|7|10|14|21] day × [Sri Lanka tour | itinerary | trip], with the site's own
 * themes (private, luxury, wildlife, cultural, tea, beach, east coast, north) as modifiers. Those
 * combinations are genuine queries and are listed in outline in the MATRIX cluster below.
 */

export const KEYWORD_CLUSTERS = [
  {
    id: 'private',
    name: 'Private & tailor-made',
    priority: 1,
    keywords: [
      ['private tours sri lanka', 'head', 1],
      ['sri lanka private tour with driver', 'body', 1],
      ['private driver sri lanka', 'body', 1],
      ['tailor made sri lanka holidays', 'body', 1],
      ['sri lanka tailor made itinerary', 'longtail', 1],
      ['custom sri lanka tour', 'body', 1],
      ['bespoke sri lanka holidays', 'longtail', 1],
      ['sri lanka private tour packages', 'body', 1],
      ['personal driver sri lanka', 'longtail', 1],
      ['sri lanka chauffeured tour', 'longtail', 2],
      ['private guided tour sri lanka', 'body', 1],
    ],
  },
  {
    id: 'packages',
    name: 'Tour packages & itineraries',
    priority: 1,
    keywords: [
      ['sri lanka tour packages', 'head', 2],
      ['sri lanka itinerary', 'body', 1],
      ['sri lanka tour packages 7 days', 'body', 1],
      ['sri lanka tour plan', 'longtail', 2],
      ['sri lanka route planner', 'longtail', 2],
      ['sri lanka round trip', 'body', 2],
      ['sri lanka holiday packages', 'head', 2],
      ['sri lanka vacation packages', 'body', 2],
      ['best sri lanka itinerary', 'body', 2],
    ],
  },
  {
    id: 'duration',
    name: 'Trip length',
    priority: 1,
    keywords: [
      ['3 day sri lanka tour', 'body', 2],
      ['5 day sri lanka tour', 'body', 1],
      ['7 day sri lanka itinerary', 'body', 1],
      ['one week in sri lanka', 'body', 1],
      ['10 day sri lanka itinerary', 'body', 1],
      ['2 weeks in sri lanka', 'body', 1],
      ['14 day sri lanka itinerary', 'body', 1],
      ['sri lanka itinerary 2 weeks', 'longtail', 1],
      ['21 day sri lanka itinerary', 'longtail', 2],
      ['sri lanka 3 week itinerary', 'longtail', 2],
    ],
  },
  {
    id: 'luxury',
    name: 'Luxury & comfort',
    priority: 1,
    keywords: [
      ['luxury sri lanka tour', 'body', 1],
      ['luxury holidays sri lanka', 'body', 1],
      ['sri lanka luxury itinerary', 'longtail', 1],
      ['5 star sri lanka tour', 'body', 2],
      ['sri lanka luxury safari', 'body', 2],
      ['luxury honeymoon sri lanka', 'body', 3],
    ],
  },
  {
    id: 'wildlife',
    name: 'Wildlife & safari',
    priority: 1,
    keywords: [
      ['sri lanka safari', 'head', 1],
      ['sri lanka wildlife tour', 'body', 1],
      ['yala safari', 'body', 1],
      ['yala leopard safari', 'body', 1],
      ['udawalawe safari', 'body', 1],
      ['wilpattu safari', 'body', 1],
      ['minneriya elephant gathering', 'body', 2],
      ['sri lanka elephant safari', 'body', 1],
      ['whale watching mirissa', 'body', 2],
      ['blue whale watching sri lanka', 'longtail', 2],
      ['sri lanka leopard safari', 'longtail', 1],
    ],
  },
  {
    id: 'cultural',
    name: 'Cultural triangle & heritage',
    priority: 1,
    keywords: [
      ['cultural triangle sri lanka', 'body', 1],
      ['sri lanka cultural tour', 'body', 1],
      ['sigiriya rock', 'head', 2],
      ['dambulla cave temple', 'body', 2],
      ['polonnaruwa ancient city', 'body', 2],
      ['anuradhapura sacred city', 'body', 2],
      ['temple of the tooth kandy', 'body', 2],
      ['sri lanka heritage tour', 'body', 1],
      ['sri lanka ancient cities', 'longtail', 2],
    ],
  },
  {
    id: 'hill',
    name: 'Hill country & tea',
    priority: 1,
    keywords: [
      ['sri lanka tea country tour', 'body', 1],
      ['nuwara eliya', 'head', 2],
      ['ella sri lanka', 'head', 2],
      ['kandy to ella train', 'body', 1],
      ['tea plantation tour sri lanka', 'body', 2],
      ['horton plains', 'body', 2],
      ["adam's peak", 'body', 2],
      ['sri lanka hill country itinerary', 'longtail', 1],
    ],
  },
  {
    id: 'beach',
    name: 'Beach & south coast',
    priority: 1,
    keywords: [
      ['sri lanka beach holiday', 'body', 1],
      ['mirissa beach', 'body', 2],
      ['galle fort', 'head', 2],
      ['unawatuna beach', 'body', 2],
      ['hikkaduwa beach', 'body', 2],
      ['tangalle beach', 'body', 2],
      ['sri lanka south coast tour', 'body', 1],
    ],
  },
  {
    id: 'eastnorth',
    name: 'East coast & the north',
    priority: 2,
    keywords: [
      ['trincomalee tour', 'body', 2],
      ['arugam bay surf', 'body', 2],
      ['jaffna tour', 'body', 2],
      ['nilaveli beach', 'body', 3],
      ['pigeon island snorkeling', 'longtail', 2],
      ['passikudah beach', 'body', 3],
      ['sri lanka east coast tour', 'body', 2],
      ['north sri lanka tour', 'body', 2],
    ],
  },
  {
    id: 'seasonal',
    name: 'Seasons & weather',
    priority: 2,
    keywords: [
      ['best time to visit sri lanka', 'head', 2],
      ['sri lanka weather by month', 'body', 2],
      ['sri lanka monsoon season', 'body', 2],
      ['when to go to sri lanka', 'longtail', 2],
      ['sri lanka rainy season', 'longtail', 2],
      ['best month for sri lanka', 'longtail', 2],
    ],
  },
  {
    id: 'things',
    name: 'Things to do (destination pages)',
    priority: 2,
    keywords: [
      ['things to do in kandy', 'body', 2],
      ['things to do in ella', 'body', 2],
      ['things to do in galle', 'body', 2],
      ['things to do in sigiriya', 'body', 2],
      ['things to do in jaffna', 'body', 2],
      ['things to do in colombo', 'body', 2],
      ['things to do in negombo', 'body', 2],
      ['things to do in nuwara eliya', 'body', 2],
      ['things to do in trincomalee', 'body', 2],
      ['things to do in bentota', 'body', 3],
      ['things to do in anuradhapura', 'body', 2],
      ['things to do in polonnaruwa', 'body', 3],
    ],
  },
  {
    id: 'transport',
    name: 'Getting around',
    priority: 2,
    keywords: [
      ['kandy to ella train tickets', 'longtail', 2],
      ['sri lanka train travel', 'body', 2],
      ['colombo to sigiriya', 'longtail', 2],
      ['sri lanka airport transfer', 'body', 3],
      ['sri lanka visa', 'head', 3],
      ['sri lanka eta', 'body', 3],
    ],
  },
  {
    id: 'wellness',
    name: 'Food & wellness',
    priority: 2,
    keywords: [
      ['sri lanka food tour', 'body', 2],
      ['sri lankan rice and curry', 'body', 2],
      ['ayurveda sri lanka', 'body', 3],
      ['sri lanka cooking class', 'longtail', 2],
    ],
  },
  {
    id: 'cost',
    name: 'Budget & cost',
    priority: 2,
    keywords: [
      ['sri lanka tour cost', 'body', 2],
      ['how much does a sri lanka trip cost', 'longtail', 2],
      ['is sri lanka expensive', 'longtail', 2],
      ['sri lanka trip budget', 'longtail', 2],
    ],
  },
  {
    id: 'market',
    name: 'Source markets',
    priority: 3,
    keywords: [
      ['sri lanka holidays from uk', 'body', 3],
      ['sri lanka holidays from australia', 'body', 3],
      ['sri lanka tour from india', 'body', 3],
      ['sri lanka honeymoon packages', 'body', 3],
      ['family tour sri lanka', 'body', 3],
    ],
  },
  {
    id: 'trust',
    name: 'Trust & brand',
    priority: 3,
    keywords: [
      ['sri lanka tour operator', 'body', 2],
      ['sri lanka travel agency', 'body', 2],
      ['sltda registered tour operator', 'longtail', 3],
      ['sri lanka tour operator kurunegala', 'longtail', 3],
      ['prathibhalanka voyages', 'head', 3],
    ],
  },
  {
    id: 'faq',
    name: 'Planning questions (FAQ / journal)',
    priority: 2,
    keywords: [
      ['how many days do you need in sri lanka', 'longtail', 2],
      ['sri lanka first time visitor guide', 'longtail', 2],
      ['sigiriya vs pidurangala', 'longtail', 2],
      ['climbing sigiriya', 'longtail', 2],
      ['is sri lanka safe to travel', 'longtail', 2],
      ['sri lanka for solo travellers', 'longtail', 3],
    ],
  },
  {
    id: 'attractions',
    name: 'Named attractions',
    priority: 2,
    keywords: [
      ['nine arch bridge ella', 'body', 2],
      ['pidurangala rock', 'body', 2],
      ['yala national park', 'body', 1],
      ['udawalawe national park', 'body', 1],
      ['wilpattu national park', 'body', 2],
      ['minneriya national park', 'body', 2],
      ['pinnawala elephant orphanage', 'body', 3],
      ['galle dutch fort', 'body', 2],
      ['kandy botanical gardens', 'longtail', 2],
      ['pedro tea estate', 'longtail', 3],
      ['worlds end horton plains', 'longtail', 2],
      ['elle rock hike', 'longtail', 2],
      ['little adams peak', 'longtail', 2],
      ['mirissa whale watching season', 'longtail', 2],
      ['rekawa turtle watch', 'longtail', 3],
    ],
  },
  {
    id: 'matrix',
    name: 'Long-tail matrix (expansion to ~1000)',
    priority: 2,
    keywords: [
      // Destinations × modifiers. Every row expands to 8 real queries (things to do / tour /
      // itinerary / best time / hotels / travel guide / attractions / day trip), which is how the
      // list reaches ~1000 without padding: 12 destinations × 8 modifiers = 96, × duration and theme
      // combinations on top.
      ['kandy', 'matrix', 2],
      ['ella', 'matrix', 2],
      ['galle', 'matrix', 2],
      ['sigiriya', 'matrix', 2],
      ['jaffna', 'matrix', 2],
      ['trincomalee', 'matrix', 2],
      ['mirissa', 'matrix', 2],
      ['nuwara eliya', 'matrix', 2],
      ['anuradhapura', 'matrix', 2],
      ['polonnaruwa', 'matrix', 2],
      ['colombo', 'matrix', 2],
      ['yala national park', 'matrix', 1],
    ],
  },
];

/** Every keyword as a flat string, for a quick scan or for a keyword-planner import. */
export function flatKeywords() {
  return KEYWORD_CLUSTERS.flatMap((cluster) =>
    cluster.keywords.map(([phrase]) => phrase),
  );
}
