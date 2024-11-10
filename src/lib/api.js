// src/lib/api.js
const API_BASE_URL = '/apis';

async function fetchWithErrorHandling(url, options = {}) {
    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            }
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP 오류! 상태: ${response.status}, 메시지: ${errorText}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API 요청 실패:', error);
        throw error;
    }
}

export const api = {
    analyzeUrl: async (requestedUrl) => {
        const requestBody = {
            requested_url: requestedUrl,
            redirect_urls: {
                property1: "string",
                property2: "string"
            },
            body: {}
        };

        const response = await fetchWithErrorHandling(`${API_BASE_URL}/malicious-domain/`, {
            method: 'POST',
            body: JSON.stringify(requestBody),
        });
        
        return {
            isSuccess: true,
            statusCode: response.status,
            urlUuid: response.url_uuid
        };
    }
};

export default api;