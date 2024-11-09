<script>
    import { fade } from 'svelte/transition';
    import { goto } from '$app/navigation';
    import { searchHistory } from '$lib/stores/searchHistory';
    import api from '$lib/api';
    import { onMount } from 'svelte';
   
    let url = '';
    let isAnalyzing = false;
    let error = null;

    async function sha256(message) {
        const msgBuffer = new TextEncoder().encode(message);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex;
    }

    async function handleSubmit() {
    if (url && !isAnalyzing) {
        isAnalyzing = true;
        error = null;
        
        try {
            // API 호출 부분 주석 처리
            /*const result = await api.analyzeUrl(url);
            const urlHash = await sha256(url);
            
            // searchHistory 스토어에 새로운 분석 결과 추가
            searchHistory.addSearch({
                url: url,
                title: result.title || '',
                status: result.status || 'Online',
                resourceCount: result.resourceCount || 0,
                linkCount: result.linkCount || 0,
                tags: result.tags || ['normal'],
                country: result.country || ''
            });*/

            // 임시로 더미 데이터 추가
            const urlHash = await sha256(url);
            searchHistory.addSearch({
                url: url,
                title: 'Test Title',
                status: 'Online',
                resourceCount: 100,
                linkCount: 50,
                tags: ['normal'],
                country: 'South Korea'
            });

            const urlMap = JSON.parse(localStorage.getItem('urlHashMap') || '{}');
            urlMap[urlHash] = url;
            localStorage.setItem('urlHashMap', JSON.stringify(urlMap));

            goto(`/results?hash=${urlHash}`);
        } catch (err) {
            // 에러가 발생해도 results 페이지로 이동
            console.error('URL 분석 중 오류 발생:', err);
            const urlHash = await sha256(url);
            goto(`/results?hash=${urlHash}`);
        } finally {
            isAnalyzing = false;
        }
    }
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

    // 컴포넌트 마운트 시 searchHistory 로드
    onMount(() => {
    // 페이지 로드 시 검색 기록 로드
    searchHistory.loadSearchHistory();

    // 브라우저의 뒤로가기/앞으로가기 이벤트 감지
    window.addEventListener('popstate', () => {
        searchHistory.loadSearchHistory();
    });

    return () => {
        window.removeEventListener('popstate', () => {
            searchHistory.loadSearchHistory();
        });
    };
    });

</script>

<!-- 배경 이미지 오버레이 부분 수정 -->
<div class="w-full min-h-screen bg-gray-100 pb-40">
    <!-- 배경 이미지와 오버레이 -->
    <div class="absolute inset-0 z-0">
        <div class="absolute search-height-overlay bg-gradient-overlay"></div>
    </div>

       <!-- 헤더와 검색 섹션을 하나의 컨테이너로 묶기 -->
       <div class="header-search-container relative z-1">
        <!-- 헤더 섹션 -->
        <div class="text-center pt-12">
            <div class="mb-6">
                <img 
                    src="/images/bmw-logo.png" 
                    alt="bmw" 
                    class="h-28 mx-auto"
                />
            </div>
            <div class="relative">
                <h1 class="text-3xl font-bold mb-4 text-white">악성 URL 탐지 및 분석 서비스</h1>
                <p class="text-lg font-bold text-gray-100 mb-6 mx-auto max-w-4xl">
                    Domain info,YARA, DNS Foot printing 등의 분석기법을 통해 악성 URL로 인한<br/>
                    사이버 위협을 유사도 분석 기술과 사회공학기법을 융합하여 탐지하고 분석합니다.
                </p>
            </div>
        </div>

        <!-- 검색 섹션 -->
        <div class="search-section">
            <div class="max-w-6xl mx-auto px-4">
                <form on:submit|preventDefault={handleSubmit} class="relative" in:fade>
                    <div class="flex items-center bg-white rounded-full shadow-xl relative pr-2 h-16">
                        <input
                            bind:value={url}
                            type="text"
                            class="flex-1 pl-6 pr-12 py-4 text-gray-700 focus:outline-none rounded-full"
                            placeholder="Domain, URL을 입력하세요"
                        />
                        <button
                            type="submit"
                            class="search-button"
                            disabled={isAnalyzing}
                        >
                            {#if isAnalyzing}
                                <div class="loader"></div>
                            {:else}
                                <div class="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                                    <img 
                                        src="/images/search.png" 
                                        alt="search" 
                                        class="w-8 h-8"
                                    />
                                </div>
                            {/if}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>

   <!-- 최근 분석 현황 테이블 부분 수정 -->
   <div class="relative w-[95%] max-w-screen-2xl mx-auto mt-40 bg-white rounded-lg shadow-lg overflow-hidden pb-4 fixed-content mb-8">
        <div class="p-6">
            <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
                <img src="/images/warning.png" alt="warning" class="w-10 h-10" />
                최근 분석 현황
            </h2>
            <div class="overflow-x-auto">
                {#if $searchHistory.length === 0}
                    <p class="text-center text-gray-500 py-4">최근 분석 기록이 없습니다.</p>
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
        </div>
    </div>
</div>
 <!-- Footer 추가 -->
<div class="w-full bg-white text-gray-600 text-xs border-t-4">
    <div class="mx-auto p-4">
        <div class="flex flex-col gap-2">
            <!-- 로고 섹션 -->
            <div class="flex items-center gap-2 mb-2">
                <img src="/images/lucky_logo_row.png" alt="Logo" class="h-6" />
                <span class="text-gray-400">v1.0.0</span>
            </div>
            
            <!-- 정보 섹션 -->
            <div class="flex flex-col gap-1">
                <div class="flex items-center gap-2 flex-wrap">
                    <span>이용약관</span>
                    <span class="text-gray-300">|</span>
                    <span>개인정보처리방침</span>
                    <span class="text-gray-300">|</span>
                    <span class="text-blue-800 font-bold">사업자번호:</span>
                    <span>000-00-00000</span>
                </div>
                
                <div class="text-gray-500">
                    <span>(05717) 서울 송파구 중대로 135 서관 14층 (재)한국정보보호산업협회, KISIA</span>
                </div>
                
                <div class="flex items-center gap-2 text-gray-500 flex-wrap">
                    <span class = "text-blue-800 font-bold">대표이사:</span>
                    <span>KISIA</span>
                    <span class="text-gray-300">|</span>
                    <span class = "text-blue-800 font-bold">대표전화:</span>
                    <span>02-0000-0000</span>
                    <span class="text-gray-300">|</span>
                    <span class = "text-blue-800 font-bold">기술지원:</span>
                    <span>02-0000-0000</span>
                    <span class="text-gray-300">|</span>
                    <span class = "text-blue-800 font-bold">팩스:</span>
                    <span>02-0000-0000</span>
                </div>
                
                <div class="text-gray-500">
                    <span>이메일: luckybicky@luckybicky.com</span>
                </div>
            </div>
        </div>
    </div>
</div>

<style>
    .header-search-container {
        height: 500px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding-bottom: 100px;
    }

    .search-height-overlay {
        height: 450px;
        width: 100%;
        background-image: url('/images/background.jpg');
        background-size: cover;
        background-position: center;
    }

    .search-button {
        position: absolute;
        right: 8px;
        top: 50%;
        transform: translateY(-50%);
        padding: 0;
        border: none;
        background: none;
        cursor: pointer;
        transition: all 0.2s ease;
        z-index: 1;
    }

    .search-button:hover {
        transform: translateY(-50%) scale(1.05);
    }

    .search-button:active {
        transform: translateY(-50%) scale(0.95);
    }

    .loader {
        border: 2px solid rgba(255,255,255,0.3);
        border-top: 2px solid #ffffff;
        border-radius: 50%;
        width: 20px;
        height: 20px;
        animation: spin 1s linear infinite;
    }

    .fixed-content {
        min-width: 320px;
        max-height: calc(100vh - 12rem);
        overflow-y: auto;
        margin-bottom: 2rem;
        position: relative;
        z-index: 1;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }

    /* 반응형 디자인 */
    @media (max-width: 640px) {
        .header-search-container {
            height: 550px;
            padding-bottom: 80px;
        }

        .search-height-overlay {
            height: 550px;
        }

        .fixed-content {
            width: 95%;
            margin: 2rem auto;
        }
    }

    @media (min-width: 641px) and (max-width: 1024px) {
        .header-search-container {
            height: 520px;
            padding-bottom: 90px;
        }

        .search-height-overlay {
            height: 520px;
        }

        .fixed-content {
            width: 90%;
            margin: 3rem auto;
        }
    }

    @media (min-width: 1025px) {
        .fixed-content {
            width: 85%;
            max-width: 1920px;
            margin: 4rem auto;
        }
    }

    /* 테이블 스타일링 */
    :global(.overflow-x-auto) {
        -webkit-overflow-scrolling: touch;
        scrollbar-width: thin;
        position: relative;
    }

    :global(.overflow-x-auto::-webkit-scrollbar) {
        height: 6px;
    }

    :global(.overflow-x-auto::-webkit-scrollbar-track) {
        background: #f1f1f1;
    }

    :global(.overflow-x-auto::-webkit-scrollbar-thumb) {
        background: #888;
        border-radius: 3px;
    }

    :global(.overflow-x-auto::-webkit-scrollbar-thumb:hover) {
        background: #555;
    }
</style>