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
