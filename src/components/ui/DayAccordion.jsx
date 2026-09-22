import { useState } from 'react'
import { ChevronDown } from './Icons'
import { readDay } from '../../utils/dayPlan'

/**
 * The day-by-day itinerary, as a list you open one day at a time.
 *
 * The itinerary arrives as one line per day, and a 20-day trip is a wall of text when every line is
 * printed at once. Each day becomes a row: the heading names where that day starts, and the rest of
 * it - the stops the day is strung together from, which the data separates with an arrow - is
 * revealed underneath. The first day starts open so the shape of a day is visible without a click,
 * and "Open all days" is there for anybody who would rather read the whole thing at once.
 *
 * The rows are buttons rather than <details> elements because the expand-all control has to reach
 * into every one of them, and a button with aria-expanded/aria-controls says the same thing to a
 * screen reader. The height animation is CSS (grid-template-rows 0fr -> 1fr), so nothing here
 * measures the DOM, and it collapses under prefers-reduced-motion like the rest of the site.
 */
export default function DayAccordion({ lines }) {
  const [open, setOpen] = useState(() => new Set([0]))

  if (!lines || lines.length === 0) return null

  const allOpen = open.size === lines.length

  const toggle = (index) => {
    setOpen((current) => {
      const next = new Set(current)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  const toggleAll = () => {
    setOpen(allOpen ? new Set() : new Set(lines.map((_, index) => index)))
  }

  return (
    <div className="days">
      <div className="days__toolbar">
        <span className="days__count">
          {lines.length} day{lines.length === 1 ? '' : 's'} Â· open a day to read it
        </span>
        <button type="button" className="days__toggle-all" onClick={toggleAll} aria-expanded={allOpen}>
          {allOpen ? 'Close all days' : 'Open all days'}
        </button>
      </div>

      <ol className="days__list">
        {lines.map((line, index) => {
          const { summary, steps } = readDay(line)
          const isOpen = open.has(index)
          const panelId = `day-panel-${index}`
          const buttonId = `day-button-${index}`

          return (
            <li className={`days__item ${isOpen ? 'is-open' : ''}`} key={index}>
              <h4 className="days__heading">
                <button
                  type="button"
                  id={buttonId}
                  className="days__button"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => toggle(index)}
                >
                  <span className="days__number">Day {String(index + 1).padStart(2, '0')}</span>
                  <span className="days__summary">{summary}</span>
                  <ChevronDown className="days__chevron" width={18} height={18} />
                </button>
              </h4>

              <div className="days__panel" id={panelId} role="region" aria-labelledby={buttonId}>
                <div className="days__panel-inner">
                  {steps.length > 1 ? (
                    <ul className="days__steps">
                      {steps.map((step, stepIndex) => (
                        <li key={stepIndex}>{step}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>{line}</p>
                  )}
                </div>
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
