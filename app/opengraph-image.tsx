import { ImageResponse } from 'next/og'

export const alt = 'Own2gether — Fractional Property Co-Ownership in Nigeria'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

// Default social share card used whenever a page doesn't supply its own image.
export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #142235 0%, #2E6F5E 100%)',
          padding: '72px',
          color: 'white',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', fontSize: 40, fontWeight: 700, letterSpacing: '-0.02em' }}>
          Own2gether
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 72, fontWeight: 700, lineHeight: 1.05, letterSpacing: '-0.03em', maxWidth: 960 }}>
            Co-own real property in Nigeria
          </div>
          <div style={{ fontSize: 34, marginTop: 28, color: 'rgba(255,255,255,0.82)', maxWidth: 900, lineHeight: 1.3 }}>
            Pool your money. Fractional co-ownership. No fund, no fees in cash.
          </div>
        </div>

        <div style={{ display: 'flex', fontSize: 28, color: 'rgba(255,255,255,0.7)' }}>
          own2gether.com
        </div>
      </div>
    ),
    { ...size },
  )
}
