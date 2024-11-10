// src/lib/utils/urlValidation.js
export const urlValidation = {
    isValidUrl: function(url) {
        try {
            if (!url || url.trim() === '') {
                throw new Error('URL을 입력해주세요.');
            }

            let urlString = url;
            if (!/^https?:\/\//i.test(url)) {
                urlString = 'http://' + url;
            }

            const urlObj = new URL(urlString);

            const urlPattern = /^https?:\/\/[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;
            if (!urlPattern.test(urlString)) {
                throw new Error('올바른 URL 형식이 아닙니다.');
            }

            if (urlObj.hostname.length < 3) {
                throw new Error('도메인이 너무 짧습니다.');
            }

            const invalidChars = /[\s<>{}|\\\^~\[\]`]/g;
            if (invalidChars.test(url)) {
                throw new Error('URL에 허용되지 않는 문자가 포함되어 있습니다.');
            }

            return {
                isValid: true,
                url: urlString
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