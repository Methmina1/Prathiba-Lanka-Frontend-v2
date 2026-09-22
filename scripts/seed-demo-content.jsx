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

const ADMIN_EMAIL =
  process.env.PRATHIBALANKA_ADMIN_EMAIL ?? process.env.SEED_ADMIN_EMAIL ?? process.env.BOOTSTRAP_ADMIN_EMAIL ?? 'prathibhalankavoyages@gmail.com'
const ADMIN_PASSWORD =
  process.env.PRATHIBALANKA_ADMIN_PASSWORD ?? process.env.SEED_ADMIN_PASSWORD ?? process.env.BOOTSTRAP_ADMIN_PASSWORD ?? ''

if (!ADMIN_PASSWORD) {
  console.error(
    'No admin password.\n' +
      'Set BOOTSTRAP_ADMIN_PASSWORD (the variable the backend creates the admin account from),\n' +
      'or SEED_ADMIN_PASSWORD, and run again.',
  )
  process.exit(1)
}

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

  // One note per province, so the map on this page always has something to show for whichever
  // province a reader picks. Each one names the province and the places in it, which is what the map
  // matches on (see src/data/provinceJournals.js) - so a note keeps working after it is edited in
  // the console, as long as the places stay in the text.
  {
    title: 'The north: Jaffna, and the road that only opened recently',
    description:
      'Palm-lined, Tamil-speaking and thirty years off most itineraries. The far north rewards the extra drive.',
    photo: 'seed-gallery-16.jpg',
    content: [
      'For most of the last forty years the north was closed, and the island is still catching up with it. What that leaves a traveller is a region with excellent roads, very few other visitors and a culture that is visibly its own: Hindu kovils with their gopurams painted in primary colours, a library that was a symbol of the place before the war, and Tamil spoken everywhere.',
      'Jaffna is the centre of it. Walk the old Dutch fort, eat a crab curry that will recalibrate your idea of heat, and take a boat out to Nagadeepa or Delft, an island of wild ponies and coral walls that feels a century away from Colombo.',
      'Come between May and September, when the peninsula is dry and the rest of the island is not. Carry cash: card machines are fewer here, and the distance from the nearest alternative makes the north a place to plan rather than to improvise.',
    ].join('\n\n'),
  },
  {
    title: 'Anuradhapura and Polonnaruwa: two capitals, three hours apart',
    description: 'The island\u2019s first cities, and the easiest place to understand how old Sri Lanka actually is.',
    photo: 'seed-gallery-09.jpg',
    content: [
      'Anuradhapura was a capital for a thousand years, and its scale still surprises people. The stupas are the size of cathedrals and older than most of Europe\u2019s. The sacred Bo tree here was grown from a cutting of the one under which the Buddha is said to have found enlightenment, which makes it the oldest documented tree in the world.',
      'Polonnaruwa, three hours east, is the later capital and the easier one to read: a compact medieval city you can cover by bicycle in a morning, with the four great Buddha figures of the Gal Vihara carved straight into a granite face. It is the site people underrate beforehand and talk about longest afterwards.',
      'This is the dry zone, so it is hot - start early, carry water, and be barefoot-ready for the temples. The season that suits it best is May to September, when the west coast is wet and this part of the island is at its clearest.',
    ].join('\n\n'),
  },
  {
    title: 'Wilpattu and the North Western coast',
    description: 'The island\u2019s largest national park, quieter than Yala and full of lakes.',
    photo: 'seed-package-wildlife.jpg',
    content: [
      'Wilpattu is the oldest and largest of Sri Lanka\u2019s national parks, and it works differently to Yala. Instead of a dry scrubland of jeeps and dust, it is a country of villus - shallow, rain-fed lakes in the forest - which means fewer vehicles, longer drives, and a real chance of having a leopard sighting entirely to yourself.',
      'The park is the reason to come, but the coast below it is not to be missed: Kalpitiya is a long sand spit with kitesurfing on one side and dolphins offshore, and Chilaw and Puttalam are the heart of the island\u2019s prawn and coconut country. The fishing towns here are working towns rather than resorts, which is the point.',
      'Slots in Wilpattu are limited and the park closes for part of the year, so this is one to plan rather than turn up for. Half board at a tented camp inside the buffer zone, two dawn drives and a slow afternoon is the shape that works.',
    ].join('\n\n'),
  },
  {
    title: 'Colombo, Negombo and the west coast',
    description: 'Where most journeys begin: the capital, the airport coast, and the first evening.',
    photo: 'seed-gallery-01.jpg',
    content: [
      'Almost everybody lands at Katunayake, and the thirty minutes between the airport and Negombo is the softest introduction to the country you will get. Negombo is a working fishing town: the lagoon fills with sails at dusk, the fish market runs on its own clock, and the beach is a place to walk rather than to swim.',
      'Colombo itself is worth a day if you have one. The Gangaramaya and Seema Malaka temples, the old quarter of Pettah with its market streets sorted by trade, the National Museum for the history you are about to drive through, and Galle Face Green at sunset with the whole city out walking.',
      'The west coast is the winter coast: from November to April the sea is calm, the sun sets over the water, and Bentota, Hikkaduwa and Kalutara make easy first or last stops. It is also the most built-up stretch of the island, so treat it as a gateway rather than the destination.',
    ].join('\n\n'),
  },
  {
    title: 'Kandy, the highlands and the road to Sigiriya',
    description: 'The hill capital, the cave temples and the rock fortress: the middle of the island, and its most photographed.',
    photo: 'seed-journal-sigiriya.jpg',
    content: [
      'Kandy is the last royal capital, and it still behaves like one: the lake in the middle of the city, the Temple of the Tooth holding the island\u2019s most sacred relic, and drumming you can hear from the streets at dusk. Time a visit for the evening puja and the whole place makes sense.',
      'North of it, in Matale district, is the triangle everybody comes for. Sigiriya is the one to climb at dawn, before the coaches arrive and while the rock is still cool. Dambulla\u2019s cave temples are the quieter masterpiece: five caves, painted ceiling to floor, and a Buddha in every posture.',
      'Then climb into the tea country. Nuwara Eliya sits at nearly two thousand metres, which is why it has a racecourse, a golf course and a climate that requires a jacket. The train from Kandy to Ella is one of the great railway journeys anywhere, and it costs about a pound.',
    ].join('\n\n'),
  },
  {
    title: 'Trincomalee, Batticaloa and the east coast',
    description: 'The other monsoon, the other coast, and the best swimming from May to September.',
    photo: 'seed-package-coast.jpg',
    content: [
      'The east coast runs on the opposite calendar to the south-west, which is the single most useful thing to know about Sri Lanka\u2019s weather. From May to September, when it rains on the west coast, Trincomalee, Nilaveli, Passikudah and Arugam Bay are dry, calm and warm.',
      'Trincomalee is a natural deep-water harbour with a Hindu temple on the headland above it, and Pigeon Island a short boat ride away is the best snorkelling on the island: reef sharks, turtles and coral in water you can stand up in. Batticaloa is quieter still, with a lagoon, a singing fish legend and a Dutch fort.',
      'Arugam Bay is the surf town - a right-hand point break that draws people for the whole season, and a crescent of guesthouses, cafes and fishing boats behind it. Book ahead for June to August, when everyone who knows arrives at once.',
    ].join('\n\n'),
  },
  {
    title: 'Ella, Bandarawela and the Uva hills',
    description: 'The prettiest train ride on the island, and the walking that follows it.',
    photo: 'seed-package-hillcountry.jpg',
    content: [
      'Ella is a village in a gap in the mountains, and the view from it is why people stay longer than they planned. The Nine Arches Bridge, Little Adam\u2019s Peak and Ella Rock are the three walks everybody does; the first is a twenty-minute stroll, the last is a half-day and worth the early start.',
      'Uva is tea country with fewer visitors than the estates around Nuwara Eliya. A factory tour here is still a working tour rather than a show, and the high-grown leaf from these hills goes into some of the best tea the island makes.',
      'The train from Kandy or Nuwara Eliya to Ella is the reason to come this way at all: three hours of tea slopes, tunnels and viaducts, with the doors open and people hanging out of them. Second class reserved is the sweet spot - first class has sealed windows.',
    ].join('\n\n'),
  },
  {
    title: 'Adam\u2019s Peak, Sinharaja and the gem country',
    description: 'A pilgrimage at two in the morning, and the last of the island\u2019s rainforest.',
    photo: 'seed-gallery-05.jpg',
    content: [
      'Adam\u2019s Peak - Sri Pada, the sacred footprint - is climbed at night. You start around two in the morning so that you reach the summit for sunrise, and the path is lit, stepped and lined with tea stalls and pilgrims of three faiths who come for the same view from different directions. It is a genuinely hard climb and an unforgettable one.',
      'The season for it is December to May; outside that the summit is lost in cloud and often closed. Ratnapura, the town below, is the island\u2019s gem capital - sapphires, rubies and the famous star stones - and a place to buy from a licensed dealer rather than a roadside stall.',
      'Sinharaja, to the south-west, is the island\u2019s last great tract of primary rainforest and a UNESCO site. It is not a safari: you walk in with a guide, quietly, and look for mixed-species flocks, endemic birds, and the occasional green pit viper asleep in a branch. Leeches are part of the deal. Long trousers are not optional.',
    ].join('\n\n'),
  },
  {
    title: 'Galle, Mirissa and the south coast',
    description: 'The fort, the whales, and the beaches everybody pictures when they picture Sri Lanka.',
    photo: 'cover-galle-fort.jpg',
    content: [
      'Galle Fort is the best-preserved colonial sea fort in Asia: Dutch walls, streets of villas and shops inside them, and a lighthouse at the point. Stay inside the walls for a night if you can - the fort is at its best before the day-trippers arrive and after they leave.',
      'West of it, the coast turns into the beaches people come for. Unawatuna for swimming, Mirissa for the bay and the whale watching, Tangalle and Hiriketiya further east for something quieter. The stilt fishermen of Koggala are a few minutes along the road.',
      'Blue whales pass Mirissa between November and April, and the boats leave before dawn. Take the trip with a licensed operator that keeps its distance, and treat a sighting as a gift rather than a booking. The rest of the year the south coast is for hammocks, rice and curry, and the long slow end of a trip.',
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
