import { api } from '../../api/client'
import { useApi } from '../../hooks/useApi'
import Reveal from '../ui/Reveal'
import Scenery from '../ui/Scenery'

const TILES = [
  { variant: 'temple', caption: 'Sigiriya at dawn', span: 'wide' },
  { variant: 'safari', caption: 'Yala, block one', span: 'tall' },
  { variant: 'tea', caption: 'Tea terraces near Ella' },
  { variant: 'coast', caption: 'Stilt fishermen, Koggala' },
  { variant: 'train', caption: 'The Nine Arch bridge' },
  { variant: 'hills', caption: 'Knuckles range', span: 'wide' },
]

export default function Gallery() {
  const { data: images } = useApi(() => api.getGallery(), [])
  const hasLive = Array.isArray(images) && images.length > 0

  return (
    <section className="section" id="gallery">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">Gallery</span>
          <h2>Where the journeys go</h2>
          <p className="lede">
            {hasLive
              ? 'Photographs uploaded from the road by our guides.'
              : 'Illustrated previews for now - replace them with your own photography in /public/images.'}
          </p>
        </div>

        <Reveal delay={100}>
          <div className="mosaic">
          {hasLive
            ? images.slice(0, 6).map((image) => (
                <figure className={`mosaic__tile ${image.caption?.length > 30 ? 'wide' : ''}`} key={image.imageId}>
                  <img src={image.imageUrl} alt={image.caption ?? 'Gallery image'} loading="lazy" />
                  <figcaption>{image.caption ?? image.packageTitle}</figcaption>
                </figure>
              ))
            : TILES.map((tile) => (
                <figure className={`mosaic__tile ${tile.span ?? ''}`} key={tile.caption}>
                  <Scenery variant={tile.variant} ratio="1 / 1" />
                  <figcaption>{tile.caption}</figcaption>
                </figure>
              ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
