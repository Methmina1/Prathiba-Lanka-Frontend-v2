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
 * It is safe to re-run: packages are matched on title, journal posts on title, and gallery items
 * are skipped when the same media file is already in the gallery.
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

/** Journeys, promo copy and covers. The words match the sample content the site ships with. */
const PACKAGES = [
  {
    title: 'Classical Heritage',
    destination: 'Cultural Triangle',
    durationDays: 8,
    price: 1290,
    maxCapacity: 12,
    photo: 'seed-package-heritage.jpg',
    description:
      'Sigiriya at sunrise, the cave temples of Dambulla, the ancient city of Polonnaruwa and the lake at Kandy.',
    itinerary: [
      'Arrive in Colombo and transfer to Sigiriya; evening at leisure.',
      'Sigiriya rock at first light, then the Dambulla cave temples.',
      'Polonnaruwa by bicycle, with the afternoon free by the tank.',
      'Drive to Kandy via Matale; evening at the temple of the tooth.',
      'Kandy to Nuwara Eliya through the tea country.',
      'A slow day in the hills: factory walk and a planter bungalow.',
      'Return towards the coast, with the evening in Negombo.',
      'Transfer to the airport.',
    ].join('\n'),
  },
  {
    title: 'Wild Heart',
    destination: 'Yala & Minneriya',
    durationDays: 6,
    price: 1080,
    maxCapacity: 8,
    photo: 'seed-package-wildlife.jpg',
    description:
      'Dawn game drives for leopards and sloth bears, then the great elephant gathering on the Minneriya tank.',
    itinerary: [
      'Arrive and transfer to Tissamaharama.',
      'Yala before dawn; siesta, then an afternoon drive.',
      'Second morning in Yala, then on to Ella.',
      'The hill country: tea, waterfalls and the Nine Arch bridge.',
      'Drive north to Habarana for the Minneriya gathering.',
      'Minneriya at dusk, then transfer to the airport.',
    ].join('\n'),
  },
  {
    title: 'Mist & Tea',
    destination: 'Hill Country',
    durationDays: 5,
    price: 940,
    maxCapacity: 10,
    photo: 'seed-package-hillcountry.jpg',
    description:
      'The Kandy to Ella line, tea factory walks, Horton Plains at first light and cool nights in a planter bungalow.',
    itinerary: [
      'Kandy: the lake, the temple and the botanical gardens.',
      'The train to Ella, observation carriage, reserved seats.',
      'Horton Plains at first light, World\u2019s End before the mist.',
      'Tea factory and a walk through the estates around Ella.',
      'Ella to Colombo by road, with a stop at the St Clair falls.',
    ].join('\n'),
  },
  {
    title: 'Southern Serenity',
    destination: 'Galle & Mirissa',
    durationDays: 7,
    price: 1150,
    maxCapacity: 14,
    photo: 'seed-package-coast.jpg',
    description:
      'A Dutch fort, whale-watching off Mirissa, stilt fishermen at dusk and slow mornings on a quiet stretch of coast.',
    itinerary: [
      'Arrive and drive south to Bentota.',
      'Bentota river at dawn, then on to Galle.',
      'The fort on foot, with the afternoon on the ramparts.',
      'Galle to Mirissa; whale-watching booked for the morning.',
      'Whales at first light, the rest of the day on the beach.',
      'Free day: surf lesson, or a tuk-tuk to Weligama.',
      'Transfer to the airport.',
    ].join('\n'),
  },
]

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
]

/** Gallery captions stay empty: describe the photographs yourself in the console. */
const GALLERY = [
  'seed-gallery-01.jpg', 'seed-gallery-02.jpg', 'seed-gallery-03.jpg', 'seed-gallery-04.jpg',
  'seed-gallery-05.jpg', 'seed-gallery-06.jpg', 'seed-gallery-07.jpg', 'seed-gallery-08.jpg',
  'seed-gallery-09.jpg', 'seed-gallery-10.jpg', 'seed-gallery-11.jpg', 'seed-gallery-12.jpg',
  'seed-gallery-13.jpg', 'seed-gallery-14.jpg', 'seed-gallery-15.jpg', 'seed-gallery-16.jpg',
  'seed-gallery-17.jpg', 'seed-gallery-18.jpg',
]

/** Photos for the editable About/Contact pages, so those are staff-managed too. */
const PAGE_PHOTOS = {
  about: { hero: 'seed-journal-sigiriya.jpg', story: 'seed-package-hillcountry.jpg' },
  contact: { hero: 'seed-package-coast.jpg' },
}

if (process.argv[2]) {
  process.env.VITE_API_BASE_URL = process.argv[2]
}

const upload = async (token, fileName, title) => {
  const bytes = await readFile(join(photoDir, fileName))
  const file = new File([bytes], fileName, { type: 'image/jpeg' })
  return adminApi.uploadMedia(token, file, title)
}

const login = await api.login(ADMIN_EMAIL, ADMIN_PASSWORD)
const token = login.token
if (!token) throw new Error(`Could not sign in as ${ADMIN_EMAIL} - is the backend running?`)
console.log(`Seeding ${api.baseUrl} as ${ADMIN_EMAIL}\n`)

// ---------------------------------------------------------------- packages
const existingPackages = await adminApi.listPackages(token)
const packageIds = {}

for (const spec of PACKAGES) {
  const asset = await upload(token, spec.photo, `${spec.title} cover`)
  const payload = {
    title: spec.title,
    destination: spec.destination,
    durationDays: spec.durationDays,
    price: spec.price,
    maxCapacity: spec.maxCapacity,
    description: spec.description,
    itinerary: spec.itinerary,
    imageUrl: asset.url,
    status: 'ACTIVE',
  }

  const match = existingPackages.find((pkg) => pkg.title === spec.title)
  const saved = match
    ? await adminApi.updatePackage(token, match.packageId, payload)
    : await adminApi.createPackage(token, payload)

  packageIds[spec.title] = saved.packageId
  console.log(`  package  ${match ? 'updated' : 'created'}  ${saved.title} (${saved.packageId}) -> ${asset.url}`)
}

// ---------------------------------------------------------------- journal
const existingPosts = await adminApi.listJournal(token)

for (const spec of JOURNAL) {
  const asset = await upload(token, spec.photo, `${spec.title} cover`)
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

// One photograph per journey, linked, so the journey page has a "from the road" strip.
for (const [title, packageId] of Object.entries(packageIds)) {
  const asset = await upload(token, PACKAGES.find((p) => p.title === title).photo, `${title} on the road`)
  if (usedUrls.has(asset.url)) {
    console.log(`  gallery  skipped   ${title} (already present)`)
    continue
  }
  await adminApi.uploadImage(token, {
    imageUrl: asset.url,
    caption: null,
    packageId,
    mediaType: 'IMAGE',
  })
  usedUrls.add(asset.url)
  console.log(`  gallery  linked    ${title} (${packageId}) -> ${asset.url}`)
}

for (const photo of GALLERY) {
  const asset = await upload(token, photo, null)
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
    const asset = await upload(token, photo, `${section} ${field}`)
    payload[field].image = asset.url
  }

  await adminApi.saveContent(token, section, payload)
  console.log(`  content  updated   ${section} -> ${Object.values(photos).join(', ')}`)
}

console.log('\nDone. Everything above is now editable in the admin console.')
