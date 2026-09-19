/**
 * The photographs that live with the site itself (in public/images/sl).
 *
 * These fill the fixed places - the home hero, each page header, the framed sections - where there
 * is no database record to attach a picture to. Anything that IS in the database (journeys, journal
 * covers, gallery items, the About/Contact images) is uploaded through the admin console instead, so
 * staff can change it without a deploy.
 *
 * Files are named after the slot rather than the photo: to swap one, replace the file, or point the
 * slot at a different file here. The originals the site was built from are in
 * public/images/Sri lanka, and scripts/optimize-images.ps1 produces web-sized copies of them.
 */
export const PHOTOS = {
  /**
   * Home hero carousel - order matters, it matches the slides in components/sections/Hero.jsx.
   * Slide 2 is a WebP (2400x1600): the file arrived that way and it is already lighter than the
   * JPEGs around it, so it is served as-is - every browser the site supports reads WebP.
   */
  hero: [
    '/images/sl/hero-1.jpg',
    '/images/sl/hero-2.webp',
    '/images/sl/hero-3.jpg',
    '/images/sl/hero-4.jpg',
  ],

  /** Header band on each inner page. */
  pageHero: {
    journeys: '/images/sl/page-journeys.jpg',
    journal: '/images/sl/page-journal.jpg',
    gallery: '/images/sl/page-gallery.jpg',
    reviews: '/images/sl/page-reviews.jpg',
    about: '/images/sl/page-about.jpg',
    contact: '/images/sl/page-contact.jpg',
    plan: '/images/sl/page-plan.jpg',
  },

  /** Framed 4/5 portrait in the home "fewer places" section. */
  philosophy: '/images/sl/philosophy.jpg',
  /** Stand-in for the About story frame until an image is set in the console. */
  aboutStory: '/images/sl/about-story.jpg',
  /** Backdrop of the "Start a conversation" band. */
  ctaBand: '/images/sl/cta-band.jpg',
  /** The illustrated map panel on the contact page. */
  contactMap: '/images/sl/contact-map.jpg',
  notFound: '/images/sl/not-found.jpg',

  /** Shown when the gallery has no rows yet, so the page is never a grid of empty boxes. */
  galleryTiles: [
    '/images/sl/tile-1.jpg',
    '/images/sl/tile-2.jpg',
    '/images/sl/tile-3.jpg',
    '/images/sl/tile-4.jpg',
    '/images/sl/tile-5.jpg',
    '/images/sl/tile-6.jpg',
  ],

  /** Shown on a journal card whose post has no cover uploaded. */
  journalFallback: ['/images/sl/journal-1.jpg', '/images/sl/journal-2.jpg', '/images/sl/journal-3.jpg'],
}

export default PHOTOS
