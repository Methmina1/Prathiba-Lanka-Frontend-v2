import { useState } from 'react'
import { api } from '../api/client'
import { useApi } from '../hooks/useApi'
import PageHero from '../components/layout/PageHero'
import Reveal from '../components/ui/Reveal'
import MediaFigure from '../components/ui/MediaFigure'
import Lightbox from '../components/ui/Lightbox'
import PHOTOS from '../data/photos'
import { Search } from '../components/ui/Icons'
import { formatDate } from '../utils/format'

/**
 * The gallery: an even grid of photographs, and any one of them full size when it is clicked.
 *
 * Every tile is the same square with the picture cropped to fill it and the caption underneath rather
 * than written over the image, so the wall reads as a grid of photographs instead of a page of
 * captions. Clicking a picture opens the viewer (components/ui/Lightbox.jsx), which moves through the
 * set with the arrow keys. A clip keeps its own controls and is not clickable: opening a video on top
 * of itself would only get in the way of playing it.
 */
/**
 * The shapes a tile can take, and how often.
 *
 * The wall is not a uniform grid any more: photographs of different shapes sit at different heights,
 * which is what stops twenty-odd pictures reading as a spreadsheet. 2:1 leads because that is the shape
 * that suits this coast-and-hills photography; the others are the variation around it.
 */
const TILE_SHAPES = [
  'panorama', 'landscape', 'panorama', 'square', 'panorama', 'portrait',
  'landscape', 'panorama', 'portrait', 'panorama', 'landscape', 'panorama',
]

/**
 * Which shape a photograph gets.
 *
 * A hash of the photograph's own key, not a random number and not its position: the same photograph
 * keeps its shape between visits (so the wall does not reshuffle under somebody who reloads), and
 * adding a new upload does not change the shape of everything after it. It *looks* random, and it is
 * the same on every render - which is also what makes it testable.
 */
function shapeFor(key) {
  const text = String(key ?? '')
  let hash = 7
  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * 31 + text.charCodeAt(index)) % 100003
  }
  return TILE_SHAPES[hash % TILE_SHAPES.length]
}

/**
 * The gallery: a wall of photographs, and any one of them full size when it is clicked.
 *
 * The tiles are laid out in columns rather than rows, so a taller photograph simply takes more of the
 * column instead of leaving a hole - and each photograph is cropped to its own shape rather than to one
 * shape for the whole page. Captions sit underneath the pictures. Clicking one opens the viewer
 * (components/ui/Lightbox.jsx), which moves through the set with the arrow keys and shows each
 * photograph at its own proportions. A clip keeps its own controls and is not clickable: opening a
 * video on top of itself would only get in the way of playing it.
 */
export default function GalleryPage() {
  const { data: images } = useApi(() => api.getGallery(), [])
  const [openIndex, setOpenIndex] = useState(null)

  const hasLive = Array.isArray(images) && images.length > 0

  const photos = hasLive
    ? images.map((image) => ({
        key: image.imageId,
        item: image,
        src: api.mediaUrl(image.imageUrl),
        // Real captions only: an upload with no caption shows the journey it belongs to, or nothing.
        caption: image.caption ?? image.packageTitle ?? null,
      }))
    : PHOTOS.galleryTiles.map((src) => ({ key: src, src, caption: null }))

  return (
    <main className="page-enter">
      <PageHero
        eyebrow="Gallery"
        title="Where the journeys go"
        lede={
          hasLive
            ? 'Photographs and short clips uploaded from the road. Click a photograph to see it full size.'
            : 'A first look at the island - more goes up as the season runs.'
        }
        crumbs={[{ label: 'Gallery' }]}
        image={PHOTOS.pageHero.gallery}
        scenery="coast"
      />

      <section className="section gallery-section">
        <div className="container">
          {!hasLive && (
            <p className="notice">
              Nothing has been uploaded yet, so these are the photographs that ship with the site.
              Add images and clips in the admin console (Gallery, or the media library) and they
              appear here instead.
            </p>
          )}

          <div className="gallery-grid">
            {photos.map((photo, index) => (
              <Reveal key={photo.key} className="gallery-grid__cell" delay={(index % 4) * 70}>
                <figure className={`gallery-tile gallery-tile--${shapeFor(photo.key)}`}>
                  {photo.item?.mediaType === 'VIDEO' ? (
                    <>
                      <div className="gallery-tile__media">
                        <MediaFigure item={photo.item} alt={photo.caption ?? 'Gallery clip'} />
                      </div>
                      <figcaption className="gallery-tile__caption">
                        {photo.caption ?? 'Clip'}
                      </figcaption>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="gallery-tile__media gallery-tile__open"
                        onClick={() => setOpenIndex(index)}
                        aria-label={`Open ${photo.caption ?? 'this photograph'} full size`}
                      >
                        {photo.item ? (
                          <MediaFigure item={photo.item} alt={photo.caption ?? 'Gallery image'} />
                        ) : (
                          <img src={photo.src} alt="" loading="lazy" />
                        )}
                        <span className="gallery-tile__hint" aria-hidden="true">
                          <Search width={18} height={18} />
                        </span>
                      </button>
                      {photo.caption && (
                        <figcaption className="gallery-tile__caption">{photo.caption}</figcaption>
                      )}
                    </>
                  )}
                </figure>
              </Reveal>
            ))}
          </div>

          {hasLive && (
            <p className="results-line gallery-line">
              {images.length} {images.length === 1 ? 'photograph' : 'photographs'}
              {images[0]?.uploadedAt ? ` · latest ${formatDate(images[0].uploadedAt) ?? 'recently'}` : ''}
            </p>
          )}
        </div>
      </section>

      {openIndex !== null && (
        <Lightbox
          photos={photos}
          index={openIndex}
          onIndex={setOpenIndex}
          onClose={() => setOpenIndex(null)}
        />
      )}
    </main>
  )
}
