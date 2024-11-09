// src/lib/stores/searchHistory.js
import { writable } from 'svelte/store';

const STORAGE_KEY = 'searchHistory'; // 기존 키 유지

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
            const newItem = {
                no: items.length + 1,
                date: new Date().toLocaleString(),
                domain: data.url,
                title: data.title || '',
                status: 'Online',
                resourceCount: data.resourceCount || 0,
                linkCount: data.linkCount || 0,
                tags: data.tags || ['normal'],
                country: data.country || ''
            };
            const updatedItems = [newItem, ...items].slice(0, 10); // 최근 10개만 유지
            
            // localStorage 업데이트
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
        clearHistory: () => {
            set([]);
            if (typeof window !== 'undefined') {
                localStorage.removeItem(STORAGE_KEY);
            }
        }
    };
}

export const searchHistory = createSearchHistory();

// 브라우저 탐색 이벤트 감지 (선택적)
if (typeof window !== 'undefined') {
    window.addEventListener('popstate', () => {
        searchHistory.loadSearchHistory();
    });
}