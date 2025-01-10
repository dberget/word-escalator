const fs = require('fs');
const https = require('https');

// Fetch words from URL
const url = 'https://raw.githubusercontent.com/dolph/dictionary/refs/heads/master/popular.txt';

https.get(url, (resp) => {
    let data = '';

    resp.on('data', (chunk) => {
        data += chunk;
    });

    resp.on('end', () => {
        // Process the word list
        const wordList = data
            .split('\n')
            .map(word => word.trim())
            .filter(word => word); // Remove empty lines

        // Extract 4 and 5 letter words
        const wordsByLength = {
            fourLetters: [],
            fiveLetters: []
        };

        wordList.forEach(word => {
            // Convert to lowercase and remove any whitespace
            const cleanWord = word.toLowerCase().trim();

            // Sort into appropriate length category
            if (cleanWord.length === 4) {
                wordsByLength.fourLetters.push(cleanWord);
            } else if (cleanWord.length === 5) {
                wordsByLength.fiveLetters.push(cleanWord);
            }
        });

        // Add metadata
        const outputData = {
            metadata: {
                source: url,
                totalWords: wordList.length,
                fourLetterCount: wordsByLength.fourLetters.length,
                fiveLetterCount: wordsByLength.fiveLetters.length,
                lastUpdated: new Date().toISOString()
            },
            words: wordsByLength
        };

        // Save to JSON file
        fs.writeFileSync(
            'popular_word_list.json',
            JSON.stringify(outputData, null, 2),
            'utf8'
        );

        // Log stats
        console.log(`Total words processed: ${wordList.length}`);
        console.log(`4-letter words found: ${wordsByLength.fourLetters.length}`);
        console.log(`5-letter words found: ${wordsByLength.fiveLetters.length}`);
    });

}).on("error", (err) => {
    console.log("Error fetching word list: " + err.message);
});
