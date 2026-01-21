import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'How to Play Word Escalator',
  description:
    'Learn how to play Word Escalator, the daily word ladder puzzle game. Transform one word into another by changing one letter at a time. Simple rules, addictive gameplay.',
  alternates: {
    canonical: '/how-to-play',
  },
  openGraph: {
    title: 'How to Play Word Escalator',
    description:
      'Learn how to play Word Escalator, the daily word ladder puzzle game. Simple rules, addictive gameplay.',
    url: '/how-to-play',
  },
}

export default function HowToPlay() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center text-orange-500 hover:text-orange-400 mb-8 transition-colors"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Game
        </Link>

        {/* Header */}
        <h1 className="text-4xl font-bold mb-2">How to Play</h1>
        <p className="text-zinc-400 text-lg mb-8">
          Master Word Escalator in just a few minutes
        </p>

        {/* The Goal */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 text-orange-500">
            The Goal
          </h2>
          <p className="text-zinc-300 leading-relaxed">
            Transform the <strong>starting word</strong> into the{' '}
            <strong>target word</strong> by changing one letter at a time. Each
            step must form a valid English word.
          </p>
        </section>

        {/* Rules */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 text-orange-500">Rules</h2>
          <ul className="space-y-4">
            <li className="flex items-start">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-500/20 text-orange-500 flex items-center justify-center font-bold mr-3">
                1
              </span>
              <div>
                <strong className="text-white">Change exactly one letter</strong>
                <p className="text-zinc-400 mt-1">
                  Each move, you can only change a single letter in the word.
                </p>
              </div>
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-500/20 text-orange-500 flex items-center justify-center font-bold mr-3">
                2
              </span>
              <div>
                <strong className="text-white">Form valid words</strong>
                <p className="text-zinc-400 mt-1">
                  Every word in your chain must be a real English word.
                </p>
              </div>
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-500/20 text-orange-500 flex items-center justify-center font-bold mr-3">
                3
              </span>
              <div>
                <strong className="text-white">Match the optimal</strong>
                <p className="text-zinc-400 mt-1">
                  Try to reach the target in as few moves as possible. Can you
                  match the optimal solution?
                </p>
              </div>
            </li>
          </ul>
        </section>

        {/* Example */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 text-orange-500">
            Example
          </h2>
          <p className="text-zinc-300 mb-4">
            Transform <strong>COLD</strong> into <strong>WARM</strong>:
          </p>
          <div className="bg-zinc-900 rounded-lg p-6 space-y-3">
            {[
              { word: 'COLD', note: 'Starting word', highlight: true },
              { word: 'CORD', note: 'Changed L → R', highlight: false },
              { word: 'CARD', note: 'Changed O → A', highlight: false },
              { word: 'WARD', note: 'Changed C → W', highlight: false },
              { word: 'WARM', note: 'Changed D → M', highlight: true },
            ].map((step, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex gap-1">
                  {step.word.split('').map((letter, j) => (
                    <div
                      key={j}
                      className={`w-10 h-10 flex items-center justify-center rounded font-bold ${
                        step.highlight
                          ? 'bg-orange-500 text-white'
                          : 'bg-zinc-800 text-zinc-300'
                      }`}
                    >
                      {letter}
                    </div>
                  ))}
                </div>
                <span className="text-zinc-500 text-sm">{step.note}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Game Modes */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 text-orange-500">
            Game Modes
          </h2>
          <div className="space-y-4">
            <div className="bg-zinc-900 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-1">Daily Puzzle</h3>
              <p className="text-zinc-400">
                A new puzzle every day, the same for everyone. Compare your
                score with friends!
              </p>
            </div>
            <div className="bg-zinc-900 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-1">Endless Mode</h3>
              <p className="text-zinc-400">
                Unlimited puzzles at your chosen difficulty. Perfect for
                practice or when you want more.
              </p>
            </div>
          </div>
        </section>

        {/* Tips */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 text-orange-500">
            Pro Tips
          </h2>
          <ul className="space-y-2 text-zinc-300">
            <li className="flex items-start">
              <span className="text-orange-500 mr-2">•</span>
              Look for common letter patterns between start and end words
            </li>
            <li className="flex items-start">
              <span className="text-orange-500 mr-2">•</span>
              Vowels are often easier to swap than consonants
            </li>
            <li className="flex items-start">
              <span className="text-orange-500 mr-2">•</span>
              If stuck, try working backwards from the target word
            </li>
            <li className="flex items-start">
              <span className="text-orange-500 mr-2">•</span>
              Use the hint feature sparingly to nudge you in the right direction
            </li>
          </ul>
        </section>

        {/* Play Now */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 text-orange-500">
            Start Playing
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Link
              href="/"
              className="bg-orange-500 hover:bg-orange-600 rounded-lg p-5 transition-colors group"
            >
              <h3 className="font-semibold text-white mb-1 flex items-center gap-2">
                Daily Challenge
                <svg className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </h3>
              <p className="text-sm text-white/80">
                New puzzle every day at midnight UTC.
              </p>
            </Link>
            <Link
              href="/?mode=endless"
              className="bg-zinc-800 hover:bg-zinc-700 rounded-lg p-5 transition-colors group"
            >
              <h3 className="font-semibold text-white mb-1 flex items-center gap-2">
                Endless Mode
                <svg className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </h3>
              <p className="text-sm text-zinc-400">
                Unlimited puzzles. Choose your difficulty.
              </p>
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}
