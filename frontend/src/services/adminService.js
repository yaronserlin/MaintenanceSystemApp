// src/services/adminService.js
import apiClient from './apiClient';

const adminService = {
    // ── Users ────────────────────────────────────────────────────────────────

    /** GET  /api/admin/users */
    getUsers: async () => {
        const res = await apiClient.get('/admin/users');
        return res.data;
    },

    /** POST /api/admin/users
     *  body: { name, email, password, role }
     */
    createUser: async (userData) => {
        const res = await apiClient.post('/admin/users', userData);
        return res.data;
    },

    /** PATCH /api/admin/users/:id/role
     *  body: { role }
     */
    updateUserRole: async (userId, newRole) => {
        const res = await apiClient.patch(`/admin/users/${userId}/role`, { role: newRole });
        return res.data;
    },

    /** DELETE /api/admin/users/:id */
    deleteUser: async (userId) => {
        await apiClient.delete(`/admin/users/${userId}`);
    },


    // ── Equipment ────────────────────────────────────────────────────────────

    /** GET /api/admin/equipment */
    getEquipment: async () => {
        const res = await apiClient.get('/admin/equipment');
        return res.data;
    },

    /** POST /api/admin/equipment */
    createEquipment: async (data) => {
        const res = await apiClient.post('/admin/equipment', data);
        return res.data;
    },

    /** PUT /api/admin/equipment/:id */
    updateEquipment: async (id, updates) => {
        const res = await apiClient.put(`/admin/equipment/${id}`, updates);
        return res.data;
    },

    /** DELETE /api/admin/equipment/:id */
    deleteEquipment: async (id) => {
        await apiClient.delete(`/admin/equipment/${id}`);
    },

    // ── Tools (backward-compatible aliases) ───────────────────────────────────

    /** GET  /api/admin/tools */
    getTools: async () => {
        const res = await apiClient.get('/admin/tools');
        return res.data;
    },

    /** POST /api/admin/tools
     *  body: { name, serialNumber, description, model, localSerialNumber }
     */
    createTool: async (toolData) => {
        const res = await apiClient.post('/admin/tools', toolData);
        return res.data;
    },

    /** PUT /api/admin/tools/:id
     *  body: updated fields
     */
    updateTool: async (toolId, updates) => {
        const res = await apiClient.put(`/admin/tools/${toolId}`, updates);
        return res.data;
    },

    /** DELETE /api/admin/tools/:id */
    deleteTool: async (toolId) => {
        await apiClient.delete(`/admin/tools/${toolId}`);
    },
};

export default adminService;
