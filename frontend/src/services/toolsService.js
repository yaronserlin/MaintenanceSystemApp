// src/services/toolsService.js
import apiClient from './apiClient'; // your preconfigured Axios instance

const toolsService = {
    /**
     * Fetch all tools (e.g., equipment list)
     * @returns {Promise<Array>} Array of tool objects
     */
    getAll: () =>
        apiClient
            .get('/tools')
            .then(res => res.data),

    /**
     * Fetch a single tool by its ID
     * @param {string|number} id - The tool's unique identifier
     * @returns {Promise<Object>} The tool object
     */
    getById: (id) =>
        apiClient
            .get(`/tools/${id}`)
            .then(res => res.data),

    /**
     * Create a new tool entry
     * @param {Object} payload - { name, type, serialNumber, details… }
     * @returns {Promise<Object>} The created tool
     */
    create: payload =>
        apiClient
            .post('/tools', payload)
            .then(res => res.data),

    /**
     * Update an existing tool
     * @param {string|number} id - The tool's ID
     * @param {Object} payload - Fields to update
     * @returns {Promise<Object>} The updated tool
     */
    update: (id, payload) =>
        apiClient
            .put(`/tools/${id}`, payload)
            .then(res => res.data),

    /**
     * Delete a tool by its ID
     * @param {string|number} id - The tool's ID
     * @returns {Promise<void>}
     */
    delete: id =>
        apiClient
            .delete(`/tools/${id}`)
            .then(res => res.data)
};

export default toolsService;
