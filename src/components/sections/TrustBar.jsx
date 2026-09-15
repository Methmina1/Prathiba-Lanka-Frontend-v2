import { trustBadges } from '../../data/fallback'
import Reveal from '../ui/Reveal'
import { Clock, Compass, Leaf, Shield } from '../ui/Icons'

const ICONS = { shield: Shield, compass: Compass, clock: Clock, leaf: Leaf }

export default function TrustBar() {
  return (
    <section className="trustbar">
      <div className="container trustbar__grid">
        {trustBadges.map((badge, index) => {
          const Icon = ICONS[badge.icon] ?? Shield
          return (
            <Reveal className="trustbar__item" key={badge.title} delay={index * 90}>
              <span className="trustbar__icon">
                <Icon />
              </span>
              <div>
                <strong>{badge.title}</strong>
                <span>{badge.text}</span>
              </div>
            </Reveal>
          )
        })}
      </div>
    </section>
  )
}
