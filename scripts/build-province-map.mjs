/**
 * Builds src/data/provinces.js - the nine provinces, shaped into the island.
 *
 *   node scripts/build-province-map.mjs
 *
 * Each province comes from one of two places:
 *
 *   1. the silhouette supplied in public/map, if it really is that province, or
 *   2. the reference map, when the supplied file does not match.
 *
 * Which one is used is decided by comparing shapes, not by trusting the file name: every supplied
 * silhouette and every reference province is rasterised in a browser and scored by intersection over
 * union. A file has to score 0.80 or better against the province it is named after to be used. This
 * matters because a map is a factual claim - a province drawn in the wrong place, or in the wrong
 * shape, is worse than no map. Run it and it prints the scores, so the check is visible rather than
 * hidden in a script.
 *
 * The reference is @svg-maps/sri-lanka: 25 districts, CC BY 4.0, originally from MapSVG
 * (https://mapsvg.com/maps/sri-lanka). Districts are grouped into the nine provinces. If all nine
 * supplied files pass the check the map is built entirely from them; if any fails, the reference
 * geometry is used for all nine so the map is drawn in one consistent hand.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { tmpdir } from 'node:os'
import { chromium } from 'playwright'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..')
const mapDir = join(root, 'public', 'map')
const outFile = join(root, 'src', 'data', 'provinces.js')

const REFERENCE_URL = 'https://cdn.jsdelivr.net/npm/@svg-maps/sri-lanka@2.0.0/sri-lanka.svg'
const cacheFile = join(tmpdir(), 'sri-lanka-districts.svg')
const GRID = 48
const MATCH_THRESHOLD = 0.8

/** Districts per province, the copy the caption shows, and the file to check in public/map. */
const PROVINCES = [
  {
    id: 'western',
    name: 'Western',
    capital: 'Colombo',
    file: 'Western_Province.svg',
    districts: ['Colombo', 'Gampaha', 'Kalutara'],
    blurb: 'The capital, the airport road and the coast either side of them.',
  },
  {
    id: 'central',
    name: 'Central',
    capital: 'Kandy',
    file: 'Central_Province.svg',
    districts: ['Kandy', 'Matale', 'Nuwara Eliya'],
    blurb: 'Tea country, the Kandy-Ella line and the mist at Horton Plains.',
  },
  {
    id: 'southern',
    name: 'Southern',
    capital: 'Galle',
    file: 'Southern_Province.svg',
    districts: ['Galle', 'Matara', 'Hambantota'],
    blurb: 'The fort at Galle, the whales off Mirissa and the quiet coast at Tangalle.',
  },
  {
    id: 'northern',
    name: 'Northern',
    capital: 'Jaffna',
    file: 'Northern_Province.svg',
    districts: ['Jaffna', 'Kilinochchi', 'Mannar', 'Mullaitivu', 'Vavuniya'],
    blurb: 'The peninsula, its kovils and the islands, from Jaffna down to Mannar.',
  },
  {
    id: 'eastern',
    name: 'Eastern',
    capital: 'Trincomalee',
    file: 'Eastern_Province.svg',
    districts: ['Ampara', 'Batticaloa', 'Trincomalee'],
    blurb: 'The dry-season coast: Trincomalee harbour, its reefs and long empty sand.',
  },
  {
    id: 'north-western',
    name: 'North Western',
    capital: 'Kurunegala',
    file: 'North_Western_Province.svg',
    districts: ['Kurunegala', 'Puttalam'],
    blurb: 'Coconut triangle, the Puttalam lagoon and the road north out of Colombo.',
  },
  {
    id: 'north-central',
    name: 'North Central',
    capital: 'Anuradhapura',
    file: 'North_Central_Province.svg',
    districts: ['Anuradhapura', 'Polonnaruwa'],
    blurb: 'The first two capitals, their stupas, tanks and ruined cities.',
  },
  {
    id: 'uva',
    name: 'Uva',
    capital: 'Badulla',
    file: 'Uva_Province.svg',
    districts: ['Badulla', 'Monaragala'],
    blurb: 'Ella, the Nine Arch Bridge and the dry edge of the hill country.',
  },
  {
    id: 'sabaragamuwa',
    name: 'Sabaragamuwa',
    capital: 'Ratnapura',
    file: 'Sabaragamuwa_Province.svg',
    districts: ['Kegalle', 'Ratnapura'],
    blurb: 'Gem country, and the road up towards Adam\u2019s Peak.',
  },
]

const ALIASES = { monaragala: 'moneragala' }
const key = (value) => value.toLowerCase().replace(/[^a-z]/g, '')
const round = (value) => Math.round(value * 100) / 100

// ------------------------------------------------------------------ reference map
if (!existsSync(cacheFile)) {
  console.log(`fetching the reference map -> ${cacheFile}`)
  const response = await fetch(REFERENCE_URL)
  if (!response.ok) throw new Error(`reference map: HTTP ${response.status}`)
  await writeFile(cacheFile, await response.text(), 'utf8')
}

const browser = await chromium.launch()
const page = await browser.newPage()
await page.setContent('<body style="margin:0"></body>')
await page.evaluate((svg) => {
  document.body.innerHTML = svg
}, await readFile(cacheFile, 'utf8'))

const districtPaths = await page.evaluate(() => {
  const out = {}
  for (const path of document.querySelectorAll('path')) {
    const id = (path.getAttribute('aria-label') || path.getAttribute('id') || '').toLowerCase().replace(/[^a-z]/g, '')
    if (id) out[id] = path.getAttribute('d')
  }
  return out
})

// ------------------------------------------------------------------ measuring tools
await page.evaluate((grid) => {
  const NS = 'http://www.w3.org/2000/svg'

  const boxOf = (paths) => {
    const svg = document.createElementNS(NS, 'svg')
    const group = document.createElementNS(NS, 'g')
    for (const d of paths) {
      const element = document.createElementNS(NS, 'path')
      element.setAttribute('d', d)
      group.appendChild(element)
    }
    svg.appendChild(group)
    document.body.appendChild(svg)
    const box = group.getBBox()
    svg.remove()
    return box
  }

  /** The true bounding box of a set of paths, in the reference coordinate system. */
  window.__box = (paths) => {
    const box = boxOf(paths)
    return { minX: box.x, minY: box.y, maxX: box.x + box.width, maxY: box.y + box.height }
  }

  /** A grid mask of a set of paths, normalised to their own bounding box. */
  window.__mask = async (paths) => {
    const box = boxOf(paths)
    const markup =
      `<svg xmlns="${NS}" viewBox="${box.x} ${box.y} ${box.width} ${box.height}" width="${grid}" height="${grid}" ` +
      `preserveAspectRatio="none">` +
      paths.map((d) => `<path d="${d}" fill="#000"/>`).join('') +
      `</svg>`

    const image = new Image()
    await new Promise((resolve, reject) => {
      image.onload = resolve
      image.onerror = () => reject(new Error('render failed'))
      image.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(markup)
    })

    const canvas = document.createElement('canvas')
    canvas.width = grid
    canvas.height = grid
    const ctx = canvas.getContext('2d')
    ctx.drawImage(image, 0, 0)
    const { data } = ctx.getImageData(0, 0, grid, grid)
    const mask = []
    for (let index = 0; index < grid * grid; index += 1) mask.push(data[index * 4 + 3] > 128 ? 1 : 0)
    return mask
  }
}, GRID)

const maskOf = (paths) => page.evaluate((dList) => window.__mask(dList), paths)
const boxOf = (paths) => page.evaluate((dList) => window.__box(dList), paths)

const iou = (a, b) => {
  let intersection = 0
  let union = 0
  for (let index = 0; index < a.length; index += 1) {
    if (a[index] || b[index]) union += 1
    if (a[index] && b[index]) intersection += 1
  }
  return union === 0 ? 0 : intersection / union
}

// ------------------------------------------------------------------ read what was supplied
const supplied = new Map()
for (const province of PROVINCES) {
  const file = join(mapDir, province.file)
  if (!existsSync(file)) {
    supplied.set(province.id, null)
    continue
  }
  const svg = await readFile(file, 'utf8')
  const paths = [...svg.matchAll(/<path\b[^>]*>/g)]
    .map((match) => (match[0].match(/\sd="([^"]+)"/) ?? [])[1])
    .filter(Boolean)
  supplied.set(province.id, paths.length > 0 ? paths : null)
}

const reference = new Map()
for (const province of PROVINCES) {
  const paths = province.districts.map((district) => districtPaths[key(district)] ?? districtPaths[ALIASES[key(district)]])
  if (paths.some((path) => !path)) throw new Error(`${province.name}: a district is missing from the reference map`)
  reference.set(province.id, { paths, box: await boxOf(paths), mask: await maskOf(paths) })
}

// ------------------------------------------------------------------ does each file match?
console.log(`\nDoes public/map hold the province each file is named after? (needs ${MATCH_THRESHOLD} to be used)\n`)
console.log(`${'file'.padEnd(30)}${'province'.padEnd(17)}${'score'.padStart(7)}   verdict`)

let matches = 0
for (const province of PROVINCES) {
  const paths = supplied.get(province.id)
  if (!paths) {
    console.log(`${province.file.padEnd(30)}${province.name.padEnd(17)}${'—'.padStart(7)}   missing`)
    continue
  }
  const score = iou(await maskOf(paths), reference.get(province.id).mask)
  const ok = score >= MATCH_THRESHOLD
  if (ok) matches += 1
  console.log(
    `${province.file.padEnd(30)}${province.name.padEnd(17)}${score.toFixed(3).padStart(7)}   ${ok ? 'used' : 'does not match this province'}`,
  )
}

const useSupplied = matches === PROVINCES.length
console.log(
  useSupplied
    ? '\nAll nine files match: the map is drawn from public/map.\n'
    : `\n${matches} of ${PROVINCES.length} files match. The map is drawn from the reference geometry instead,` +
        `\nso every province is in the right place and drawn in the same hand. Replace the files in public/map\n` +
        `with correct silhouettes (or drop in the ones the map was built from) and re-run to switch over.\n`,
)

await browser.close()

// ------------------------------------------------------------------ assemble the map
const island = {
  minX: Math.min(...[...reference.values()].map((entry) => entry.box.minX)),
  minY: Math.min(...[...reference.values()].map((entry) => entry.box.minY)),
  maxX: Math.max(...[...reference.values()].map((entry) => entry.box.maxX)),
  maxY: Math.max(...[...reference.values()].map((entry) => entry.box.maxY)),
}

const shiftX = round(4 - island.minX)
const shiftY = round(4 - island.minY)
const viewBox = `0 0 ${round(island.maxX - island.minX + 8)} ${round(island.maxY - island.minY + 8)}`

/**
 * Makes the leading moveto of a path safe to append after another path.
 *
 * "m 44.4,578.9 2.6,0.07" means: an absolute moveto to (44.4, 578.9) - the first moveto of a path
 * is absolute even when written lower case - followed by an implicit *relative* lineto. Once the
 * path is no longer first in the file, that leading m is read as relative, and simply upper-casing
 * it turns the second pair into an absolute coordinate, which throws the pen across the map. So the
 * moveto is rewritten explicitly: M for the first pair, and l for any others.
 */
function fixLeadingMoveto(d) {
  const match = d.match(/^\s*m\s*((?:[-\d.eE+]+\s*[,\s]\s*[-\d.eE+]+\s*)+)/)
  if (!match) return d

  const numbers = match[1].trim().split(/[\s,]+/).filter(Boolean).map(Number)
  const head = `M ${numbers[0]} ${numbers[1]}` + (numbers.length > 2 ? ` l ${numbers.slice(2).join(' ')}` : '')
  return `${head} ${d.slice(match[0].length)}`.trim()
}

const entries = PROVINCES.map((province) => {
  const paths = useSupplied ? supplied.get(province.id) : reference.get(province.id).paths
  const box = reference.get(province.id).box

  // One path per province, from the districts' subpaths.
  const d = paths.map((path, index) => (index === 0 ? path : fixLeadingMoveto(path))).join(' ')

  return `  {
    id: ${JSON.stringify(province.id)},
    name: ${JSON.stringify(province.name)},
    capital: ${JSON.stringify(province.capital)},
    blurb: ${JSON.stringify(province.blurb)},
    districts: ${JSON.stringify(province.districts)},
    // Middle of the province, for the label that follows the pointer.
    label: { x: ${round((box.minX + box.maxX) / 2 + shiftX)}, y: ${round((box.minY + box.maxY) / 2 + shiftY)} },
    d: '${d}',
  }`
})

const source = useSupplied
  ? 'the silhouettes in public/map'
  : 'the district geometry of @svg-maps/sri-lanka (CC BY 4.0, from MapSVG - https://mapsvg.com/maps/sri-lanka), grouped into provinces'

const file = `/**
 * The nine provinces, shaped into the island.
 *
 * Generated by scripts/build-province-map.mjs from ${source}.
 * Do not edit by hand - re-run the script after changing public/map.
 *
 * Coordinates are the map's own: put them in an <svg viewBox="${viewBox}"> and every province lands
 * where it belongs. "label" is the middle of the province, for the name that follows the pointer.
 */
export const MAP_VIEW_BOX = '${viewBox}'

export const MAP_SOURCE = ${JSON.stringify(useSupplied ? 'public/map' : 'reference')}

export const PROVINCES = [
${entries.join(',\n')},
]

export default PROVINCES
`

await mkdir(dirname(outFile), { recursive: true })
await writeFile(outFile, file, 'utf8')

console.log(`viewBox ${viewBox}`)
console.log(`written ${outFile} (${Math.round(file.length / 1024)} KB)`)
