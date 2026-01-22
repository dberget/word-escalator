/**
 * Streak Store - Shared library for tracking user streaks across daily games
 *
 * Stores both per-game and global (cross-game) streak data in localStorage.
 * Designed for future backend sync capability.
 */

const STORAGE_KEY = 'daily-games-streaks';
const STORAGE_VERSION = 1;

/**
 * Get today's date as YYYY-MM-DD string in local timezone
 */
function getTodayString() {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

/**
 * Get yesterday's date as YYYY-MM-DD string in local timezone
 */
function getYesterdayString() {
  const now = new Date();
  now.setDate(now.getDate() - 1);
  return now.toISOString().split('T')[0];
}

/**
 * Create empty streak data structure for a game or global
 */
function createEmptyStreakData() {
  return {
    currentStreak: 0,
    maxStreak: 0,
    totalDaysPlayed: 0,
    lastPlayedDate: null,
    playedDates: []
  };
}

/**
 * Create the full data structure with version
 */
function createEmptyStore() {
  return {
    version: STORAGE_VERSION,
    global: createEmptyStreakData(),
    games: {}
  };
}

/**
 * Load streak data from localStorage
 */
function getStreakData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return createEmptyStore();
    }
    const data = JSON.parse(raw);

    // Handle version migrations here in the future
    if (!data.version || data.version < STORAGE_VERSION) {
      // Future: migrate old data
      data.version = STORAGE_VERSION;
    }

    return data;
  } catch {
    return createEmptyStore();
  }
}

/**
 * Save streak data to localStorage
 */
function saveStreakData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

/**
 * Update streak data for a single entry (game or global)
 * @param {Object} entry - The streak entry to update
 * @param {string} today - Today's date string
 * @param {string} yesterday - Yesterday's date string
 * @returns {Object} Updated entry
 */
function updateStreakEntry(entry, today, yesterday) {
  // Already played today - no change needed
  if (entry.lastPlayedDate === today) {
    return entry;
  }

  // Calculate new streak
  let newStreak;
  if (entry.lastPlayedDate === yesterday) {
    // Consecutive day - increment streak
    newStreak = entry.currentStreak + 1;
  } else {
    // Gap in days or first play - start fresh
    newStreak = 1;
  }

  // Update max streak if needed
  const newMaxStreak = Math.max(entry.maxStreak, newStreak);

  // Add today to played dates if not already there
  const playedDates = entry.playedDates.includes(today)
    ? entry.playedDates
    : [...entry.playedDates, today];

  return {
    currentStreak: newStreak,
    maxStreak: newMaxStreak,
    totalDaysPlayed: playedDates.length,
    lastPlayedDate: today,
    playedDates
  };
}

/**
 * Record a win/completion for a game
 * Updates both game-specific and global streaks
 * @param {string} gameType - The game identifier (e.g., 'hexguess', 'dial-words')
 * @returns {Object} Updated streak data for the game
 */
function recordWin(gameType) {
  const data = getStreakData();
  const today = getTodayString();
  const yesterday = getYesterdayString();

  // Ensure game entry exists
  if (!data.games[gameType]) {
    data.games[gameType] = createEmptyStreakData();
  }

  // Update game-specific streak
  data.games[gameType] = updateStreakEntry(data.games[gameType], today, yesterday);

  // Update global streak (any game played counts)
  data.global = updateStreakEntry(data.global, today, yesterday);

  saveStreakData(data);

  return data.games[gameType];
}

/**
 * Get streak data for a specific game
 * @param {string} gameType - The game identifier
 * @returns {Object} Streak data { currentStreak, maxStreak, totalDaysPlayed, lastPlayedDate }
 */
function getGameStreak(gameType) {
  const data = getStreakData();
  const gameData = data.games[gameType] || createEmptyStreakData();

  // Return without playedDates for simpler API
  const { playedDates, ...stats } = gameData;
  return stats;
}

/**
 * Get global (cross-game) streak data
 * @returns {Object} Streak data { currentStreak, maxStreak, totalDaysPlayed, lastPlayedDate }
 */
function getGlobalStreak() {
  const data = getStreakData();
  const { playedDates, ...stats } = data.global;
  return stats;
}

/**
 * Check if a specific game has been played today
 * @param {string} gameType - The game identifier
 * @returns {boolean}
 */
function hasPlayedToday(gameType) {
  const data = getStreakData();
  const gameData = data.games[gameType];
  return gameData?.lastPlayedDate === getTodayString();
}

/**
 * Check if any game has been played today
 * @returns {boolean}
 */
function hasPlayedAnyToday() {
  const data = getStreakData();
  return data.global.lastPlayedDate === getTodayString();
}

/**
 * Get all played dates for a specific game
 * @param {string} gameType - The game identifier
 * @returns {string[]} Array of date strings in YYYY-MM-DD format, sorted descending
 */
function getPlayedDates(gameType) {
  const data = getStreakData();
  const gameData = data.games[gameType];
  if (!gameData) return [];
  return [...gameData.playedDates].sort().reverse();
}

/**
 * Get all played dates across all games
 * @returns {string[]} Array of date strings in YYYY-MM-DD format, sorted descending
 */
function getAllPlayedDates() {
  const data = getStreakData();
  return [...data.global.playedDates].sort().reverse();
}

/**
 * Get all games with streak data
 * @returns {string[]} Array of game type identifiers
 */
function getTrackedGames() {
  const data = getStreakData();
  return Object.keys(data.games);
}

/**
 * Get full streak data for all games
 * @returns {Object} Map of gameType -> streak stats
 */
function getAllGameStreaks() {
  const data = getStreakData();
  const result = {};
  for (const [gameType, gameData] of Object.entries(data.games)) {
    const { playedDates, ...stats } = gameData;
    result[gameType] = stats;
  }
  return result;
}

// Export all functions as a store object
export const streakStore = {
  recordWin,
  getGameStreak,
  getGlobalStreak,
  hasPlayedToday,
  hasPlayedAnyToday,
  getPlayedDates,
  getAllPlayedDates,
  getTrackedGames,
  getAllGameStreaks
};

export default streakStore;
