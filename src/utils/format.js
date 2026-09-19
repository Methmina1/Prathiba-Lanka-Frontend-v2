const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

/** 1290 -> "$1,290.00"; returns null when there is no usable price. */
export function formatPrice(price) {
  if (price === null || price === undefined || price === '') return null
  const value = Number(price)
  return Number.isNaN(value) ? null : currency.format(value)
}

/** ISO string -> "18 Aug 2026" */
export function formatDate(value) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

/** 8 -> "8 days" */
export function formatDays(days) {
  if (!days && days !== 0) return null
  return `${days} ${Number(days) === 1 ? 'day' : 'days'}`
}

/** 1536000 -> "1.5 MB" */
export function formatBytes(bytes) {
  if (!bytes && bytes !== 0) return null
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`
  return `${bytes} B`
}

/** Splits a textarea-style body into paragraphs for rendering. */
export function toParagraphs(text) {
  if (!text) return []
  return String(text)
    .split(/\n{2,}|\r\n\r\n/)
    .map((part) => part.trim())
    .filter(Boolean)
}

/**
 * Splits a body that is written one entry per line - the day-by-day itinerary, where every line is
 * a day. Blank lines are dropped, and a single newline is the only separator.
 */
export function toLines(text) {
  if (!text) return []
  return String(text)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
}

/**
 * The opening sentence of a longer description, for the places that need one line rather than a
 * paragraph (a hero lede, a card's standfirst). Text with no full stop is cut at the limit instead.
 */
export function firstSentence(text, limit = 180) {
  if (!text) return ''
  const flat = String(text).replace(/\s+/g, ' ').trim()
  const stop = flat.search(/\.(\s|$)/)
  const sentence = stop === -1 ? flat : flat.slice(0, stop + 1)
  if (sentence.length <= limit) return sentence
  return `${flat.slice(0, limit - 1).trimEnd()}\u2026`
}
