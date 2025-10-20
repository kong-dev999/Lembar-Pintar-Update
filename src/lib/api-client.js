/**
 * API Client with Cognito Token Support
 * Automatically adds Authorization header for Cognito authentication
 */

import { isCognito } from './auth/config';

/**
 * Get authentication headers
 * @returns {Object} Headers object with Authorization if available
 */
function getAuthHeaders() {
  const useCognito = isCognito();

  if (useCognito && typeof window !== 'undefined') {
    // Get Cognito token from localStorage
    const idToken = localStorage.getItem('cognito_id_token');
    if (idToken) {
      return {
        'Authorization': `Bearer ${idToken}`,
      };
    }
  }

  // For NextAuth, session is handled via cookies automatically
  return {};
}

/**
 * Enhanced fetch with automatic Cognito authentication
 *
 * @param {string} url - API endpoint URL
 * @param {Object} options - Fetch options
 * @returns {Promise<Response>} Fetch response
 */
export async function authenticatedFetch(url, options = {}) {
  const authHeaders = getAuthHeaders();

  const enhancedOptions = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
      ...options.headers,
    },
  };

  return fetch(url, enhancedOptions);
}

/**
 * API client methods
 */
export const apiClient = {
  /**
   * GET request
   */
  async get(url, options = {}) {
    const response = await authenticatedFetch(url, {
      ...options,
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * POST request
   */
  async post(url, data = {}, options = {}) {
    const response = await authenticatedFetch(url, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * PUT request
   */
  async put(url, data = {}, options = {}) {
    const response = await authenticatedFetch(url, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * DELETE request
   */
  async delete(url, options = {}) {
    const response = await authenticatedFetch(url, {
      ...options,
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * PATCH request
   */
  async patch(url, data = {}, options = {}) {
    const response = await authenticatedFetch(url, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  },
};

export default apiClient;
