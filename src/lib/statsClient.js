/**
 * Stats API Client for Daily Games
 *
 * Tracks game sessions, events, and user stats.
 * Uses anonymous authentication via device ID stored in localStorage.
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
 */
export function getDeviceId() {
  let deviceId = localStorage.getItem(DEVICE_ID_KEY);
  if (!deviceId) {
    deviceId = generateUUID();
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }
  return deviceId;
}

/**
 * Make an authenticated API request
 */
async function apiRequest(endpoint, options = {}) {
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
    throw new Error(error.error || `API error: ${response.status}`);
  }

  return response.json();
}

/**
 * Record a game session completion
 *
 * @param {Object} params
 * @param {string} params.gameType - One of: color_guessing, rotary_words, scroggle, word_chain
 * @param {string} params.gameMode - One of: daily, unlimited, warmup, endless, hex
 * @param {number} params.score - Game score
 * @param {string} params.result - One of: completed, gave_up, in_progress
 * @param {number} params.durationSeconds - Time taken in seconds
 * @param {number} params.puzzleNumber - Puzzle identifier
 * @param {string} params.puzzleDate - Date in YYYY-MM-DD format (required for daily mode)
 * @param {Object} params.metadata - Game-specific data
 * @returns {Promise<Object>} Session result with streak info
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
  // Validate required fields
  if (!gameType) {
    throw new Error('gameType is required');
  }

  if (gameMode === 'daily' && !puzzleDate) {
    throw new Error('puzzleDate is required for daily mode');
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

  try {
    const response = await apiRequest(`/api/games/${gameType}/sessions`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return response;
  } catch (error) {
    // Don't throw on 409 (already played) - just log and return null
    if (error.message.includes('already played')) {
      console.log('Stats: Daily puzzle already recorded');
      return null;
    }
    console.error('Stats: Failed to record session:', error);
    throw error;
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
  if (!eventType) {
    throw new Error('eventType is required');
  }

  const payload = {
    event_type: eventType,
    metadata,
  };

  if (gameType) {
    payload.game_type = gameType;
  }

  try {
    await apiRequest('/api/events', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  } catch (error) {
    // Don't throw for event tracking failures
    console.error('Stats: Failed to track event:', error);
  }
}

/**
 * Track multiple events at once
 *
 * @param {Array<Object>} events - Array of event objects
 */
export async function trackEventsBatch(events) {
  if (!Array.isArray(events) || events.length === 0) {
    return;
  }

  try {
    await apiRequest('/api/events/batch', {
      method: 'POST',
      body: JSON.stringify({ events }),
    });
  } catch (error) {
    console.error('Stats: Failed to track events batch:', error);
  }
}

/**
 * Get user stats across all games
 *
 * @returns {Promise<Object>} User stats
 */
export async function getUserStats() {
  const deviceId = getDeviceId();
  return apiRequest(`/api/users/${deviceId}/stats`);
}

/**
 * Get user's streak for a specific game
 *
 * @param {string} gameType - Game type
 * @returns {Promise<Object>} Streak info
 */
export async function getStreak(gameType) {
  const deviceId = getDeviceId();
  return apiRequest(`/api/games/${gameType}/streaks/${deviceId}`);
}

/**
 * Get leaderboard for a game
 *
 * @param {string} gameType - Game type
 * @param {Object} params - Query params
 * @param {string} params.period - daily, weekly, monthly, all_time
 * @param {number} params.limit - Max entries
 * @returns {Promise<Object>} Leaderboard data
 */
export async function getLeaderboard(gameType, { period = 'daily', limit = 100 } = {}) {
  return apiRequest(`/api/games/${gameType}/leaderboard?period=${period}&limit=${limit}`);
}

/**
 * Get streak leaderboard for a game
 *
 * @param {string} gameType - Game type
 * @param {number} limit - Max entries
 * @returns {Promise<Object>} Streak leaderboard data
 */
export async function getStreakLeaderboard(gameType, limit = 100) {
  return apiRequest(`/api/games/${gameType}/leaderboard/streaks?limit=${limit}`);
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
