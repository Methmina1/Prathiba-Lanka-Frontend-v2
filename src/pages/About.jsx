import { Link } from 'react-router-dom'
import PageHero from '../components/layout/PageHero'
import Reveal from '../components/ui/Reveal'
import Scenery from '../components/ui/Scenery'
import CtaBand from '../components/sections/CtaBand'
import { ArrowRight, Check } from '../components/ui/Icons'
import { usePageContent } from '../hooks/usePageContent'

export default function About() {
  // Copy comes from the API (editable in the admin console) and falls back to the bundled defaults.
  const { content } = usePageContent('about')
  const { hero, story, values, timeline } = content

  return (
    <main className="page-enter">
      <PageHero
        eyebrow={hero.eyebrow}
        title={hero.title}
        lede={hero.lede}
        crumbs={[{ label: 'About' }]}
        scenery={hero.scenery}
      />

      <section className="section">
        <div className="container philosophy">
          <Reveal className="philosophy__media" variant="reveal--right">
            <div className="philosophy__frame">
              <Scenery variant={story.scenery} ratio="4 / 5" />
            </div>
            <div className="philosophy__badge">
              <strong>{story.badgeTitle}</strong>
              <span>{story.badgeText}</span>
            </div>
          </Reveal>

          <Reveal className="philosophy__copy" delay={120}>
            <span className="eyebrow">{story.eyebrow}</span>
            <h2>{story.heading}</h2>
            <p className="lede">{story.lede}</p>

            <ul className="philosophy__points">
              {(story.points ?? []).map((point) => (
                <li key={point.title}>
                  <span className="philosophy__tick">
                    <Check width={15} height={15} />
                  </span>
                  <div>
                    <strong>{point.title}</strong>
                    <p>{point.text}</p>
                  </div>
                </li>
              ))}
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
            <span className="eyebrow">{values.eyebrow}</span>
            <h2>{values.heading}</h2>
          </Reveal>

          <div className="grid grid--4">
            {(values.items ?? []).map((value, index) => (
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
            <span className="eyebrow">{timeline.eyebrow}</span>
            <h2>{timeline.heading}</h2>
          </Reveal>

          <ol className="timeline">
            {(timeline.items ?? []).map((entry, index) => (
              <Reveal as="li" className="timeline__item" key={`${entry.year}-${entry.title}`} delay={index * 90}>
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
