import { sustainabilityPoints } from '../../data/fallback'
import Reveal from '../ui/Reveal'
import { Check } from '../ui/Icons'

export default function Sustainability() {
  return (
    <section className="section section--deep">
      <div className="container">
        <Reveal className="section-head section-head--center">
          <span className="eyebrow eyebrow--onDark">Responsible travel</span>
          <h2>Conscious exploration</h2>
          <p className="lede">
            Sri Lanka is small and it is generous. We try to give more back than we take, in the ways
            that stay in the country.
          </p>
        </Reveal>

        <div className="grid grid--4">
          {sustainabilityPoints.map((point, index) => (
            <Reveal key={point.title} delay={index * 110}>
              <div className="sus-card">
                <span className="sus-card__tick">
                  <Check width={16} height={16} />
                </span>
                <strong>{point.title}</strong>
                <p>{point.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
