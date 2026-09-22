/**
 * Sri_Lanka_25_Districts.docx -> src/data/districtDetail.js
 *
 *   node scripts/build-district-detail.mjs
 *
 * Why a generator rather than a hand-written data file: the source is a 40 KB document the agency
 * supplied, one chapter per district, and every fact on the site has to be traceable to it. Retyping
 * 25 districts by hand is how a "population of 2.3 million" becomes "3.2 million" three releases
 * later. Run this after replacing the document and the panel follows it.
 *
 * The document is a .docx, which is a zip - and this script reads it with zlib rather than a
 * dependency, because one entry of one archive is not worth a package. The path it wants is
 * data/Sri_Lanka_25_Districts.docx (the file as supplied, kept next to the script so the build is
 * reproducible; pass another path as the first argument to override).
 *
 * The five sections run to a couple of hundred words each, which is far more than a panel can show.
 * Each one is therefore cut to its opening sentences, at a sentence boundary, keeping the facts the
 * section leads with: the area and the borders for geography, the founding and the colonial era for
 * history, the main sectors for economy, the headline sights for tourism, the population and its
 * makeup for culture. Nothing is paraphrased and nothing is invented - it is the document's own
 * sentences, shortened.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { inflateRawSync } from 'node:zlib'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const frontend = join(here, '..')
const source = process.argv[2] ?? join(frontend, 'data', 'Sri_Lanka_25_Districts.docx')
const target = join(frontend, 'src', 'data', 'districtDetail.js')

/** How much of each section to keep, by sentence count and by hard character ceiling. */
const LIMITS = {
  geography: { sentences: 2, chars: 420 },
  history: { sentences: 2, chars: 400 },
  economy: { sentences: 2, chars: 400 },
  tourism: { sentences: 3, chars: 560 },
  culture: { sentences: 2, chars: 400 },
}

const SECTION_LABELS = {
  'Geographical Profile': 'geography',
  'History and Heritage': 'history',
  'Economy and Infrastructure': 'economy',
  'Tourism and Attractions': 'tourism',
  'Demographics and Culture': 'culture',
}

/** "Western Province" -> the id src/data/provinces.js uses. */
const PROVINCE_IDS = {
  western: 'western',
  central: 'central',
  southern: 'southern',
  northern: 'northern',
  eastern: 'eastern',
  northwestern: 'north-western',
  northcentral: 'north-central',
  uva: 'uva',
  sabaragamuwa: 'sabaragamuwa',
}

// ---------------------------------------------------------------- reading the .docx

/** One entry out of a zip, read straight from the central directory. */
function readZipEntry(buffer, name) {
  const eocd = buffer.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06]))
  if (eocd === -1) throw new Error('not a zip: no end-of-central-directory record')
  const entryCount = buffer.readUInt16LE(eocd + 10)
  let offset = buffer.readUInt32LE(eocd + 16)

  for (let i = 0; i < entryCount; i += 1) {
    if (buffer.readUInt32LE(offset) !== 0x02014b50) throw new Error('bad central directory entry')
    const method = buffer.readUInt16LE(offset + 10)
    const compressedSize = buffer.readUInt32LE(offset + 20)
    const nameLength = buffer.readUInt16LE(offset + 28)
    const extraLength = buffer.readUInt16LE(offset + 30)
    const commentLength = buffer.readUInt16LE(offset + 32)
    const localOffset = buffer.readUInt32LE(offset + 42)
    const entryName = buffer.toString('utf8', offset + 46, offset + 46 + nameLength)

    if (entryName === name) {
      const localNameLength = buffer.readUInt16LE(localOffset + 26)
      const localExtraLength = buffer.readUInt16LE(localOffset + 28)
      const dataStart = localOffset + 30 + localNameLength + localExtraLength
      const data = buffer.subarray(dataStart, dataStart + compressedSize)
      return method === 0 ? data.toString('utf8') : inflateRawSync(data).toString('utf8')
    }
    offset += 46 + nameLength + extraLength + commentLength
  }
  throw new Error(`${name} is not in the archive`)
}

/** The document's text, one paragraph per line, table cells separated by " | ". */
function documentText(xml) {
  return xml
    .replace(/<w:tab[^>]*\/>/g, '\t')
    .replace(/<\/w:p>/g, '\n')
    .replace(/<\/w:tc>/g, ' | ')
    .replace(/<\/w:tr>/g, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .split(/\r?\n/)
    .map((line) => line.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, '').trim())
    .filter((line) => line && line !== '|')
}

// ---------------------------------------------------------------- shortening

/** Splits prose into sentences. A full stop inside a number or an abbreviation is not a full stop. */
function sentencesOf(text) {
  const ABBREVIATION = /\b(?:St|Mr|Mrs|Ms|Dr|No|approx|e\.g|i\.e|etc|vs|Ltd|Co|Mt|ft|km)\.$/i
  const parts = text.split(/(?<=[.!?])\s+/)
  const sentences = []
  for (const part of parts) {
    // "…a population of approximately 1.4 million." splits correctly (no space after the first stop),
    // but "St. Mary's" would not: glue a fragment back on when the sentence before it is an
    // abbreviation rather than an ending.
    if (sentences.length && ABBREVIATION.test(sentences[sentences.length - 1])) {
      sentences[sentences.length - 1] += ` ${part}`
    } else {
      sentences.push(part)
    }
  }
  return sentences
}

/** Cuts a section to its opening sentences. */
function condense(text, limit) {
  const clean = text.replace(/\s+/g, ' ').trim()
  const sentences = sentencesOf(clean)
  const kept = []
  for (const sentence of sentences.slice(0, limit.sentences)) {
    // The split consumed the space between sentences, so they are joined back with one.
    if (kept.length && [...kept, sentence].join(' ').length > limit.chars) break
    kept.push(sentence)
  }
  let out = (kept.length ? kept.join(' ') : clean).trim()
  if (out.length > limit.chars) {
    const cut = out.slice(0, limit.chars)
    const stop = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('; '))
    out = stop > 120 ? cut.slice(0, stop + 1) : `${cut.trimEnd()}…`
  }
  return out
}

const NUMBER_WORDS = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10 }

/** "approximately 699 square kilometres" -> 699. Null when the document does not say. */
function areaOf(text) {
  const match = text.match(/area of (?:approximately |about |roughly )?([\d,]+(?:\.\d+)?)\s*square\s*kilomet/i)
    ?? text.match(/covering (?:an area of )?(?:approximately |about )?([\d,]+(?:\.\d+)?)\s*square\s*kilomet/i)
    ?? text.match(/approximately ([\d,]+(?:\.\d+)?)\s*square\s*kilomet/i)
  if (!match) return null
  return Number(match[1].replace(/,/g, ''))
}

/** The population phrase the document uses, plus it in millions where that can be read off. */
function populationOf(text) {
  const match = text.match(/population of (?:approximately |about |over |nearly |around )?([\d][\d,.]*\d|\d)\s*(million|thousand)?/i)
    ?? text.match(/([\d][\d,.]*\d|\d)\s*(million|thousand)?\s*(?:people|residents)/i)
  if (!match) return { phrase: null, millions: null }
  // The number carries the sentence's punctuation when it ends the clause: "…600,000, with…".
  const digits = match[1].replace(/[.,]+$/, '')
  const value = Number(digits.replace(/,/g, ''))
  const unit = (match[2] ?? '').toLowerCase()
  if (Number.isNaN(value)) return { phrase: null, millions: null }
  const millions = unit === 'million' ? value : unit === 'thousand' ? value / 1000 : value > 100 ? value / 1e6 : value
  const phrase = `${digits}${unit ? ` ${unit}` : ''}`.trim()
  return { phrase, millions }
}

// ---------------------------------------------------------------- parsing

const xml = readZipEntry(readFileSync(source), 'word/document.xml')
const lines = documentText(xml)

const districts = []
let current = null
let section = null

for (const line of lines) {
  const heading = line.match(/^(\d{1,2})\.\s+(.+?)\s+District$/)
  if (heading) {
    current = { order: Number(heading[1]), name: heading[2].trim(), province: null, sections: {} }
    districts.push(current)
    section = null
    continue
  }
  if (!current) continue

  const province = line.match(/^Province:\s*(.+?)\s*Province$/i)
  if (province) {
    const key = province[1].toLowerCase().replace(/[^a-z]/g, '')
    current.province = PROVINCE_IDS[key] ?? null
    continue
  }

  const label = SECTION_LABELS[line]
  if (label) {
    section = label
    continue
  }
  if (section) {
    current.sections[section] = current.sections[section]
      ? `${current.sections[section]} ${line}`
      : line
  }
}

const problems = []
for (const district of districts) {
  if (!district.province) problems.push(`${district.name}: no province matched`)
  for (const key of Object.keys(LIMITS)) {
    if (!district.sections[key]) problems.push(`${district.name}: no ${key}`)
  }
}

const records = districts.map((district) => {
  const geography = district.sections.geography ?? ''
  const culture = district.sections.culture ?? ''
  const population = populationOf(culture)
  return {
    name: district.name,
    province: district.province,
    order: district.order,
    areaKm2: areaOf(geography),
    population: population.phrase,
    populationMillions: population.millions,
    sections: Object.fromEntries(
      Object.entries(LIMITS).map(([key, limit]) => [key, condense(district.sections[key] ?? '', limit)]),
    ),
  }
})

// ---------------------------------------------------------------- writing

const withProvince = records.filter((record) => record.province)
const byProvince = withProvince.reduce((all, record) => {
  all[record.province] = (all[record.province] ?? 0) + 1
  return all
}, {})

const body = withProvince
  .map((record) => {
    const sections = Object.entries(record.sections)
      .map(([key, text]) => `      ${key}: ${JSON.stringify(text)},`)
      .join('\n')
    return `  {
    name: ${JSON.stringify(record.name)},
    province: ${JSON.stringify(record.province)},
    areaKm2: ${record.areaKm2 ?? 'null'},
    population: ${record.population ? JSON.stringify(record.population) : 'null'},
    populationMillions: ${record.populationMillions ?? 'null'},
    sections: {
${sections}
    },
  },`
  })
  .join('\n')

const file = `/**
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
${body}
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
`

mkdirSync(dirname(target), { recursive: true })
writeFileSync(target, file, 'utf8')

console.log(`districts read:      ${records.length}`)
console.log(`with a province:     ${withProvince.length}`)
console.log(`per province:        ${Object.entries(byProvince).map(([id, n]) => `${id} ${n}`).join(', ')}`)
console.log(`with an area:        ${withProvince.filter((r) => r.areaKm2).length}`)
console.log(`with a population:   ${withProvince.filter((r) => r.population).length}`)
console.log(`written:             ${target.replace(frontend, '')} (${(file.length / 1024).toFixed(1)} KB)`)
if (problems.length) {
  console.log(`\nworth a look (${problems.length}):`)
  for (const problem of problems) console.log(`  - ${problem}`)
}
