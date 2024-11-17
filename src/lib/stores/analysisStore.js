// src/lib/stores/analysisStore.js
import { writable } from 'svelte/store';

function createAnalysisStore() {
    const { subscribe, set, update } = writable({
        isAnalyzing: false,
        currentUrl: '',
        error: null
    });

    return {
        subscribe,
        startAnalysis: (url) => {
            update(state => ({
                ...state,
                isAnalyzing: true,
                currentUrl: url,
                error: null
            }));
        },
        finishAnalysis: () => {
            update(state => ({
                ...state,
                isAnalyzing: false
            }));
        },
        setError: (error) => {
            update(state => ({
                ...state,
                isAnalyzing: false,
                error
            }));
        },
        reset: () => {
            set({
                isAnalyzing: false,
                currentUrl: '',
                error: null
            });
        }
    };
}

export const analysisStore = createAnalysisStore();