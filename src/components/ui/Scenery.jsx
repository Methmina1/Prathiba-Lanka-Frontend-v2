import { useId } from 'react'

/**
 * Illustrated scene placeholders drawn in the brand palette.
 *
 * These stand in for photography so the site has no external image dependencies: drop real photos
 * into /public/images and swap a <Scenery /> for an <img /> when you have them.
 */

const VARIANTS = {
  temple: { sky: ['#fdf4e6', '#f7e2bd'], sun: '#eaa939', layers: ['#b3e6ce', '#39c684', '#0b7443'] },
  safari: { sky: ['#fdf0dc', '#f7d9a8'], sun: '#d5911a', layers: ['#dcd0a4', '#a8b678', '#4f645a'] },
  tea: { sky: ['#eef7f1', '#d7f4e6'], sun: '#f2c069', layers: ['#9ad9c0', '#1da565', '#085933'] },
  coast: { sky: ['#fdf6e7', '#fbe8c5'], sun: '#eaa939', layers: ['#a9e2cd', '#1da565', '#054226'] },
  train: { sky: ['#eef7f1', '#b3e6ce'], sun: '#f2c069', layers: ['#81cfab', '#1da565', '#054226'] },
  hills: { sky: ['#eef7f1', '#d7f4e6'], sun: '#eaa939', layers: ['#b3e6ce', '#39c684', '#0b7443'] },
}

const HILLS = [
  'M0 330 C140 290 240 350 400 320 C560 290 660 340 800 310 L800 500 L0 500 Z',
  'M0 380 C160 340 260 400 420 370 C580 340 680 400 800 372 L800 500 L0 500 Z',
  'M0 430 C180 400 300 450 460 424 C620 398 700 448 800 428 L800 500 L0 500 Z',
]

function Motif({ variant, color }) {
  switch (variant) {
    case 'temple':
      return (
        <g fill={color}>
          <rect x="376" y="300" width="48" height="34" rx="3" />
          <path d="M368 300a32 32 0 0 1 64 0Z" />
          <path d="M396 236h8v32h-8z" />
          <path d="M400 220l7 16h-14Z" />
          <circle cx="400" cy="334" r="4" opacity="0.5" />
        </g>
      )
    case 'safari':
      return (
        <g fill={color}>
          <path d="M398 402h6c1-30 2-52 6-70l-4-2c-6 20-8 44-8 72Z" />
          <path d="M404 330c-26-6-48-2-62 10 18-2 34 0 46 6-16 4-28 12-34 24 20-12 42-16 66-10 24-8 46-6 64 6-4-14-16-22-32-26 12-6 28-8 46-6-14-14-36-18-64-10-6 1-14 3-30 6Z" />
          <ellipse cx="250" cy="418" rx="26" ry="9" opacity="0.7" />
          <ellipse cx="560" cy="428" rx="34" ry="10" opacity="0.5" />
        </g>
      )
    case 'tea':
      return (
        <g stroke={color} fill="none" strokeWidth="3" opacity="0.55">
          <path d="M0 350 C200 330 340 366 520 348 C640 336 720 356 800 344" />
          <path d="M0 382 C200 362 340 398 520 380 C640 368 720 388 800 376" />
          <path d="M0 414 C200 394 340 430 520 412 C640 400 720 420 800 408" />
          <path d="M0 446 C200 426 340 462 520 444 C640 432 720 452 800 440" />
        </g>
      )
    case 'coast':
      return (
        <g fill={color}>
          <path d="M470 330c-4-34-6-58-4-74l6 1c4 22 4 46 4 73Z" />
          <path d="M474 262c-18-10-34-12-46-6 12 2 22 8 28 16-16-4-30-2-40 6 16 0 30 4 40 12-4 6-4 12-2 16 6-14 14-22 26-26 12 4 22 10 28 20 2-8 0-16-6-22 12-2 24 0 34 6-10-12-24-18-42-18-6-14-12-20-20-24Z" />
          <path d="M300 402h4v-52l-8 2c1 18 2 32 4 50Z" opacity="0.8" />
          <path d="M304 356c-14-6-26-6-34-2 10 2 18 6 22 12-12-2-22 0-30 6 12 0 22 2 30 8-2 4-2 8 0 12 4-10 10-16 18-18 8 2 16 8 20 14 0-6-2-12-6-16 8-2 16 0 24 4-8-8-18-12-30-12-4-8-8-12-14-14Z" />
          <path d="M240 470c30-10 60-10 90 0s60 10 90 0 60-10 90 0 60 10 90 0" fill="none" stroke={color} strokeWidth="3" opacity="0.5" />
        </g>
      )
    case 'train':
      return (
        <g fill={color}>
          <path d="M0 430h800v70H0Z" opacity="0.9" />
          <path d="M120 430V350a38 38 0 0 1 76 0v80Zm140 0V350a38 38 0 0 1 76 0v80Zm140 0V350a38 38 0 0 1 76 0v80Zm140 0V350a38 38 0 0 1 76 0v80Z" opacity="0.25" />
          <path d="M158 350a38 38 0 0 1 76 0M438 350a38 38 0 0 1 76 0" fill="none" stroke={color} strokeWidth="6" opacity="0.6" />
          <path d="M0 268h800v14H0Z" opacity="0.35" />
        </g>
      )
    default:
      return (
        <g fill={color} opacity="0.75">
          <circle cx="400" cy="300" r="26" />
        </g>
      )
  }
}

export default function Scenery({ variant = 'hills', className = '', ratio = '4 / 3' }) {
  const config = VARIANTS[variant] ?? VARIANTS.hills
  const uid = useId().replace(/[:]/g, '')
  const skyId = `sky-${uid}`

  return (
    <svg
      className={className}
      viewBox="0 0 800 500"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label={`Illustration: ${variant}`}
      style={{ width: '100%', height: '100%', aspectRatio: ratio, display: 'block' }}
    >
      <defs>
        <linearGradient id={skyId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={config.sky[0]} />
          <stop offset="100%" stopColor={config.sky[1]} />
        </linearGradient>
      </defs>

      <rect width="800" height="500" fill={`url(#${skyId})`} />
      <circle cx="612" cy="150" r="58" fill={config.sun} opacity="0.85" />

      <path d={HILLS[0]} fill={config.layers[0]} />
      <Motif variant={variant} color={config.layers[2]} />
      <path d={HILLS[1]} fill={config.layers[1]} opacity="0.92" />
      <path d={HILLS[2]} fill={config.layers[2]} />
    </svg>
  )
}
