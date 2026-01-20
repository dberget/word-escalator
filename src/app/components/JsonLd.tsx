'use client'

export function JsonLd() {
  const baseUrl = 'https://wordescalator.com'

  // WebApplication Schema
  const webApplicationSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Word Escalator',
    url: baseUrl,
    description:
      'A daily word ladder puzzle game where you transform one word into another by changing one letter at a time. Challenge yourself with daily puzzles and endless mode.',
    applicationCategory: 'GameApplication',
    operatingSystem: 'Any',
    browserRequirements: 'Requires JavaScript. Requires HTML5.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  }

  // VideoGame Schema (more specific for games)
  const videoGameSchema = {
    '@context': 'https://schema.org',
    '@type': 'VideoGame',
    name: 'Word Escalator',
    url: baseUrl,
    description:
      'Transform words one letter at a time in this addictive daily word puzzle game. New puzzle every day!',
    genre: ['Puzzle', 'Word Game', 'Brain Training'],
    gamePlatform: ['Web Browser'],
    playMode: 'SinglePlayer',
    numberOfPlayers: {
      '@type': 'QuantitativeValue',
      value: 1,
    },
    image: `${baseUrl}/word-chain-logo.png`,
    author: {
      '@type': 'Organization',
      name: 'Word Escalator',
      url: baseUrl,
    },
  }

  // FAQPage Schema
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is Word Escalator?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Word Escalator is a daily word ladder puzzle game where you transform a starting word into a target word by changing one letter at a time. Each intermediate step must be a valid English word.',
        },
      },
      {
        '@type': 'Question',
        name: 'How do you play Word Escalator?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Start with the given word and change one letter at a time to create new valid words. Continue until you reach the target word. Try to complete the puzzle in as few moves as possible to match the optimal solution.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is Word Escalator free to play?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, Word Escalator is completely free to play. A new puzzle is available every day, and you can also play unlimited puzzles in endless mode.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is a word ladder puzzle?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'A word ladder (also known as doublets, word-links, or word golf) is a word game invented by Lewis Carroll where players transform one word into another by changing a single letter at each step, with each intermediate step being a valid word.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is there a new puzzle every day?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes! Word Escalator features a new daily puzzle that is the same for all players. You can also play unlimited puzzles in endless mode with adjustable difficulty levels.',
        },
      },
    ],
  }

  // HowTo Schema
  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Play Word Escalator',
    description:
      'Learn how to play the Word Escalator word ladder puzzle game.',
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Start with the given word',
        text: 'Look at the starting word displayed at the top of the puzzle.',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Change one letter',
        text: 'Type a new word that differs from the current word by exactly one letter.',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Form valid words',
        text: 'Each word you enter must be a valid English word.',
      },
      {
        '@type': 'HowToStep',
        position: 4,
        name: 'Reach the target',
        text: 'Continue changing one letter at a time until you reach the target word.',
      },
      {
        '@type': 'HowToStep',
        position: 5,
        name: 'Match the optimal',
        text: 'Try to complete the puzzle in as few moves as possible to match the optimal solution.',
      },
    ],
    totalTime: 'PT5M',
  }

  // Organization Schema
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Word Escalator',
    url: baseUrl,
    logo: `${baseUrl}/word-chain-logo.png`,
  }

  // BreadcrumbList Schema
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: baseUrl,
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(webApplicationSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(videoGameSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(howToSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />
    </>
  )
}
