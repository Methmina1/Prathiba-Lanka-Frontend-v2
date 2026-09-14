import { trustBadges } from '../../data/fallback'
import { Clock, Compass, Leaf, Shield } from '../ui/Icons'

const ICONS = { shield: Shield, compass: Compass, clock: Clock, leaf: Leaf }

export default function TrustBar() {
  return (
    <section className="trustbar">
      <div className="container trustbar__grid">
        {trustBadges.map((badge) => {
          const Icon = ICONS[badge.icon] ?? Shield
          return (
            <div className="trustbar__item" key={badge.title}>
              <span className="trustbar__icon">
                <Icon />
              </span>
              <div>
                <strong>{badge.title}</strong>
                <span>{badge.text}</span>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
