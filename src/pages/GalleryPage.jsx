import { api } from '../api/client'
import { useApi } from '../hooks/useApi'
import PageHero from '../components/layout/PageHero'
import Reveal from '../components/ui/Reveal'
import Scenery from '../components/ui/Scenery'
import { formatDate } from '../utils/format'

const TILES = [
  { variant: 'temple', caption: 'Sigiriya at dawn', span: 'wide' },
  { variant: 'safari', caption: 'Yala, block one', span: 'tall' },
  { variant: 'tea', caption: 'Tea terraces near Ella' },
  { variant: 'coast', caption: 'Stilt fishermen, Koggala' },
  { variant: 'train', caption: 'The Nine Arch bridge' },
  { variant: 'hills', caption: 'Knuckles range', span: 'wide' },
  { variant: 'coast', caption: 'Mirissa at dusk' },
  { variant: 'temple', caption: 'Dambulla cave temples' },
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
            ? 'Photographs uploaded from the road by our guides.'
            : 'Illustrated previews for now - replace them with your own photography in /public/images.'
        }
        crumbs={[{ label: 'Gallery' }]}
        scenery="coast"
      />

      <section className="section">
        <div className="container">
          {!hasLive && (
            <p className="notice">
              The gallery is empty, so these are the illustrated placeholders. Upload real images
              through <code>/api/admin/gallery</code> and they appear here.
            </p>
          )}

          <div className="mosaic mosaic--page">
            {hasLive
              ? images.map((image) => (
                  <figure className="mosaic__tile" key={image.imageId}>
                    <img src={image.imageUrl} alt={image.caption ?? 'Gallery image'} loading="lazy" />
                    <figcaption>{image.caption ?? image.packageTitle ?? 'Sri Lanka'}</figcaption>
                  </figure>
                ))
              : TILES.map((tile, index) => (
                  <Reveal className={`mosaic__tile ${tile.span ?? ''}`} key={tile.caption} delay={index * 60} as="figure">
                    <Scenery variant={tile.variant} ratio="1 / 1" />
                    <figcaption>{tile.caption}</figcaption>
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
