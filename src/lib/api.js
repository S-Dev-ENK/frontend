// src/lib/api.js
const API_BASE_URL = import.meta.env.PROD 
   ? 'http://enk-api.com/apis'  // https -> http로 변경
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
           mode: 'cors'
       });
       
       if (!response.ok) {
           let errorMessage;
           try {
               const errorData = await response.json();
               errorMessage = errorData.message || '알 수 없는 오류가 발생했습니다.';
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
       const requestBody = {
           requested_url: requestedUrl,
           redirect_urls: {
               property1: "string",
               property2: "string"
           },
           body: {}
       };

       try {
           const response = await fetchWithErrorHandling(`${API_BASE_URL}/malicious-domain/`, {
               method: 'POST',
               body: JSON.stringify(requestBody),
           });
           
           return {
               isSuccess: true,
               statusCode: response.status || 200,
               urlUuid: response.url_uuid || ''
           };
       } catch (error) {
           console.error('URL 분석 실패:', error);
           return {
               isSuccess: false,
               statusCode: 500,
               error: error.message
           };
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