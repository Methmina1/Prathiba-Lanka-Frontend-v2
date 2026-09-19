import { Link } from 'react-router-dom'
import { api } from '../../api/client'
import { useApi } from '../../hooks/useApi'
import Reveal from '../ui/Reveal'
import MediaFigure from '../ui/MediaFigure'
import PHOTOS from '../../data/photos'

const TILES = PHOTOS.galleryTiles.map((image, index) => ({
  image,
  span: index === 0 || index === 5 ? 'wide' : index === 1 ? 'tall' : undefined,
}))

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
              ? 'Photographs and short clips uploaded from the road.'
              : 'A first look at the island - more goes up as the season runs.'}
          </p>
        </div>

        <Reveal delay={100}>
          <div className="mosaic">
          {hasLive
            ? images.slice(0, 6).map((image) => (
                <figure className={`mosaic__tile ${image.caption?.length > 30 ? 'wide' : ''}`} key={image.imageId}>
                  <MediaFigure
                    item={image}
                    alt={image.caption ?? 'Gallery image'}
                    className={image.mediaType === 'VIDEO' ? 'mosaic__video' : undefined}
                  />
                  <figcaption>{image.caption ?? image.packageTitle}</figcaption>
                </figure>
              ))
            : TILES.map((tile) => (
                <figure className={`mosaic__tile ${tile.span ?? ''}`} key={tile.image}>
                  <img src={tile.image} alt="" loading="lazy" />
                </figure>
              ))}
          </div>
        </Reveal>

        <div className="section-cta">
          <Link className="btn btn--ghost" to="/gallery">
            Open the gallery
          </Link>
        </div>
      </div>
    </section>
  )
}
