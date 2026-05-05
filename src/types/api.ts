export interface ApiResponse<T> {
  status: number;
  error: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    perPage: number;
    totalPages: number;
    totalItems: number;
  };
}

// For paginated API responses where pagination is at root level
export interface PaginatedApiResponse<T> {
  status: number;
  error: boolean;
  message: string;
  data: T[];
  pagination: {
    currentPage: number;
    perPage: number;
    totalPages: number;
    totalItems: number;
  };
}

export interface Contact {
  id: string;
  fullName: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  updatedAt: string;
}

export interface BuyerMessage {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  subject: string;
  message: string;
  createdAt: string;
  updatedAt: string;
}

export interface VendorMessage {
  id: string;
  name: string;
  storeName: string;
  email: string;
  phoneNumber: string;
  subject: string;
  message: string;
  createdAt: string;
  updatedAt: string;
}

export interface Ticket {
  ticketId: string;
  subject: string;
  status: string;
  priority: string;
  category: string;
  createdAt: string;
  updatedAt: string;
  unreadCount: number;
  userType?: string; // VENDOR, BUYER, etc.
}

export interface TicketsResponse {
  pagination: {
    currentPage: number;
    perPage: number;
    totalPages: number;
    totalItems: number;
  };
  tickets: Ticket[];
}

export interface SenderInfo {
  id: string;
  name: string;
  email: string;
  phone?: string;
  business_name?: string;
  type: string;
}

export interface TicketMessage {
  messageId: string;
  ticketId: string;
  message: string;
  messageType: string;
  senderType: string;
  senderId: string;
  senderInfo: SenderInfo;
  isOwnMessage: boolean;
  isRead: boolean;
  createdAt: string;
  timeAgo?: string;
}

export interface TicketMessagesResponse {
  messages: TicketMessage[];
}

export interface Coupon {
  id?: number;
  code: string;
  description?: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  usedCount?: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CouponPayload {
  code: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  validFrom: string;
  validUntil: string;
}

export interface CouponsResponse {
  data: Coupon[];
  pagination: {
    currentPage: number;
    perPage: number;
    totalPages: number;
    totalItems: number;
  };
}

export interface BuyerMessage {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  subject: string;
  message: string;
  createdAt: string;
  updatedAt: string;
}

export interface VendorMessage {
  id: string;
  name: string;
  storeName: string;
  email: string;
  phoneNumber: string;
  subject: string;
  message: string;
  createdAt: string;
  updatedAt: string;
}

export interface Ticket {
  ticketId: string;
  subject: string;
  status: string;
  priority: string;
  category: string;
  createdAt: string;
  updatedAt: string;
  unreadCount: number;
  userType?: string; // VENDOR, BUYER, etc.
}

export interface TicketsResponse {
  pagination: {
    currentPage: number;
    perPage: number;
    totalPages: number;
    totalItems: number;
  };
  tickets: Ticket[];
}

export interface SenderInfo {
  id: string;
  name: string;
  email: string;
  phone?: string;
  business_name?: string;
  type: string;
}

export interface TicketMessage {
  messageId: string;
  ticketId: string;
  message: string;
  messageType: string;
  senderType: string;
  senderId: string;
  senderInfo: SenderInfo;
  isOwnMessage: boolean;
  isRead: boolean;
  createdAt: string;
  timeAgo?: string;
}

export interface TicketMessagesResponse {
  messages: TicketMessage[];
}

export interface WaitlistEntry {
  id: string;
  business_name?: string;
  businessName?: string;
  business_type?: string;
  businessType?: string;
  state_of_operation?: string;
  stateOfOperation?: string;
  full_name?: string;
  fullName?: string;
  phone_number?: string;
  phoneNumber?: string;
  email_address?: string;
  emailAddress?: string;
  product_categories?: string;
  productCategories?: string;
  special_handling?: string;
  specialHandling?: string;
  product_origin?: string;
  productOrigin?: string;
  online_presence?: string;
  onlinePresence?: string;
  online_platforms?: string;
  onlinePlatforms?: string;
  receive_notification?: string;
  receiveNotification?: string;
  message?: string | null;
  created_at?: string;
  createdAt?: string;
  updated_at?: string;
  updatedAt?: string;
}

export interface VendorSignup {
  id?: string; // Only present in single vendor endpoint
  vendorId: string;
  fullName: string;
  emailAddress: string;
  phoneNumber: string | null;
  businessName: string | null;
  businessCategory: string | null;
  businessRegNumber: string | null;
  storeName: string | null;
  businessAddress: string | null;
  taxIdNumber: string | null;
  idDocument: string | null;
  businessRegCertificate: string | null;
  isActive: string; // "0" or "1"
  isApproved: string; // "0" or "1"
  approvedAt: string | null;
  isSuspended: string; // "0" or "1"
  suspendedAt: string | null;
  isPending?: boolean | string; // Pending approval status
  createdAt: string;
  updatedAt: string;
  businessCategoryName: string | null;
}

export interface BuyerSignup {
  id?: string;
  buyerId: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  full_name?: string; // API may return snake_case
  emailAddress: string;
  phoneNumber: string | null;
  address?: string | null;
  isActive: string; // "0" or "1"
  createdAt: string;
  updatedAt: string;
}

export interface BusinessCategory {
  id: string;
  categoryName: string;
  associatedBusinesses: string | number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryRequest {
  categoryName: string;
}

export interface ProductCategory {
  categoryId: string;
  categoryName: string;
  associatedProducts: string | number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductSummary {
  totalProducts?: number | string;
  activeProducts?: number | string;
  inactiveProducts?: number | string;
  total?: number | string;
  count?: number | string;
}

export interface CreateProductCategoryRequest {
  categoryName: string;
}

export interface SuspendVendorRequest {
  suspensionReason: string;
  requiredActions: string[];
}

export interface ReinstateVendorRequest {
  reinstatementReason: string;
  notes?: string;
}

export interface UpdateVendorAccountInfoRequest {
  accountNumber: string;
  settlementBank: string;
  settlementBankName: string;
}

export interface Bank {
  id: number;
  name: string;
  code: string;
  longcode?: string | null;
  slug?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

// Actual login response from backend (different structure)
export interface LoginResponse {
  status: number;
  error: boolean;
  message: string;
  token: string;
}

//order
export type OrderSort = "recent" | "oldest";

export interface OrdersQuery {
  page: number;
  perPage: number;
  status?: string;
  startDate?: string;
  endDate?: string;
  customerName?: string;
  orderNo?: string;
  paymentMethod?: string;
  sortBy?: string;
}

export interface SplitSubaccount {
  subaccount: string;
  share?: number;
  bearer_type?: string;
}

export interface SplitConfig {
  type?: string;
  bearer_type?: string;
  subaccounts?: SplitSubaccount[];
}

export interface Order {
  orderNo: string;
  totalAmount: number | string;
  status: string;
  paymentMethod?: string;
  paymentStatus?: string | null;
  paymentReference?: string | null;
  paymentDate?: string | null;
  splitPayment?: string | boolean;
  splitConfig?: SplitConfig | null;
  splitName?: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  createdAt: string;
  totalItemsCount: number;
  shippingFee?: number | string;
  vendorEarnings?: number | string;
  vendorOrderTotal?: number | string;
  commission?: number | string;
  vendors?: string[];
  uniqueVendorsCount?: number;
  vendorsFees?: number | string;
  vendorFees?: number | string;
}

export interface OrdersMetrics {
  totalOrders?: number;
  deliveredOrders?: number;
  returnedOrders?: number;
  cancelledOrders?: number;
  pendingOrders?: number;
}

export interface Pagination {
  currentPage: number;
  perPage: number;
  totalPages: number;
  totalItems: number;
  count?: number;
  metrics?: OrdersMetrics;
}

export interface OrdersResponse {
  status: number;
  error: boolean;
  message: string;
  data: Order[];
  pagination: Pagination;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  image?: string;
  subtotal?: string;
  productImages?: string[];
}

export interface VendorItems {
  items: OrderItem[];
}

export interface OrderItemsResponse {
  items?: OrderItem[];
  itemsByVendor?: VendorItems[];
}

// types/order.ts

export interface OrderTimelineItem {
  status: string;
  description: string;
  timestamp: string;
  current: boolean;
  key: string;
}

export interface VendorItems {
  vendorName: string;
  vendorId: string;
  vendorTotal: number;
  items: OrderItem[];
}

export interface OrderDetailsResponse {
  orderInfo: {
    orderNo: string;
    status: string;
    paymentMethod: string;
    totalAmount: string;
    subtotalAmount: string;
    discountAmount: string;
    couponCode: string | null;
    createdAt: string;
    orderTimeline: OrderTimelineItem[];
  };
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    address: {
      streetAddress: string;
      apartment: string;
      city: string;
      companyName: string;
    };
  };
  orderSummary: {
    totalItemsCount: number;
    uniqueProductsCount: number;
    vendorsCount: number;
    vendors: string[];
    calculatedTotal: number;
  };
  itemsByVendor: VendorItems[];
}

export interface OverviewStats {
  completedOrders?: number;
  totalOrders?: number;
  totalContacts?: number;
  totalVendors?: number;
  adminUnreadMessages?: number;
  adminMessagesCount?: number;
  vendorUnreadMesagesCount?: number;
  buyerUnreadMessagesCount?: number;
  vendorMessagesCount?: number;
  buyerMessagesCount?: number;
}

export interface NotificationItem {
  notificationId: string;
  userId: string;
  title: string;
  message: string;
  isRead: string; // "0" or "1" based on your JSON
  readAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationResponse {
  status: number;
  error: boolean;
  message: string;
  notifications: NotificationItem[];
  unreadCount: number;
  pagination: {
    currentPage: number;
    perPage: number;
    totalPages: number;
    totalItems: number;
  };
}

export interface NotificationCounts {
  vendors: number;
  buyers: number;
  admin: number;
  pendingSignups: number;
}

export interface CategoryCount {
  label: string;
  count: number;
  route: string;
  type: "vendor" | "buyer" | "admin" | "pendingSignups";
}

export interface VendorProductPrice {
  current?: number;
  original?: number;
  [key: string]: unknown;
}

export interface VendorProductFlags {
  bestseller?: boolean;
  featured?: boolean;
  [key: string]: unknown;
}

export interface VendorProduct {
  productId?: string;
  id?: string;
  // API returns productName; name is kept as alias for compatibility
  productName?: string;
  name?: string;
  description?: string;
  productDescription?: string;
  vendorId?: string;
  vendorLogo?: string | null;
  storeName?: string;
  // API returns unitPrice as a flat number
  unitPrice?: number;
  discountPrice?: string;
  oldPrice?: number;
  totalPrice?: number;
  // Legacy nested-price shape (buyer-side storefront)
  price?: VendorProductPrice | number;
  currentPrice?: number;
  originalPrice?: number;
  images?: string[];
  productImages?: string[];
  image?: string;
  categoryId?: string;
  categoryName?: string;
  category?: string;
  flags?: VendorProductFlags;
  isActive?: string;
  stock?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

// ─── Analytics types ───────────────────────────────────────────────────────

export type Timeframe = "7d" | "30d";

export interface AnalyticsRevenueSeries {
  label: string;
  value: number;
}

export interface WeeklyRevenuePoint {
  day: string;
  revenue: number;
}

export interface AnalyticsCategoryItem {
  category: string;
  percentage: number;
}

export interface AnalyticsProductItem {
  product: string;
  sales: number;
  revenue: number;
}

export interface AnalyticsLocationItem {
  state: string;
  percentage: number;
}

export interface AnalyticsCustomerInsight {
  totalCustomers: number;
  newCustomersLabel: string;
  newCustomers: number;
  repeatBuyers: number;
  locations: AnalyticsLocationItem[];
}

export interface AnalyticsData {
  inventorySnapshot: {
    totalProducts: number;
    totalOrders: number;
    totalRevenue: number;
    pendingOrders: number;
  };
  summaryCards: {
    totalRevenue: number;
    totalOrders: number;
    avgOrderValue: number;
    conversionRate: number;
  };
  revenueSeries: {
    "7d": AnalyticsRevenueSeries[];
    "30d": AnalyticsRevenueSeries[];
  };
  weeklyRevenueComparison: {
    thisWeek: WeeklyRevenuePoint[];
    lastWeek: WeeklyRevenuePoint[];
  };
  salesByCategory: AnalyticsCategoryItem[];
  topSellingProducts: {
    "7d": AnalyticsProductItem[];
    "30d": AnalyticsProductItem[];
  };
  customerInsights: {
    "7d": AnalyticsCustomerInsight;
    "30d": AnalyticsCustomerInsight;
  };
}
