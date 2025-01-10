const fs = require('fs');
const path = require('path');

// Add this function to load words from popular_word_list.json
function loadPopularWordList() {
    try {
        const filePath = path.join(__dirname, '..', 'popular_word_list.json');
        const data = fs.readFileSync(filePath, 'utf8');
        const wordList = JSON.parse(data);

        // For our puzzle generator, we only want 4-letter words
        return new Set(wordList.words.fourLetters.map(word => word.toUpperCase()));
    } catch (error) {
        console.error('Error loading popular word list:', error);
        return new Set(); // Return empty set if file can't be loaded
    }
}

// Update the word list reference to use the popular word list
const wordList = Array.from(loadPopularWordList());

// Add validation to ensure we have words to work with
if (wordList.length === 0) {
    console.error('No words loaded from popular word list!');
    process.exit(1);
}

// Log some stats about the loaded words
console.log(`Loaded ${wordList.length} four-letter words from popular word list`);

function getNeighbors(word) {
    const neighbors = new Set();
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    for (let i = 0; i < word.length; i++) {
        for (let letter of alphabet) {
            const newWord = word.slice(0, i) + letter + word.slice(i + 1);
            if (wordList.includes(newWord) && newWord !== word) {
                neighbors.add(newWord);
            }
        }
    }
    return neighbors;
}

function findWordPath(start, end, validWords) {
    if (start === end) return [start];

    const queue = [[start]];
    const visited = new Set([start]);

    while (queue.length > 0) {
        const path = queue.shift();
        const currentWord = path[path.length - 1];

        const neighbors = getNeighbors(currentWord);
        for (const neighbor of neighbors) {
            if (!visited.has(neighbor)) {
                visited.add(neighbor);
                const newPath = [...path, neighbor];
                if (neighbor === end) return newPath;
                queue.push(newPath);
            }
        }
    }
    return [];
}

// Rename generatePuzzleList to generateNewPuzzles and modify it to return the puzzles
function generateNewPuzzles() {
    const puzzles = [];
    const formattedPuzzles = { easy: [], medium: [], hard: [], impossible: [] };

    const getDifficulty = (pathLength) => {
        if (pathLength <= 3) return 'easy';
        if (pathLength <= 5) return 'medium';
        if (pathLength <= 9) return 'hard';
        return 'impossible';
    };

    while (puzzles.length < 1000) {
        console.log(`Generating puzzle ${puzzles.length + 1}/1000`);
        const start = wordList[Math.floor(Math.random() * wordList.length)];
        const end = wordList[Math.floor(Math.random() * wordList.length)];

        if (start === end || puzzles.some(p => p.start === start && p.end === end)) {
            continue;
        }

        const solution = findWordPath(start, end, new Set(wordList));

        if (solution.length > 0) {
            const puzzle = {
                start,
                end,
                solution,
                difficulty: getDifficulty(solution.length),
                moves: solution.length - 1
            };
            puzzles.push(puzzle);
            formattedPuzzles[puzzle.difficulty].push(puzzle);
        }
    }

    return formattedPuzzles;
}

// Read existing puzzle data
function readExistingPuzzles() {
    try {
        const data = fs.readFileSync('src/data/puzzleData.js', 'utf8');
        // Extract the JSON part from the JS file - make more robust
        const match = data.match(/puzzleData\s*=\s*({[\s\S]*?});/);
        if (!match) {
            throw new Error('Could not parse puzzle data format');
        }
        return JSON.parse(match[1]);
    } catch (error) {
        console.log('No existing puzzles found or error reading file:', error);
        return { easy: [], medium: [], hard: [] };
    }
}

// Append new puzzles to existing ones
function appendNewPuzzles(existingPuzzles, newPuzzles) {
    // Validate input objects
    if (!existingPuzzles || !newPuzzles) {
        throw new Error('Missing puzzle data');
    }

    // Ensure all difficulty levels exist
    ['easy', 'medium', 'hard', 'impossible'].forEach(difficulty => {
        existingPuzzles[difficulty] = existingPuzzles[difficulty] || [];
        newPuzzles[difficulty] = newPuzzles[difficulty] || [];
    });

    // Create sets of existing puzzle signatures to avoid duplicates
    const existingSignatures = {
        easy: new Set(existingPuzzles.easy.map(p => `${p.start}-${p.end}`)),
        medium: new Set(existingPuzzles.medium.map(p => `${p.start}-${p.end}`)),
        hard: new Set(existingPuzzles.hard.map(p => `${p.start}-${p.end}`)),
        impossible: new Set(existingPuzzles.impossible.map(p => `${p.start}-${p.end}`))
    };

    let addedCount = 0;
    // Append only unique puzzles
    ['easy', 'medium', 'hard', 'impossible'].forEach(difficulty => {
        newPuzzles[difficulty].forEach(puzzle => {
            if (!puzzle.start || !puzzle.end) {
                console.warn('Invalid puzzle found:', puzzle);
                return;
            }
            const signature = `${puzzle.start}-${puzzle.end}`;
            if (!existingSignatures[difficulty].has(signature)) {
                existingPuzzles[difficulty].push(puzzle);
                existingSignatures[difficulty].add(signature);
                addedCount++;
            }
        });
    });

    console.log(`Added ${addedCount} new unique puzzles`);
    return existingPuzzles;
}

// Save combined puzzles with error handling
function savePuzzles(puzzles) {
    try {
        const fileContent = `// Generated puzzle data
export const puzzleData = ${JSON.stringify(puzzles, null, 2)};

// Helper functions for puzzle management
export const getRandomPuzzle = (difficulty, previousEndWord = null) => {
  const puzzles = puzzleData[difficulty];
  if (previousEndWord) {
    // Find puzzles that start with the previous end word
    const validPuzzles = puzzles.filter(puzzle => puzzle.start === previousEndWord);
    if (validPuzzles.length > 0) {
      return validPuzzles[Math.floor(Math.random() * validPuzzles.length)];
    }
  }
  // Fall back to completely random puzzle if no matching start word found
  return puzzles[Math.floor(Math.random() * puzzles.length)];
};

export const getNextDifficulty = (currentDifficulty) => {
  const difficulties = ['easy', 'medium', 'hard', 'impossible'];
  const currentIndex = difficulties.indexOf(currentDifficulty);
  return difficulties[Math.min(currentIndex + 1, difficulties.length - 1)];
};
`;
        fs.writeFileSync('src/data/puzzleData.js', fileContent, 'utf8');
    } catch (error) {
        console.error('Error saving puzzles:', error);
        throw error;
    }
}

// Main process with error handling
async function generateAndAppendPuzzles() {
    try {
        console.log('Reading existing puzzles...');
        const existingPuzzles = readExistingPuzzles();

        console.log('Generating new puzzles...');
        const newPuzzles = generateNewPuzzles(); // Your existing puzzle generation logic

        console.log('Combining puzzles...');
        const combinedPuzzles = appendNewPuzzles(existingPuzzles, newPuzzles);

        console.log('Saving combined puzzles...');
        savePuzzles(combinedPuzzles);

        // Log statistics
        console.log('\nPuzzle counts after update:');
        console.log(`Easy: ${combinedPuzzles.easy.length}`);
        console.log(`Medium: ${combinedPuzzles.medium.length}`);
        console.log(`Hard: ${combinedPuzzles.hard.length}`);
        console.log(`Impossible: ${combinedPuzzles.impossible.length}`);
    } catch (error) {
        console.error('Error in puzzle generation process:', error);
        process.exit(1);
    }
}

// Start the process
generateAndAppendPuzzles(); 