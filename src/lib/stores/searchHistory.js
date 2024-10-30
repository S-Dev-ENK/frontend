// src/lib/stores/searchHistory.js

import { writable } from 'svelte/store';

function createSearchHistory() {
    const { subscribe, set, update } = writable([]);

    return {
        subscribe,
        saveSearchHistory: (url, score, hash) => {
            update(history => {
                const newHistory = [{
                    url,
                    hash,
                    score,
                    timestamp: new Date().toISOString()
                }, ...history];
                
                if (newHistory.length > 10) {
                    newHistory.pop();
                }
                
                localStorage.setItem('searchHistory', JSON.stringify(newHistory));
                return newHistory;
            });
        },
        loadSearchHistory: () => {
            const savedHistory = localStorage.getItem('searchHistory');
            if (savedHistory) {
                set(JSON.parse(savedHistory));
            }
        },
        clearHistory: () => {
            set([]);
            localStorage.removeItem('searchHistory');
        }
    };
}

export const searchHistory = createSearchHistory();