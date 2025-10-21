import api from './auth';

export interface CheckoutSession {
  id: string;
  sessionId: string;
  product: {
    id: string;
    name: string;
    description?: string;
    price: number;
    images: string[];
    shop: {
      name: string;
      logo?: string;
    };
    productType: 'physical' | 'digital';
    requiresShipping: boolean;
  };
  currentStep: number;
  email?: string;
  customerName?: string;
  phone?: string;
  shippingAddress?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  shippingCost?: number;
  totalAmount?: number;
  billingCycle: 'one_time' | 'weekly' | 'monthly' | 'yearly';
  status: 'pending' | 'completed' | 'expired' | 'abandoned';
}

export interface ShippingRate {
  id: string;
  name: string;
  description: string;
  price: number;
  deliveryTime: string;
}

export interface CreateCheckoutSessionRequest {
  productId: string;
  billingCycle: 'one_time' | 'weekly' | 'monthly' | 'yearly';
  quantity?: number;
}

export interface SaveInformationRequest {
  email: string;
  name: string;
  phone?: string;
  shippingAddress: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  note?: string;
}

export interface SelectShippingRequest {
  shippingRateId: string;
}

export const checkoutApi = {
  async createSession(data: CreateCheckoutSessionRequest) {
    const response = await api.post('/checkout/create-session', data);
    return response.data;
  },

  async getSession(sessionId: string): Promise<CheckoutSession> {
    const response = await api.get(`/checkout/sessions/${sessionId}`);
    return response.data;
  },

  async saveInformation(sessionId: string, data: SaveInformationRequest) {
    const response = await api.post(`/checkout/sessions/${sessionId}/information`, data);
    return response.data;
  },

  async selectShipping(sessionId: string, data: SelectShippingRequest) {
    const response = await api.post(`/checkout/sessions/${sessionId}/shipping`, data);
    return response.data;
  },

  async createPayment(sessionId: string, data: { paymentMethod: string }) {
    const response = await api.post(`/checkout/sessions/${sessionId}/payment`, data);
    return response.data;
  },

  async calculateShipping(sessionId: string): Promise<{ rates: ShippingRate[] }> {
    const response = await api.get(`/shipping/calculate?sessionId=${sessionId}`);
    return response.data;
  },
};