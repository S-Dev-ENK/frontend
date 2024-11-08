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
        
        console.log('Request URL:', url);
        console.log('Response type:', response.type);
        console.log('Response status:', response.status);
        console.log('Response headers:', [...response.headers.entries()]);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error response:', errorText);
            throw new Error(`HTTP 오류! 상태: ${response.status}, 메시지: ${errorText}`);
        }
        
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return await response.json();
        } else {
            console.warn('응답이 JSON 형식이 아닙니다:', contentType);
            return await response.text();
        }
    } catch (error) {
        console.error('API 요청 실패:', error);
        throw error;
    }
}
// 아아아아
export const api = {
    analyzeUrl: async (requestedUrl) => {
        const requestBody = {
            requested_url: requestedUrl,
            redirect_urls: {
                // 필요한 경우 여기에 리다이렉트 URL 정보를 추가
                property1: "string",
                property2: "string"
            },
            body: {}
        };

        const response = await fetchWithErrorHandling(`${API_BASE_URL}/malicious-domain/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });
        
        if (response && response.status === 200) {
            return {
                isSuccess: true,
                statusCode: response.status,
                urlUuid: response.url_uuid
            };
        } else {
            throw new Error(`API 요청 실패: ${response.status}`);
        }
    },

   getDomainDetails: async (urlUuid) => {
        const response = await fetchWithErrorHandling(`${API_BASE_URL}/malicious-domain/details/?url_uuid=${encodeURIComponent(urlUuid)}`);
        
        return {
            isSuccess: response.is_success,
            statusCode: response.status_code,
            isMalicious: response.malicious,
            details: response.details
        };
    },

    getDomainStatus: async (urlUuid) => {
        const response = await fetchWithErrorHandling(`${API_BASE_URL}/malicious-domain/status/?url_uuid=${encodeURIComponent(urlUuid)}`);
        
        return {
            isSuccess: response.is_success,
            statusCode: response.status_code,
            status: response.status
        };
    },

    checkDomainHealth: async () => {
        return fetchWithErrorHandling(`${API_BASE_URL}/malicious-domain/health`);
    }
};

export default api;