// Environment configuration
export const config = {
  API_BASE_URL:
    import.meta.env.VITE_API_BASE_URL ||
    (import.meta.env.DEV ? "http://api.9jacart.ng" : "https://api.9jacart.ng"),
  IS_DEVELOPMENT: import.meta.env.DEV,
  IS_PRODUCTION: import.meta.env.PROD,
  API_DOCUMENTS_URL:
    import.meta.env.VITE_API_DOCUMENTS_URL ||
    (import.meta.env.DEV
      ? "http://api.9jacart.ng/documents/"
      : "https://api.9jacart.ng/documents/"),
};

// In development, HTTP is used by default to avoid SSL certificate issues
// In production, HTTPS is used by default
// You can override this by setting VITE_API_BASE_URL in your .env.local file
