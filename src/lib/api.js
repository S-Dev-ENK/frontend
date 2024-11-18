// src/lib/api.js
const API_BASE_URL = import.meta.env.PROD ? 'https://enk-api.com' : 'https://enk-api.com';

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
    analyzeUrl: async (url) => {
        try {
            // 1단계: URL 분석 요청
            const response = await fetchWithErrorHandling(`${API_BASE_URL}/apis/malicious-domain/`, {
                method: 'POST',
                body: JSON.stringify({
                    url: url
                })
            });
 
            console.log('URL 분석 요청 성공:', response);
 
            if (!response.url_uuid) {
                throw new Error('URL UUID를 받지 못했습니다.');
            }
 
            // 2단계: 상세 정보 요청 (GET)
            console.log('상세 정보 요청 시작 - UUID:', response.url_uuid);
            
            const details = await fetchWithErrorHandling(
                `${API_BASE_URL}/apis/malicious-domain/details/?url_uuid=${response.url_uuid}`
            );
 
            console.log('상세 정보 요청 성공:', details);
 
            return {
                isSuccess: true,
                urlUuid: response.url_uuid,
                data: details
            };
 
        } catch (error) {
            console.error('API 요청 실패:', error);
            return {
                isSuccess: false,
                error: error.message
            };
        }
    }
 };

export default api;