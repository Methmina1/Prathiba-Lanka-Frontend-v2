import Reveal from '../ui/Reveal'
import { ArrowRight, Check } from '../ui/Icons'
import PHOTOS from '../../data/photos'

const POINTS = [
  {
    title: 'Guides who are locals',
    text: 'Every journey is led by someone who grew up with the language, the temples and the shortcuts.',
  },
  {
    title: 'Comfort without the crowds',
    text: 'Small hotels and planter bungalows, timed so you meet the sites before the buses arrive.',
  },
]

export default function Philosophy() {
  return (
    <section className="section" id="philosophy">
      <div className="container philosophy">
        <Reveal className="philosophy__media" variant="reveal--right">
          <div className="philosophy__frame">
            <img src={PHOTOS.philosophy} alt="" loading="lazy" />
          </div>
          <div className="philosophy__badge">
            <strong>Since 2014</strong>
            <span>Arranging journeys from Colombo</span>
          </div>
        </Reveal>

        <Reveal className="philosophy__copy" delay={120}>
          <span className="eyebrow">Our philosophy</span>
          <h2>Fewer places. Longer looks.</h2>
          <p className="lede">
            A good Sri Lankan itinerary is not a checklist. We build each one around the things you
            actually came for - the archaeology, the wildlife, the tea, the sea - and then we slow it
            down until it fits the island's own pace.
          </p>

          <ul className="philosophy__points">
            {POINTS.map((point) => (
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

          <a className="link-arrow" href="#journeys">
            See the journeys
            <ArrowRight width={16} height={16} />
          </a>
        </Reveal>
      </div>
    </section>
  )
}
