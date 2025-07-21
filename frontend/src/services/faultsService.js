// src/services/faultService.js
import apiClient from './apiClient'; // e.g. an Axios instance preconfigured with baseURL + headers

const faultService = {
    getAll: () =>
        apiClient.get('/faults')
            .then(res => res.data),

    getById: (id) =>
        apiClient.get(`/faults/${id}`)
            .then(res => res.data),

    create: (payload) =>
        apiClient.post('/faults', payload)
            .then(res => res.data),

    close: (id) =>
        apiClient.patch(`/faults/${id}/close`)
            .then(res => res.data),
    reopen: (id) =>
        apiClient.patch(`/faults/${id}/reopen`)
            .then(res => res.data),
    update: (id, payload) =>
        apiClient.put(`/faults/${id}`, payload)
            .then(res => res.data),
    delete: (id) =>
        apiClient.delete(`/faults/${id}`)
            .then(res => res.data),

};

export default faultService;
