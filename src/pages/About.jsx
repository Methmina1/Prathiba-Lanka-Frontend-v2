import { Link } from 'react-router-dom'
import PageHero from '../components/layout/PageHero'
import Reveal from '../components/ui/Reveal'
import Scenery from '../components/ui/Scenery'
import CtaBand from '../components/sections/CtaBand'
import { ArrowRight, Check } from '../components/ui/Icons'

const VALUES = [
  {
    title: 'Local knowledge, not a script',
    text: 'Our guides grew up with these roads, temples and tea estates. They will tell you when to go, and when not to.',
  },
  {
    title: 'Private by default',
    text: 'No shared coaches, no strangers at breakfast. Your vehicle, your guide, your pace.',
  },
  {
    title: 'Priced in the open',
    text: 'One figure per person, agreed before you travel. No commission stops, no surprise extras.',
  },
  {
    title: 'Care for the island',
    text: 'Family-run stays, plastic-free journeys and wildlife viewed at a respectful distance.',
  },
]

const TIMELINE = [
  {
    year: '2014',
    title: 'A single vehicle in Colombo',
    text: 'Two guides, one van and a notebook of favourite guesthouses along the south coast.',
  },
  {
    year: '2017',
    title: 'The hill country routes',
    text: 'We mapped the tea line properly - which carriage, which side, which stops are worth the walk.',
  },
  {
    year: '2021',
    title: 'Wildlife done quietly',
    text: 'Long relationships with park trackers, and a firm rule about keeping our distance.',
  },
  {
    year: 'Today',
    title: 'A small team, still on the road',
    text: 'We keep the number of journeys per season low enough that every traveller gets a real consultant.',
  },
]

export default function About() {
  return (
    <main className="page-enter">
      <PageHero
        eyebrow="About us"
        title="Arranged by people who live here"
        lede="PrathibaLanka is a small Sri Lankan travel house. We build private journeys for travellers who would rather see four places properly than fourteen badly."
        crumbs={[{ label: 'About' }]}
        scenery="train"
      />

      <section className="section">
        <div className="container philosophy">
          <Reveal className="philosophy__media" variant="reveal--right">
            <div className="philosophy__frame">
              <Scenery variant="tea" ratio="4 / 5" />
            </div>
            <div className="philosophy__badge">
              <strong>Since 2014</strong>
              <span>Arranging journeys from Colombo</span>
            </div>
          </Reveal>

          <Reveal className="philosophy__copy" delay={120}>
            <span className="eyebrow">Our story</span>
            <h2>Fewer places. Longer looks.</h2>
            <p className="lede">
              We started with one vehicle and a list of places we loved. That has not really changed:
              we still plan every journey by hand, and we still send people to the guesthouses we
              would send our own families to.
            </p>

            <ul className="philosophy__points">
              <li>
                <span className="philosophy__tick">
                  <Check width={15} height={15} />
                </span>
                <div>
                  <strong>One consultant per journey</strong>
                  <p>The person who plans your trip is the person who answers when you write.</p>
                </div>
              </li>
              <li>
                <span className="philosophy__tick">
                  <Check width={15} height={15} />
                </span>
                <div>
                  <strong>On the ground, always</strong>
                  <p>A local number that is answered day or night, for the whole of your stay.</p>
                </div>
              </li>
            </ul>

            <Link className="link-arrow" to="/journeys">
              See the journeys
              <ArrowRight width={16} height={16} />
            </Link>
          </Reveal>
        </div>
      </section>

      <section className="section section--muted">
        <div className="container">
          <Reveal className="section-head section-head--center">
            <span className="eyebrow">What we hold to</span>
            <h2>Four things we do not compromise on</h2>
          </Reveal>

          <div className="grid grid--4">
            {VALUES.map((value, index) => (
              <Reveal key={value.title} delay={index * 100}>
                <article className="card step-card">
                  <span className="step-card__number">{String(index + 1).padStart(2, '0')}</span>
                  <strong>{value.title}</strong>
                  <p>{value.text}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <Reveal className="section-head">
            <span className="eyebrow">Milestones</span>
            <h2>How we got here</h2>
          </Reveal>

          <ol className="timeline">
            {TIMELINE.map((entry, index) => (
              <Reveal as="li" className="timeline__item" key={entry.year} delay={index * 90}>
                <span className="timeline__year">{entry.year}</span>
                <div>
                  <strong>{entry.title}</strong>
                  <p>{entry.text}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <CtaBand />
    </main>
  )
}
