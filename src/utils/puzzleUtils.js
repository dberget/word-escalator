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