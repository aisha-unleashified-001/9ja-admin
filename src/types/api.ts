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
