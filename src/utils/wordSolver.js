/**
 * Finds the shortest path between two words, changing one letter at a time
 * @param {string} startWord - The starting word
 * @param {string} targetWord - The target word
 * @param {Set<string>} validWords - Set of valid words
 * @returns {string[]} Array of words representing the solution path, or empty array if no solution
 */
export function findWordPath(startWord, targetWord, validWords) {
    // If words are not the same length, no solution is possible
    if (startWord.length !== targetWord.length) return [];

    // Queue for BFS: each entry is [word, path to word]
    const queue = [[startWord, [startWord]]];
    // Keep track of visited words to avoid cycles
    const visited = new Set([startWord]);

    while (queue.length > 0) {
        const [currentWord, currentPath] = queue.shift();

        // If we found the target word, return the path
        if (currentWord === targetWord) {
            return currentPath;
        }

        // Try changing each letter position
        for (let i = 0; i < currentWord.length; i++) {
            // Try each letter of the alphabet
            for (let j = 65; j <= 90; j++) {
                const newLetter = String.fromCharCode(j);
                const newWord =
                    currentWord.slice(0, i) +
                    newLetter +
                    currentWord.slice(i + 1);

                // Check if it's a valid word and we haven't visited it
                if (validWords.has(newWord) && !visited.has(newWord)) {
                    visited.add(newWord);
                    queue.push([newWord, [...currentPath, newWord]]);
                }
            }
        }
    }

    // If we get here, no solution was found
    return [];
}

/**
 * Finds the word that requires the most moves to reach from a starting word
 * @param {string} startWord - The starting word
 * @param {Set<string>} validWords - Set of valid words
 * @returns {Object} Object containing the hardest word and the path to reach it
 */
export function findHardestWord(startWord, validWords) {
    // Only consider words of the same length
    const sameLength = Array.from(validWords).filter(w => w.length === startWord.length);

    let hardestWord = {
        word: startWord,
        path: [startWord],
        distance: 0
    };

    // Use BFS to find all reachable words and their distances
    const visited = new Map(); // Maps words to their distances
    const paths = new Map();   // Maps words to their paths
    const queue = [[startWord, [startWord]]];
    visited.set(startWord, 0);
    paths.set(startWord, [startWord]);

    while (queue.length > 0) {
        const [currentWord, currentPath] = queue.shift();
        const currentDistance = visited.get(currentWord);

        // If this is the farthest word we've found, update hardestWord
        if (currentDistance > hardestWord.distance) {
            hardestWord = {
                word: currentWord,
                path: currentPath,
                distance: currentDistance
            };
        }

        // Try changing each letter position
        for (let i = 0; i < currentWord.length; i++) {
            for (let j = 65; j <= 90; j++) {
                const newLetter = String.fromCharCode(j);
                const newWord =
                    currentWord.slice(0, i) +
                    newLetter +
                    currentWord.slice(i + 1);

                // Check if it's a valid word and we haven't visited it
                if (validWords.has(newWord) && !visited.has(newWord)) {
                    visited.set(newWord, currentDistance + 1);
                    paths.set(newWord, [...currentPath, newWord]);
                    queue.push([newWord, [...currentPath, newWord]]);
                }
            }
        }
    }

    return hardestWord;
} 