// src/lib/api.js

const API_BASE_URL = 'http://your-fastapi-server.com/api'; // FastAPI 서버 URL로 변경예정

async function fetchWithErrorHandling(url, options = {}) {
    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('API request failed:', error);
        throw error;
    }
}

export const api = {
    analyzeUrl: async (url) => {
        return fetchWithErrorHandling(`${API_BASE_URL}/analyze`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url }),
        });
    },

    getSecurityVendors: async () => {
        return fetchWithErrorHandding(`${API_BASE_URL}/security-vendors`);
    },

    getCommunityScore: async (url) => {
        return fetchWithErrorHandling(`${API_BASE_URL}/community-score?url=${encodeURIComponent(url)}`);
    },

    // 넘어올 정보에 따라 추가적인 API 엔드포인트 추가 구현
};

export default api;