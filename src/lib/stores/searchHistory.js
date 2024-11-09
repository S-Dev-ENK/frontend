// src/lib/stores/searchHistory.js
import { writable } from 'svelte/store';

const STORAGE_KEY = 'searchHistory';
const URL_HASH_MAP_KEY = 'urlHashMap';

function createSearchHistory() {
    const { subscribe, set, update } = writable([]);

    // localStorage에서 초기 데이터 로드
    if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            set(JSON.parse(stored));
        }
    }

    return {
        subscribe,
        addSearch: (data) => update(items => {
            // URL 해시맵 업데이트
            if (typeof window !== 'undefined' && data.urlHash && data.url) {
                const urlMap = JSON.parse(localStorage.getItem(URL_HASH_MAP_KEY) || '{}');
                urlMap[data.urlHash] = data.url;
                localStorage.setItem(URL_HASH_MAP_KEY, JSON.stringify(urlMap));
            }

            const newItem = {
                no: items.length + 1,
                date: new Date().toLocaleString(),
                domain: data.url,
                urlHash: data.urlHash,
                title: data.title || '',
                status: 'Online',
                resourceCount: data.resourceCount || 0,
                linkCount: data.linkCount || 0,
                tags: data.tags || ['normal'],
                country: data.country || ''
            };
            
            const updatedItems = [newItem, ...items].slice(0, 10);
            
            if (typeof window !== 'undefined') {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedItems));
            }
            
            return updatedItems;
        }),
        
        loadSearchHistory: () => {
            if (typeof window !== 'undefined') {
                const stored = localStorage.getItem(STORAGE_KEY);
                if (stored) {
                    set(JSON.parse(stored));
                }
            }
        },

        getUrlByHash: (hash) => {
            if (typeof window !== 'undefined') {
                const urlMap = JSON.parse(localStorage.getItem(URL_HASH_MAP_KEY) || '{}');
                return urlMap[hash];
            }
            return null;
        },

        clearHistory: () => {
            set([]);
            if (typeof window !== 'undefined') {
                localStorage.removeItem(STORAGE_KEY);
                localStorage.removeItem(URL_HASH_MAP_KEY); // URL 해시맵도 함께 제거
            }
        }
    };
}

export const searchHistory = createSearchHistory();

// 브라우저 탐색 이벤트 감지
if (typeof window !== 'undefined') {
    window.addEventListener('popstate', () => {
        searchHistory.loadSearchHistory();
    });
}