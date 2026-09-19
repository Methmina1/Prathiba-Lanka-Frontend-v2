/**
 * Loads the demo content into a running backend, the same way a member of staff would: every file
 * is uploaded to the media library and every record is created through the admin API. Nothing is
 * written straight to the database, so the console can edit or delete all of it afterwards.
 *
 * Run it against a backend that is already up:
 *
 *     npm run seed                      # http://localhost:8080
 *     npm run seed -- http://host:8080  # another instance
 *
 * It seeds the journal, the gallery and the About/Contact photographs. The travel packages are NOT
 * seeded from here: the catalogue is the agency's real one, and it comes from the rate sheet -
 * `npm run extract:packages -- -Workbook <book.xlsx>` writes packages.json and
 * `npm run import:packages -- packages.json --prune` loads it (see README).
 *
 * It is safe to re-run: journal posts are matched on title, and gallery items are skipped when the
 * same media file is already in the gallery.
 */
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { api } from '../src/api/client.js'
import { adminApi } from '../src/api/admin.js'

const here = dirname(fileURLToPath(import.meta.url))
const photoDir = join(here, '..', 'public', 'images', 'sl')

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? 'admin@test.com'
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? 'Admin@12345'

const JOURNAL = [
  {
    title: 'When to visit Sri Lanka: a season-by-season guide',
    description:
      'Two monsoons, two coasts and a hill country that behaves like a third climate. Here is how to pick your window.',
    photo: 'seed-journal-season.jpg',
    content: [
      'Sri Lanka is small enough to cross in a day, which is exactly why the weather is confusing: the island has two monsoons, and they arrive on opposite coasts.',
      'The south-west monsoon runs roughly from May to September, which is when the west and south coasts see their rain and the east coast dries out. The north-east monsoon runs from October to January, and swaps the two around.',
      'In practice that means the island is always open somewhere. December to March suits the south and the hill country; May to September suits Trincomalee, Passikudah and the east. The Cultural Triangle sits in the dry zone and is workable for most of the year, with April and the inter-monsoon weeks being the hottest and stickiest.',
      'If you are planning around a single place, ask us before you book flights. Moving the trip by two weeks is often enough to leave the rain behind.',
    ].join('\n\n'),
  },
  {
    title: 'Climbing Sigiriya without the crowds',
    description: 'The rock opens at 6.30am. Go then, and you will have the mirror wall almost to yourself.',
    photo: 'seed-journal-sigiriya.jpg',
    content: [
      'Sigiriya takes about two hours at an unhurried pace: the water gardens, the boulder gardens, the mirror wall, the lion\u2019s paw and then the final staircase to the summit.',
      'The difference between a good visit and a forgettable one is almost entirely timing. The gates open at 6.30am, and the coaches arrive from about 9am. Being there for the first half hour means cooler air, softer light on the frescoes and no queue on the metal stairs.',
      'Bring water, wear something you can climb stairs in, and be careful with the wasps on the upper terraces - they are attracted to sweat and to sweet drinks, so keep the bottles closed.',
      'We usually pair the climb with Pidurangala, the neighbouring hill, on a different morning: the view back onto Sigiriya is the better photograph, and it is a quieter walk.',
    ].join('\n\n'),
  },
  {
    title: 'A short history of Ceylon tea',
    description: 'How a coffee blight in the 1870s turned a hillside of failed coffee into the world\u2019s finest tea.',
    photo: 'seed-journal-tea.jpg',
    content: [
      'The hill country around Kandy and Nuwara Eliya was planted with coffee first. When a leaf blight wiped out the coffee estates in the 1870s, the planters needed something else that would grow at altitude - and tea, already trialled in the botanical gardens at Peradeniya, was the answer.',
      'Within twenty years the hillsides had been replanted, factories had gone up beside the estates to wither, roll, ferment and fire the leaf, and Ceylon tea had become the island\u2019s export.',
      'The factories still work the same way, which is why a visit is worth the detour: you can follow the whole process, from the weighing scale at the top of the building down to the sorting room at the bottom, and taste the difference between a high-grown and a low-grown leaf.',
      'Buy from the factory shop rather than the airport. It is cheaper, it is fresher, and the money stays on the estate.',
    ].join('\n\n'),
  },
  {
    title: 'What happens between your first email and your first morning',
    description:
      'A booking is a request, not a checkout. Here is the handful of steps between sending it and standing in a vehicle at dawn.',
    photo: 'seed-journal-planning.jpg',
    content: [
      'Every journey starts as an enquiry, and every enquiry is read by a person. You tell us roughly when you are coming, how long you have, and the two or three things you would not want to miss; we reply with a first outline and a price, usually inside a working day.',
      'That outline is a draft, and it is meant to be pulled apart. Too much driving, not enough beach, a night in a place you have heard about - all of that is easier to change on paper than on the road, so we would rather go around twice now.',
      'Once the shape is right we hold the rooms and the vehicle, which is when the price becomes final. Nothing is charged through this site: the booking form creates a request with a PIN, and a consultant confirms it with the date and the agreed price. You can follow that status yourself with the PIN, no account needed.',
      'Then come the unglamorous parts that decide how the trip actually feels. Which side of the train to sit on for the hill country. Whether the safari is better on the first morning or the last. Where to stop between two long drives so the day does not become a transfer. We write all of it into the itinerary you travel with.',
      'On the morning itself you meet your guide, and from then on the plan is ours to adjust. The island has its own ideas about weather and timing, and a good guide will move the day around it rather than stick to a spreadsheet.',
      'If you would rather talk it through first, the enquiry form on the contact page is the fastest way in. There is no obligation on it, and no automatic booking.',
    ].join('\n\n'),
  },

  // The four home-page themes, each covered by the same photograph as its hero slide.
  {
    title: 'The turquoise coast: where to swim, and when',
    description:
      'Sri Lanka has two coasts and they take turns. How the seasons work, and which bays we send people to.',
    photo: 'hero-1.jpg',
    content: [
      'Sri Lanka has two coasts that take turns. From November to April the south and west are calm and clear - Mirissa, Unawatuna, Weligama, Bentota. From May to September the south-west monsoon moves in and the east dries out, so Trincomalee, Nilaveli and Passikudah become the places to swim.',
      'The south coast is the easier introduction: a string of bays an hour or two apart, with reef close enough to snorkel from the sand at Unawatuna and Hikkaduwa, and surf breaks at Weligama that suit a first lesson.',
      'Mirissa is the busiest of them, and the reason is the whales: blue whales and sperm whales pass close to the continental shelf from November to April, and a dawn boat from the harbour is a two-hour round trip. We book the smaller boats with a spotter on the roof rather than the largest hull in the bay.',
      'The east is a different mood entirely. Trincomalee has one of the finest natural deep-water harbours in the world, and Nilaveli beach is wide enough that you can walk twenty minutes and pass three people. Pigeon Island, a short boat ride offshore, has reef and blacktip reef sharks in water you can see the bottom of.',
      'The sea is warm all year, around 27 to 29 degrees, but the sun is not forgiving. Swim early, swim late, and give the middle of the day to lunch and a book. Most of our travellers end up swimming twice a day rather than once.',
      'If you only have a week, stay on one coast and go deep rather than trying to see both. The distances look small on a map and are much longer on the road.',
    ].join('\n\n'),
  },
  {
    title: 'What you will actually see on a Sri Lankan safari',
    description:
      'Leopards are the headline, but the island\u2019s wildlife is wider than one cat. What a good week of game drives looks like.',
    photo: 'hero-2.webp',
    content: [
      'Yala is the park everyone has heard of, and it earns that: one of the highest leopard densities anywhere in the world, along with sloth bears, crocodiles and a great deal else. It is also the busiest, which is why we go in when the gate opens at 5.30am and are usually back out before the convoys arrive.',
      'Wilpattu, in the north-west, is the opposite. It is the largest park in the country, it has few visitors, and its landscape - shallow sand-rimmed lakes called villus - is beautiful in a quiet way. Leopards live here too, and you may have a sighting entirely to yourself.',
      'The elephant gathering at Minneriya, roughly July to October, is the largest seasonal gathering of Asian elephants anywhere: herds moving onto the drying tank bed, sometimes several hundred animals in view at once. It is not a zoo and it is not guaranteed, but when it happens it is the most extraordinary thing on the island.',
      'Udawalawe is where the elephants are almost certain - a reservoir park with a resident population, and a good choice for families or a short trip. The transit home next door rehabilitates orphaned calves.',
      'What we ask of you: no elephant rides, no baiting, no driving off the track to get closer, and no crowding an animal that is trying to cross. A good guide turns the engine off and waits, which is usually when the best sighting happens anyway.',
      'Bring binoculars, neutral colours, a hat and patience. The drives are long, the mornings are cold, the afternoons are hot, and the good sightings are rarely on a schedule.',
    ].join('\n\n'),
  },
  {
    title: 'Reading the past: the Cultural Triangle and Kandy',
    description:
      'Rock fortresses, cave temples and a sacred city - and how to see them without walking past what matters.',
    photo: 'hero-3.jpg',
    content: [
      'The Cultural Triangle is the dry-zone heart of the old kingdoms: Anuradhapura, Polonnaruwa and Sigiriya, with the cave temples of Dambulla just south of it. These are not ruins in the European sense; they are living religious sites, and each takes a day to absorb.',
      'Sigiriya is the one everybody photographs: a granite outcrop around 200 metres high with a royal citadel on top, water gardens at the base and frescoes in a sheltered pocket halfway up. Go when the gate opens at 6.30am - by nine the coaches arrive and the metal stairs become a queue.',
      'Polonnaruwa is flatter and greener, a medieval capital you can cover by bicycle, with the Gal Vihara\u2019s four great Buddha figures carved directly into a granite face. It is the site people underrate most and talk about longest afterwards.',
      'Anuradhapura is older and larger, with the great stupas and the sacred Bo tree, grown from a cutting of the tree under which the Buddha is said to have attained enlightenment. It is a pilgrimage site first and a monument second: dress accordingly, and expect to take your shoes off more often than you planned.',
      'Dambulla\u2019s caves hold something like 150 statues and painted ceilings repainted by successive kingdoms, which is why the colour is still alive. Kandy, up in the hills, holds the Temple of the Sacred Tooth Relic, with drumming at the evening puja and a lake you can walk around in half an hour.',
      'Two things separate seeing these places from understanding them: a guide who can read the carvings and the chronicles, and going early. We build a slow afternoon in after each ancient city, because the heat is real and the detail is dense.',
    ].join('\n\n'),
  },
  {
    title: 'Chasing the golden hour on the west coast',
    description: 'The sun sets over the sea for half the year. Where to be standing when it does.',
    photo: 'hero-4.jpg',
    content: [
      'Because the island sits just north of the equator, the sun goes down quickly and at roughly the same time all year: somewhere between 5.50pm and 6.30pm. There is no long northern twilight here. It is bright, then it is gold, then it is dark.',
      'From November to April the west and south-west coasts face the sunset directly, which makes Galle Face in Colombo, Mount Lavinia, Bentota, Hikkaduwa and Mirissa the obvious places to be. Negombo, twenty minutes from the airport, is where a lot of travellers watch their first one.',
      'The light is best in the half hour before the sun reaches the water, and again for ten minutes after it has gone - which is usually when the sky does the thing you actually came for. Stay for that part.',
      'Fishing is the other half of the picture. Stilt fishermen still work the shallows around Koggala at dusk, and the Negombo lagoon fills with outrigger canoes coming home. Ask before photographing anyone working; a smile and a question about the catch usually settles it.',
      'If you are in the hill country or on the east coast you are not missing out - you get the sunrise instead. The view from a tea estate at first light, mist sitting in the valleys below, is the morning equivalent, and there are far fewer people around to share it with.',
      'Our advice is simple: do not plan anything for the last hour of daylight. Put yourself somewhere with a western horizon, order something cold, and let the day finish itself.',
    ].join('\n\n'),
  },
]

/** Gallery captions stay empty: describe the photographs yourself in the console. */
const GALLERY = [
  'seed-gallery-01.jpg', 'seed-gallery-02.jpg', 'seed-gallery-03.jpg', 'seed-gallery-04.jpg',
  'seed-gallery-05.jpg', 'seed-gallery-06.jpg', 'seed-gallery-07.jpg', 'seed-gallery-08.jpg',
  'seed-gallery-09.jpg', 'seed-gallery-10.jpg', 'seed-gallery-11.jpg', 'seed-gallery-12.jpg',
  'seed-gallery-13.jpg', 'seed-gallery-14.jpg', 'seed-gallery-15.jpg', 'seed-gallery-16.jpg',
  'seed-gallery-17.jpg', 'seed-gallery-18.jpg',

  // The four photographs the sample journeys used to be covered by. They are unlinked now that the
  // catalogue is the agency's own, and two of them also fill the About and Contact frames.
  'seed-package-heritage.jpg', 'seed-package-wildlife.jpg',
  'seed-package-hillcountry.jpg', 'seed-package-coast.jpg',
]

/** Photos for the editable About/Contact pages, so those are staff-managed too. */
const PAGE_PHOTOS = {
  about: { hero: 'seed-journal-sigiriya.jpg', story: 'seed-package-hillcountry.jpg' },
  contact: { hero: 'seed-package-coast.jpg' },
}

if (process.argv[2]) {
  process.env.VITE_API_BASE_URL = process.argv[2]
}

const login = await api.login(ADMIN_EMAIL, ADMIN_PASSWORD)
const token = login.token
if (!token) throw new Error(`Could not sign in as ${ADMIN_EMAIL} - is the backend running?`)
console.log(`Seeding ${api.baseUrl} as ${ADMIN_EMAIL}\n`)

/**
 * Uploads a file unless the media library already holds one with that name. Reusing the existing
 * asset is what makes a second run update the content instead of uploading everything again and
 * duplicating every gallery item.
 */
const CONTENT_TYPES = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.avif': 'image/avif',
}

const existingMedia = await adminApi.listMedia(token)
const upload = async (fileName, title) => {
  const already = existingMedia.find((asset) => asset.originalName === fileName)
  if (already) return already

  const extension = fileName.slice(fileName.lastIndexOf('.')).toLowerCase()
  const type = CONTENT_TYPES[extension]
  if (!type) throw new Error(`No content type known for ${fileName}`)

  const bytes = await readFile(join(photoDir, fileName))
  const asset = await adminApi.uploadMedia(token, new File([bytes], fileName, { type }), title)
  existingMedia.push(asset)
  return asset
}

// ---------------------------------------------------------------- journal
const existingPosts = await adminApi.listJournal(token)

for (const spec of JOURNAL) {
  const asset = await upload(spec.photo, `${spec.title} cover`)
  const payload = {
    title: spec.title,
    description: spec.description,
    content: spec.content,
    coverImageUrl: asset.url,
    status: 'PUBLISHED',
  }

  const match = existingPosts.find((post) => post.title === spec.title)
  const saved = match
    ? await adminApi.updatePost(token, match.journalId, payload)
    : await adminApi.createPost(token, payload)

  console.log(`  journal  ${match ? 'updated' : 'created'}  ${saved.title} (${saved.journalId}) -> ${asset.url}`)
}

// ---------------------------------------------------------------- gallery
const existingGallery = await api.getGallery()
const usedUrls = new Set(existingGallery.map((item) => item.imageUrl))

for (const photo of GALLERY) {
  const asset = await upload(photo, null)
  if (usedUrls.has(asset.url)) {
    console.log(`  gallery  skipped   ${photo} (already present)`)
    continue
  }
  await adminApi.uploadImage(token, { imageUrl: asset.url, caption: null, packageId: null, mediaType: 'IMAGE' })
  usedUrls.add(asset.url)
  console.log(`  gallery  created   ${photo} -> ${asset.url}`)
}

// ---------------------------------------------------------------- about / contact
for (const [section, photos] of Object.entries(PAGE_PHOTOS)) {
  const current = await api.getPageContent(section)
  const payload = structuredClone(current.payload)

  for (const [field, photo] of Object.entries(photos)) {
    const asset = await upload(photo, `${section} ${field}`)
    payload[field].image = asset.url
  }

  await adminApi.saveContent(token, section, payload)
  console.log(`  content  updated   ${section} -> ${Object.values(photos).join(', ')}`)
}

console.log('\nDone. Everything above is now editable in the admin console.')
