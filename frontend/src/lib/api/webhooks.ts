import api from './auth';

export interface WebhookEvent {
  id: string;
  type: string;
  source: 'stripe' | 'paypal' | 'internal';
  processed: boolean;
  processedAt?: string;
  error?: string;
  retryCount: number;
  data: any;
  createdAt: string;
}

export interface WebhookEndpoint {
  id: string;
  url: string;
  events: string[];
  secret: string;
  isActive: boolean;
  description?: string;
  lastTriggered?: string;
  totalTriggers: number;
  createdAt: string;
  updatedAt: string;
}

export interface WebhookLog {
  id: string;
  endpointId: string;
  eventType: string;
  statusCode: number;
  response?: string;
  error?: string;
  duration: number;
  attempt: number;
  triggeredAt: string;
}

export const webhooksApi = {
  // Webhook event logs (admin)
  async getWebhookEvents(params?: {
    page?: number;
    limit?: number;
    source?: string;
    type?: string;
    processed?: boolean;
    startDate?: string;
    endDate?: string;
  }): Promise<{
    events: WebhookEvent[],
    total: number,
    page: number,
    limit: number
  }> {
    const response = await api.get('/admin/webhooks/events', { params });
    return response.data;
  },

  async getWebhookEvent(eventId: string): Promise<WebhookEvent> {
    const response = await api.get(`/admin/webhooks/events/${eventId}`);
    return response.data;
  },

  async retryWebhookEvent(eventId: string): Promise<WebhookEvent> {
    const response = await api.post(`/admin/webhooks/events/${eventId}/retry`);
    return response.data;
  },

  async processWebhookEvent(eventId: string): Promise<WebhookEvent> {
    const response = await api.post(`/admin/webhooks/events/${eventId}/process`);
    return response.data;
  },

  // Webhook endpoints management (admin)
  async getWebhookEndpoints(): Promise<WebhookEndpoint[]> {
    const response = await api.get('/admin/webhooks/endpoints');
    return response.data;
  },

  async createWebhookEndpoint(data: {
    url: string;
    events: string[];
    description?: string;
  }): Promise<WebhookEndpoint> {
    const response = await api.post('/admin/webhooks/endpoints', data);
    return response.data;
  },

  async updateWebhookEndpoint(endpointId: string, data: {
    url?: string;
    events?: string[];
    description?: string;
    isActive?: boolean;
  }): Promise<WebhookEndpoint> {
    const response = await api.put(`/admin/webhooks/endpoints/${endpointId}`, data);
    return response.data;
  },

  async deleteWebhookEndpoint(endpointId: string): Promise<void> {
    await api.delete(`/admin/webhooks/endpoints/${endpointId}`);
  },

  async toggleWebhookEndpoint(endpointId: string, isActive: boolean): Promise<WebhookEndpoint> {
    const response = await api.put(`/admin/webhooks/endpoints/${endpointId}/toggle`, { isActive });
    return response.data;
  },

  async regenerateWebhookSecret(endpointId: string): Promise<{ secret: string }> {
    const response = await api.post(`/admin/webhooks/endpoints/${endpointId}/regenerate-secret`);
    return response.data;
  },

  // Webhook logs
  async getWebhookLogs(params?: {
    page?: number;
    limit?: number;
    endpointId?: string;
    eventType?: string;
    statusCode?: number;
    startDate?: string;
    endDate?: string;
  }): Promise<{
    logs: WebhookLog[],
    total: number,
    page: number,
    limit: number
  }> {
    const response = await api.get('/admin/webhooks/logs', { params });
    return response.data;
  },

  async getWebhookLog(logId: string): Promise<WebhookLog> {
    const response = await api.get(`/admin/webhooks/logs/${logId}`);
    return response.data;
  },

  // Webhook testing
  async testWebhookEndpoint(endpointId: string, eventType: string, testData?: any): Promise<{
    success: boolean;
    statusCode: number;
    response?: string;
    error?: string;
    duration: number;
  }> {
    const response = await api.post(`/admin/webhooks/endpoints/${endpointId}/test`, {
      eventType,
      testData
    });
    return response.data;
  },

  async testWebhookEvent(eventType: string, testData?: any): Promise<{
    success: boolean;
    processed: boolean;
    result?: any;
    error?: string;
  }> {
    const response = await api.post('/admin/webhooks/test-event', {
      eventType,
      testData
    });
    return response.data;
  },

  // Webhook statistics
  async getWebhookStats(): Promise<{
    totalEvents: number;
    processedEvents: number;
    failedEvents: number;
    eventsByType: Record<string, number>;
    eventsBySource: Record<string, number>;
    averageProcessingTime: number;
    successRate: number;
    recentActivity: Array<{
      date: string;
      count: number;
      successRate: number;
    }>;
  }> {
    const response = await api.get('/admin/webhooks/stats');
    return response.data;
  },

  // Available webhook events
  async getAvailableWebhookEvents(): Promise<{
    stripe: Array<{
      type: string;
      description: string;
      sampleData: any;
    }>;
    paypal: Array<{
      type: string;
      description: string;
      sampleData: any;
    }>;
    internal: Array<{
      type: string;
      description: string;
      sampleData: any;
    }>;
  }> {
    const response = await api.get('/admin/webhooks/events/available');
    return response.data;
  },

  // Webhook monitoring
  async getWebhookHealth(): Promise<{
    status: 'healthy' | 'warning' | 'critical';
    activeEndpoints: number;
    failedEventsLastHour: number;
    averageResponseTime: number;
    lastProcessedEvent?: string;
    issues: Array<{
      type: string;
      message: string;
      severity: 'low' | 'medium' | 'high';
    }>;
  }> {
    const response = await api.get('/admin/webhooks/health');
    return response.data;
  },

  // Manual webhook triggers (for testing)
  async triggerTestCheckoutCompleted(orderData: any): Promise<WebhookEvent> {
    const response = await api.post('/admin/webhooks/trigger/checkout-completed', orderData);
    return response.data;
  },

  async triggerTestSubscriptionUpdated(subscriptionData: any): Promise<WebhookEvent> {
    const response = await api.post('/admin/webhooks/trigger/subscription-updated', subscriptionData);
    return response.data;
  },

  async triggerTestPaymentFailed(paymentData: any): Promise<WebhookEvent> {
    const response = await api.post('/admin/webhooks/trigger/payment-failed', paymentData);
    return response.data;
  },

  // Webhook configuration
  async getWebhookConfiguration(): Promise<{
    allowedUrls: string[];
    maxRetryAttempts: number;
    retryBackoffMultiplier: number;
    eventRetentionDays: number;
    logRetentionDays: number;
  }> {
    const response = await api.get('/admin/webhooks/configuration');
    return response.data;
  },

  async updateWebhookConfiguration(config: {
    allowedUrls?: string[];
    maxRetryAttempts?: number;
    retryBackoffMultiplier?: number;
    eventRetentionDays?: number;
    logRetentionDays?: number;
  }): Promise<any> {
    const response = await api.put('/admin/webhooks/configuration', config);
    return response.data;
  }
};