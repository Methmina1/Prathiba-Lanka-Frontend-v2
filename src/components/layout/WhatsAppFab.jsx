import { useLocation } from 'react-router-dom'
import { WhatsApp } from '../ui/Icons'
import { usePageContent } from '../../hooks/usePageContent'
import { whatsappFrom } from '../../data/social'

/**
 * The WhatsApp bubble, on every public page.
 *
 * The agency answers on WhatsApp sooner than it answers email, so the number sits in the corner of
 * the site rather than only on the contact page. It replaced the same bubble's old job - a floating
 * link to /plan - because the CTA band already carries a "Begin your journey" button for that, and
 * the class and the icon were saying WhatsApp all along.
 *
 * The number is read from the contact content (the card whose icon is `whatsapp`), so editing it in
 * Admin → Contact moves this bubble with it. It is not shown on the account or sign-in pages: those
 * are a customer's own business, and a marketing bubble over them is noise.
 */
const HIDDEN_ON = ['/account', '/login', '/register']

export default function WhatsAppFab() {
  const { pathname } = useLocation()
  const { content } = usePageContent('contact')
  const whatsapp = whatsappFrom(content.cards)

  if (!whatsapp.value || HIDDEN_ON.some((path) => pathname.startsWith(path))) return null

  return (
    <a
      className="whatsapp-fab"
      href={whatsapp.href}
      target="_blank"
      rel="noreferrer noopener"
      aria-label={`Message us on WhatsApp: ${whatsapp.value}`}
    >
      <WhatsApp width={22} height={22} />
      <span className="whatsapp-fab__label">{whatsapp.value}</span>
    </a>
  )
}
