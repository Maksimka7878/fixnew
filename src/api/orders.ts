const API_URL = 'http://localhost:3001/api';

export interface OrderItem {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    imageUrl?: string;
}

export interface CreateOrderPayload {
    amount: number;
    returnUrl: string;
    user?: {
        id: string;
        phone: string;
    };
    items: OrderItem[];
    shipping?: {
        address: string;
        method: string;
        timeSlot: string;
    };
}

export interface Order {
    id: string;
    user_id: string;
    items: OrderItem[];
    total: number;
    status: string;
    payment_status: string;
    created_at: string;
}

export const OrdersService = {
    /**
     * Create order and initiate payment
     */
    async createOrderWithPayment(payload: CreateOrderPayload): Promise<{
        id: string;
        status: string;
        confirmationUrl: string;
        orderId: string;
    }> {
        const response = await fetch(`${API_URL}/payment/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error('Failed to create order');
        }

        return response.json();
    },

    /**
     * Get user orders from server
     */
    async getMyOrders(userId: string): Promise<Order[]> {
        const response = await fetch(`${API_URL}/orders/my?userId=${userId}`);
        if (!response.ok) {
            return []; // Return empty if not found
        }
        const data = await response.json();
        return data.orders || [];
    },
};
