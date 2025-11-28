export class RewardsApiClient {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    }

    async createUser(email) {
        const response = await fetch(`${this.baseUrl}/api/users/signup`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ user: { email } }),
        });

        if (!response.ok) {
            throw await response.json();
        }

        return response.json();
    }

    async createAnonymousUser() {
        const response = await fetch(`${this.baseUrl}/api/users/anonymous`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw await response.json();
        }

        return response.json();
    }

    async awardPoints(userId, activityId) {
        const response = await fetch(`${this.baseUrl}/api/rewards/award`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                user_id: userId,
                activity_id: activityId,
            }),
        });

        if (!response.ok) {
            throw await response.json();
        }

        return response.json();
    }
}

// Create and export a singleton instance
export const rewardsApi = new RewardsApiClient(
    "http://localhost:4000"
); 