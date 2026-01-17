import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'Word Escalator - Daily Word Ladder Puzzle Game'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image() {
  const launchDate = new Date('2024-01-01')
  const today = new Date()
  const puzzleNumber = Math.floor(
    (today.getTime() - launchDate.getTime()) / (1000 * 60 * 60 * 24)
  )

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0a0a0a',
          backgroundImage:
            'radial-gradient(circle at 25% 25%, #1a1a2e 0%, transparent 50%), radial-gradient(circle at 75% 75%, #16213e 0%, transparent 50%)',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginBottom: 40,
          }}
        >
          <div
            style={{
              fontSize: 72,
              fontWeight: 800,
              background: 'linear-gradient(90deg, #f97316, #fb923c)',
              backgroundClip: 'text',
              color: 'transparent',
              letterSpacing: '-2px',
            }}
          >
            Word Escalator
          </div>
          <div
            style={{
              fontSize: 32,
              color: '#a1a1aa',
              marginTop: 8,
            }}
          >
            Daily Word Ladder Puzzle
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12,
            marginBottom: 40,
          }}
        >
          {['COLD', 'CORD', 'WORD', 'WARM'].map((word, i) => (
            <div
              key={word}
              style={{
                display: 'flex',
                gap: 8,
              }}
            >
              {word.split('').map((letter, j) => (
                <div
                  key={j}
                  style={{
                    width: 56,
                    height: 56,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor:
                      i === 0 || i === 3 ? '#f97316' : '#27272a',
                    borderRadius: 8,
                    fontSize: 28,
                    fontWeight: 700,
                    color: '#ffffff',
                  }}
                >
                  {letter}
                </div>
              ))}
            </div>
          ))}
        </div>

        <div
          style={{
            fontSize: 24,
            color: '#71717a',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span>Puzzle #{puzzleNumber}</span>
          <span style={{ color: '#3f3f46' }}>•</span>
          <span>Play free at wordescalator.com</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
