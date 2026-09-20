/**
 * The agency's social accounts.
 *
 * Kept in one place so the footer, the contact page and anything else that grows a social row all
 * point at the same profiles. `display` is the handle as it is written on the site, and `handle` is
 * the longer sentence a screen reader reads out for the link.
 */
export const SOCIAL_LINKS = [
  {
    id: 'facebook',
    label: 'Facebook',
    display: 'Prathibha Lanka Voyages',
    handle: 'Prathibha Lanka Voyages on Facebook',
    href: 'https://www.facebook.com/share/1KcQJzpSRF/',
  },
  {
    id: 'instagram',
    label: 'Instagram',
    display: '@prathibha_lanka_voyeages',
    handle: '@prathibha_lanka_voyeages on Instagram',
    href: 'https://www.instagram.com/prathibha_lanka_voyeages/',
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
}

export default SOCIAL_LINKS
