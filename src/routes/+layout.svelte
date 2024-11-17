<script>
    import '../app.css';
    import { page } from '$app/stores';
    import { onMount } from 'svelte';
    import { fade } from 'svelte/transition';
    import { searchHistory } from '$lib/stores/searchHistory';
    import NavigationMenu from '$lib/components/NavigationMenu.svelte';

    let showSearchHistory = false;
    let showExportMenu = false;
    let exportMenuRef;
    let searchHistoryRef;

    onMount(() => {
    searchHistory.loadSearchHistory();

    const handleClickOutside = (event) => {
        if (exportMenuRef && !exportMenuRef.contains(event.target)) {
            showExportMenu = false;
        }
        
        if (searchHistoryRef && 
            !searchHistoryRef.contains(event.target) && 
            !event.target.closest('button')?.matches('[data-search-history-toggle]')) {
            showSearchHistory = false;
        }
    };

    // 브라우저 탐색 이벤트 감지
    window.addEventListener('click', handleClickOutside);
    window.addEventListener('popstate', () => {
        searchHistory.loadSearchHistory();
    });

    return () => {
        window.removeEventListener('click', handleClickOutside);
        window.removeEventListener('popstate', () => {
            searchHistory.loadSearchHistory();
        });
    };
    });

    function toggleSearchHistory(event) {
        event?.stopPropagation();
        showSearchHistory = !showSearchHistory;
    }

    function toggleExportMenu(event) {
        event.stopPropagation();
        showExportMenu = !showExportMenu;
    }

    function getStatusClass(status) {
        return status === 'Online' ? 'bg-green-500' : 'bg-gray-500';
    }

    function getTagClass(tag) {
        switch (tag.toLowerCase()) {
            case 'analyzing':
                return 'bg-yellow-400';  // 분석 중 - 노란색
            case 'normal':
                return 'bg-green-400';   // 정상 - 초록색
            case 'error':
                return 'bg-red-500';     // 에러 - 빨간색
            case 'complete':
                return 'bg-blue-400';    // 완료 - 파란색
            case 'phishing':
                return 'bg-red-500';     // 피싱 - 빨간색
            case 'malware':
                return 'bg-orange-400';  // 멀웨어 - 주황색
            case 'fraud':
                return 'bg-orange-500';  // 사기 - 진한 주황색
            case 'portal':
                return 'bg-blue-400';    // 포털 - 파란색
            default:
                return 'bg-gray-400';    // 기타 - 회색
        }
    }
</script>

<div class="min-h-screen flex flex-col bg-white text-black">
    <!-- 네비게이션 바 -->
    <nav class="fixed top-0 left-0 right-0 bg-white p-3 sm:p-6 shadow-md z-50">
        <div class="max-w-8xl mx-auto flex justify-between items-center">
            <!-- 왼쪽: 로고 -->
            <div class="flex-shrink-0"> 
                <a href="/" class="flex items-center"> 
                    <img src="/images/lucky_logo_row.png" alt="Malicious URL Detector" class="h-7 sm:h-9" />
                </a>
            </div>
            
            <!-- 오른쪽: 네비게이션 메뉴 -->
            <div class="flex items-center gap-2 sm:gap-3">
                <!-- 홈 버튼 -->
                <a 
                    href="/" 
                    class="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-gray-100 transition-all duration-200 whitespace-nowrap
                        {$page.url.pathname === '/' ? 'bg-gray-100' : ''}"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 sm:w-5 sm:h-5 {$page.url.pathname === '/' ? 'text-blue-400' : 'text-gray-600'}" viewBox="0 0 24 24" fill="none" 
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                        <polyline points="9 22 9 12 15 12 15 22"/>
                    </svg>
                    <span class="text-xs sm:text-sm text-blue-400 font-medium hidden sm:inline">Home</span>
                </a>
    
                <!-- API 버튼 -->
                <a 
                href="/api-service" 
                class="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-gray-100 transition-all duration-200 whitespace-nowrap
                    {$page.url.pathname === '/api-service' ? 'bg-gray-100' : ''}"
                
                    >
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" viewBox="0 0 24 24" fill="none" 
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect width="7" height="7" x="14" y="3" rx="1"/>
                        <rect width="7" height="7" x="3" y="3" rx="1"/>
                        <rect width="7" height="7" x="14" y="14" rx="1"/>
                        <rect width="7" height="7" x="3" y="14" rx="1"/>
                    </svg>
                    <span class="text-xs sm:text-sm text-blue-400 font-medium hidden sm:inline">API</span>
                </a>
    
                <!-- Blog 버튼 -->
                <a 
                    href="https://www.naver.com" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    class="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-gray-100 transition-all duration-200 whitespace-nowrap"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" viewBox="0 0 24 24" fill="none" 
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                    <span class="text-xs sm:text-sm text-blue-400 font-medium hidden sm:inline">Blog</span>
                </a>
    
                {#if $page.url.pathname !== '/'}
                <!-- 검색 기록 버튼 -->
                <button 
                    data-search-history-toggle
                    on:click={toggleSearchHistory}
                    class="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-gray-100 transition-all duration-200 whitespace-nowrap
                        {showSearchHistory ? 'bg-gray-100' : ''}"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" viewBox="0 0 24 24" fill="none" 
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                        <polyline points="14 2 14 8 20 8"/>
                        <line x1="16" y1="13" x2="8" y2="13"/>
                        <line x1="16" y1="17" x2="8" y2="17"/>
                        <line x1="10" y1="9" x2="8" y2="9"/>
                    </svg>
                    <span class="text-xs sm:text-sm font-medium hidden sm:inline">{showSearchHistory ? '검색 기록 닫기' : '검색 기록 보기'}</span>
                </button>
    
                <!-- 내보내기 메뉴 -->
                <div class="relative" bind:this={exportMenuRef}>
                    <button 
                        on:click={toggleExportMenu}
                        class="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-gray-100 transition-all duration-200 whitespace-nowrap
                            {showExportMenu ? 'bg-gray-100' : ''}"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" viewBox="0 0 24 24" fill="none" 
                            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                            <polyline points="17 8 12 3 7 8"/>
                            <line x1="12" y1="3" x2="12" y2="15"/>
                        </svg>
                        <span class="text-xs sm:text-sm font-medium hidden sm:inline">내보내기</span>
                    </button>
                    {#if showExportMenu}
                        <div class="absolute right-0 mt-2 w-48 sm:w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5" 
                             transition:fade={{duration: 100}}
                             style="z-index: 100;">
                            <div class="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                                <a href="#" class="block px-4 py-2 text-xs sm:text-sm text-black hover:bg-gray-100" role="menuitem">PDF 내보내기</a>
                                <a href="#" class="block px-4 py-2 text-xs sm:text-sm text-black hover:bg-gray-100" role="menuitem">(BETA)RAG보고서 내보내기</a>
                            </div>
                        </div>
                    {/if}
                </div>
                {/if}
            </div>
        </div>
    </nav>

    <div class="pt-16 sm:pt-20"></div>
    
    <slot />

    <!-- 검색 기록 사이드바 -->
    {#if showSearchHistory}
            <div 
                bind:this={searchHistoryRef}
                class="search-history-sidebar fixed top-16 sm:top-20 right-0 w-full sm:w-2/3 md:w-1/2 h-[calc(100vh-4rem)] bg-white p-3 sm:p-5 overflow-auto shadow-lg"
                style="z-index: 40;"
            >
                <h3 class="text-lg sm:text-xl font-bold mb-4">검색 기록</h3>
            {#if $searchHistory.length === 0}
                <p class="text-center text-gray-500 py-4">검색 기록이 없습니다.</p>
            {:else}
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead class="bg-gray-100">
                            <tr>
                                <th class="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-600">No.</th>
                                <th class="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-600 hidden sm:table-cell">날짜</th>
                                <th class="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-600">Domain/URL</th>
                                <th class="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-600 hidden md:table-cell">Title</th>
                                <th class="px-2 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm font-medium text-gray-600">상태</th>
                                <th class="px-2 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm font-medium text-gray-600 hidden lg:table-cell">리소스</th>
                                <th class="px-2 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm font-medium text-gray-600 hidden lg:table-cell">링크</th>
                                <th class="px-2 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm font-medium text-gray-600">태그</th>
                                <th class="px-2 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm font-medium text-gray-600 hidden md:table-cell">국가</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-200">
                            {#each $searchHistory as analysis}
                                <tr class="hover:bg-gray-50">
                                    <td class="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900">{analysis.no}</td>
                                    <td class="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900 hidden sm:table-cell">{analysis.date}</td>
                                    <td class="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-blue-600 hover:underline truncate max-w-[150px] sm:max-w-[200px]">
                                        <a href={`/results?hash=${analysis.urlHash}`} title={analysis.domain}>{analysis.domain}</a>
                                    </td>
                                    <td class="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900 hidden md:table-cell truncate max-w-[150px] sm:max-w-[200px]" title={analysis.title}>{analysis.title}</td>
                                    <td class="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-center">
                                        <span class="inline-flex items-center justify-center px-2 py-1 text-xs font-medium rounded-full text-white {getStatusClass(analysis.status)}">
                                            {analysis.status}
                                        </span>
                                    </td>
                                    <td class="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-center hidden lg:table-cell">{analysis.resourceCount}</td>
                                    <td class="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-center hidden lg:table-cell">{analysis.linkCount}</td>
                                    <td class="px-2 sm:px-4 py-2 sm:py-3">
                                        <div class="flex flex-wrap gap-1 justify-center">
                                            {#each analysis.tags as tag}
                                                <span class="px-2 py-1 text-xs font-medium rounded-md text-white {getTagClass(tag)}">
                                                    {tag}
                                                </span>
                                            {/each}
                                        </div>
                                    </td>
                                    <td class="px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-center hidden md:table-cell">{analysis.country}</td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                </div>
            {/if}
        </div>
    {/if}
 
    <div class="pb-4"></div>
 </div>
 
 <style>
    :global(body) {
        margin: 0;
        padding: 0;
        overflow-x: hidden;
    }
 
    /* 네비게이션 메뉴 스크롤바 숨기기 */
    .hide-scrollbar {
        -ms-overflow-style: none;  /* IE and Edge */
        scrollbar-width: none;  /* Firefox */
    }
    
    .hide-scrollbar::-webkit-scrollbar {
        display: none;  /* Chrome, Safari, Opera */
    }
 
    /* 검색 기록 테이블 스크롤바 스타일링 */
    .overflow-x-auto {
        -webkit-overflow-scrolling: touch;
        scrollbar-width: thin;
    }
 
    .overflow-x-auto::-webkit-scrollbar {
        height: 6px;
        width: 6px;
    }
 
    .overflow-x-auto::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 3px;
    }
 
    .overflow-x-auto::-webkit-scrollbar-thumb {
        background: #888;
        border-radius: 3px;
    }
 
    .overflow-x-auto::-webkit-scrollbar-thumb:hover {
        background: #555;
    }
 
    /* 반응형 스타일링 */
    @media (max-width: 640px) {
        /* 모바일 최적화 */
        nav {
            padding: 0.75rem 1rem;
        }
 
        .nav-item {
            padding: 0.5rem 0.75rem;
        }
 
        /* 모바일에서 사이드바 전체 너비로 */
        :global(.sidebar) {
            width: 100% !important;
        }
 
        /* 모바일에서 테이블 스크롤 개선 */
        .overflow-x-auto {
            margin: 0 -0.75rem;
            padding: 0 0.75rem;
        }
 
        /* 긴 텍스트 처리 */
        .truncate {
            max-width: 150px;
        }
 
        /* 모바일에서 내보내기 메뉴 위치 조정 */
        .export-menu {
            right: 0;
            left: auto;
        }
    }
 
    @media (min-width: 641px) and (max-width: 1024px) {
        /* 태블릿 최적화 */
        .truncate {
            max-width: 200px;
        }
 
        /* 태블릿에서 사이드바 너비 조정 */
        :global(.sidebar) {
            width: 66.666667% !important;
        }
    }
 
    @media (min-width: 1025px) {
        /* 데스크톱 최적화 */
        .truncate {
            max-width: 250px;
        }
 
        /* 데스크톱에서 사이드바 너비 */
        :global(.sidebar) {
            width: 50% !important;
        }
    }
 
    /* 애니메이션 */
    @keyframes slideIn {
        from {
            transform: translateX(100%);
        }
        to {
            transform: translateX(0);
        }
    }
 
    @keyframes fadeIn {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }
 
    /* 사이드바 애니메이션 */
    /* 사이드바 슬라이드 애니메이션 */
    .search-history-sidebar {
        animation: slideIn 0.3s ease-out;
    }

    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    /* 드롭다운 메뉴 애니메이션 */
    .export-menu {
        animation: fadeIn 0.2s ease-out;
    }
 
    /* 터치 디바이스 최적화 */
    @media (hover: none) {
        .hover\:bg-gray-100:hover {
            background-color: transparent;
        }
 
        /* 터치 액션 피드백 */
        .hover\:bg-gray-100:active {
            background-color: #f3f4f6;
        }
    }
 </style> 