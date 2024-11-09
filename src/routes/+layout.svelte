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
        switch (tag) {
            case 'phishing': return 'bg-red-500';
            case 'malware': return 'bg-orange-400';
            case 'fraud': return 'bg-orange-500';
            case 'normal': return 'bg-green-400';
            case 'portal': return 'bg-blue-400';
            default: return 'bg-gray-400';
        }
    }
</script>

<div class="min-h-screen flex flex-col bg-white text-black">
    <nav class="fixed top-0 left-0 right-0 bg-white p-6 shadow-md z-50 flex justify-between items-center">
        <a href="/" class="flex items-center"> 
            <img src="/images/lucky_logo_row.png" alt="Malicious URL Detector" class="h-9" />
        </a>
    
        <div class="flex items-center space-x-3">
            <a 
                href="/" 
                class="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-all duration-200 {$page.url.pathname === '/' ? 'bg-gray-100' : ''}"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" 
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                    class="{$page.url.pathname === '/' ? 'text-blue-400' : 'text-gray-600'}"
                >
                    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                    <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
                <span class="text-sm text-blue-400 font-medium">Home</span>
            </a>
    
            <a 
                href="https://www.naver.com" 
                target="_blank" 
                rel="noopener noreferrer"
                class="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-all duration-200 {$page.url.pathname === '/api' ? 'bg-gray-100' : ''}"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" 
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                    class="text-gray-600"
                >
                    <rect width="7" height="7" x="14" y="3" rx="1"/>
                    <rect width="7" height="7" x="3" y="3" rx="1"/>
                    <rect width="7" height="7" x="14" y="14" rx="1"/>
                    <rect width="7" height="7" x="3" y="14" rx="1"/>
                </svg>
                <span class="text-sm text-blue-400 font-medium">API</span>
            </a>
    
            <a 
                href="https://www.naver.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                class="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-all duration-200 {$page.url.pathname === '/blog' ? 'bg-gray-100' : ''}"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" 
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                    class="text-gray-600"
                >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                <span class="text-sm text-blue-400 font-medium">Blog</span>
            </a>
    
            {#if $page.url.pathname !== '/'}
            <button 
                data-search-history-toggle
                on:click={toggleSearchHistory}
                class="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-all duration-200 {showSearchHistory ? 'bg-gray-100' : ''}"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" 
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                    class="text-gray-600"
                >
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                    <line x1="10" y1="9" x2="8" y2="9"/>
                </svg>
                <span class="text-sm font-medium">{showSearchHistory ? '검색 기록 닫기' : '검색 기록 보기'}</span>
            </button>
            {/if}
    
            {#if $page.url.pathname !== '/'}
                <div class="relative" bind:this={exportMenuRef}>
                    <button 
                        on:click={toggleExportMenu}
                        class="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-all duration-200 {showExportMenu ? 'bg-gray-100' : ''}"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" 
                            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                            class="text-gray-600"
                        >
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                            <polyline points="17 8 12 3 7 8"/>
                            <line x1="12" y1="3" x2="12" y2="15"/>
                        </svg>
                        <span class="text-sm font-medium">내보내기</span>
                    </button>
                    {#if showExportMenu}
                        <div class="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5" transition:fade={{duration: 100}}>
                            <div class="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                                <a href="#" class="block px-4 py-2 text-sm text-black hover:bg-gray-100" role="menuitem">PDF 내보내기</a>
                                <a href="#" class="block px-4 py-2 text-sm text-black hover:bg-gray-100" role="menuitem">(BETA)RAG보고서 내보내기</a>
                            </div>
                        </div>
                    {/if}
                </div>
            {/if}
        </div>
    </nav>

    <div class="pt-20"></div>
    
    <slot />

    {#if showSearchHistory}
        <div 
            bind:this={searchHistoryRef}
            class="fixed top-16 right-0 w-1/2 h-[calc(100vh-4rem)] bg-white p-5 overflow-auto shadow-lg" 
            transition:fade
        >
            <h3 class="text-xl font-bold mb-4">검색 기록</h3>
            {#if $searchHistory.length === 0}
                <p>검색 기록이 없습니다.</p>
            {:else}
                <table class="w-full">
                    <thead class="bg-gray-100">
                        <tr>
                            <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">No.</th>
                            <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">날짜</th>
                            <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">Domain/URL</th>
                            <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">Title</th>
                            <th class="px-4 py-3 text-center text-sm font-medium text-gray-600">상태</th>
                            <th class="px-4 py-3 text-center text-sm font-medium text-gray-600">리소스 수</th>
                            <th class="px-4 py-3 text-center text-sm font-medium text-gray-600">링크 수</th>
                            <th class="px-4 py-3 text-center text-sm font-medium text-gray-600">태그</th>
                            <th class="px-4 py-3 text-center text-sm font-medium text-gray-600">국가</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200">
                        {#each $searchHistory as analysis}
                            <tr class="hover:bg-gray-50">
                                <td class="px-4 py-3 text-sm text-gray-900">{analysis.no}</td>
                                <td class="px-4 py-3 text-sm text-gray-900">{analysis.date}</td>
                                <td class="px-4 py-3 text-sm text-blue-600 hover:underline">
                                    <a href={`/results?url=${encodeURIComponent(analysis.domain)}`}>{analysis.domain}</a>
                                </td>
                                <td class="px-4 py-3 text-sm text-gray-900">{analysis.title}</td>
                                <td class="px-4 py-3 text-sm">
                                    <span class="inline-flex items-center justify-center px-2 py-1 text-xs font-medium rounded-full text-white {getStatusClass(analysis.status)}">
                                        {analysis.status}
                                    </span>
                                </td>
                                <td class="px-4 py-3 text-sm text-center">{analysis.resourceCount}</td>
                                <td class="px-4 py-3 text-sm text-center">{analysis.linkCount}</td>
                                <td class="px-4 py-3 text-sm">
                                    <div class="flex gap-1 justify-center">
                                        {#each analysis.tags as tag}
                                            <span class="px-2 py-1 text-xs font-medium rounded-md text-white {getTagClass(tag)}">
                                                {tag}
                                            </span>
                                        {/each}
                                    </div>
                                </td>
                                <td class="px-4 py-3 text-sm text-center">{analysis.country}</td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            {/if}
        </div>
    {/if}

    <div class="pb-4"></div>
</div>

<style>
    :global(body) {
        margin: 0;
        padding: 0;
    }
</style>