import { API_URL } from '../config';

export const AuthService = {
    /**
     * Request SMS code for phone number
     */
    /**
     * Request SMS/Email code
     */
    async sendCode(data: { phone?: string; email?: string }): Promise<{ success: boolean; message?: string; debugCode?: string }> {
        const response = await fetch(`${API_URL}/auth/send-code`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return response.json();
    },

    /**
     * Verify SMS/Email code and get auth token
     */
    async verifyCode(data: { phone?: string; email?: string; code: string }): Promise<{
        success: boolean;
        token?: string;
        user?: {
            id: string;
            phone: string;
            email: string;
            firstName: string;
            lastName: string;
            role: string;
        };
        error?: string;
    }> {
        const response = await fetch(`${API_URL}/auth/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
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
