import { api } from '../../api/client'

/**
 * A cover stored in the media library (uploaded by staff in the console), with one of the site's own
 * photographs as the fallback so a card is never empty.
 */
export default function CoverImage({ src, fallback, alt = '', className }) {
  return <img className={className} src={api.mediaUrl(src) || fallback} alt={alt} loading="lazy" />
}
