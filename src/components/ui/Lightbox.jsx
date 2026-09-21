import { useCallback, useEffect, useRef } from 'react'
import { ArrowRight, Close } from './Icons'

/**
 * One photograph, full size, on a dark backdrop.
 *
 * Opened by clicking a tile in the gallery. Escape closes it, the arrow keys move through the set,
 * clicking the backdrop closes it and the buttons in the bar do the same as the keys - because a
 * viewer that only responds to a small close button is a viewer people get stuck in.
 *
 * It is a dialog rather than a full-page route: the set it moves through is the one already on the
 * page, so opening a photograph does not reload the gallery behind it. Focus moves to the dialog
 * when it opens and back to the tile that opened it when it closes, and the page behind is frozen -
 * the same behaviour as the journey write-up dialog (components/ui/StoryDialog.jsx).
 */
export default function Lightbox({ photos, index, onClose, onIndex }) {
  const panelRef = useRef(null)
  const photo = photos[index]
  const count = photos.length

  const step = useCallback(
    (delta) => onIndex((index + delta + count) % count),
    [index, count, onIndex]
  )

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'ArrowRight') step(1)
      if (event.key === 'ArrowLeft') step(-1)
    }

    window.addEventListener('keydown', onKey)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = previousOverflow
    }
  }, [onClose, step])

  // Focus is taken once, when the viewer opens. It is deliberately not part of the effect above:
  // that one re-runs whenever the photograph changes, and pulling focus back to the panel then would
  // take it away from the arrow button somebody had just clicked.
  useEffect(() => {
    panelRef.current?.focus()
  }, [])

  if (!photo) return null

  const caption = photo.caption ?? photo.item?.packageTitle ?? 'Sri Lanka'

  return (
    <div
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={`Photograph ${index + 1} of ${count}: ${caption}`}
      data-index={index}
      onMouseDown={(event) => {
        // Only a click on the backdrop itself closes it: a drag that ends on an arrow button, or a
        // click on the picture, must not.
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className="lightbox__panel" ref={panelRef} tabIndex={-1}>
        <button type="button" className="lightbox__close" onClick={onClose} aria-label="Close" autoFocus>
          <Close width={20} height={20} />
        </button>

        <figure className="lightbox__figure">
          {photo.item?.mediaType === 'VIDEO' ? (
            <video className="lightbox__image" src={photo.src} controls autoPlay muted loop playsInline />
          ) : (
            <img className="lightbox__image" src={photo.src} alt={caption} />
          )}
          <figcaption className="lightbox__bar">
            <span className="lightbox__caption">{caption}</span>
            <span className="lightbox__count">
              {index + 1} / {count}
            </span>
          </figcaption>
        </figure>
      </div>

      {/* The arrows sit on the backdrop rather than in the panel: the panel is as wide as the
          photograph, so an arrow offset from its edge falls off a narrow screen. */}
      {count > 1 && (
        <>
          <button
            type="button"
            className="lightbox__nav lightbox__nav--prev"
            onClick={() => step(-1)}
            aria-label="Previous photograph"
          >
            <ArrowRight width={20} height={20} />
          </button>
          <button
            type="button"
            className="lightbox__nav lightbox__nav--next"
            onClick={() => step(1)}
            aria-label="Next photograph"
          >
            <ArrowRight width={20} height={20} />
          </button>
        </>
      )}
    </div>
  )
}
