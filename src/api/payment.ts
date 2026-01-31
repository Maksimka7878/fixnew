import axios from 'axios';

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
            const response = await axios.post<CreatePaymentResponse>(`${API_URL}/payment/create`, {
                amount,
                description,
                returnUrl,
            });
            return response.data;
        } catch (error) {
            console.error('Payment creation failed:', error);
            throw error;
        }
    },
};
