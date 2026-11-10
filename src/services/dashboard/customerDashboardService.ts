import api from '@/services/core/api';
import { extractData } from '@/utils/apiHelpers';
import type { CustomerDashboardParams, CustomerDashboardResponse, DailySummaryResponse } from '@/types/analytics/dashboard';

class CustomerDashboardService {
  async getCustomerDashboard(params: CustomerDashboardParams = {}): Promise<CustomerDashboardResponse> {
    const response = await api.get('/dashboard/customer', { params });
    return extractData<CustomerDashboardResponse>(response);
  }

  async getDailySummary(params: { date?: string; timezone?: string } = {}): Promise<DailySummaryResponse> {
    const response = await api.get('/dashboard/daily_summary', { params });
    return extractData<DailySummaryResponse>(response);
  }
}

export const customerDashboardService = new CustomerDashboardService();
