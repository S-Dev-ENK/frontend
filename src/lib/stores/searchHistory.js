// $lib/stores/searchHistory.js
import { writable } from 'svelte/store';

function createSearchHistoryStore() {
    const { subscribe, set, update } = writable([]);

    return {
        subscribe,
        saveSearchHistory: (url, score) => update(history => {
            const newHistory = [{ url, score, timestamp: new Date() }, ...history].slice(0, 25);
            localStorage.setItem('searchHistory', JSON.stringify(newHistory));
            return newHistory;
        }),
        loadSearchHistory: () => {
            const savedHistory = localStorage.getItem('searchHistory');
            if (savedHistory) {
                set(JSON.parse(savedHistory));
            }
        }
    };
}

export const searchHistory = createSearchHistoryStore();