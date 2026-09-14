import { useState } from 'react'
import { faqs } from '../../data/fallback'
import { ChevronDown } from '../ui/Icons'

export default function Faq() {
  const [open, setOpen] = useState(0)

  return (
    <section className="section" id="faq">
      <div className="container faq">
        <div className="faq__intro">
          <span className="eyebrow">Common questions</span>
          <h2>Before you write to us</h2>
          <p className="lede">
            The four things people ask most often. Anything else, the enquiry form above reaches a
            person, not a queue.
          </p>
        </div>

        <div className="faq__list">
          {faqs.map((item, index) => {
            const isOpen = open === index
            return (
              <div className={`faq__item ${isOpen ? 'is-open' : ''}`} key={item.q}>
                <button
                  type="button"
                  className="faq__question"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? -1 : index)}
                >
                  <span>{item.q}</span>
                  <ChevronDown width={18} height={18} />
                </button>
                {isOpen && <p className="faq__answer">{item.a}</p>}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
