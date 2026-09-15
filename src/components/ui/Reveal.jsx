import { useEffect, useRef, useState } from 'react'

/**
 * Fades and lifts its children into view once they enter the viewport.
 * Stagger siblings with <Reveal delay={120}>; if IntersectionObserver is unavailable the content
 * is shown immediately, so nothing is ever hidden by a missing observer.
 */
export default function Reveal({
  children,
  delay = 0,
  variant = '',
  as: Tag = 'div',
  className = '',
  threshold = 0.15,
  ...rest
}) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return undefined

    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true)
      return undefined
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold, rootMargin: '0px 0px -60px 0px' }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [threshold])

  return (
    <Tag
      ref={ref}
      className={`reveal ${variant} ${visible ? 'is-visible' : ''} ${className}`.trim()}
      style={{ '--reveal-delay': `${delay}ms` }}
      {...rest}
    >
      {children}
    </Tag>
  )
}
