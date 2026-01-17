import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About Word Escalator',
  description:
    'Word Escalator is a free daily word ladder puzzle game inspired by Lewis Carroll\'s classic word game. New puzzle every day, plus endless mode.',
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    title: 'About Word Escalator',
    description:
      'Word Escalator is a free daily word ladder puzzle game inspired by Lewis Carroll\'s classic word game.',
    url: '/about',
  },
}

export default function About() {
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
        <h1 className="text-4xl font-bold mb-2">About Word Escalator</h1>
        <p className="text-zinc-400 text-lg mb-8">
          A modern take on a classic word puzzle
        </p>

        {/* What is Word Escalator */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 text-orange-500">
            What is Word Escalator?
          </h2>
          <p className="text-zinc-300 leading-relaxed mb-4">
            Word Escalator is a free daily word ladder puzzle game. Each day,
            you&apos;re given a starting word and a target word. Your challenge
            is to transform one into the other by changing just one letter at a
            time, with each step forming a valid English word.
          </p>
          <p className="text-zinc-300 leading-relaxed">
            Like Wordle, there&apos;s a new puzzle every day that&apos;s the
            same for everyone. Unlike Wordle, you can also play unlimited
            puzzles in Endless Mode whenever you want more.
          </p>
        </section>

        {/* History */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 text-orange-500">
            The History of Word Ladders
          </h2>
          <p className="text-zinc-300 leading-relaxed mb-4">
            Word ladders were invented by Lewis Carroll (author of Alice in
            Wonderland) in 1877. He originally called the game
            &quot;Doublets&quot; and published it in Vanity Fair magazine.
          </p>
          <p className="text-zinc-300 leading-relaxed mb-4">
            The game has been known by many names over the years: word links,
            word golf, laddergrams, and word chains. The concept has remained
            the same for nearly 150 years because it&apos;s simply a great
            puzzle format.
          </p>
          <p className="text-zinc-300 leading-relaxed">
            Word Escalator brings this classic game into the modern era with a
            clean interface, daily puzzles, and difficulty levels for every
            skill level.
          </p>
        </section>

        {/* Features */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 text-orange-500">
            Features
          </h2>
          <div className="grid gap-4">
            <div className="bg-zinc-900 rounded-lg p-4">
              <h3 className="font-semibold mb-1">Daily Puzzles</h3>
              <p className="text-zinc-400 text-sm">
                A fresh challenge every day at midnight. The same puzzle for all
                players worldwide.
              </p>
            </div>
            <div className="bg-zinc-900 rounded-lg p-4">
              <h3 className="font-semibold mb-1">Endless Mode</h3>
              <p className="text-zinc-400 text-sm">
                Unlimited puzzles when you want to keep playing. Choose your
                difficulty level.
              </p>
            </div>
            <div className="bg-zinc-900 rounded-lg p-4">
              <h3 className="font-semibold mb-1">Multiple Difficulties</h3>
              <p className="text-zinc-400 text-sm">
                From easy warm-ups to impossible challenges. Find your perfect
                level.
              </p>
            </div>
            <div className="bg-zinc-900 rounded-lg p-4">
              <h3 className="font-semibold mb-1">Optimal Solution</h3>
              <p className="text-zinc-400 text-sm">
                Every puzzle has an optimal solution. Can you match it?
              </p>
            </div>
            <div className="bg-zinc-900 rounded-lg p-4">
              <h3 className="font-semibold mb-1">Hints Available</h3>
              <p className="text-zinc-400 text-sm">
                Stuck? Use hints to get a nudge in the right direction without
                giving away the answer.
              </p>
            </div>
            <div className="bg-zinc-900 rounded-lg p-4">
              <h3 className="font-semibold mb-1">Share Your Results</h3>
              <p className="text-zinc-400 text-sm">
                Compare with friends by sharing your spoiler-free results.
              </p>
            </div>
          </div>
        </section>

        {/* Why Play */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 text-orange-500">
            Why Play Word Games?
          </h2>
          <p className="text-zinc-300 leading-relaxed mb-4">
            Word puzzles like Word Escalator are more than just fun—they&apos;re
            good for your brain. Playing word games regularly can help:
          </p>
          <ul className="space-y-2 text-zinc-300">
            <li className="flex items-start">
              <span className="text-orange-500 mr-2">•</span>
              Expand your vocabulary
            </li>
            <li className="flex items-start">
              <span className="text-orange-500 mr-2">•</span>
              Improve problem-solving skills
            </li>
            <li className="flex items-start">
              <span className="text-orange-500 mr-2">•</span>
              Exercise working memory
            </li>
            <li className="flex items-start">
              <span className="text-orange-500 mr-2">•</span>
              Provide a satisfying daily mental workout
            </li>
          </ul>
        </section>

        {/* Free Forever */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 text-orange-500">
            Free Forever
          </h2>
          <p className="text-zinc-300 leading-relaxed">
            Word Escalator is completely free to play with no ads, no
            subscriptions, and no paywalls. Just pure word puzzle fun.
          </p>
        </section>

        {/* CTA */}
        <div className="text-center pt-6 border-t border-zinc-800">
          <p className="text-zinc-400 mb-4">Ready to play?</p>
          <Link
            href="/"
            className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
          >
            Play Word Escalator
          </Link>
        </div>
      </div>
    </main>
  )
}
