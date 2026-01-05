import type {
  ApiResponse,
  PaginatedApiResponse,
  Contact,
  WaitlistEntry,
  VendorSignup,
  BusinessCategory,
  ProductCategory,
  CreateCategoryRequest,
  CreateProductCategoryRequest,
  LoginCredentials,
  LoginResponse,
  SuspendVendorRequest,
  ReinstateVendorRequest,
  OrdersQuery,
  OrdersResponse,
  OrderItemsResponse,
  OrdersMetrics,
  Order,
  TicketsResponse,
  TicketMessagesResponse,
  NotificationResponse,
  OverviewStats,
} from "../types/api";
import { config } from "../config/env";
import { useAuthStore } from "../stores/authStore";

const API_BASE_URL = config.API_BASE_URL;

class ApiService {
  private getToken(): string | null {
    return useAuthStore.getState().token;
  }

  private handleAuthError() {
    const { logout } = useAuthStore.getState();
    logout();
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = this.getToken();

    const headers = {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        mode: "cors",
      });

      if (!response.ok) {
        // Handle authentication errors
        if (response.status === 401) {
          this.handleAuthError();
          throw new Error("Session expired. Please log in again.");
        }

        const errorText = await response.text();
        throw new Error(
          `HTTP ${response.status}: ${errorText || response.statusText}`
        );
      }

      return response.json();
    } catch (error) {
      if (
        error instanceof TypeError &&
        error.message.includes("Failed to fetch")
      ) {
        throw new Error(
          "Network error: Unable to connect to the server. Please check your connection or try again later."
        );
      }
      throw error;
    }
  }

  private async requestWithBasicAuth<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const basicAuthCredentials = btoa("admin@example.com:admin123");

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Basic ${basicAuthCredentials}`,
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        mode: "cors",
      });

      if (!response.ok) {
        // Handle authentication errors
        if (response.status === 401) {
          this.handleAuthError();
          throw new Error("Session expired. Please log in again.");
        }

        const errorText = await response.text();
        throw new Error(
          `HTTP ${response.status}: ${errorText || response.statusText}`
        );
      }

      return response.json();
    } catch (error) {
      if (
        error instanceof TypeError &&
        error.message.includes("Failed to fetch")
      ) {
        throw new Error(
          "Network error: Unable to connect to the server. Please check your connection or try again later."
        );
      }
      throw error;
    }
  }

  // Auth
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const url = `${API_BASE_URL}/backoffice/login`;

    // Create Basic Auth header for login endpoint
    const basicAuthCredentials = btoa("admin@example.com:admin123");

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Basic ${basicAuthCredentials}`,
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers,
        mode: "cors",
        body: JSON.stringify({
          emailAddress: credentials.email,
          password: credentials.password,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP ${response.status}: ${errorText || response.statusText}`
        );
      }

      const loginResponse: LoginResponse = await response.json();

      if (loginResponse.token) {
        const { setAuth } = useAuthStore.getState();

        // Create a user object from the email since backend doesn't provide user info
        const user = {
          id: "user-" + Date.now(), // Temporary ID
          email: credentials.email,
          name: credentials.email.split("@")[0], // Use email prefix as name
        };

        setAuth(loginResponse.token, user);

        // Keep localStorage for backward compatibility
        localStorage.setItem("auth_token", loginResponse.token);
      } else {
        throw new Error("Login failed: No token received from server");
      }

      return loginResponse;
    } catch (error) {
      if (
        error instanceof TypeError &&
        error.message.includes("Failed to fetch")
      ) {
        throw new Error(
          "Network error: Unable to connect to the server. Please check your connection or try again later."
        );
      }
      throw error;
    }
  }

  logout() {
    const { logout } = useAuthStore.getState();
    logout();
  }

  isAuthenticated(): boolean {
    const { isAuthenticated, checkTokenExpiry } = useAuthStore.getState();

    if (!isAuthenticated) {
      return false;
    }

    // Check if token is still valid
    return checkTokenExpiry();
  }

  // Contacts
  async getContacts(
    page = 1,
    perPage = 20
  ): Promise<PaginatedApiResponse<Contact>> {
    return this.request<PaginatedApiResponse<Contact>>(
      `/backoffice/vendors/contacts?page=${page}&perPage=${perPage}`
    );
  }

  // overview stats
  async getOverviewStats(): Promise<ApiResponse<OverviewStats>> {
    return this.request<ApiResponse<OverviewStats>>(
      `/backoffice/overview`
    );
  }

  async getContact(id: string): Promise<ApiResponse<Contact>> {
    return this.request<ApiResponse<Contact>>(
      `/backoffice/vendors/contacts/${id}`
    );
  }

  // Waitlist
  async getWaitlist(
    page = 1,
    perPage = 20
  ): Promise<PaginatedApiResponse<WaitlistEntry>> {
    return this.request<PaginatedApiResponse<WaitlistEntry>>(
      `/backoffice/vendors/waitlist?page=${page}&perPage=${perPage}`
    );
  }

  async getWaitlistEntry(id: string): Promise<ApiResponse<WaitlistEntry>> {
    return this.request<ApiResponse<WaitlistEntry>>(
      `/backoffice/vendors/waitlist/${id}`
    );
  }

  // Export methods - fetch all data for CSV export
  async getAllContacts(): Promise<PaginatedApiResponse<Contact>> {
    return this.request<PaginatedApiResponse<Contact>>(
      `/backoffice/vendors/contacts?page=1&perPage=10000`
    );
  }

  async getAllWaitlist(): Promise<PaginatedApiResponse<WaitlistEntry>> {
    return this.request<PaginatedApiResponse<WaitlistEntry>>(
      `/backoffice/vendors/waitlist?page=1&perPage=10000`
    );
  }

  // Vendor Signups
  async getVendorSignups(
    page = 1,
    perPage = 20
  ): Promise<PaginatedApiResponse<VendorSignup>> {
    return this.request<PaginatedApiResponse<VendorSignup>>(
      `/backoffice/vendors/signup?page=${page}&perPage=${perPage}`
    );
  }

  async getVendorSignup(vendorId: string): Promise<ApiResponse<VendorSignup>> {
    return this.request<ApiResponse<VendorSignup>>(
      `/backoffice/vendors/signup/${vendorId}`
    );
  }

  async toggleVendorStatus(
    vendorId: string
  ): Promise<ApiResponse<{ message: string }>> {
    return this.request<ApiResponse<{ message: string }>>(
      `/backoffice/vendors/account/${vendorId}/status`,
      {
        method: "POST",
      }
    );
  }

  async approveVendor(
    vendorId: string
  ): Promise<ApiResponse<{ message: string }>> {
    return this.request<ApiResponse<{ message: string }>>(
      `/backoffice/vendors/account/${vendorId}/approve`,
      {
        method: "POST",
      }
    );
  }

  async suspendVendor(
    vendorId: string,
    data: SuspendVendorRequest
  ): Promise<ApiResponse<{ message: string }>> {
    return this.request<ApiResponse<{ message: string }>>(
      `/backoffice/vendors/account/${vendorId}/suspend`,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  }

  async reinstateVendor(
    vendorId: string,
    data: ReinstateVendorRequest
  ): Promise<ApiResponse<{ message: string }>> {
    return this.request<ApiResponse<{ message: string }>>(
      `/backoffice/vendors/account/${vendorId}/reinstate`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      }
    );
  }

  async getAllVendorSignups(): Promise<PaginatedApiResponse<VendorSignup>> {
    return this.request<PaginatedApiResponse<VendorSignup>>(
      `/backoffice/vendors/signup?page=1&perPage=10000`
    );
  }

  // Orders
  async getOrders(query: OrdersQuery): Promise<OrdersResponse> {
    // Build the query string from the query object, filtering out undefined values
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, String(value));
      }
    });
    const queryString = params.toString();

    return this.request<OrdersResponse>(
      `/backoffice/orders${queryString ? `?${queryString}` : ""}`
    );
  }

  async getOrdersSummary(): Promise<ApiResponse<OrdersMetrics>> {
    return this.request<ApiResponse<OrdersMetrics>>(
      `/backoffice/orders/summary`
    );
  }

  async updateOrderStatus(
    orderNo: string,
    status: string
  ): Promise<ApiResponse<{ message: string; order: Order }>> {
    return this.request<ApiResponse<{ message: string; order: Order }>>(
      `/backoffice/orders/status/${orderNo}`,
      {
        method: "PUT",
        body: JSON.stringify({ status }),
      }
    );
  }

  async getOrderItems(
    orderId: string
  ): Promise<ApiResponse<OrderItemsResponse>> {
    return this.request<ApiResponse<OrderItemsResponse>>(
      `/backoffice/orders/items/${orderId}`
    );
  }

  // async getProductTracking(productId: string) {
  //   // eslint-disable-next-line @typescript-eslint/no-explicit-any
  //   return this.request<any>(`/product/${productId}/track-view`, {
  //     method: "PUT",
  //   });
  // }

  // Business Categories (using Basic Auth)
  async getBusinessCategories(): Promise<ApiResponse<BusinessCategory[]>> {
    return this.requestWithBasicAuth<ApiResponse<BusinessCategory[]>>(
      `/business/get-categories`
    );
  }

  async getBusinessCategory(
    id: string
  ): Promise<ApiResponse<BusinessCategory>> {
    return this.requestWithBasicAuth<ApiResponse<BusinessCategory>>(
      `/business/category/${id}`
    );
  }

  async createBusinessCategory(
    data: CreateCategoryRequest
  ): Promise<ApiResponse<BusinessCategory>> {
    return this.requestWithBasicAuth<ApiResponse<BusinessCategory>>(
      `/business/category`,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  }

  async updateBusinessCategory(
    id: string,
    data: CreateCategoryRequest
  ): Promise<ApiResponse<BusinessCategory>> {
    return this.requestWithBasicAuth<ApiResponse<BusinessCategory>>(
      `/business/category/edit/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      }
    );
  }

  async deleteBusinessCategory(
    id: string
  ): Promise<ApiResponse<{ message: string }>> {
    return this.requestWithBasicAuth<ApiResponse<{ message: string }>>(
      `/business/category/delete/${id}`,
      {
        method: "DELETE",
      }
    );
  }

  async updateProductCategory(
    id: string,
    data: CreateCategoryRequest
  ): Promise<ApiResponse<ProductCategory>> {
    return this.requestWithBasicAuth<ApiResponse<ProductCategory>>(
      `/product/category/edit/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      }
    );
  }

  async deleteProductCategory(
    id: string
  ): Promise<ApiResponse<{ message: string }>> {
    return this.requestWithBasicAuth<ApiResponse<{ message: string }>>(
      `/product/category/delete/${id}`,
      {
        method: "DELETE",
      }
    );
  }

  // Product Categories (using Basic Auth)
  async getProductCategories(
    page = 1,
    perPage = 20
  ): Promise<PaginatedApiResponse<ProductCategory>> {
    return this.requestWithBasicAuth<PaginatedApiResponse<ProductCategory>>(
      `/product/category?page=${page}&perPage=${perPage}`
    );
  }

  async createProductCategory(
    data: CreateProductCategoryRequest
  ): Promise<ApiResponse<ProductCategory>> {
    return this.requestWithBasicAuth<ApiResponse<ProductCategory>>(
      `/product/category/create`,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  }

  async getAllProductCategories(): Promise<
    PaginatedApiResponse<ProductCategory>
  > {
    return this.requestWithBasicAuth<PaginatedApiResponse<ProductCategory>>(
      `/product/category?page=1&perPage=10000`
    );
  }

  // Commission
  async updateCommission(data: {
    platformShare: number;
  }): Promise<ApiResponse<{ message?: string }>> {
    return this.request<ApiResponse<{ message?: string }>>(
      `/backoffice/settings/commission`,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  }
  async getCommission(): Promise<
    ApiResponse<{
      id: string;
      platformCommission: string;
      createdAt: string;
      updatedAt: string;
    }>
  > {
    return this.request<
      ApiResponse<{
        id: string;
        platformCommission: string;
        createdAt: string;
        updatedAt: string;
      }>
    >(`/backoffice/settings`);
  }

  // Tickets
  async getTickets(
    page = 1,
    perPage = 10,
    search?: string
  ): Promise<ApiResponse<TicketsResponse>> {
    const params = new URLSearchParams({
      page: String(page),
      perPage: String(perPage),
    });
    if (search) {
      params.append("search", search);
    }
    return this.request<ApiResponse<TicketsResponse>>(
      `/ticket/support?${params.toString()}`
    );
  }

  async getTicketMessages(
    ticketId: string
  ): Promise<ApiResponse<TicketMessagesResponse>> {
    return this.request<ApiResponse<TicketMessagesResponse>>(
      `/ticket/get-messages/${ticketId}`
    );
  }

  async replyToTicket(
    ticketId: string,
    message: string
  ): Promise<ApiResponse<{ message: string }>> {
    return this.request<ApiResponse<{ message: string }>>(
      `/ticket/reply-message/${ticketId}`,
      {
        method: "POST",
        body: JSON.stringify({ message }),
      }
    );
  }

  async getNotifications(query?: {
    page?: number;
    perPage?: number;
  }): Promise<ApiResponse<NotificationResponse>> {
    const params = new URLSearchParams({
      page: String(query?.page || 1),
      perPage: String(query?.perPage || 10),
    });
    return this.request<ApiResponse<NotificationResponse>>(
      `/notification?${params.toString()}`
    );
  }

  async markNotificationAsRead(
    notificationId: string
  ): Promise<ApiResponse<{ message: string }>> {
    return this.request<ApiResponse<{ message: string }>>(
      `/notification/${notificationId}/read`,
      {
        method: "PUT",
      }
    );
  }
}

export const apiService = new ApiService();
