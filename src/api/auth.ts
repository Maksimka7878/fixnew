const API_URL = 'http://localhost:3001/api';

export const AuthService = {
    /**
     * Request SMS code for phone number
     */
    async sendCode(phone: string): Promise<{ success: boolean; debugCode?: string }> {
        const response = await fetch(`${API_URL}/auth/send-code`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone }),
        });
        return response.json();
    },

    /**
     * Verify SMS code and get auth token
     */
    async verifyCode(phone: string, code: string): Promise<{
        success: boolean;
        token?: string;
        user?: {
            id: string;
            phone: string;
            firstName: string;
            lastName: string;
            role: string;
        };
        error?: string;
    }> {
        const response = await fetch(`${API_URL}/auth/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone, code }),
        });
        return response.json();
    },

    /**
     * Update user profile
     */
    async updateProfile(id: string, data: { firstName?: string; lastName?: string; email?: string }): Promise<{ success: boolean; user?: any }> {
        const response = await fetch(`${API_URL}/auth/profile`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, ...data }),
        });
        return response.json();
    },
};
