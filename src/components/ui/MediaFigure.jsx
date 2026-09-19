import { api } from '../../api/client'

/**
 * Renders one gallery item: a picture, or a short clip with controls. Uploaded files are stored as
 * a path, so mediaUrl adds the API origin.
 */
export default function MediaFigure({ item, alt, className }) {
  const src = api.mediaUrl(item.imageUrl)

  if (item.mediaType === 'VIDEO') {
    return (
      <video
        className={className}
        src={src}
        controls
        muted
        loop
        playsInline
        preload="metadata"
        aria-label={alt}
      />
    )
  }

  return <img className={className} src={src} alt={alt} loading="lazy" />
}
