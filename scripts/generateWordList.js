const fs = require('fs');
const path = require('path');

// Get the word list from node_modules
const wordlistPath = path.join(__dirname, '../node_modules/word-list/words.txt');

// Read the word list
const words = fs.readFileSync(wordlistPath, 'utf8').split('\n');
const fourLetterWords = words
    .filter(word => word.length <= 5 && word.length >= 4)
    .map(word => word.toUpperCase());

// Ensure the utils directory exists
const utilsDir = path.join(__dirname, '../src/utils');
if (!fs.existsSync(utilsDir)) {
    fs.mkdirSync(utilsDir, { recursive: true });
}

// Write the filtered word list
fs.writeFileSync(
    path.join(utilsDir, 'validWords.json'),
    JSON.stringify(fourLetterWords)
);

console.log(`Generated ${fourLetterWords.length} four-letter words`); 