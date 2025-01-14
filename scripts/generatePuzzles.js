const fs = require('fs');
const path = require('path');

// Add this function to load words from popular_word_list.json
function loadPopularWordList() {
    try {
        const filePath = path.join(__dirname, '..', 'popular_word_list.json');
        const data = fs.readFileSync(filePath, 'utf8');
        const wordList = JSON.parse(data);

        return {
            fourLetters: new Set(wordList.words.fourLetters.map(word => word.toUpperCase())),
            fiveLetters: new Set(wordList.words.fiveLetters.map(word => word.toUpperCase()))
        };
    } catch (error) {
        console.error('Error loading popular word list:', error);
        return { fourLetters: new Set(), fiveLetters: new Set() };
    }
}

// Update word list handling
const wordLists = loadPopularWordList();
const fourLetterWords = Array.from(wordLists.fourLetters);
const fiveLetterWords = Array.from(wordLists.fiveLetters);

// Validate both word lists
if (fourLetterWords.length === 0 || fiveLetterWords.length === 0) {
    console.error('Missing required word lists!');
    process.exit(1);
}

console.log(`Loaded ${fourLetterWords.length} four-letter words and ${fiveLetterWords.length} five-letter words`);

function getNeighbors(word, wordList) {
    const neighbors = new Set();
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    for (let i = 0; i < word.length; i++) {
        for (let letter of alphabet) {
            const newWord = word.slice(0, i) + letter + word.slice(i + 1);
            if (wordList.has(newWord) && newWord !== word) {
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

        const neighbors = getNeighbors(currentWord, validWords);
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

// Add this function before generateNewPuzzles
function getDifficulty(solutionLength) {
    if (solutionLength < 2) return 'too_easy';
    if (solutionLength <= 3) return 'easy';
    if (solutionLength <= 5) return 'medium';
    if (solutionLength <= 7) return 'hard';
    if (solutionLength <= 10) return 'extreme';
    return 'impossible';
}

// Rename generatePuzzleList to generateNewPuzzles and modify it to return the puzzles
function generateNewPuzzles() {
    const puzzles = {
        fourLetters: { easy: [], medium: [], hard: [], extreme: [], impossible: [] },
        fiveLetters: { easy: [], medium: [], hard: [], extreme: [], impossible: [] }
    };

    ['fourLetters', 'fiveLetters'].forEach(lengthType => {
        const currentWordList = lengthType === 'fourLetters' ? fourLetterWords : fiveLetterWords;
        const targetCount = 10000;
        const generated = new Set();

        // Then continue with random generation for remaining puzzles
        while (generated.size < targetCount) {
            const start = currentWordList[Math.floor(Math.random() * currentWordList.length)];
            const end = currentWordList[Math.floor(Math.random() * currentWordList.length)];
            const signature = `${start}-${end}`;

            if (start === end || generated.has(signature)) {
                continue;
            }

            const solution = findWordPath(start, end, new Set(currentWordList));
            if (solution.length > 0) {
                const difficulty = getDifficulty(solution.length);
                if (difficulty !== 'too_easy') {
                    // Only store start, end, and moves
                    const puzzle = {
                        start,
                        end,
                        moves: solution.length - 1
                    };
                    puzzles[lengthType][difficulty].push(puzzle);
                    generated.add(signature);
                }
            }
        }
    });

    return puzzles;
}

// Read existing puzzle data
function readExistingPuzzles() {
    try {
        const data = fs.readFileSync('src/data/puzzleData.js', 'utf8');
        const match = data.match(/puzzleData\s*=\s*({[\s\S]*?});/);
        if (!match) {
            throw new Error('Could not parse puzzle data format');
        }
        return JSON.parse(match[1]);
    } catch (error) {
        console.log('No existing puzzles found or error reading file:', error);
        return {
            fourLetters: { easy: [], medium: [], hard: [], extreme: [], impossible: [] },
            fiveLetters: { easy: [], medium: [], hard: [], extreme: [], impossible: [] }
        };
    }
}

// Append new puzzles to existing ones
function appendNewPuzzles(existingPuzzles, newPuzzles) {
    if (!existingPuzzles || !newPuzzles) {
        throw new Error('Missing puzzle data');
    }

    ['fourLetters', 'fiveLetters'].forEach(lengthType => {
        existingPuzzles[lengthType] = existingPuzzles[lengthType] || {};

        ['easy', 'medium', 'hard', 'extreme', 'impossible'].forEach(difficulty => {
            existingPuzzles[lengthType][difficulty] = existingPuzzles[lengthType][difficulty] || [];
            newPuzzles[lengthType][difficulty] = newPuzzles[lengthType][difficulty] || [];
        });
    });

    // Create sets of existing puzzle signatures to avoid duplicates
    const existingSignatures = {
        fourLetters: {
            easy: new Set(existingPuzzles.fourLetters.easy.map(p => `${p.start}-${p.end}`)),
            medium: new Set(existingPuzzles.fourLetters.medium.map(p => `${p.start}-${p.end}`)),
            hard: new Set(existingPuzzles.fourLetters.hard.map(p => `${p.start}-${p.end}`)),
            extreme: new Set(existingPuzzles.fourLetters.extreme.map(p => `${p.start}-${p.end}`)),
            impossible: new Set(existingPuzzles.fourLetters.impossible.map(p => `${p.start}-${p.end}`))
        },
        fiveLetters: {
            easy: new Set(existingPuzzles.fiveLetters.easy.map(p => `${p.start}-${p.end}`)),
            medium: new Set(existingPuzzles.fiveLetters.medium.map(p => `${p.start}-${p.end}`)),
            hard: new Set(existingPuzzles.fiveLetters.hard.map(p => `${p.start}-${p.end}`)),
            extreme: new Set(existingPuzzles.fiveLetters.extreme.map(p => `${p.start}-${p.end}`)),
            impossible: new Set(existingPuzzles.fiveLetters.impossible.map(p => `${p.start}-${p.end}`))
        }
    };

    let addedCount = 0;
    // Append only unique puzzles
    ['fourLetters', 'fiveLetters'].forEach(lengthType => {
        ['easy', 'medium', 'hard', 'extreme', 'impossible'].forEach(difficulty => {
            newPuzzles[lengthType][difficulty].forEach(puzzle => {
                if (!puzzle.start || !puzzle.end) {
                    console.warn('Invalid puzzle found:', puzzle);
                    return;
                }
                const signature = `${puzzle.start}-${puzzle.end}`;
                if (!existingSignatures[lengthType][difficulty].has(signature)) {
                    existingPuzzles[lengthType][difficulty].push(puzzle);
                    existingSignatures[lengthType][difficulty].add(signature);
                    addedCount++;
                }
            });
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

// Helper function to get a random puzzle
export const getRandomPuzzle = (wordLength, difficulty) => {
  const lengthKey = wordLength === 4 ? 'fourLetters' : 'fiveLetters';
  const puzzleSet = puzzleData[lengthKey][difficulty];
  return puzzleSet[Math.floor(Math.random() * puzzleSet.length)];
};

export function getNextDifficulty(currentDifficulty) {
  const difficulties = ['easy', 'medium', 'hard'];
  const currentIndex = difficulties.indexOf(currentDifficulty);
  if (currentIndex === -1 || currentIndex === difficulties.length - 1) {
    return null;
  }
  return difficulties[currentIndex + 1];
}
`;
        fs.writeFileSync('src/data/puzzleData.js', fileContent, 'utf8');
    } catch (error) {
        console.error('Error saving puzzles:', error);
        throw error;
    }
}

// Update the main process function to remove daily puzzle generation
async function generateAndSavePuzzles() {
    try {
        console.log('Reading existing puzzles...');
        const existingPuzzles = readExistingPuzzles();

        console.log('Generating new puzzles...');
        const newPuzzles = generateNewPuzzles();

        console.log('Combining puzzles...');
        const combinedPuzzles = appendNewPuzzles(existingPuzzles, newPuzzles);

        console.log('Saving puzzles...');
        savePuzzles(combinedPuzzles);

        // Log statistics
        console.log('\nRegular Puzzle counts:');
        ['fourLetters', 'fiveLetters'].forEach(length => {
            console.log(`\n${length}:`);
            ['easy', 'medium', 'hard'].forEach(diff => {
                console.log(`${diff}: ${combinedPuzzles[length][diff].length}`);
            });
        });
    } catch (error) {
        console.error('Error in puzzle generation process:', error);
        process.exit(1);
    }
}

// Start the process
generateAndSavePuzzles(); 