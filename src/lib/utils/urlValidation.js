// src/lib/utils/urlValidation.js
export const urlValidation = {
    isValidUrl: function(url) {
        try {
            if (!url || url.trim() === '') {
                throw new Error('URL을 입력해주세요.');
            }

            let urlString = url.trim();
            
            // 도메인 형식 검증 (프로토콜 없이)
            const domainPattern = /^[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;
            // 전체 URL 형식 검증 (프로토콜 포함)
            const urlPattern = /^https?:\/\/[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;

            // // URL에 프로토콜이 없는 경우 체크
            // if (!urlString.startsWith('http://') && !urlString.startsWith('https://')) {
            //     // 도메인 패턴 검사
            //     if (!domainPattern.test(urlString)) {
            //         throw new Error('올바른 도메인 형식이 아닙니다.');
            //     }
            // } else {
            //     // 전체 URL 패턴 검사
            //     if (!urlPattern.test(urlString)) {
            //         throw new Error('올바른 URL 형식이 아닙니다.');
            //     }
            // }

            // 허용되지 않는 문자 확인
            const invalidChars = /[\s<>{}|\\\^~\[\]`]/g;
            if (invalidChars.test(urlString)) {
                throw new Error('URL에 허용되지 않는 문자가 포함되어 있습니다.');
            }

            return {
                isValid: true,
                url: urlString  // 원본 URL 반환
            };
        } catch (error) {
            return {
                isValid: false,
                error: error.message
            };
        }
    }
};

export default urlValidation;