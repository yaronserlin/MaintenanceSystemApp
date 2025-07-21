// src/services/userService.js
import apiClient from './apiClient';

/**
 * Service for user-related API calls: fetching/updating profile and changing password
 */
const userService = {
    /**
     * Retrieve the current user's profile
     * @returns {Promise} Axios response with user data
     */
    getProfile: () => apiClient.get('/auth/me'),

    /**
     * Update the current user's name and email
     * @param {{name: string, email: string}} data
     * @returns {Promise} Axios response with updated user data
     */
    updateProfile: (data) => apiClient.put('/auth/me', data),

    /**
     * Change the current user's password
     * @param {{currentPassword: string, newPassword: string}} payload
     * @returns {Promise} Axios response
     */
    changePassword: (payload) => apiClient.post('/auth/me/change-password', payload),
};

export default userService;
