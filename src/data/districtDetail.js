/**
 * What the agency's district document says about each of Sri Lanka's 25 districts.
 *
 * GENERATED FILE - do not edit by hand. Run:
 *
 *   node scripts/build-district-detail.mjs
 *
 * The source is data/Sri_Lanka_25_Districts.docx, the document as supplied, kept in the repository so
 * the build is reproducible. Each district carries the facts the document states outright (area,
 * population) and the opening sentences of its five sections, cut at a sentence boundary - see LIMITS
 * in the generator for how much of each. Nothing here is paraphrased: it is the document's own words,
 * shortened, so a claim on the panel can always be traced back to a page.
 *
 * Districts are grouped by the province that administers them (src/data/provinces.js), which is what
 * the map panel shows: point at a province and its districts explain it.
 */

export const DISTRICT_DETAIL = [
  {
    name: "Colombo",
    province: "western",
    areaKm2: 699,
    population: "2.3 million",
    populationMillions: 2.3,
    sections: {
      geography: "Colombo District is the smallest yet most densely populated district in Sri Lanka, covering an area of approximately 699 square kilometres along the southwestern coast of the island. It lies at sea level on the coastal plain, bordered by the Indian Ocean to the west, Gampaha District to the north, Kalutara District to the south, and Kegalle District to the east.",
      history: "Colombo's history spans over two millennia, but it rose to international prominence as a major trading port during the medieval period. Arab traders settled here as early as the 8th century, calling it \"Kalanbu.\" Portuguese explorers arrived in 1505 and recognised the harbour's strategic value, constructing a fort and establishing dominance over the cinnamon trade.",
      economy: "Colombo is the economic powerhouse of Sri Lanka, contributing a disproportionate share of the nation's GDP. The district hosts the Colombo Port, one of the busiest transshipment hubs in South Asia, handling millions of containers annually and serving as a gateway for regional trade.",
      tourism: "Colombo is a vibrant destination combining colonial heritage, modern lifestyle, and cultural depth. The Gangaramaya Temple, one of the most important Buddhist temples in the city, blends Sri Lankan, Thai, Indian, and Chinese architectural styles and houses an impressive collection of artefacts. The National Museum of Sri Lanka in Cinnamon Gardens preserves thousands of royal regalia, paintings, and archaeological finds.",
      culture: "Colombo District is home to approximately 2.3 million people, making it the most populous district in Sri Lanka. It is the most ethnically diverse district on the island, with Sinhalese forming the majority, followed by Sri Lankan Tamils, Sri Lankan Moors, Burghers, and Malays.",
    },
  },
  {
    name: "Gampaha",
    province: "western",
    areaKm2: 1387,
    population: "2.3 million",
    populationMillions: 2.3,
    sections: {
      geography: "Gampaha District occupies an area of approximately 1,387 square kilometres in the Western Province of Sri Lanka, lying immediately north of Colombo. It is bordered by the Kelani River to the south, the Maha Oya river to the north, the Indian Ocean to the west, and the Kegalle and Kurunegala districts to the east.",
      history: "Gampaha has deep historical roots tied to ancient Sri Lankan kingdoms. The region formed part of the Kotte Kingdom and later came under Kandyan influence.",
      economy: "Gampaha is one of Sri Lanka's most economically active districts outside Colombo. The Bandaranaike International Airport, located in Katunayake within the district, is the country's only international airport and a critical artery for tourism, exports, and remittances.",
      tourism: "The district offers a range of attractions from beach tourism to religious heritage. Negombo Beach is a popular destination for both local and foreign visitors, known for its golden sands and seafood restaurants. St. Mary's Church in Negombo, an imposing Catholic cathedral, stands as a testament to the district's Portuguese colonial legacy.",
      culture: "Gampaha District has a population of over 2.3 million people, making it the second most populous district in Sri Lanka. The majority of the population is Sinhalese, with Tamil and Muslim minority communities.",
    },
  },
  {
    name: "Kalutara",
    province: "western",
    areaKm2: 1598,
    population: "1.2 million",
    populationMillions: 1.2,
    sections: {
      geography: "Kalutara District lies in the southern part of the Western Province, covering approximately 1,598 square kilometres. It stretches along the southwestern coast of Sri Lanka, bordered by the Indian Ocean to the west, Colombo District to the north, Ratnapura District to the east, and Galle District to the south.",
      history: "Kalutara has been inhabited since prehistoric times and served as an important trading port during the era of ancient Sri Lankan kingdoms. Arab and Chinese traders frequented its shores, drawn by its proximity to the maritime spice routes.",
      economy: "Kalutara's economy is diverse, drawing from agriculture, fisheries, and small-scale industry. Rubber cultivation is among the most important agricultural activities, with vast rubber estates covering much of the inland areas.",
      tourism: "Kalutara is best known for its scenic beaches and the impressive Kalutara Bodhiya, a sacred Buddhist temple built above a hollow dagoba — unique in Sri Lanka — situated dramatically at the mouth of the Kalu River. Bentota, located at the southern tip of the district, is one of Sri Lanka's premier beach resort destinations, famous for water sports including jet skiing, windsurfing, and river safaris.",
      culture: "Kalutara District has a population of approximately 1.2 million people. The Sinhalese community constitutes the majority, with a significant Muslim population particularly in the Beruwala and Aluthgama areas, reflecting centuries of Arab trading influence.",
    },
  },
  {
    name: "Kandy",
    province: "central",
    areaKm2: 1940,
    population: "1.4 million",
    populationMillions: 1.4,
    sections: {
      geography: "Kandy District is situated in the central highlands of Sri Lanka, covering an area of approximately 1,940 square kilometres. It is one of the most scenic districts in the country, characterised by mountain ranges, valleys, rivers, and lush tea-covered hillsides.",
      history: "Kandy holds an unparalleled place in Sri Lankan history as the last capital of the Sinhala kingdom. Founded in the 14th century by King Wickramabahu III, it withstood centuries of Portuguese and Dutch colonial pressure before finally falling to the British in 1815, marking the end of Sri Lankan sovereignty for over 130 years.",
      economy: "Kandy's economy is anchored by tea cultivation, tourism, and trade. The surrounding hills are blanketed with tea estates, many dating back to the British colonial era, producing both high-grown and mid-country teas sold worldwide.",
      tourism: "Kandy is Sri Lanka's most visited inland destination. The Temple of the Tooth Relic is the single most sacred Buddhist site in the country, drawing pilgrims and tourists in their millions. The annual Kandy Esala Perahera, a grand procession of decorated elephants, traditional dancers, drummers, and fire performers held over ten days in July-August, is one of the grandest festivals in Asia and a UNESCO-recognised cultural event.",
      culture: "Kandy District has a population of approximately 1.4 million. Sinhalese make up the overwhelming majority, with Tamil, Muslim, and Burgher minorities.",
    },
  },
  {
    name: "Matale",
    province: "central",
    areaKm2: 1993,
    population: "490,000",
    populationMillions: 0.49,
    sections: {
      geography: "Matale District is located in the Central Province of Sri Lanka, covering an area of approximately 1,993 square kilometres. It is bounded by Kandy District to the south and west, Kurunegala District to the northwest, Anuradhapura District to the north, Polonnaruwa District to the northeast, and Badulla District to the east.",
      history: "Matale has been an important centre of Sri Lankan civilisation since antiquity. The Aluvihara Rock Cave Temple, located about 30 kilometres north of Kandy, is one of the most sacred and historically significant temples in the country.",
      economy: "Matale's economy is deeply rooted in agriculture. The district is one of the most significant spice-producing regions in Sri Lanka and indeed the world.",
      tourism: "Matale offers a rich mix of natural beauty, ancient history, and cultural charm. The Aluvihara Rock Cave Temple is the foremost attraction, with its vivid murals depicting scenes from Buddhist mythology and its remarkable historical significance. The Nalanda Gedige, a unique 8th-century stone temple blending Buddhist and Hindu architectural elements, is one of the finest examples of ancient syncretism in Sri Lanka.",
      culture: "Matale District has a population of approximately 490,000 people. The Sinhalese form the majority, with Tamil and Muslim minorities.",
    },
  },
  {
    name: "Nuwara Eliya",
    province: "central",
    areaKm2: 1741,
    population: "760,000",
    populationMillions: 0.76,
    sections: {
      geography: "Nuwara Eliya District is situated in the highest elevations of the Central Highlands, covering approximately 1,741 square kilometres. It is flanked by Kandy and Matale districts to the north, Badulla District to the east, Ratnapura District to the south, and Kegalle District to the west.",
      history: "Nuwara Eliya's modern history began with British colonisation in the early 19th century. Sir Edward Barnes, a British Governor, is credited with establishing Nuwara Eliya as a hill station and retreat for colonial officers.",
      economy: "Tea is the lifeblood of Nuwara Eliya's economy. The district produces some of the world's finest high-grown teas, prized for their delicate flavour and golden colour.",
      tourism: "Nuwara Eliya is one of Sri Lanka's most beloved tourist destinations, particularly popular as a retreat from the island's tropical heat. The Horton Plains National Park, a UNESCO World Heritage Site, offers dramatic highland scenery, endemic wildlife, and the famous \"World's End\" escarpment — a sheer 880-metre drop with views stretching to the coast on clear days. Gregory Lake in the town centre is a popular venue for paddle boating and evening strolls.",
      culture: "Nuwara Eliya District has a population of approximately 760,000 people. It is notably one of the most diverse districts in Sri Lanka, with Indian Tamils (plantation Tamils) forming a near-majority alongside Sinhalese and Sri Lankan Tamils.",
    },
  },
  {
    name: "Galle",
    province: "southern",
    areaKm2: 1652,
    population: "1.1 million",
    populationMillions: 1.1,
    sections: {
      geography: "Galle District is located in the southwestern corner of Sri Lanka, covering approximately 1,652 square kilometres. It is bordered by Kalutara District to the north, Matara District to the east, Ratnapura District to the northeast, and the Indian Ocean to the south and west.",
      history: "Galle is one of the oldest ports in Sri Lanka, with a documented maritime history stretching back over two thousand years. Arab, Persian, Chinese, Indian, and later European traders all anchored in its natural harbour.",
      economy: "Galle's economy is driven by tourism, fishing, trade, and agriculture. The Galle Harbour, though superseded by Colombo in modern times, remains active for local and regional shipping.",
      tourism: "Galle is arguably Sri Lanka's most atmospheric destination. The Galle Fort, a walled city of extraordinary historical depth, is a living heritage precinct where colonial-era mansions, Dutch churches, mosques, boutique hotels, and cafes coexist. The Dutch Reformed Church, the Old Dutch Hospital, and the historic lighthouse within the fort are iconic sights.",
      culture: "Galle District has a population of approximately 1.1 million. Sinhalese form the large majority, with significant Muslim and small Tamil minorities.",
    },
  },
  {
    name: "Matara",
    province: "southern",
    areaKm2: 1283,
    population: "820,000",
    populationMillions: 0.82,
    sections: {
      geography: "Matara District occupies the southernmost tip of Sri Lanka, covering approximately 1,283 square kilometres. It is bordered by Galle District to the west, Ratnapura District to the north, Monaragala District to the northeast, and Hambantota District to the east.",
      history: "Matara has been inhabited since antiquity and appears in ancient chronicles as a significant settlement. During the Kandyan Kingdom period it was an important administrative and military outpost.",
      economy: "Matara's economy is primarily agricultural, with rubber, tea, coconut, and rice cultivation forming the backbone. The fishing industry, centred on the Matara Harbour, contributes significantly to both local consumption and exports.",
      tourism: "Matara's attractions blend natural beauty with historical depth. The Matara Fort and the Star Fort are well-preserved Dutch colonial fortifications offering a step back in time. Polhena Beach is famous for sea turtle nesting and is a popular site for snorkelling with sea turtles.",
      culture: "Matara District has a population of approximately 820,000 people, predominantly Sinhalese with small Muslim and Tamil minorities. The district has a strong Buddhist identity, with numerous ancient temples and vihares playing central roles in community life.",
    },
  },
  {
    name: "Hambantota",
    province: "southern",
    areaKm2: 2609,
    population: "600,000",
    populationMillions: 0.6,
    sections: {
      geography: "Hambantota District is the largest district in the Southern Province, covering approximately 2,609 square kilometres. It lies in the southernmost part of Sri Lanka, bordered by Matara District to the west, Ratnapura and Monaragala districts to the north, and the Indian Ocean to the south.",
      history: "Hambantota is considered one of the most historically significant districts in Sri Lanka. Mahagama, the ancient capital of the southern kingdom, was located here.",
      economy: "Hambantota has been the site of one of the most ambitious infrastructure development programs in Sri Lanka's post-war history. The Mattala Rajapaksa International Airport, the Hambantota International Port, and a special economic zone were constructed here in the 2000s and 2010s.",
      tourism: "Hambantota is best known as the gateway to Sri Lanka's most celebrated wildlife destinations. Yala National Park, the most visited national park in Sri Lanka, is home to the world's highest density of leopards, as well as elephants, sloth bears, crocodiles, and a staggering diversity of bird species. Bundala National Park, a Ramsar wetland, hosts flamingos, pelicans, and thousands of migratory birds.",
      culture: "Hambantota District has a population of approximately 600,000, predominantly Sinhalese with small Muslim minority communities along the coast. The district has a distinctly rural and agrarian character, with traditions rooted in ancient Ruhunu culture.",
    },
  },
  {
    name: "Jaffna",
    province: "northern",
    areaKm2: 1025,
    population: "600,000",
    populationMillions: 0.6,
    sections: {
      geography: "Jaffna District is located at the northern extremity of Sri Lanka, covering approximately 1,025 square kilometres. It occupies a peninsula and a chain of offshore islands including Kayts, Karaitivu, Nainativu, and Delft.",
      history: "Jaffna is one of the oldest inhabited regions of Sri Lanka, with evidence of settlement stretching back over three thousand years. It was the capital of the Jaffna Kingdom, a medieval Tamil kingdom that flourished from the 13th to the 17th centuries and maintained close cultural ties with South India.",
      economy: "Jaffna's economy is recovering strongly from the devastation of the civil war. Agriculture is the primary activity, with the peninsula known for producing an extraordinary variety of fruits and vegetables on its thin limestone soils.",
      tourism: "Jaffna is emerging as one of the most distinctive and exciting tourism destinations in Sri Lanka. The Jaffna Fort, a sprawling Dutch fortification overlooking the lagoon, is the city's most iconic landmark. The Nallur Kandaswamy Kovil, one of the most revered Hindu temples in Sri Lanka, hosts the spectacular 25-day Nallur festival each year, drawing hundreds of thousands of devotees.",
      culture: "Jaffna District has a population of approximately 600,000, predominantly Sri Lankan Tamils who practice Shaivite Hinduism. The district is considered the cultural and intellectual heartland of Sri Lankan Tamil civilisation.",
    },
  },
  {
    name: "Kilinochchi",
    province: "northern",
    areaKm2: 1279,
    population: "130,000",
    populationMillions: 0.13,
    sections: {
      geography: "Kilinochchi District is located in the northern-central area of Sri Lanka, covering approximately 1,279 square kilometres. It is bordered by Jaffna District to the north, Mullaitivu District to the east, Vavuniya District to the south, and Mannar District to the west.",
      history: "Kilinochchi District was carved out of Jaffna District as a separate administrative unit in 1984. It became the administrative capital of the Liberation Tigers of Tamil Eelam (LTTE) during the civil war — the so-called \"capital\" of the de facto state of Tamil Eelam.",
      economy: "Kilinochchi's economy is primarily agricultural. Paddy cultivation using the Iranamadu Tank's irrigation is the main activity, supplemented by the cultivation of chillies, onions, maize, and ground nuts.",
      tourism: "Kilinochchi's tourism is emerging, centred largely on war heritage, reconciliation narratives, and natural landscapes. The Kilinochchi Water Tower, a distinctive local landmark, and various war memorials attract visitors interested in understanding the civil conflict. The Iranamadu Tank and its surrounding birdlife offer nature-based experiences.",
      culture: "Kilinochchi District has a population of approximately 130,000 people, predominantly Sri Lankan Tamils. The district was severely depopulated during the civil war, with hundreds of thousands displaced; many have returned and the population is gradually growing.",
    },
  },
  {
    name: "Mannar",
    province: "northern",
    areaKm2: 1996,
    population: "100,000",
    populationMillions: 0.1,
    sections: {
      geography: "Mannar District is located on the northwestern coast of Sri Lanka, covering approximately 1,996 square kilometres, including the Mannar Island which is connected to the mainland by a causeway. It is bordered by Kilinochchi District to the north, Vavuniya District to the east, and Puttalam District to the south, with the Gulf of Mannar forming its western boundary.",
      history: "Mannar has been a crossing point between Sri Lanka and India since antiquity and features prominently in the Hindu epic Ramayana as the site where Rama built a bridge to rescue Sita. The Mannar Fort, built by the Portuguese in 1560 and later expanded by the Dutch, is one of the most impressive colonial fortifications in Sri Lanka.",
      economy: "Mannar's economy is based on fishing, agriculture, salt production, and pearl diving — a traditional and historically famous industry. The Gulf of Mannar was once the world's most productive pearl fishery, though this industry declined dramatically in the 20th century.",
      tourism: "The Our Lady of Madhu Church is the most significant pilgrimage site in the district, drawing over a million Catholic and non-Catholic worshippers each year for the annual festival. The Mannar Fort is a dramatic and largely intact Portuguese-Dutch fortification on Mannar Island. The Bar Reef Marine Sanctuary offers exceptional diving and snorkelling.",
      culture: "Mannar District has a population of approximately 100,000. It is ethnically diverse, with Sri Lankan Tamils, Sri Lankan Moors, and Sinhalese all represented.",
    },
  },
  {
    name: "Vavuniya",
    province: "northern",
    areaKm2: 1967,
    population: "170,000",
    populationMillions: 0.17,
    sections: {
      geography: "Vavuniya District is located in the central-north of Sri Lanka, covering approximately 1,967 square kilometres. It is a pivotal transitional district, bordered by Mannar to the west, Kilinochchi and Mullaitivu to the north, Trincomalee to the east, and Anuradhapura to the south.",
      history: "Vavuniya District was a key frontier zone during the civil war, with intense military activity and significant civilian displacement. The town of Vavuniya functioned as the southern gateway to LTTE-controlled territory for decades and witnessed extensive conflict.",
      economy: "Vavuniya's economy centres on trade, agriculture, and public services. As the main town of the Northern Province with good transport links, it serves as a commercial distribution hub.",
      tourism: "Vavuniya is not a primary tourist destination but serves as an important transit point for the north. The Vavuniya Archaeological Museum houses artefacts recovered from the region's ancient Buddhist sites. Madukanda Viharaya, a revered Buddhist temple, draws pilgrims.",
      culture: "Vavuniya District has a population of approximately 170,000. It is ethnically mixed, with Sri Lankan Tamils, Sinhalese, and Sri Lankan Moors in significant proportions — a reflection of its transitional geographical position.",
    },
  },
  {
    name: "Mullaitivu",
    province: "northern",
    areaKm2: 2617,
    population: "100,000",
    populationMillions: 0.1,
    sections: {
      geography: "Mullaitivu District lies on the northeastern coast of Sri Lanka, covering approximately 2,617 square kilometres — the largest district in the Northern Province. It is bordered by Kilinochchi District to the west, Vavuniya District to the south, Trincomalee District to the southeast, and the Bay of Bengal to the east.",
      history: "Mullaitivu's recent history is dominated by its role as the last stronghold of the LTTE during the final phase of the civil war. The district was at the centre of the war's devastating conclusion in 2009, when the last battle was fought on its beaches and lagoons.",
      economy: "Mullaitivu's economy is predominantly based on fishing, which is the livelihood of a large share of the population. The district has extensive coastline with rich marine resources.",
      tourism: "Mullaitivu's tourism is nascent but growing. The district's beaches — particularly around Mullaitivu town — are among the most pristine in Sri Lanka, largely untouched by mass tourism. The Nanthikadal Lagoon area, where the civil war ended, draws those seeking to understand and reflect on the island's recent history.",
      culture: "Mullaitivu District has a population of approximately 100,000 — significantly lower than before the war due to the massive displacement of the 1990s and 2000s. Resettlement is ongoing.",
    },
  },
  {
    name: "Batticaloa",
    province: "eastern",
    areaKm2: 2854,
    population: "580,000",
    populationMillions: 0.58,
    sections: {
      geography: "Batticaloa District is located on the east coast of Sri Lanka, covering approximately 2,854 square kilometres. It is bordered by Trincomalee District to the north, Ampara District to the south, Polonnaruwa District to the west, and the Bay of Bengal to the east.",
      history: "Batticaloa has been inhabited since antiquity and was a significant medieval trading port frequented by Arab merchants. The Portuguese arrived in 1602 and built a fort at Batticaloa, which was subsequently captured by the Dutch in 1638.",
      economy: "Agriculture, fishing, and government services are the main economic drivers. Paddy cultivation is extensive, supported by irrigation from tanks and rivers.",
      tourism: "Batticaloa is emerging as one of Sri Lanka's most distinctive eastern destinations. Passekudah Bay, with its wide, shallow, turquoise water enclosed by a natural coral reef barrier, is one of the finest beach destinations in the country, ideal for swimming and non-powered water sports. Kalkudah Beach, nearby, offers additional undeveloped coastal beauty.",
      culture: "Batticaloa District has a population of approximately 580,000. Sri Lankan Tamils form the majority, with significant Muslim (Sri Lankan Moor) and small Sinhalese communities.",
    },
  },
  {
    name: "Ampara",
    province: "eastern",
    areaKm2: 4415,
    population: "710,000",
    populationMillions: 0.71,
    sections: {
      geography: "Ampara District is located in the southeastern part of the Eastern Province, covering approximately 4,415 square kilometres — one of the larger districts in Sri Lanka. It is bordered by Batticaloa District to the north, Monaragala and Badulla districts to the west, Hambantota District to the south, and the Bay of Bengal to the east.",
      history: "Ampara District was created as a separate administrative unit in 1961, carved out of Batticaloa District. The region contains some of the most significant Buddhist heritage in Sri Lanka.",
      economy: "Agriculture is the cornerstone of Ampara's economy. The Gal Oya Scheme opened up large tracts of fertile land to paddy cultivation and brought thousands of Sinhalese settlers to the district.",
      tourism: "Arugam Bay, located on the district's southeastern coast, is one of the most famous surfing destinations in Asia, consistently ranked among the world's top surfing spots. It draws thousands of surfers and beach lovers annually. Gal Oya National Park, with boat safaris through the Senanayake Samudraya reservoir, offers unique wildlife experiences — elephants swimming between forested islands are an iconic sight.",
      culture: "Ampara District has a population of approximately 710,000. It is one of the most ethnically diverse districts in Sri Lanka, with significant Sinhalese, Sri Lankan Tamil, and Sri Lankan Moor populations.",
    },
  },
  {
    name: "Trincomalee",
    province: "eastern",
    areaKm2: 2727,
    population: "380,000",
    populationMillions: 0.38,
    sections: {
      geography: "Trincomalee District lies in the northeastern corner of Sri Lanka, covering approximately 2,727 square kilometres. It is bordered by Mullaitivu District to the north, Vavuniya to the northwest, Polonnaruwa to the west, Ampara to the south, and the Bay of Bengal to the east.",
      history: "Trincomalee's history is shaped by its extraordinary natural harbour, which has been strategically coveted for millennia. Ancient chronicles reference it as a port of great importance.",
      economy: "Trincomalee's economy is anchored by fishing, agriculture, tourism, and the navy. The Trincomalee Harbour has potential to become a major commercial and bunkering port for the Bay of Bengal region, and significant investment is being directed toward realising this potential.",
      tourism: "Trincomalee offers some of Sri Lanka's finest beach and marine experiences. Nilaveli Beach and Uppuveli Beach are celebrated for their white sands and calm turquoise waters. Pigeon Island National Park, just offshore, hosts the coral reef with the best hard coral coverage in Sri Lanka, offering world-class snorkelling and diving.",
      culture: "Trincomalee District has a population of approximately 380,000. It is ethnically diverse, with Sri Lankan Tamils, Sri Lankan Moors, and Sinhalese in significant proportions.",
    },
  },
  {
    name: "Kurunegala",
    province: "north-western",
    areaKm2: 4812,
    population: "1.6 million",
    populationMillions: 1.6,
    sections: {
      geography: "Kurunegala District is the largest district in the North Western Province, covering approximately 4,812 square kilometres. It occupies the centre-north of Sri Lanka, bordered by Puttalam District to the west, Anuradhapura District to the north, Matale and Kandy districts to the east, and Gampaha, Colombo, and Kegalle districts to the south.",
      history: "Kurunegala served as the capital of Sri Lanka for approximately a century, during the reigns of several Sinhalese kings from the late 13th to early 14th century, when the capital shifted between the Wet Zone and Dry Zone. The Kurunegala rock fortress remnants and ruins of palace structures attest to this period.",
      economy: "Kurunegala is one of Sri Lanka's most agriculturally productive districts. Coconut cultivation dominates the landscape, and the district is among the top coconut-producing areas in the country.",
      tourism: "Kurunegala offers a blend of historical, religious, and natural attractions. The Ethagala Rock, towering 325 metres above the town, offers panoramic views and houses a Buddha statue visible from across the district. Yapahuwa, a brief but extraordinary medieval rock fortress and former capital, features remarkable carved stone lion staircases and palace ruins.",
      culture: "Kurunegala District has a population of approximately 1.6 million, predominantly Sinhalese. It is one of the most culturally homogeneous districts in Sri Lanka, with a deeply rooted Sinhala-Buddhist identity.",
    },
  },
  {
    name: "Puttalam",
    province: "north-western",
    areaKm2: 3072,
    population: "750,000",
    populationMillions: 0.75,
    sections: {
      geography: "Puttalam District occupies the northwestern coast of Sri Lanka, covering approximately 3,072 square kilometres. It is bordered by Kurunegala District to the east, Anuradhapura District to the northeast, Mannar District to the north, and the Indian Ocean to the west.",
      history: "Puttalam has a history reaching back to ancient Sri Lanka and features in accounts of early South Asian maritime trade. Arab traders settled along the coast as early as the 9th century, and the district has a large and historically rooted Muslim community.",
      economy: "Puttalam's economy is driven by salt production, coconut cultivation, fisheries, and energy. The district produces the vast majority of Sri Lanka's salt, with extensive salt flats along the coast.",
      tourism: "Puttalam is not a primary tourist destination but has genuine attractions. The Wilpattu National Park, the largest national park in Sri Lanka and one of the oldest, covers much of the district's northern section. Famous for its leopards, sloth bears, elephants, and unique \"villus\" (water-filled basins), Wilpattu offers exceptional wildlife experiences off the beaten track.",
      culture: "Puttalam District has a population of approximately 750,000. It is ethnically diverse, with Sinhalese, Sri Lankan Moors, and Sri Lankan Tamils all well-represented.",
    },
  },
  {
    name: "Anuradhapura",
    province: "north-central",
    areaKm2: 7179,
    population: "860,000",
    populationMillions: 0.86,
    sections: {
      geography: "Anuradhapura District is the largest district in Sri Lanka, covering approximately 7,179 square kilometres in the North Central Province. It lies in the dry zone of the island, characterised by flat terrain, scrub jungle, and an extraordinary system of ancient man-made irrigation reservoirs (tanks).",
      history: "Anuradhapura is one of the most important ancient cities in the world and the first capital of Sri Lanka, established over 2,500 years ago. According to tradition, the city was founded by King Pandukabhaya in 437 BCE, though it reached its greatest glory under King Devanampiya Tissa in the 3rd century BCE.",
      economy: "Anuradhapura's economy is anchored by agriculture, tourism, and government services. Paddy cultivation, supported by the ancient tank system, is the main agricultural activity.",
      tourism: "Anuradhapura is a UNESCO World Heritage Site and one of Asia's greatest ancient cities. The Sacred City contains eight of the most sacred Buddhist sites in Sri Lanka, including the Sri Maha Bodhi tree, the Ruwanwelisaya Dagoba (one of the world's largest), the Jetavanaramaya (which was once the third-tallest structure in the ancient world), and the Thuparamaya (Sri Lanka's first dagoba). The Isurumuniya Rock Temple, with its exquisite ancient carvings including the famous \"Isurumuniya Lovers,\" is a gem of early Lankan sculpture.",
      culture: "Anuradhapura District has a population of approximately 860,000, predominantly Sinhalese. As the cradle of Sinhala Buddhist civilisation, the district has an intensely Sinhalese-Buddhist cultural identity.",
    },
  },
  {
    name: "Polonnaruwa",
    province: "north-central",
    areaKm2: 3293,
    population: "430,000",
    populationMillions: 0.43,
    sections: {
      geography: "Polonnaruwa District is located in the North Central Province, covering approximately 3,293 square kilometres. It is bordered by Anuradhapura District to the northwest, Trincomalee to the north, Ampara to the southeast, Badulla to the south, and Matale and Kandy districts to the west.",
      history: "Polonnaruwa was the second ancient capital of Sri Lanka, succeeding Anuradhapura following its sacking by South Indian invaders in the early medieval period. The city reached its zenith under King Parakramabahu I (1153-1186 CE), who unified the island under a single rule, undertook massive irrigation works, and built a magnificent royal city of palaces, dagobas, and Buddha statues.",
      economy: "Agriculture is the foundation of Polonnaruwa's economy. The ancient and modern irrigation infrastructure supports extensive paddy cultivation that makes the district one of the rice bowls of Sri Lanka.",
      tourism: "Polonnaruwa is a UNESCO World Heritage Site and one of Sri Lanka's most visited historical destinations. The ancient city contains remarkable royal palace ruins, the Rankoth Vehera dagoba, the Lankatilaka image house, and most famously the Gal Vihara — four magnificent Buddha images carved from a single granite face, considered masterpieces of ancient Lankan sculpture. The Parakrama Samudraya reservoir, covering 2,400 hectares, creates a breathtaking backdrop to the ancient city.",
      culture: "Polonnaruwa District has a population of approximately 430,000, predominantly Sinhalese. Post-independence resettlement and irrigation development programs have significantly shaped the district's demographic character.",
    },
  },
  {
    name: "Badulla",
    province: "uva",
    areaKm2: 2861,
    population: "900,000",
    populationMillions: 0.9,
    sections: {
      geography: "Badulla District is the largest district in the Uva Province, covering approximately 2,861 square kilometres. It is situated in the eastern highlands of Sri Lanka, flanked by Nuwara Eliya and Kandy districts to the north and west, Matale to the northwest, Polonnaruwa to the north, Ampara to the east, Monaragala to the southeast, and Ratnapura to the southwest.",
      history: "Badulla is one of the oldest towns in Sri Lanka, mentioned in ancient chronicles as Dighavapi. It was an important administrative and commercial centre during multiple ancient kingdoms.",
      economy: "Tea cultivation is the primary economic activity, and Uva teas are among the most sought-after in the world, with their distinctive malty flavour prized by connoisseurs. The tea industry provides livelihoods for a significant proportion of the district's population, particularly Indian Tamil estate workers.",
      tourism: "Badulla offers extraordinary natural and historical attractions. Dunhinda Falls, plunging 64 metres into a misty gorge near Badulla town, is one of the island's most dramatic natural sights. The Bogoda Wooden Bridge, possibly the oldest surviving wooden bridge in Sri Lanka (over 400 years old), is a remarkable piece of living history.",
      culture: "Badulla District has a population of approximately 900,000. It is notably diverse, with Sinhalese, Indian Tamils (plantation workers), Sri Lankan Tamils, and Sri Lankan Moors all forming significant communities.",
    },
  },
  {
    name: "Monaragala",
    province: "uva",
    areaKm2: 5639,
    population: "450,000",
    populationMillions: 0.45,
    sections: {
      geography: "Monaragala District covers approximately 5,639 square kilometres, making it the second largest district in Sri Lanka, and lies in the Uva Province. It is bordered by Badulla to the north, Ampara to the northeast, Hambantota to the south, Matara to the southwest, Ratnapura to the west, and Polonnaruwa to the north.",
      history: "Monaragala is believed to be one of the most ancient inhabited areas in Sri Lanka. Cave shelters across the district have yielded prehistoric remains.",
      economy: "Monaragala is one of the least developed and most rural districts in Sri Lanka. Agriculture is the dominant economic activity.",
      tourism: "Monaragala is an emerging ecotourism destination. The Maligawila Buddha Statue — standing at 10.6 metres and belonging to the 7th century CE — is one of the largest ancient standing Buddha statues in Sri Lanka. The Buduruvagala rock carvings are ancient Mahayana Buddhist carvings of remarkable artistic quality.",
      culture: "Monaragala District has a population of approximately 450,000, predominantly Sinhalese. The district received a significant influx of settlers through post-independence colonisation schemes, and the population has grown considerably as a result.",
    },
  },
  {
    name: "Ratnapura",
    province: "sabaragamuwa",
    areaKm2: 3275,
    population: "1.1 million",
    populationMillions: 1.1,
    sections: {
      geography: "Ratnapura District is located in the Sabaragamuwa Province, covering approximately 3,275 square kilometres. It is bordered by Colombo and Kalutara districts to the west, Kegalle District to the north, Kandy and Nuwara Eliya to the northeast, Badulla and Monaragala to the east, and Hambantota and Matara to the south.",
      history: "Ratnapura — literally \"City of Gems\" in Sanskrit — has been a gem mining centre for over 2,000 years. References to Sri Lanka's sapphires, rubies, and other precious stones appear in texts from ancient Greece, Rome, China, and the Arab world.",
      economy: "Ratnapura is the gem capital of Sri Lanka. The alluvial deposits of the Kalu River basin and its tributaries contain extraordinary concentrations of sapphires, rubies, cat's eyes, alexandrites, spinels, and hundreds of other gemstone varieties.",
      tourism: "Ratnapura offers some of Sri Lanka's most unique tourism experiences. The annual Sri Pada (Adam's Peak) pilgrimage season from December to May draws hundreds of thousands of devotees of all faiths who make the pre-dawn climb to the 2,243-metre summit to witness the sunrise and the mountain's famous triangular shadow. The National Gem and Jewellery Museum in Ratnapura town displays a dazzling collection of precious stones.",
      culture: "Ratnapura District has a population of approximately 1.1 million, predominantly Sinhalese. The gem mining communities have a distinct cultural identity and traditional practices around gem excavation, blessing of mines, and trading rituals.",
    },
  },
  {
    name: "Kegalle",
    province: "sabaragamuwa",
    areaKm2: 1693,
    population: "840,000",
    populationMillions: 0.84,
    sections: {
      geography: "Kegalle District is located in the Sabaragamuwa Province, covering approximately 1,693 square kilometres. It is bordered by Kandy District to the north, Matale to the northeast, Nuwara Eliya and Ratnapura to the east and south, Colombo and Gampaha to the west, and Kurunegala to the northwest.",
      history: "Kegalle District has been inhabited since antiquity. The Rambukkana and Mawanella areas were important transit zones between the Kandyan highlands and the western coastal regions.",
      economy: "Rubber cultivation is the dominant agricultural activity, making Kegalle one of the most productive rubber districts in Sri Lanka. Tea, coconut, and paddy are also cultivated.",
      tourism: "Kegalle's most celebrated attraction is the Pinnawala Elephant Orphanage, one of the world's most famous and visited wildlife centres, where rescued and orphaned elephants are cared for in a natural setting along the Maha Oya river. The daily bathing of the elephant herd in the river is a remarkable spectacle. The Ambuluwawa Tower in Gampola, a multi-religious tower and biodiversity complex with intertwining spiral walkways set on a misty hilltop, has become a popular Instagram destination.",
      culture: "Kegalle District has a population of approximately 840,000, predominantly Sinhalese with smaller Tamil and Muslim minority communities. The district has a deeply traditional Sinhala-Buddhist cultural character, with numerous temples, annual peraheras, and devotional life forming the social fabric of communities.",
    },
  },
]

/** The districts of one province, in the document's own order. */
export function districtsInProvince(provinceId) {
  return DISTRICT_DETAIL.filter((district) => district.province === provinceId)
}

/**
 * One province's districts plus the totals the panel shows above them.
 *
 * The totals are sums of what the document states district by district, which is why they are
 * computed here rather than written down: a district's figure being corrected in the source moves the
 * province's figure with it.
 */
export function provinceFacts(provinceId) {
  const districts = districtsInProvince(provinceId)
  const population = districts.reduce((sum, district) => sum + (district.populationMillions ?? 0), 0)
  return {
    districts,
    count: districts.length,
    areaKm2: districts.reduce((sum, district) => sum + (district.areaKm2 ?? 0), 0),
    populationMillions: population > 0 ? Number(population.toFixed(1)) : null,
  }
}

export default DISTRICT_DETAIL
