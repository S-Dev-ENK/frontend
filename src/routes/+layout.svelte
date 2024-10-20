<script>
    import '../app.css';
    import { page } from '$app/stores';
    import { onMount } from 'svelte';
    import { fade } from 'svelte/transition';
    import { searchHistory } from '$lib/stores/searchHistory';

    let showSearchHistory = false;
    let showExportMenu = false;
    let exportMenuRef;

    onMount(() => {
        searchHistory.loadSearchHistory();

        const handleClickOutside = (event) => {
            if (exportMenuRef && !exportMenuRef.contains(event.target)) {
                showExportMenu = false;
            }
        };

        window.addEventListener('click', handleClickOutside);

        return () => {
            window.removeEventListener('click', handleClickOutside);
        };
    });

    function toggleSearchHistory() {
        showSearchHistory = !showSearchHistory;
    }

    function toggleExportMenu(event) {
        event.stopPropagation();
        showExportMenu = !showExportMenu;
    }
</script>

<div class="min-h-screen flex flex-col bg-black text-white">
    <nav class="fixed top-0 left-0 right-0 bg-gray-900 p-4 shadow-md z-50 flex justify-between items-center">
        <a href="/" class="font-bold text-2xl text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"> 
            Malicious URL Detector
            <!-- 2depth home 가기 기능 -->
        </a>
        <div class="flex items-center space-x-4">
            {#if $page.url.pathname !== '/'}
                <div class="relative" bind:this={exportMenuRef}>
                    <button 
                        on:click={toggleExportMenu}
                        class="apple-button"
                    >
                        내보내기
                    </button>
                    <!-- 내보내기 기능 2개 링크 추가 구현해야함 -->
                    {#if showExportMenu}
                        <div class="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5" transition:fade={{duration: 100}}>
                            <div class="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                                <a href="#" class="block px-4 py-2 text-sm text-white hover:bg-gray-700" role="menuitem">PDF 내보내기</a>
                                <a href="#" class="block px-4 py-2 text-sm text-white hover:bg-gray-700" role="menuitem">(BETA)RAG보고서 내보내기</a>
                            </div>
                        </div>
                    {/if}
                </div>
            {/if}
            <button 
                on:click={toggleSearchHistory}
                class="apple-button"
            >
                {showSearchHistory ? '검색 기록 닫기' : '검색 기록 보기'}
            </button>
        </div>
    </nav>

    <div class="pt-20"></div>
    
    <slot />

    {#if showSearchHistory}
        <div class="fixed top-16 right-0 w-1/2 h-[calc(100vh-4rem)] bg-gray-800 p-5 overflow-auto shadow-lg" transition:fade>
            <h3 class="text-xl font-bold mb-4">검색 기록</h3>
            {#if $searchHistory.length === 0}
                <p>검색 기록이 없습니다.</p>
            {:else}
                <table class="w-full text-left">
                    <thead>
                        <tr>
                            <th class="pb-2">URL</th>
                            <th class="pb-2">점수</th>
                            <th class="pb-2">결과</th>
                            <th class="pb-2">검색 시간</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each $searchHistory as { url, score, timestamp }}
                            <tr class="border-t border-gray-700">
                                <td class="py-2">
                                    <a href={`/results?url=${encodeURIComponent(url)}`} class="text-blue-400 hover:underline">
                                        {url}
                                    </a>
                                </td>
                                <td class="py-2">{score}</td>
                                <td class="py-2">
                                    <span class={score < 50 ? 'text-green-500' : score < 80 ? 'text-yellow-500' : 'text-red-500'}>
                                        {score < 50 ? '안전' : score < 80 ? '주의' : '위험'}
                                    </span>
                                </td>
                                <td class="py-2">{new Date(timestamp).toLocaleString()}</td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            {/if}
        </div>
    {/if}

    <footer class="fixed bottom-0 left-0 right-0 bg-gray-900 text-white text-xs p-2 shadow-md z-50">
        <div class="container mx-auto flex justify-between items-center">
            <span>© 2024 악성 URL 탐지기 주식회사. All rights reserved.</span>
            <span>
                <a href="https://www.examplecompany.com" class="hover:underline">www.examplecompany.com</a>
                | Contact: 02-1234-5678
            </span>
        </div>
    </footer>

    <div class="pb-10"></div>
</div>

<style>
    :global(body) {
        margin: 0;
        padding: 0;
    }

    .apple-button {
        background: rgba(255, 255, 255, 0.1);
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 20px;
        font-weight: 500;
        font-size: 14px;
        transition: all 0.3s ease;
        box-shadow: 0 0 10px rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
    }

    .apple-button:hover {
        background: rgba(255, 255, 255, 0.2);
        box-shadow: 0 0 15px rgba(255, 255, 255, 0.2);
    }

    .apple-button:active {
        background: rgba(255, 255, 255, 0.3);
        transform: scale(0.98);
    }
</style>