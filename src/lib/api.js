// src/lib/api.js
const API_BASE_URL = import.meta.env.PROD 
    ? '/apis'
    : '/apis';

async function fetchWithErrorHandling(url, options = {}) {
    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            credentials: 'omit',
        });
        
        if (!response.ok) {
            let errorMessage;
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorData.detail || '알 수 없는 오류가 발생했습니다.';
            } catch {
                errorMessage = await response.text();
            }
            throw new Error(`HTTP 오류! 상태: ${response.status}, 메시지: ${errorMessage}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API 요청 실패:', error);
        throw error;
    }
}

export const api = {
    analyzeUrl: async (requestedUrl) => {
        try {
            // URL에 프로토콜 추가
            let processedUrl = requestedUrl;
            if (!processedUrl.startsWith('http://') && !processedUrl.startsWith('https://')) {
                processedUrl = `${requestedUrl}`;
            }

            // URL을 query parameter로 전송
            const encodedUrl = encodeURIComponent(processedUrl);
            const queryUrl = `${API_BASE_URL}/malicious-domain/?url=${encodedUrl}`;

            console.log('Sending request to:', queryUrl);

            const response = await fetchWithErrorHandling(queryUrl, {
                method: 'POST'  // POST 메소드는 유지
            });
            
            console.log('Received response:', response);

            if (response && response.url_uuid) {
                return {
                    isSuccess: true,
                    statusCode: 200,
                    urlUuid: response.url_uuid
                };
            } else {
                throw new Error('잘못된 응답 형식입니다.');
            }
        } catch (error) {
            console.error('URL 분석 실패:', error);
            return {
                isSuccess: false,
                statusCode: error.status || 422,
                error: error.message
            };
        }
    },



    getDomainDetails: async (urlUuid) => {
        try {
            const response = await fetchWithErrorHandling(`${API_BASE_URL}/malicious-domain/details/?url_uuid=${encodeURIComponent(urlUuid)}`);
            
            return {
                isSuccess: true,
                statusCode: response.status_code,
                isMalicious: response.malicious,
                details: response.details
            };
        } catch (error) {
            console.error('도메인 상세 정보 조회 실패:', error);
            return {
                isSuccess: false,
                statusCode: 500,
                error: error.message
            };
        }
    },

    getDomainStatus: async (urlUuid) => {
        try {
            const response = await fetchWithErrorHandling(`${API_BASE_URL}/malicious-domain/status/?url_uuid=${encodeURIComponent(urlUuid)}`);
            
            return {
                isSuccess: true,
                statusCode: response.status_code,
                status: response.status
            };
        } catch (error) {
            console.error('도메인 상태 조회 실패:', error);
            return {
                isSuccess: false,
                statusCode: 500,
                error: error.message
            };
        }
    },

    checkDomainHealth: async () => {
        try {
            const response = await fetchWithErrorHandling(`${API_BASE_URL}/malicious-domain/health`);
            return response;
        } catch (error) {
            console.error('도메인 헬스 체크 실패:', error);
            throw error;
        }
    }
};

export default api;