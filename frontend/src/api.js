import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 20000,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const metricsAPI = {
    getCurrentMetrics: async () => {
        const response = await api.get('/api/metrics/current');
        return response.data;
    },

    getHistoricalMetrics: async (minutes = 60) => {
        const response = await api.get(`/api/metrics/history?minutes=${minutes}`);
        return response.data;
    },

    getTopProcesses: async (minutes = 5) => {
        const response = await api.get(`/api/processes/top?minutes=${minutes}`);
        return response.data;
    },

    healthCheck: async () => {
        const response = await api.get('/');
        return response.data;
    },
};

export default api;
