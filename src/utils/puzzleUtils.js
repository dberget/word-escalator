/**
 * Mulberry32 seeded PRNG - produces deterministic random numbers from a seed
 * @param {number} seed - Integer seed value
 * @returns {function} Function that returns random number between 0 and 1
 */
export function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Convert a date string to a numeric seed using djb2 hash algorithm
 * @param {string} dateString - Date string like "2024-3-20"
 * @returns {number} Positive integer seed
 */
export function dateToSeed(dateString) {
  let hash = 5381;
  for (let i = 0; i < dateString.length; i++) {
    const char = dateString.charCodeAt(i);
    hash = (hash << 5) + hash + char; // hash * 33 + char
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Get local date string in YYYY-M-D format
 * @param {Date} date - Date object (defaults to now)
 * @returns {string} Local date string
 */
export function getLocalDateString(date = new Date()) {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

export const generateNewPuzzle = async (startWord, difficulty) => {
    try {
        const response = await fetch('/api/generate-puzzle', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                startWord: startWord.toLowerCase(),
                currentDifficulty: difficulty,
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to generate puzzle');
        }

        return await response.json();
    } catch (error) {
        console.error('Error generating puzzle:', error);
        throw error;
    }
}; 