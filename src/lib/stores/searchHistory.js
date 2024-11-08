// src/lib/stores/searchHistory.js
import { writable } from 'svelte/store';

function createSearchHistory() {
    const { subscribe, set, update } = writable([]);

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
            return [newItem, ...items].slice(0, 10); // 최근 10개만 유지
        }),
        loadSearchHistory: () => {
            const stored = localStorage.getItem('searchHistory');
            if (stored) {
                set(JSON.parse(stored));
            }
        },
        clearHistory: () => set([])
    };
}

export const searchHistory = createSearchHistory();

// localStorage와 동기화
searchHistory.subscribe(value => {
    if (typeof localStorage !== 'undefined') {
        localStorage.setItem('searchHistory', JSON.stringify(value));
    }
});