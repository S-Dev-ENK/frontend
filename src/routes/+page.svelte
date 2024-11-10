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
                urlHash: urlHash, // URL 해시 추가
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

<svelte:head>
    <title>Main - Luckybicky</title>
</svelte:head>

<div class="w-full min-h-screen bg-gray-100 pb-20">
    <!-- 배경 이미지와 오버레이 -->
    <div class="absolute inset-0 z-0">
        <div class="absolute search-height-overlay bg-gradient-overlay"></div>
    </div>

    <!-- 헤더와 검색 섹션 컨테이너 -->
    <div class="header-search-container relative z-1">
        <!-- 헤더 섹션 -->
        <div class="text-center pt-8 sm:pt-12 ">
            <div class="mb-4 sm:mb-6">
                <img 
                    src="/images/bmw-logo.png" 
                    alt="bmw" 
                    class="h-16 sm:h-20 mx-auto"
                />
            </div>
            <div class="relative px-4">
                <h1 class="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 text-white">악성 URL 탐지 및 분석 서비스</h1>
                <p class="text-base sm:text-lg font-bold text-gray-100 mb-4 sm:mb-6 mx-auto max-w-4xl px-4">
                    <span class="hidden sm:inline">Domain info, YARA, DNS Foot printing 등의 분석기법을 통해 악성 URL로 인한<br/>
                    사이버 위협을 유사도 분석 기술과 사회공학기법을 융합하여 탐지하고 분석합니다.</span>
                    <span class="sm:hidden">
                        Domain info, YARA, DNS 분석을 통해 악성 URL을 탐지하고 분석합니다.
                    </span>
                </p>
            </div>
        </div>

        <!-- 검색 섹션 -->
        <div class="search-section px-4">
            <div class="max-w-6xl mx-auto">
                <form on:submit|preventDefault={handleSubmit} class="relative" in:fade>
                    <div class="flex items-center bg-white rounded-full shadow-xl relative pr-2 h-12 sm:h-16">
                        <input
                            bind:value={url}
                            type="text"
                            class="flex-1 pl-4 sm:pl-6 pr-12 py-2 sm:py-4 text-sm sm:text-base text-gray-700 focus:outline-none rounded-full"
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
                                <div class="w-8 h-8 sm:w-12 sm:h-12 bg-green-500 rounded-full flex items-center justify-center">
                                    <img 
                                        src="/images/search.png" 
                                        alt="search" 
                                        class="w-5 h-5 sm:w-8 sm:h-8"
                                    />
                                </div>
                            {/if}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- 최근 분석 현황 테이블 -->
    <div class="relative w-[95%] max-w-screen-2xl mx-auto mt-20 sm:mt-40 bg-white rounded-lg shadow-lg overflow-hidden pb-4 fixed-content mb-8">
        <div class="p-4 sm:p-6">
            <h2 class="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2">
                <img src="/images/warning.png" alt="warning" class="w-8 sm:w-10 h-8 sm:h-10" />
                최근 분석 현황
            </h2>
            <div class="overflow-x-auto">
                {#if $searchHistory.length === 0}
                    <p class="text-center text-gray-500 py-4">최근 분석 기록이 없습니다.</p>
                {:else}
                    <div class="min-w-full inline-block align-middle">
                        <div class="overflow-hidden">
                            <table class="min-w-full divide-y divide-gray-200">
                                <thead class="bg-gray-100">
                                    <tr>
                                        <th scope="col" class="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-600">No.</th>
                                        <th scope="col" class="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-600 hidden sm:table-cell">날짜</th>
                                        <th scope="col" class="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-600">Domain/URL</th>
                                        <th scope="col" class="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-medium text-gray-600 hidden md:table-cell">Title</th>
                                        <th scope="col" class="px-3 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm font-medium text-gray-600">상태</th>
                                        <th scope="col" class="px-3 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm font-medium text-gray-600 hidden lg:table-cell">리소스</th>
                                        <th scope="col" class="px-3 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm font-medium text-gray-600 hidden lg:table-cell">링크</th>
                                        <th scope="col" class="px-3 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm font-medium text-gray-600">태그</th>
                                        <th scope="col" class="px-3 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm font-medium text-gray-600 hidden md:table-cell">국가</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-gray-200">
                                    {#each $searchHistory as analysis}
                                        <tr class="hover:bg-gray-50">
                                            <td class="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900">{analysis.no}</td>
                                            <td class="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900 hidden sm:table-cell">{analysis.date}</td>
                                            <td class="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-blue-600 hover:underline truncate max-w-[200px]">
                                                <a href={`/results?hash=${analysis.urlHash}`} title={analysis.domain}>{analysis.domain}</a>
                                            </td>
                                            <td class="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900 hidden md:table-cell truncate max-w-[200px]" title={analysis.title}>{analysis.title}</td>
                                            <td class="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-center">
                                                <span class="inline-flex items-center justify-center px-2 py-1 text-xs font-medium rounded-full text-white {getStatusClass(analysis.status)}">
                                                    {analysis.status}
                                                </span>
                                            </td>
                                            <td class="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-center hidden lg:table-cell">{analysis.resourceCount}</td>
                                            <td class="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-center hidden lg:table-cell">{analysis.linkCount}</td>
                                            <td class="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm">
                                                <div class="flex flex-wrap gap-1 justify-center">
                                                    {#each analysis.tags as tag}
                                                        <span class="px-2 py-1 text-xs font-medium rounded-md text-white {getTagClass(tag)}">
                                                            {tag}
                                                        </span>
                                                    {/each}
                                                </div>
                                            </td>
                                            <td class="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-center hidden md:table-cell">{analysis.country}</td>
                                        </tr>
                                    {/each}
                                </tbody>
                            </table>
                        </div>
                    </div>
                {/if}
            </div>
        </div>
    </div>
</div>

<!-- Footer -->
<div class="w-full bg-white text-gray-600 text-xs border-t-4">
    <div class="mx-auto p-4">
        <div class="flex flex-col gap-2">
            <!-- 로고 섹션 -->
            <div class="flex items-center gap-2 mb-2">
                <img src="/images/lucky_logo_row.png" alt="Logo" class="h-4 sm:h-6" />
                <span class="text-gray-400">v1.0.0</span>
            </div>
            
            <!-- 정보 섹션 -->
            <div class="flex flex-col gap-1 text-[10px] sm:text-xs">
                <div class="flex items-center gap-1 sm:gap-2 flex-wrap">
                    <span>이용약관</span>
                    <span class="text-gray-300">|</span>
                    <span>개인정보처리방침</span>
                    <span class="text-gray-300">|</span>
                    <span class="text-blue-800 font-bold">사업자번호:</span>
                    <span>000-00-00000</span>
                </div>
                
                <div class="text-gray-500">
                    <span class="text-[10px] sm:text-xs">(05717) 서울 송파구 중대로 135 서관 14층 (재)한국정보보호산업협회, KISIA</span>
                </div>
                
                <div class="flex items-center gap-1 sm:gap-2 text-gray-500 flex-wrap text-[10px] sm:text-xs">
                    <span class="text-blue-800 font-bold">대표이사:</span>
                    <span>KISIA</span>
                    <span class="text-gray-300">|</span>
                    <span class="text-blue-800 font-bold">대표전화:</span>
                    <span>02-0000-0000</span>
                    <span class="text-gray-300">|</span>
                    <span class="text-blue-800 font-bold">기술지원:</span>
                    <span>02-0000-0000</span>
                    <span class="text-gray-300">|</span>
                    <span class="text-blue-800 font-bold">팩스:</span>
                    <span>02-0000-0000</span>
                </div>
                
                <div class="text-gray-500 text-[10px] sm:text-xs">
                    <span>이메일: luckybicky@luckybicky.com</span>
                </div>
            </div>
        </div>
    </div>
</div>

<style>
    .header-search-container {
        min-height: 400px;
        height: auto;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding-bottom: 30px;
    }

    .search-height-overlay {
        min-height: 400px;
        height: auto;
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
        width: 16px;
        height: 16px;
        animation: spin 1s linear infinite;
    }

    .fixed-content {
        min-width: 320px;
        max-height: calc(100vh - 8rem);
        overflow-y: auto;
        margin-bottom: 2rem;
        position: relative;
        z-index: 1;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }

    /* 스크롤바 스타일링 */
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

   /* 반응형 디자인 */
   @media (max-width: 640px) {
       .header-search-container {
           min-height: 300px;
           padding-bottom: 40px;
       }

       .search-height-overlay {
           min-height: 300px;
       }

       .fixed-content {
           width: 95%;
           margin: 1rem auto;
       }
       
       /* 모바일에서 테이블 스크롤 개선 */
       .overflow-x-auto {
           -webkit-overflow-scrolling: touch;
           position: relative;
           margin: 0 -1rem;
           padding: 0 1rem;
       }
       
       /* 모바일에서 텍스트 말줄임 */
       .truncate {
           max-width: 150px;
       }
   }

   @media (min-width: 641px) and (max-width: 1024px) {
       .header-search-container {
           min-height: 350px;
           padding-bottom: 50px;
       }

       .search-height-overlay {
           min-height: 350px;
       }

       .fixed-content {
           width: 90%;
           margin: 2rem auto;
       }
       
       .truncate {
           max-width: 180px;
       }
   }

   @media (min-width: 1025px) {
       .header-search-container {
           min-height: 400px;
       }

       .search-height-overlay {
           min-height: 400px;
       }

       .fixed-content {
           width: 85%;
           max-width: 1920px;
           margin: 3rem auto;
       }
       
       .truncate {
           max-width: 250px;
       }
   }
</style>