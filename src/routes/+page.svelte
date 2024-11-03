<script>
    import { fade } from 'svelte/transition';
    import { goto } from '$app/navigation';
    import { searchHistory } from '$lib/stores/searchHistory';
    import api from '$lib/api';
    import { onMount } from 'svelte';
   
    let url = '';
    let isAnalyzing = false;
    let error = null;

    // 더미 데이터
    const recentAnalyses = [
        {
            no: 1,
            date: "2024-11-01 00:06:01",
            domain: "http://57.181.32.253/",
            title: "대검찰청 - 대검찰청",
            status: "Online",
            resourceCount: 80,
            linkCount: 8,
            tags: ["phishing", "malware"],
            country: "Japan"
        },
        {
            no: 2,
            date: "2024-10-31 23:39:31",
            domain: "http://61.223.142.170/",
            title: "대검찰청",
            status: "Offline",
            resourceCount: 50,
            linkCount: 7,
            tags: ["phishing", "malware"],
            country: "Taiwan"
        },
        {
            no: 3,
            date: "2024-10-31 23:37:10",
            domain: "http://트윈.com/",
            title: "",
            status: "Online",
            resourceCount: 7,
            linkCount: 2,
            tags: ["normal"],
            country: ""
        },
        {
            no: 4,
            date: "2024-10-31 23:36:58",
            domain: "https://overseas.mofa.go.kr/th-ko/br",
            title: "외교부",
            status: "Online",
            resourceCount: 6,
            linkCount: 370,
            tags: ["normal"],
            country: "Korea, Republic of"
        },
        {
            no: 5,
            date: "2024-10-31 23:36:44",
            domain: "https://tdeal.kr/app/HT8V3I?seq=11581415969&date=241031",
            title: "SKT와 함께하는 바로 사는 중...",
            status: "Online",
            resourceCount: 7,
            linkCount: 9,
            tags: ["normal"],
            country: "United States"
        },
        {
            no: 6,
            date: "2024-10-31 22:16:31",
            domain: "http://114.41.74.179/",
            title: "대검찰청",
            status: "Online",
            resourceCount: 50,
            linkCount: 7,
            tags: ["phishing", "malware"],
            country: "Taiwan"
        },
        {
            no: 7,
            date: "2024-10-31 22:04:51",
            domain: "https://patgosales.com/collections/women-s-hats-accessories?page=2",
            title: "Women's Hats & Accessorie...",
            status: "Online",
            resourceCount: 11,
            linkCount: 413,
            tags: ["fraud"],
            country: ""
        },
        {
            no: 8,
            date: "2024-10-31 21:05:04",
            domain: "https://bet556.cc/",
            title: "",
            status: "Online",
            resourceCount: 3,
            linkCount: 0,
            tags: ["fraud"],
            country: "United States"
        },
        {
            no: 9,
            date: "2024-10-31 20:57:34",
            domain: "https://www.naver.com/",
            title: "",
            status: "Offline",
            resourceCount: 0,
            linkCount: 0,
            tags: ["portal"],
            country: ""
        },
        {
            no: 10,
            date: "2024-10-31 20:27:47",
            domain: "https://0070.co.kr/c/Hc03b",
            title: "Not Found",
            status: "Online",
            resourceCount: 1,
            linkCount: 0,
            tags: ["normal"],
            country: "Korea, Republic of"
        }
    ];

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
                const result = await api.analyzeUrl(url);
                const urlHash = await sha256(url);
                
                const urlMap = JSON.parse(localStorage.getItem('urlHashMap') || '{}');
                urlMap[urlHash] = url;
                localStorage.setItem('urlHashMap', JSON.stringify(urlMap));

                goto(`/results?hash=${urlHash}`);
            } catch (err) {
                console.error('URL 분석 중 오류 발생:', err);
                error = 'URL 분석 중 오류가 발생했습니다. 다시 시도해주세요.';
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
</script>

<div class="min-h-screen bg-gray-100">
    <!-- 배경 이미지와 오버레이 -->
    <div class="absolute inset-0 z-0">
        <div class="absolute h-[35vh] inset-0 bg-gradient-overlay"></div>
    </div>

    <!-- 컨텐츠 -->
    <!-- 헤더 섹션 -->
    <div class="text-center pt-12 pb-8 relative z-1">
        <div class="mb-6">
            <img 
                src="src/lib/images/bmw-logo.png" 
                alt="bmw" 
                class="h-28 mx-auto"
            />
        </div>
        <div class="relative z-1">
            <h1 class="text-3xl font-bold mb-4 text-white">악성 URL 탐지 및 분석 서비스</h1>
            <p class="text-lg font-bold text-gray-100 mb-6">
                Domain info,YARA, DNS Foot printing 등의 분석기법을 통해 악성 URL로 인한<br/>
                사이버 위협을 유사도 분석 기술과 사회공학기법을 융합하여 탐지하고 분석합니다.
            </p>
        </div>
    </div>

    <!-- 검색 섹션 -->
    <div class="absolute left-0 right-0 top-[35vh] -translate-y-1/2">
        <div class="max-w-6xl mx-auto">
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
                                    src="src/lib/images/search.png" 
                                    alt="search" 
                                    class="w-8 h-8"
                                />
                            </div>
                        {/if}
                    </button>
                </div>
            </form>

            {#if error}
                <p class="text-red-300 mt-4 text-center">{error}</p>
            {/if}
        </div>
    </div>

    <!-- 최근 분석 현황 테이블 -->
    <div class="relative max-w-7xl mx-auto mt-40 bg-white rounded-lg shadow-lg overflow-hidden pb-4">
        <div class="p-6">
            <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
                <img src="src/lib/images/warning.png" alt="warning" class="w-10 h-10" />
                최근 분석 현황
            </h2>
            <div class="overflow-x-auto">
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
                        {#each recentAnalyses as analysis}
                            <tr class="hover:bg-gray-50">
                                <td class="px-4 py-3 text-sm text-gray-900">{analysis.no}</td>
                                <td class="px-4 py-3 text-sm text-gray-900">{analysis.date}</td>
                                <td class="px-4 py-3 text-sm text-blue-600 hover:underline">
                                    <a href={analysis.domain}>{analysis.domain}</a>
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
            </div>
        </div>
    </div>
</div>

<style>
    .bg-gradient-overlay {
        background-image: url('src/lib/images/background.jpg');
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

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
</style>