import type {
  ApiResponse,
  PaginatedApiResponse,
  Contact,
  WaitlistEntry,
  LoginCredentials,
  LoginResponse,
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

  // Auth
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await this.request<LoginResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        emailAddress: credentials.email,
        password: credentials.password,
      }),
    });

    if (response.token) {
      const { setAuth } = useAuthStore.getState();

      // Create a user object from the email since backend doesn't provide user info
      const user = {
        id: "user-" + Date.now(), // Temporary ID
        email: credentials.email,
        name: credentials.email.split("@")[0], // Use email prefix as name
      };

      setAuth(response.token, user);

      // Keep localStorage for backward compatibility
      localStorage.setItem("auth_token", response.token);
    } else {
      throw new Error("Login failed: No token received from server");
    }

    return response;
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
}

export const apiService = new ApiService();
