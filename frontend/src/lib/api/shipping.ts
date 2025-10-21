import api from './auth';

export interface ShippingZone {
  id: string;
  shopId: string;
  name: string;
  countries: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ShippingRate {
  id: string;
  zoneId: string;
  name: string;
  description?: string;
  price: number;
  minOrderAmount?: number;
  maxWeight?: number;
  minDeliveryDays: number;
  maxDeliveryDays: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ShippingCalculationRequest {
  shopId: string;
  productId: string;
  country: string;
  state?: string;
  postalCode?: string;
  weight?: number;
  orderAmount?: number;
}

export interface ShippingCalculationResponse {
  rates: Array<{
    id: string;
    name: string;
    description: string;
    price: number;
    deliveryTime: string;
    minDeliveryDays: number;
    maxDeliveryDays: number;
  }>;
  shop: {
    id: string;
    name: string;
    freeShippingThreshold?: number;
  };
}

export interface CreateShippingZoneRequest {
  shopId: string;
  name: string;
  countries: string[];
}

export interface CreateShippingRateRequest {
  zoneId: string;
  name: string;
  description?: string;
  price: number;
  minOrderAmount?: number;
  maxWeight?: number;
  minDeliveryDays: number;
  maxDeliveryDays: number;
}

export const shippingApi = {
  // Calculate shipping rates
  async calculateShipping(data: ShippingCalculationRequest): Promise<ShippingCalculationResponse> {
    const response = await api.post('/shipping/calculate', data);
    return response.data;
  },

  async calculateShippingForCheckout(sessionId: string): Promise<ShippingCalculationResponse> {
    const response = await api.get('/shipping/calculate', { params: { sessionId } });
    return response.data;
  },

  // Shipping zones (shop owner)
  async getShippingZones(shopId: string): Promise<ShippingZone[]> {
    const response = await api.get(`/shops/${shopId}/shipping/zones`);
    return response.data;
  },

  async createShippingZone(shopId: string, data: CreateShippingZoneRequest): Promise<ShippingZone> {
    const response = await api.post(`/shops/${shopId}/shipping/zones`, data);
    return response.data;
  },

  async updateShippingZone(zoneId: string, data: Partial<CreateShippingZoneRequest>): Promise<ShippingZone> {
    const response = await api.put(`/shipping/zones/${zoneId}`, data);
    return response.data;
  },

  async deleteShippingZone(zoneId: string): Promise<void> {
    await api.delete(`/shipping/zones/${zoneId}`);
  },

  async toggleShippingZone(zoneId: string, isActive: boolean): Promise<ShippingZone> {
    const response = await api.put(`/shipping/zones/${zoneId}/toggle`, { isActive });
    return response.data;
  },

  // Shipping rates (shop owner)
  async getShippingRates(zoneId: string): Promise<ShippingRate[]> {
    const response = await api.get(`/shipping/zones/${zoneId}/rates`);
    return response.data;
  },

  async createShippingRate(zoneId: string, data: CreateShippingRateRequest): Promise<ShippingRate> {
    const response = await api.post(`/shipping/zones/${zoneId}/rates`, data);
    return response.data;
  },

  async updateShippingRate(rateId: string, data: Partial<CreateShippingRateRequest>): Promise<ShippingRate> {
    const response = await api.put(`/shipping/rates/${rateId}`, data);
    return response.data;
  },

  async deleteShippingRate(rateId: string): Promise<void> {
    await api.delete(`/shipping/rates/${rateId}`);
  },

  async toggleShippingRate(rateId: string, isActive: boolean): Promise<ShippingRate> {
    const response = await api.put(`/shipping/rates/${rateId}/toggle`, { isActive });
    return response.data;
  },

  // Shop shipping settings
  async getShopShippingSettings(shopId: string): Promise<{
    shippingEnabled: boolean;
    freeShippingThreshold?: number;
    defaultShippingZone?: string;
    shippingCountries: string[];
  }> {
    const response = await api.get(`/shops/${shopId}/shipping/settings`);
    return response.data;
  },

  async updateShopShippingSettings(shopId: string, data: {
    shippingEnabled?: boolean;
    freeShippingThreshold?: number;
    defaultShippingZone?: string;
    shippingCountries?: string[];
  }): Promise<any> {
    const response = await api.put(`/shops/${shopId}/shipping/settings`, data);
    return response.data;
  },

  // Admin shipping management
  async getAllShippingZones(): Promise<ShippingZone[]> {
    const response = await api.get('/admin/shipping/zones');
    return response.data;
  },

  async getShippingStats(): Promise<{
    totalZones: number;
    totalRates: number;
    activeZones: number;
    activeRates: number;
    shopsWithShipping: number;
    shopsWithoutShipping: number;
  }> {
    const response = await api.get('/admin/shipping/stats');
    return response.data;
  },

  // Shipping carriers and tracking
  async getShippingCarriers(): Promise<Array<{
    id: string;
    name: string;
    code: string;
    countries: string[];
    isActive: boolean;
  }>> {
    const response = await api.get('/shipping/carriers');
    return response.data;
  },

  async trackShipment(trackingNumber: string, carrier?: string): Promise<{
    trackingNumber: string;
    carrier: string;
    status: string;
    estimatedDelivery: string;
    trackingHistory: Array<{
      timestamp: string;
      status: string;
      location?: string;
      description: string;
    }>;
  }> {
    const response = await api.get('/shipping/track', {
      params: { trackingNumber, carrier }
    });
    return response.data;
  },

  // Bulk shipping operations
  async bulkUpdateShippingRates(updates: Array<{
    rateId: string;
    price: number;
    isActive?: boolean;
  }>): Promise<ShippingRate[]> {
    const response = await api.put('/shipping/rates/bulk', { updates });
    return response.data;
  },

  async exportShippingRates(shopId: string): Promise<Blob> {
    const response = await api.get(`/shops/${shopId}/shipping/export`, {
      responseType: 'blob'
    });
    return response.data;
  },

  async importShippingRates(shopId: string, file: File): Promise<{
    imported: number;
    errors: Array<{
      row: number;
      error: string;
    }>;
  }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post(`/shops/${shopId}/shipping/import`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Shipping validation
  async validateShippingAddress(address: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  }): Promise<{
    isValid: boolean;
    normalizedAddress?: {
      line1: string;
      line2?: string;
      city: string;
      state: string;
      country: string;
      postalCode: string;
    };
    suggestions?: Array<{
      line1: string;
      line2?: string;
      city: string;
      state: string;
      country: string;
      postalCode: string;
    }>;
    errors?: string[];
  }> {
    const response = await api.post('/shipping/validate-address', address);
    return response.data;
  }
};