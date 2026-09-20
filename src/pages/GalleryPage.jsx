import { api } from '../api/client'
import { useApi } from '../hooks/useApi'
import PageHero from '../components/layout/PageHero'
import Reveal from '../components/ui/Reveal'
import MediaFigure from '../components/ui/MediaFigure'
import PHOTOS from '../data/photos'
import { formatDate } from '../utils/format'

/**
 * The wall of photographs, pinned up like a scrapbook page.
 *
 * Every photo is a print with a paper border, a piece of tape over one corner, a handwritten caption
 * where the upload has one, and a hand-pressed tilt so the wall is deliberately uneven - see the
 * .scrapbook rules in components.css. The tilt lives on the inner <figure> rather than on the
 * element <Reveal> animates, because both would be writing to `transform`.
 *
 * The shapes cycle so no two neighbours are the same size; with four columns a wide tile always has
 * a plain one beside it, which is what stops the grid tearing when the photos are not multiples of
 * four.
 */
const SHAPES = ['tall', '', 'wide', '', '', 'tall', '', 'wide']

export default function GalleryPage() {
  const { data: images } = useApi(() => api.getGallery(), [])
  const hasLive = Array.isArray(images) && images.length > 0

  const photos = hasLive
    ? images.map((image) => ({
        key: image.imageId,
        item: image,
        // Real captions only: an upload with no caption gets its number and nothing invented.
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
            ? 'Photographs and short clips uploaded from the road.'
            : 'A first look at the island - more goes up as the season runs.'
        }
        crumbs={[{ label: 'Gallery' }]}
        image={PHOTOS.pageHero.gallery}
        scenery="coast"
      />

      <section className="section scrapbook-section">
        <div className="container">
          {!hasLive && (
            <p className="notice">
              Nothing has been uploaded yet, so these are the photographs that ship with the site.
              Add images and clips in the admin console (Gallery, or the media library) and they
              appear here instead.
            </p>
          )}

          <div className="scrapbook">
            {photos.map((photo, index) => (
              <Reveal
                key={photo.key}
                className={`scrapbook__item ${SHAPES[index % SHAPES.length]}`}
                delay={(index % 4) * 90}
              >
                <figure className="scrapbook__card">
                  <span className="scrapbook__tape" aria-hidden="true" />

                  <div className="scrapbook__frame">
                    {photo.item ? (
                      <MediaFigure
                        item={photo.item}
                        alt={photo.caption ?? 'Gallery image'}
                        className={photo.item.mediaType === 'VIDEO' ? 'scrapbook__video' : undefined}
                      />
                    ) : (
                      <img src={photo.src} alt="" loading="lazy" />
                    )}
                  </div>

                  <figcaption className="scrapbook__caption">
                    {photo.caption && <span className="scrapbook__hand">{photo.caption}</span>}
                    <span className="scrapbook__no">Nº {String(index + 1).padStart(2, '0')}</span>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>

          {hasLive && (
            <p className="results-line scrapbook__line">
              {images.length} {images.length === 1 ? 'photograph' : 'photographs'} pinned up
              {images[0]?.uploadedAt ? ` · latest ${formatDate(images[0].uploadedAt) ?? 'recently'}` : ''}
            </p>
          )}
        </div>
      </section>
    </main>
  )
}
