const WEBHOOKS = {
    PUZZLE_COMPLETION: "https://discord.com/api/webhooks/1072731926860923021/J05_RRh-dEYU1tSczq64AIniMbL_vRrgJYc4-uU4VGqsx2344XYRbzDHJOQws-jXVI0T"
    // Add more webhook URLs here as needed
};

/**
 * Sends a notification to Discord via webhook
 * @param {string} content - The message content to send
 * @param {Object} options - Additional options for the webhook
 * @param {string} options.webhookType - The type of webhook to use (defaults to PUZZLE_COMPLETION)
 * @param {boolean} options.includeTimestamp - Whether to include timestamp (defaults to true)
 * @returns {Promise} - Resolution/rejection of the fetch request
 */
export const sendDiscordNotification = async (content, options = {}) => {
    const {
        webhookType = 'PUZZLE_COMPLETION',
        includeTimestamp = true
    } = options;

    const webhookUrl = WEBHOOKS[webhookType];

    console.log('webhookUrl', webhookUrl);

    if (!webhookUrl) {
        console.warn(`No webhook URL found for type: ${webhookType}`);
        return;
    }

    const payload = {
        content: includeTimestamp
            ? `${content}\n_${new Date().toISOString()}_`
            : content,
    };

    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        console.log('sendDiscordNotification response', response);

        if (!response.ok) {
            throw new Error(`Discord webhook failed with status ${response.status}`);
        }

        return response;
    } catch (error) {
        console.error('Failed to send Discord notification:', error);
        // Optionally rethrow the error if you want to handle it upstream
        // throw error;
    }
};

/**
 * Formats and sends a puzzle completion notification
 * @param {Object} data - The puzzle completion data
 * @param {number} data.moves - Number of moves taken
 * @param {string} data.difficulty - Difficulty level of the puzzle
 * @param {string} data.startWord - Starting word
 * @param {string} data.endWord - Target word
 * @param {boolean} data.isGivenUp - Whether player gave up
 * @param {string} data.gameMode - Game mode (WARMUP/DAILY/ENDLESS)
 */
export const notifyPuzzleCompletion = async (data) => {
    console.log('notifyPuzzleCompletion', data);
    const {
        moves,
        difficulty,
        startWord,
        endWord,
        isGivenUp,
        gameMode
    } = data;

    const emoji = isGivenUp ? '🏳️' : '🎯';

    const inDev = process.env.NODE_ENV === 'development';

    if (inDev) {
        return;
    }

    const message = [
        `${emoji} Word Escalator Completion!`,
        `${startWord} ➜ ${endWord}`,
        `Moves: ${moves}`,
        `Difficulty: ${difficulty.toUpperCase()}`,
        `${isGivenUp ? 'Gave up' : 'Completed'}`,
        `Game mode: ${gameMode}`
    ].filter(Boolean).join('\n');

    return sendDiscordNotification(message);
};

// Example usage in your game component:
// 
// import { notifyPuzzleCompletion } from '@/utils/discord';
//
// // When puzzle is completed:
// await notifyPuzzleCompletion({
//   playerName: 'Player123',
//   attempts: 4,
//   score: 2500,
//   brandName: 'Coca-Cola',
//   isExactMatch: true,
//   streak: 5
// }); 