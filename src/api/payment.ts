// Mock payment service - no external dependencies
const API_URL = 'http://localhost:3001/api';

export interface CreatePaymentResponse {
    id: string;
    status: string;
    confirmationUrl: string;
}

export const PaymentService = {
    /**
     * Creates a payment session with the backend
     * @param amount Total amount to pay
     * @param description Payment description
     * @param returnUrl URL to redirect to after payment (success or failure)
     */
    async createPayment(amount: number, description: string = 'Оплата заказа', returnUrl: string): Promise<CreatePaymentResponse> {
        try {
            const response = await fetch(`${API_URL}/payment/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount, description, returnUrl }),
            });
            if (!response.ok) {
                throw new Error(`Payment API error: ${response.status}`);
            }
            return response.json();
        } catch (error) {
            console.error('Payment creation failed:', error);
            throw error;
        }
    },
};
