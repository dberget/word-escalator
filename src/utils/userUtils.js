import { rewardsApi } from './rewardsApi';

const USER_ID_KEY = 'wordEscalator_userId';

export async function getOrCreateUserId() {
    // Check localStorage first
    const existingUserId = localStorage.getItem(USER_ID_KEY);

    // If we have an ID and it's a valid number, return it
    if (existingUserId && !isNaN(existingUserId)) {
        return parseInt(existingUserId, 10);
    }

    try {
        // Only create new anonymous user if we don't have a valid ID
        const { data: user } = await rewardsApi.createAnonymousUser();

        console.log("user", user);
        // Store the new user ID
        localStorage.setItem(USER_ID_KEY, user.id.toString());

        return user.id;
    } catch (error) {
        console.error('Failed to create anonymous user:', error);
        return null;
    }
} 