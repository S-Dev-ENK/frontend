// src/lib/types/analysisTypes.js
export const AnalysisStatus = {
    PROCESSING: 'Processing',
    COMPLETE: 'Complete',
    ERROR: 'Error'
};

export const AnalysisDetails = {
    [AnalysisStatus.PROCESSING]: {
        title: '분석 중...',
        tag: 'analyzing',
        tagColor: 'bg-yellow-400'
    },
    [AnalysisStatus.COMPLETE]: {
        title: '분석 완료',
        tag: 'complete',
        tagColor: 'bg-green-400'
    },
    [AnalysisStatus.ERROR]: {
        title: '분석 지연',
        tag: 'error',
        tagColor: 'bg-red-500'
    }
};