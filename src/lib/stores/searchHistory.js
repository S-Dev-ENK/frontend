import { writable } from 'svelte/store';
import { AnalysisStatus, AnalysisDetails } from '../types/analysisTypes';

const STORAGE_KEY = 'searchHistory';
const URL_HASH_MAP_KEY = 'urlHashMap';

function createSearchHistory() {
   const { subscribe, set, update } = writable([]);

   // localStorage에서 초기 데이터 로드
   if (typeof window !== 'undefined') {
       const stored = localStorage.getItem(STORAGE_KEY);
       if (stored) {
           const items = JSON.parse(stored);
           const updatedItems = items.map((item, index) => ({
               ...item,
               no: items.length - index
           }));
           set(updatedItems);
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

           const status = data.status || AnalysisStatus.PROCESSING;
           const analysisDetail = AnalysisDetails[status];

           const newItem = {
               no: 1,
               date: new Date().toLocaleString(),
               domain: data.url,
               urlHash: data.urlHash,
               title: status === AnalysisStatus.COMPLETE ? (data.title || data.url) : analysisDetail.title,
               status: status,
               resourceCount: data.resourceCount || 0,
               linkCount: data.linkCount || 0,
               tags: [analysisDetail.tag],
               country: data.country || '-'
           };
           
           // 기존 항목들의 번호를 1씩 증가
           const updatedItems = items.map(item => ({
               ...item,
               no: item.no + 1
           }));
           
           // 새 항목을 추가하고 최대 10개만 유지
           const finalItems = [newItem, ...updatedItems].slice(0, 10);
           
           if (typeof window !== 'undefined') {
               localStorage.setItem(STORAGE_KEY, JSON.stringify(finalItems));
           }
           
           return finalItems;
       }),

       updateSearchStatus: (urlHash, status, result = null) => update(items => {
           const analysisDetail = AnalysisDetails[status];
           const updatedItems = items.map(item => {
               if (item.urlHash === urlHash) {
                   return {
                       ...item,
                       status: status,
                       title: status === AnalysisStatus.COMPLETE ? (result?.title || item.domain) : analysisDetail.title,
                       tags: [analysisDetail.tag],
                       ...(result && {
                           resourceCount: result.resourceCount || 0,
                           linkCount: result.linkCount || 0,
                           country: result.country || '-'
                       })
                   };
               }
               return item;
           });
           
           if (typeof window !== 'undefined') {
               localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedItems));
           }
           return updatedItems;
       }),
       
       loadSearchHistory: () => {
           if (typeof window !== 'undefined') {
               const stored = localStorage.getItem(STORAGE_KEY);
               if (stored) {
                   const items = JSON.parse(stored);
                   const updatedItems = items.map((item, index) => ({
                       ...item,
                       no: index + 1
                   }));
                   set(updatedItems);
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
               localStorage.removeItem(URL_HASH_MAP_KEY);
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