import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api';

export const apiFetch = async (endpoint, options = {}) => {
    try {

        const config = {
            url: `${API_URL}${endpoint}`,
            method: options.method || 'GET',
            data: options.body ? JSON.parse(options.body) : undefined,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
        };

        const response = await axios(config);
        return response.data;
    } catch (error) {
        console.error('API Error:', error);
        if (error.response && error.response.data) {
            // If server returns string (e.g. HTML 404 or text), wrap it
            if (typeof error.response.data === 'string') {
                return { message: error.response.data };
            }
            return error.response.data; // Return actual backend error object
        }
        return { success: false, message: 'Server Connection Failed' };
    }
};
