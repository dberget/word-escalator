/**
 * Stats API Client for Daily Games
 *
 * Tracks game sessions, events, and user stats.
 * Uses anonymous authentication via device ID stored in localStorage.
 *
 * IMPORTANT: All methods fail silently to never crash the game.
 */

const API_BASE_URL = 'https://api.play-wordfall.com';
const DEVICE_ID_KEY = 'daily-games-device-id';

/**
 * Generate a UUID v4
 */
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Get or create a device ID for this browser
 * Returns null if localStorage is unavailable
 */
export function getDeviceId() {
  try {
    let deviceId = localStorage.getItem(DEVICE_ID_KEY);
    if (!deviceId) {
      deviceId = generateUUID();
      localStorage.setItem(DEVICE_ID_KEY, deviceId);
    }
    return deviceId;
  } catch (error) {
    // localStorage unavailable (private browsing, etc.)
    console.warn('Stats: localStorage unavailable, using session-only ID');
    return generateUUID();
  }
}

/**
 * Make an authenticated API request
 * Returns null on any error
 */
async function apiRequest(endpoint, options = {}) {
  try {
    const deviceId = getDeviceId();

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'X-Device-ID': deviceId,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.warn('Stats API error:', error.error || response.status);
      return null;
    }

    return response.json();
  } catch (error) {
    console.warn('Stats: Network error:', error.message);
    return null;
  }
}

/**
 * Record a game session completion
 *
 * @param {Object} params
 * @param {string} params.gameType - Game identifier (e.g., hexguess, dial-words)
 * @param {string} params.gameMode - One of: daily, unlimited, warmup, endless, hex
 * @param {number} params.score - Game score
 * @param {string} params.result - One of: completed, gave_up, in_progress
 * @param {number} params.durationSeconds - Time taken in seconds
 * @param {number} params.puzzleNumber - Puzzle identifier
 * @param {string} params.puzzleDate - Date in YYYY-MM-DD format (required for daily mode)
 * @param {Object} params.metadata - Game-specific data
 * @returns {Promise<Object|null>} Session result with streak info, or null on error
 */
export async function recordGameSession({
  gameType,
  gameMode = 'daily',
  score = 0,
  result = 'completed',
  durationSeconds,
  puzzleNumber,
  puzzleDate,
  metadata = {},
}) {
  try {
    // Validate required fields
    if (!gameType) {
      console.warn('Stats: gameType is required');
      return null;
    }

    if (gameMode === 'daily' && !puzzleDate) {
      console.warn('Stats: puzzleDate is required for daily mode');
      return null;
    }

    const payload = {
      game_type: gameType,
      game_mode: gameMode,
      score,
      result,
      metadata,
    };

    if (durationSeconds !== undefined) {
      payload.duration_seconds = durationSeconds;
    }
    if (puzzleNumber !== undefined) {
      payload.puzzle_number = puzzleNumber;
    }
    if (puzzleDate) {
      payload.puzzle_date = puzzleDate;
    }

    return await apiRequest(`/api/games/${gameType}/sessions`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.warn('Stats: Failed to record session:', error.message);
    return null;
  }
}

/**
 * Track a single analytics event
 *
 * @param {Object} params
 * @param {string} params.eventType - Event name
 * @param {string} params.gameType - Optional game type
 * @param {Object} params.metadata - Optional event data
 */
export async function trackEvent({ eventType, gameType, metadata = {} }) {
  try {
    if (!eventType) {
      return;
    }

    const payload = {
      event_type: eventType,
      metadata,
    };

    if (gameType) {
      payload.game_type = gameType;
    }

    await apiRequest('/api/events', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  } catch (error) {
    // Silently fail
  }
}

/**
 * Track multiple events at once
 *
 * @param {Array<Object>} events - Array of event objects
 */
export async function trackEventsBatch(events) {
  try {
    if (!Array.isArray(events) || events.length === 0) {
      return;
    }

    await apiRequest('/api/events/batch', {
      method: 'POST',
      body: JSON.stringify({ events }),
    });
  } catch (error) {
    // Silently fail
  }
}

/**
 * Get user stats across all games
 *
 * @returns {Promise<Object|null>} User stats or null on error
 */
export async function getUserStats() {
  try {
    const deviceId = getDeviceId();
    return await apiRequest(`/api/users/${deviceId}/stats`);
  } catch (error) {
    return null;
  }
}

/**
 * Get user's streak for a specific game
 *
 * @param {string} gameType - Game type
 * @returns {Promise<Object|null>} Streak info or null on error
 */
export async function getStreak(gameType) {
  try {
    const deviceId = getDeviceId();
    return await apiRequest(`/api/games/${gameType}/streaks/${deviceId}`);
  } catch (error) {
    return null;
  }
}

/**
 * Get leaderboard for a game
 *
 * @param {string} gameType - Game type
 * @param {Object} params - Query params
 * @param {string} params.period - daily, weekly, monthly, all_time
 * @param {number} params.limit - Max entries
 * @returns {Promise<Object|null>} Leaderboard data or null on error
 */
export async function getLeaderboard(gameType, { period = 'daily', limit = 100 } = {}) {
  try {
    return await apiRequest(`/api/games/${gameType}/leaderboard?period=${period}&limit=${limit}`);
  } catch (error) {
    return null;
  }
}

/**
 * Get streak leaderboard for a game
 *
 * @param {string} gameType - Game type
 * @param {number} limit - Max entries
 * @returns {Promise<Object|null>} Streak leaderboard data or null on error
 */
export async function getStreakLeaderboard(gameType, limit = 100) {
  try {
    return await apiRequest(`/api/games/${gameType}/leaderboard/streaks?limit=${limit}`);
  } catch (error) {
    return null;
  }
}

/**
 * Helper to get today's date in YYYY-MM-DD format
 */
export function getTodayDate() {
  return new Date().toISOString().split('T')[0];
}

/**
 * Create a stats client instance pre-configured for a specific game
 *
 * @param {string} gameType - Game type
 * @returns {Object} Stats client methods for this game
 */
export function createGameStatsClient(gameType) {
  return {
    getDeviceId,
    getTodayDate,

    recordSession: (params) => recordGameSession({ ...params, gameType }),
    trackEvent: (eventType, metadata = {}) => trackEvent({ eventType, gameType, metadata }),
    getStats: getUserStats,
    getStreak: () => getStreak(gameType),
    getLeaderboard: (params) => getLeaderboard(gameType, params),
    getStreakLeaderboard: (limit) => getStreakLeaderboard(gameType, limit),
  };
}

// Export a default instance for convenience
export default {
  getDeviceId,
  getTodayDate,
  recordGameSession,
  trackEvent,
  trackEventsBatch,
  getUserStats,
  getStreak,
  getLeaderboard,
  getStreakLeaderboard,
  createGameStatsClient,
};
