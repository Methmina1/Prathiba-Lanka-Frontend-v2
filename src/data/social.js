/**
 * The agency's social accounts.
 *
 * Kept in one place so the footer, the contact page and anything else that grows a social row all
 * point at the same profiles. `display` is the handle as it is written on the site, and `handle` is
 * the longer sentence a screen reader reads out for the link.
 *
 * The TikTok link is the canonical profile URL: the address the app offers for sharing carries `_r`
 * and `_t` parameters that belong to that one share, not to the profile.
 */
export const SOCIAL_LINKS = [
  {
    id: 'facebook',
    label: 'Facebook',
    display: 'Prathibha Lanka Voyages',
    handle: 'Prathibha Lanka Voyages on Facebook',
    cta: 'Follow along',
    href: 'https://www.facebook.com/share/1KcQJzpSRF/',
  },
  {
    id: 'instagram',
    label: 'Instagram',
    display: '@prathibha_lanka_voyeages',
    handle: '@prathibha_lanka_voyeages on Instagram',
    cta: 'Follow along',
    href: 'https://www.instagram.com/prathibha_lanka_voyeages/',
  },
  {
    id: 'tiktok',
    label: 'TikTok',
    display: '@prathibha_lanka_voyages',
    handle: 'Prathibha Lanka Voyages on TikTok',
    cta: 'Watch the clips',
    href: 'https://www.tiktok.com/@prathibha_lanka_voyages',
  },
  {
    // Written the way a visitor from abroad dials it. The same number is on the contact page as a
    // card, which is editable in the console - see whatsappFrom below.
    id: 'whatsapp',
    label: 'WhatsApp',
    display: '+94 76 048 4088',
    handle: 'Message Prathibha Lanka Voyages on WhatsApp',
    cta: 'Send a message',
    href: 'https://wa.me/94760484088',
  },
]

/**
 * The contact details to use before the console has any.
 *
 * The phone is deliberately empty: the number is not decided yet, and a placeholder in a footer is
 * worse than no line at all. Every place that shows it renders nothing while it is blank, so filling
 * it in here - or in Admin → Contact, which is what actually drives the site - is all it takes.
 */
export const CONTACT_FALLBACK = {
  email: 'prathibhalankavoyages@gmail.com',
  phone: '',
  office: 'Kurunagala, Sri Lanka',
  whatsapp: '+94 76 048 4088',
  whatsappHref: 'https://wa.me/94760484088',
}

/**
 * The WhatsApp details the Contact page is publishing, or the fallback.
 *
 * The number is content: it lives in Admin → Contact with the rest of the contact details, as the
 * card whose icon is `whatsapp`. Reading it from there - the way the footer already reads the phone
 * and email cards - keeps one number in one place, and the fallback is what a database that has not
 * been edited yet serves.
 */
export function whatsappFrom(cards) {
  const card = (cards ?? []).find((entry) => entry?.icon === 'whatsapp' && entry.value && entry.href)

  return {
    label: card?.label ?? 'WhatsApp',
    value: card?.value ?? CONTACT_FALLBACK.whatsapp,
    href: card?.href ?? CONTACT_FALLBACK.whatsappHref,
    note: card?.note ?? 'Fastest way to reach us',
  }
}

export default SOCIAL_LINKS
