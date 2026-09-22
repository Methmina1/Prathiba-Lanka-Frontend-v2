/**
 * One stored itinerary day -> a heading and the stops it is made of.
 *
 * Kept out of the component (and free of JSX) so it can be run against the real itineraries on their
 * own: the agency writes a day as "stop → stop → stop", and the day-by-day dropdown needs a short
 * heading for each one.
 */
export function readDay(line) {
  const steps = String(line ?? '')
    .split('→')
    .map((part) => part.trim())
    .filter(Boolean)

  if (steps.length <= 1) {
    const whole = String(line ?? '').trim()
    return { summary: shorten(whole), steps: [] }
  }

  return { summary: shorten(steps[0]), steps }
}

/** Keeps a heading to one line: the first clause, or a clipped version of a long one. */
export function shorten(text, limit = 78) {
  const full = String(text ?? '').trim()
  if (full.length <= limit) return full

  // Only split at a separator once there is enough of a phrase in front of it to read as one. A day
  // that begins "Colombo: National Museum · ..." should not be titled "Colombo".
  const clause = full.split(/[.:·]/)[0].trim()
  if (clause.length >= 20 && clause.length <= limit) return clause

  const cut = full.slice(0, limit)
  const lastSpace = cut.lastIndexOf(' ')
  return `${(lastSpace > 20 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`
}

export default readDay
