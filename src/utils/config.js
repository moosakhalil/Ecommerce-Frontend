/**
 * Centralized API Configuration
 * 
 * This module provides a single source of truth for API endpoints.
 * It automatically switches between local development and production
 * based on environment variables.
 * 
 * Local: Uses http://localhost:5000 (from .env.local)
 * Production: Uses Render backend URL (from Vercel env vars)
 */

// Get API base URL from environment variable with fallback
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

/**
 * Build a full API URL from an endpoint path
 * @param {string} endpoint - API endpoint path (e.g., '/api/users')
 * @returns {string} Full API URL
 */
export const getApiUrl = (endpoint) => {
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${cleanEndpoint}`;
};

/**
 * Build a full URL for images and static assets
 * @param {string} path - Path to the image/asset (e.g., '/uploads/image.jpg')
 * @returns {string} Full asset URL
 */
export const getImageUrl = (path) => {
  if (!path) return '';
  // If path already includes http/https, return as-is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  // Remove leading slash if present to avoid double slashes
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
};

/**
 * Check if we're in development mode
 * @returns {boolean}
 */
export const isDevelopment = () => {
  return API_BASE_URL.includes('localhost');
};

// Log current configuration in development
if (process.env.NODE_ENV === 'development') {
  console.log('🔧 API Configuration:', {
    baseUrl: API_BASE_URL,
    environment: isDevelopment() ? 'Development' : 'Production'
  });
}

export default {
  API_BASE_URL,
  getApiUrl,
  getImageUrl,
  isDevelopment
};
