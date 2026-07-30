import type {
  ApiResponse,
  PaginatedApiResponse,
  Contact,
  WaitlistEntry,
  VendorSignup,
  VendorProduct,
  BuyerSignup,
  BusinessCategory,
  ProductCategory,
  ProductSummary,
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
  UpdateVendorAccountInfoRequest,
  UpdateVendorPaymentStatusRequest,
  Bank,
  AnalyticsData,
  AnalyticsRevenueSeries,
  AnalyticsCategoryItem,
  AnalyticsProductItem,
  AnalyticsCustomerInsight,
  WeeklyRevenuePoint,
  Coupon,
  CouponPayload,
  CouponsResponse,
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

  /** If true, 401 responses will not call logout (e.g. for endpoints that may return 401 for permission, not auth). */
  private async request<T>(
    endpoint: string,
    options: RequestInit & { skipLogoutOn401?: boolean } = {}
  ): Promise<T> {
    const { skipLogoutOn401, ...fetchOptions } = options;
    const url = `${API_BASE_URL}${endpoint}`;
    const token = this.getToken();

    const headers = {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...fetchOptions.headers,
    };

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers,
        mode: "cors",
      });

      if (!response.ok) {
        // Handle authentication errors
        if (response.status === 401) {
          if (!skipLogoutOn401) {
            this.handleAuthError();
          }
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

  async updateVendorAccountInfo(
    vendorId: string,
    data: UpdateVendorAccountInfoRequest
  ): Promise<ApiResponse<{ message: string }>> {
    return this.request<ApiResponse<{ message: string }>>(
      `/backoffice/vendors/${vendorId}/update-account-info`,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  }

  async updateVendorPaymentStatus(
    vendorId: string,
    data: UpdateVendorPaymentStatusRequest
  ): Promise<ApiResponse<{ message: string }>> {
    return this.request<ApiResponse<{ message: string }>>(
      `/backoffice/vendors/signup/${vendorId}/payment-status`,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  }

  async getBanks(): Promise<ApiResponse<Bank[]>> {
    return this.requestWithBasicAuth<ApiResponse<Bank[]>>(`/payment/banks`);
  }

  async getAllVendorSignups(): Promise<PaginatedApiResponse<VendorSignup>> {
    return this.request<PaginatedApiResponse<VendorSignup>>(
      `/backoffice/vendors/signup?page=1&perPage=10000`
    );
  }

  async getVendorProducts(
    vendorId: string,
    page = 1,
    perPage = 100
  ): Promise<PaginatedApiResponse<VendorProduct>> {
    return this.request<PaginatedApiResponse<VendorProduct>>(
      `/backoffice/vendors/${vendorId}/products?page=${page}&perPage=${perPage}`
    );
  }

  // Buyer Signups
  async getBuyerSignups(
    page = 1,
    perPage = 20
  ): Promise<PaginatedApiResponse<BuyerSignup>> {
    return this.request<PaginatedApiResponse<BuyerSignup>>(
      `/backoffice/buyers/signup?page=${page}&perPage=${perPage}`
    );
  }

  async getBuyerSignup(buyerId: string): Promise<ApiResponse<BuyerSignup>> {
    return this.request<ApiResponse<BuyerSignup>>(
      `/backoffice/buyers/signup/${buyerId}`
    );
  }

  async toggleBuyerStatus(
    buyerId: string
  ): Promise<ApiResponse<{ message: string }>> {
    return this.request<ApiResponse<{ message: string }>>(
      `/backoffice/buyers/account/${buyerId}/status`,
      {
        method: "POST",
      }
    );
  }

  async getAllBuyerSignups(): Promise<PaginatedApiResponse<BuyerSignup>> {
    return this.request<PaginatedApiResponse<BuyerSignup>>(
      `/backoffice/buyers/signup?page=1&perPage=10000`
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

  async getProductSummary(): Promise<ApiResponse<ProductSummary>> {
    return this.request<ApiResponse<ProductSummary>>(
      `/backoffice/vendors/product-summary`
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
    // GET /backoffice/settings requires Basic Auth per API docs
    return this.requestWithBasicAuth<
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

  async getVendorAnalytics(search?: string): Promise<AnalyticsData> {
    try {
      const params = new URLSearchParams();
      const trimmedSearch = search?.trim();
      if (trimmedSearch) {
        params.append("search", trimmedSearch);
        if (trimmedSearch.includes("@")) {
          params.append("email", trimmedSearch);
        } else {
          params.append("name", trimmedSearch);
        }
      }

      const raw = await this.request<{
        status?: number;
        error?: boolean;
        message?: string;
        data?: Record<string, unknown>;
      }>(
        `/backoffice/vendors/analytics/general${
          params.toString() ? `?${params.toString()}` : ""
        }`
      );

      if (raw?.error) throw new Error(raw.message || "Analytics fetch failed");
      return normalizeAnalyticsPayload(
        (raw?.data ?? raw ?? {}) as Record<string, unknown>
      );
    } catch (error) {
      if (
        error instanceof Error &&
        (error.message.includes("Session expired") ||
          error.message.includes("Network error") ||
          error.message.includes("HTTP 4") ||
          error.message.includes("HTTP 5"))
      ) {
        throw error;
      }
      return getAnalyticsDefaults();
    }
  }

  // Coupons
  async getCoupons(params: {
    page?: number;
    limit?: number;
    search?: string;
    discountType?: string;
  }): Promise<CouponsResponse> {
    const query = new URLSearchParams();
    if (params.page !== undefined) query.set("page", String(params.page));
    if (params.limit !== undefined) query.set("limit", String(params.limit));
    if (params.search) query.set("search", params.search);
    if (params.discountType) query.set("discountType", params.discountType);
    return this.request<CouponsResponse>(`/backoffice/coupon?${query.toString()}`);
  }

  async createCoupon(payload: CouponPayload): Promise<ApiResponse<Coupon>> {
    return this.request<ApiResponse<Coupon>>("/backoffice/coupon/create", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  async updateCoupon(identifier: string | number, payload: CouponPayload): Promise<ApiResponse<Coupon>> {
    return this.request<ApiResponse<Coupon>>(`/backoffice/coupon/${identifier}/update`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  }

  async toggleCouponStatus(identifier: string | number): Promise<ApiResponse<Coupon>> {
    return this.request<ApiResponse<Coupon>>(`/backoffice/coupon/${identifier}/toggle`, {
      method: "POST",
    });
  }
}

// ─── Analytics helpers ─────────────────────────────────────────────────────

function toNum(val: unknown): number {
  if (typeof val === "number") return isNaN(val) ? 0 : val;
  if (typeof val === "string") {
    const n = parseFloat(val);
    return isNaN(n) ? 0 : n;
  }
  return 0;
}

const WEEK_DAYS_MON_TO_SUN = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getMonIndexedDay(dayValue: unknown, dateValue?: unknown): string | null {
  const normalizedDay = String(dayValue ?? "").trim().toLowerCase();
  const dayMap: Record<string, string> = {
    monday: "Mon",
    mon: "Mon",
    tuesday: "Tue",
    tue: "Tue",
    tues: "Tue",
    wednesday: "Wed",
    wed: "Wed",
    thursday: "Thu",
    thu: "Thu",
    thur: "Thu",
    thurs: "Thu",
    friday: "Fri",
    fri: "Fri",
    saturday: "Sat",
    sat: "Sat",
    sunday: "Sun",
    sun: "Sun",
  };

  if (normalizedDay && dayMap[normalizedDay]) {
    return dayMap[normalizedDay];
  }

  if (typeof dateValue === "string" && dateValue.trim()) {
    const parsed = new Date(dateValue);
    if (!isNaN(parsed.getTime())) {
      const jsDay = parsed.getDay(); // 0 (Sun) -> 6 (Sat)
      const mondayIndex = (jsDay + 6) % 7; // 0 (Mon) -> 6 (Sun)
      return WEEK_DAYS_MON_TO_SUN[mondayIndex];
    }
  }

  return null;
}

function buildAlignedWeekSeries(
  source: unknown[],
  fallback?: unknown[]
): WeeklyRevenuePoint[] {
  const buckets = new Map<string, number>(
    WEEK_DAYS_MON_TO_SUN.map((day) => [day, 0])
  );

  const ingest = (rows?: unknown[]) => {
    if (!Array.isArray(rows)) return;
    rows.forEach((row) => {
      const item = row as Record<string, unknown>;
      const normalizedDay = getMonIndexedDay(item.day ?? item.label, item.date);
      if (!normalizedDay) return;
      const current = buckets.get(normalizedDay) ?? 0;
      buckets.set(normalizedDay, current + toNum(item.revenue ?? item.value ?? item.amount));
    });
  };

  ingest(source);
  const hasValues = [...buckets.values()].some((value) => value > 0);
  if (!hasValues && Array.isArray(fallback)) {
    ingest(fallback);
  }

  return WEEK_DAYS_MON_TO_SUN.map((day) => ({
    day,
    revenue: buckets.get(day) ?? 0,
  }));
}

export function getAnalyticsDefaults(): AnalyticsData {
  return {
    inventorySnapshot: {
      totalProducts: 0,
      totalOrders: 0,
      totalRevenue: 0,
      pendingOrders: 0,
    },
    summaryCards: {
      totalRevenue: 0,
      totalOrders: 0,
      avgOrderValue: 0,
      conversionRate: 0,
    },
    revenueSeries: {
      "7d": WEEK_DAYS_MON_TO_SUN.map((day) => ({ label: day, value: 0 })),
      "30d": [],
    },
    weeklyRevenueComparison: {
      thisWeek: WEEK_DAYS_MON_TO_SUN.map((day) => ({ day, revenue: 0 })),
      lastWeek: WEEK_DAYS_MON_TO_SUN.map((day) => ({ day, revenue: 0 })),
    },
    salesByCategory: [],
    topSellingProducts: { "7d": [], "30d": [] },
    customerInsights: {
      "7d": {
        totalCustomers: 0,
        newCustomersLabel: "This Week",
        newCustomers: 0,
        repeatBuyers: 0,
        locations: [],
      },
      "30d": {
        totalCustomers: 0,
        newCustomersLabel: "This Month",
        newCustomers: 0,
        repeatBuyers: 0,
        locations: [],
      },
    },
  };
}

function normalizeAnalyticsPayload(
  data: Record<string, unknown>
): AnalyticsData {
  if (!data || typeof data !== "object") return getAnalyticsDefaults();

  // ── KPI values (flat fields at top level) ──────────────────────────────
  const totalRevenue = toNum(
    data.totalRevenue ??
      (data.inventorySnapshot as Record<string, unknown>)?.totalRevenue ??
      0
  );
  const totalOrders = toNum(
    data.totalOrders ??
      (data.inventorySnapshot as Record<string, unknown>)?.totalOrders ??
      0
  );
  const pendingOrders = toNum(
    data.pendingOrders ??
      (data.inventorySnapshot as Record<string, unknown>)?.pendingOrders ??
      0
  );
  const avgOrderValue = toNum(
    data.avgOrderValue ??
      data.averageOrderValue ??
      (data.summaryCards as Record<string, unknown>)?.avgOrderValue ??
      0
  );

  const inventorySnapshot = {
    totalProducts: toNum(
      data.totalProducts ??
        (data.inventorySnapshot as Record<string, unknown>)?.totalProducts ??
        0
    ),
    totalOrders,
    totalRevenue,
    pendingOrders,
  };

  const summaryCards = {
    totalRevenue,
    totalOrders,
    avgOrderValue,
    conversionRate: toNum(data.conversionRate ?? 0),
  };

  // ── Weekly revenue chart ────────────────────────────────────────────────
  // General analytics may send currentWeekRevenue / lastWeekRevenue (each with
  // dailyBreakdown) instead of weeklyRevenueOverview.thisWeek / .lastWeek.
  const currentWeekRevenue = (data.currentWeekRevenue ?? {}) as Record<string, unknown>;
  const lastWeekRevenue = (data.lastWeekRevenue ?? {}) as Record<string, unknown>;
  const currentWeekDaily = Array.isArray(currentWeekRevenue.dailyBreakdown)
    ? (currentWeekRevenue.dailyBreakdown as unknown[])
    : [];
  const lastWeekDaily = Array.isArray(lastWeekRevenue.dailyBreakdown)
    ? (lastWeekRevenue.dailyBreakdown as unknown[])
    : [];

  const weeklyOverview = (data.weeklyRevenueOverview ?? {}) as Record<string, unknown>;
  const legacyThisWeek = Array.isArray(weeklyOverview.thisWeek)
    ? (weeklyOverview.thisWeek as unknown[])
    : Array.isArray(data.thisWeek)
    ? (data.thisWeek as unknown[])
    : undefined;
  const legacyLastWeek = Array.isArray(weeklyOverview.lastWeek)
    ? (weeklyOverview.lastWeek as unknown[])
    : Array.isArray(data.lastWeek)
    ? (data.lastWeek as unknown[])
    : undefined;

  const thisWeekRaw =
    legacyThisWeek && legacyThisWeek.length > 0
      ? legacyThisWeek
      : currentWeekDaily.length > 0
      ? currentWeekDaily
      : legacyThisWeek ?? [];
  const lastWeekRaw =
    legacyLastWeek && legacyLastWeek.length > 0
      ? legacyLastWeek
      : lastWeekDaily.length > 0
      ? lastWeekDaily
      : legacyLastWeek ?? [];

  const dailyBreakdown =
    Array.isArray(weeklyOverview.dailyBreakdown) &&
    (weeklyOverview.dailyBreakdown as unknown[]).length > 0
      ? (weeklyOverview.dailyBreakdown as unknown[])
      : currentWeekDaily;

  const thisWeekAligned = buildAlignedWeekSeries(thisWeekRaw, dailyBreakdown);
  const lastWeekAligned = buildAlignedWeekSeries(lastWeekRaw);

  const seriesRaw = (data.revenueSeries ?? {}) as Record<string, unknown>;

  const mapSeriesItems = (arr: unknown[]): AnalyticsRevenueSeries[] =>
    arr
      .map((item, i) => {
        const d = item as Record<string, unknown>;
        return {
          // prefer short day name ("Monday") → fallback to date string → index
          label: String(d.day ?? d.label ?? d.date ?? d.week ?? `Day ${i + 1}`),
          value: toNum(d.revenue ?? d.value ?? d.amount ?? 0),
        };
      })
      .filter((s) => !isNaN(s.value));

  const revenueSeries7d: AnalyticsRevenueSeries[] =
    thisWeekAligned.some((point) => point.revenue > 0)
      ? thisWeekAligned.map((point) => ({ label: point.day, value: point.revenue }))
      : dailyBreakdown.length > 0
      ? mapSeriesItems(dailyBreakdown)
      : Array.isArray(seriesRaw["7d"])
      ? mapSeriesItems(seriesRaw["7d"] as unknown[])
      : Array.isArray(seriesRaw.daily)
      ? mapSeriesItems(seriesRaw.daily as unknown[])
      : Array.isArray(data.revenueTrend)
      ? mapSeriesItems(data.revenueTrend as unknown[])
      : [];

  const revenueSeries30d: AnalyticsRevenueSeries[] = Array.isArray(seriesRaw["30d"])
    ? mapSeriesItems(seriesRaw["30d"] as unknown[])
    : Array.isArray(seriesRaw.monthly)
    ? mapSeriesItems(seriesRaw.monthly as unknown[])
    : revenueSeries7d; // fall back to weekly data

  // ── Categories ─────────────────────────────────────────────────────────
  // API field: topCategories[].categoryName / .percentage
  const catRaw: unknown[] = Array.isArray(data.topCategories)
    ? (data.topCategories as unknown[])
    : Array.isArray(data.salesByCategory)
    ? (data.salesByCategory as unknown[])
    : Array.isArray(data.categories)
    ? (data.categories as unknown[])
    : [];

  const salesByCategory: AnalyticsCategoryItem[] = catRaw
    .map((item) => {
      const d = item as Record<string, unknown>;
      return {
        category: String(
          d.categoryName ?? d.category ?? d.name ?? d.label ?? "Unknown"
        ),
        percentage: toNum(d.percentage ?? d.percent ?? d.value ?? 0),
      };
    })
    .sort((a, b) => b.percentage - a.percentage);

  // ── Top products ────────────────────────────────────────────────────────
  // API field: topProducts[].productName / .totalSold / .totalRevenue
  const mapProducts = (arr: unknown[]): AnalyticsProductItem[] =>
    arr
      .map((item) => {
        const d = item as Record<string, unknown>;
        return {
          product: String(
            d.productName ?? d.product ?? d.name ?? d.title ?? "Unknown"
          ),
          sales: toNum(d.totalSold ?? d.sales ?? d.itemsSold ?? d.quantity ?? d.count ?? 0),
          revenue: toNum(d.totalRevenue ?? d.revenue ?? d.amount ?? 0),
        };
      })
      .filter((p) => p.sales > 0 || p.revenue > 0)
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 10);

  // topProducts may be a flat array or nested with "7d"/"30d" keys
  const prodSource = data.topProducts ?? data.topSellingProducts ?? data.products;
  let products: AnalyticsProductItem[] = [];
  if (Array.isArray(prodSource)) {
    products = mapProducts(prodSource as unknown[]);
  } else if (prodSource && typeof prodSource === "object") {
    const ps = prodSource as Record<string, unknown>;
    products = Array.isArray(ps["7d"])
      ? mapProducts(ps["7d"] as unknown[])
      : [];
  }

  // ── Customer insights ───────────────────────────────────────────────────
  // API fields: customerInsights.totalCustomers / .newCustomersCurrentMonth
  //             .repeatBuyers / .customerLocations[].city / .percentage
  const custRaw = (data.customerInsights ?? data.customers ?? {}) as Record<string, unknown>;

  const mapLocations = (arr: unknown[]) =>
    arr.map((l) => {
      const d = l as Record<string, unknown>;
      return {
        // API returns "city", our type uses "state" as the display label
        state: String(d.city ?? d.state ?? d.location ?? d.name ?? "Unknown"),
        percentage: toNum(d.percentage ?? d.percent ?? d.value ?? 0),
      };
    });

  const buildInsight = (obj: Record<string, unknown>): AnalyticsCustomerInsight => {
    const locs = Array.isArray(obj.customerLocations)
      ? mapLocations(obj.customerLocations as unknown[])
      : Array.isArray(obj.locations)
      ? mapLocations(obj.locations as unknown[])
      : [];

    return {
      totalCustomers: toNum(obj.totalCustomers ?? obj.total ?? 0),
      newCustomersLabel: "This Month",
      newCustomers: toNum(
        obj.newCustomersCurrentMonth ??
          obj.newCustomers ??
          obj.newCustomersThisMonth ??
          obj.new ??
          0
      ),
      repeatBuyers: toNum(obj.repeatBuyers ?? obj.returning ?? 0),
      locations: locs,
    };
  };

  // Support both flat customerInsights and timeframe-nested shapes
  const insight =
    typeof custRaw["7d"] === "object" && custRaw["7d"] !== null
      ? buildInsight(custRaw["7d"] as Record<string, unknown>)
      : buildInsight(custRaw);

  return {
    inventorySnapshot,
    summaryCards,
    revenueSeries: { "7d": revenueSeries7d, "30d": revenueSeries30d },
    weeklyRevenueComparison: {
      thisWeek: thisWeekAligned,
      lastWeek: lastWeekAligned,
    },
    salesByCategory,
    topSellingProducts: { "7d": products, "30d": products },
    customerInsights: { "7d": insight, "30d": insight },
  };
}

export const apiService = new ApiService();
