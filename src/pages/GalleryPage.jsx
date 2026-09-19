import { api } from '../api/client'
import { useApi } from '../hooks/useApi'
import PageHero from '../components/layout/PageHero'
import Reveal from '../components/ui/Reveal'
import MediaFigure from '../components/ui/MediaFigure'
import PHOTOS from '../data/photos'
import { formatDate } from '../utils/format'

/** Shown until the gallery has uploaded rows; the photos ship with the site. */
const TILES = [
  { image: PHOTOS.galleryTiles[0], span: 'wide' },
  { image: PHOTOS.galleryTiles[1], span: 'tall' },
  { image: PHOTOS.galleryTiles[2] },
  { image: PHOTOS.galleryTiles[3] },
  { image: PHOTOS.galleryTiles[4] },
  { image: PHOTOS.galleryTiles[5], span: 'wide' },
]

export default function GalleryPage() {
  const { data: images } = useApi(() => api.getGallery(), [])
  const hasLive = Array.isArray(images) && images.length > 0

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

      <section className="section">
        <div className="container">
          {!hasLive && (
            <p className="notice">
              Nothing has been uploaded yet, so these are the photographs that ship with the site.
              Add images and clips in the admin console (Gallery, or the media library) and they
              appear here instead.
            </p>
          )}

          <div className="mosaic mosaic--page">
            {hasLive
              ? images.map((image) => (
                  <figure className="mosaic__tile" key={image.imageId}>
                    <MediaFigure
                      item={image}
                      alt={image.caption ?? 'Gallery image'}
                      className={image.mediaType === 'VIDEO' ? 'mosaic__video' : undefined}
                    />
                    <figcaption>{image.caption ?? image.packageTitle ?? 'Sri Lanka'}</figcaption>
                  </figure>
                ))
              : TILES.map((tile, index) => (
                  <Reveal className={`mosaic__tile ${tile.span ?? ''}`} key={tile.image} delay={index * 60} as="figure">
                    <img src={tile.image} alt="" loading="lazy" />
                  </Reveal>
                ))}
          </div>

          {hasLive && images.some((image) => image.uploadedAt) && (
            <p className="results-line">
              Latest upload {formatDate(images[0]?.uploadedAt) ?? 'recently'} · {images.length}{' '}
              {images.length === 1 ? 'image' : 'images'}
            </p>
          )}
        </div>
      </section>
    </main>
  )
}
