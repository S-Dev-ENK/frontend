// $lib/stores/aiReportStore.js

import { writable, derived } from 'svelte/store';

function createAIReportStore() {
    const { subscribe, set, update } = writable({
        reports: {},        // 리포트 저장
        status: {},        // 상태 저장
        errors: {}         // 에러 저장
    });

    return {
        subscribe,
        getReport: (urlHash) => {
            return derived({ subscribe }, $store => ({
                report: $store.reports[urlHash],
                status: $store.status[urlHash] || 'idle',
                error: $store.errors[urlHash]
            }));
        },
        startAnalysis: (urlHash) => update(store => ({
            ...store,
            status: { ...store.status, [urlHash]: 'loading' },
            errors: { ...store.errors, [urlHash]: null }
        })),
        setReport: (urlHash, report) => update(store => ({
            ...store,
            reports: { ...store.reports, [urlHash]: report },
            status: { ...store.status, [urlHash]: 'complete' },
            errors: { ...store.errors, [urlHash]: null }
        })),
        setError: (urlHash, error) => update(store => ({
            ...store,
            status: { ...store.status, [urlHash]: 'error' },
            errors: { ...store.errors, [urlHash]: error }
        }))
    };
}

export const aiReportStore = createAIReportStore();