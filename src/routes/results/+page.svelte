<script>
    import { page } from '$app/stores';
    import { onMount } from 'svelte';
    import { Pie, Bar } from 'svelte-chartjs';
    import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale, BarElement } from 'chart.js';
    import { goto } from '$app/navigation';
    import { searchHistory } from '$lib/stores/searchHistory';
    import { fade } from 'svelte/transition';
    import AIReport from '$lib/components/AIReport.svelte';
    import api from '$lib/api';

    ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale, BarElement);

    let searchUrl = ''; // URL 정보 표시용 변수와 검색용 변수를 분리
    let displayUrl = ''; // 표시용 URL
    let results = null;
    let isAnalyzing = false;
    let error = null;
    let activeTab = 'Summary';
    const status = 'normal';
    const tabs = ['Summary', 'Resources', 'Links', 'AI Report'];

    // URL 해싱을 위한 함수
    async function sha256(message) {
        const msgBuffer = new TextEncoder().encode(message);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex;
    }

        // URL 해시값으로부터 결과 로드
        async function loadResultsByHash(urlHash) {
        try {
            const urlMap = JSON.parse(localStorage.getItem('urlHashMap') || '{}');
            displayUrl = urlMap[urlHash];

            if (!displayUrl) {
                error = 'URL 정보를 찾을 수 없습니다.';
                return;
            }

            await fetchResults(displayUrl);
        } catch (err) {
            console.error('URL 복원 오류:', err);
            error = 'URL 정보 복원에 실패했습니다.';
        }
    }

    onMount(async () => {
        const urlHash = $page.url.searchParams.get('hash');
        if (!urlHash) {
            error = '올바르지 않은 접근입니다.';
            return;
        }
        await loadResultsByHash(urlHash);
    });

    // URL 매개변수 변경 감지
    $: {
        const urlHash = $page.url.searchParams.get('hash');
        if (urlHash) {
            loadResultsByHash(urlHash);
        }
    }

    async function fetchResults(urlToAnalyze, currentHash) {
        isAnalyzing = true;
        error = null;
        try {
            // 더미 데이터 사용
            const dummyResults = {
                isSuccess: true,
                statusCode: 200,
                isMalicious: false,
                info1: 'Sample Information 1',
                info2: 'Sample Information 2',
                info3: 'Sample Information 3',
                barChartData: {
                    labels: ['위험도', '신뢰도', '악성코드', '피싱', '스팸', '평판'],
                    datasets: [{
                        label: '보안 분석 결과',
                        data: [65, 85, 30, 45, 20, 75],
                        backgroundColor: [
                            'rgba(66, 153, 225, 0.5)',
                            'rgba(49, 130, 206, 0.5)',
                            'rgba(43, 108, 176, 0.5)',
                            'rgba(44, 82, 130, 0.5)',
                            'rgba(42, 67, 101, 0.5)',
                            'rgba(26, 32, 44, 0.5)'
                        ],
                        borderColor: [
                            'rgba(66, 153, 225, 1)',
                            'rgba(49, 130, 206, 1)',
                            'rgba(43, 108, 176, 1)',
                            'rgba(44, 82, 130, 1)',
                            'rgba(42, 67, 101, 1)',
                            'rgba(26, 32, 44, 1)'
                        ],
                        borderWidth: 1
                    }]
                },
                pieChartData: {
                    labels: ['안전', '의심', '위험'],
                    datasets: [{
                        data: [65, 25, 10],
                        backgroundColor: [
                            'rgba(72, 187, 120, 0.8)',
                            'rgba(246, 173, 85, 0.8)',
                            'rgba(245, 101, 101, 0.8)'
                        ],
                        hoverBackgroundColor: [
                            'rgba(72, 187, 120, 1)',
                            'rgba(246, 173, 85, 1)',
                            'rgba(245, 101, 101, 1)'
                        ]
                    }]
                },
                securityVendors: [
                    { name: 'Kaspersky', status: 'Clean' },
                    { name: 'McAfee', status: 'Clean' },
                    { name: 'Symantec', status: 'Malicious' },
                    { name: 'Trend Micro', status: 'Clean' },
                    { name: 'ESET', status: 'unknown' },
                    { name: 'Avast', status: 'Clean' },
                    { name: 'BitDefender', status: 'Malicious' },
                    { name: 'F-Secure', status: 'Clean' },
                    { name: 'Sophos', status: 'unknown' },
                    { name: 'Fortinet', status: 'Clean' }
                ]
            };

            results = dummyResults;
            
            if (currentHash) {
                searchHistory.saveSearchHistory(urlToAnalyze, results.statusCode, currentHash);
            }

        } catch (err) {
            console.error('결과 가져오기 오류:', err);
            error = err.message;
        } finally {
            isAnalyzing = false;
        }
    }

    // 검색 처리 함수
    async function handleSearch() {
        if (searchUrl && !isAnalyzing) {
            isAnalyzing = true;
            error = null;
            
            try {
                const urlHash = await sha256(searchUrl);
                
                // 검색 기록 저장
                searchHistory.addSearch({
                    url: searchUrl,
                    title: 'Test Title',
                    status: 'Online',
                    resourceCount: 100,
                    linkCount: 50,
                    tags: ['normal'],
                    country: 'South Korea'
                });

                // URL 맵 업데이트
                const urlMap = JSON.parse(localStorage.getItem('urlHashMap') || '{}');
                urlMap[urlHash] = searchUrl;
                localStorage.setItem('urlHashMap', JSON.stringify(urlMap));

                // 새 URL로 이동
                goto(`/results?hash=${urlHash}`);
                
                // 검색창 초기화
                searchUrl = '';
            } catch (err) {
                console.error('URL 분석 중 오류 발생:', err);
                error = 'URL 분석 중 오류가 발생했습니다.';
            } finally {
                isAnalyzing = false;
            }
        }
    }

    function getStatusColor(status) {
        switch(status.toLowerCase()) {
            case 'normal':
                return 'border-green-500 text-green-500';
            case 'warning':
                return 'border-yellow-500 text-yellow-500';
            case 'danger':
                return 'border-red-500 text-red-500';
            default:
                return 'border-gray-500 text-gray-500';
        }
    }

    // 상태 변수 (예시)
</script>

<!-- 메인 콘텐츠 영역 -->
<div class="w-full min-h-screen bg-gray-100">
    <!-- 검색 섹션 -->
    <div class="bg-gradient-overlay relative h-[15vh] flex items-center">
        <div class="max-w-6xl mx-auto w-full px-4">
            <form on:submit|preventDefault={handleSearch} class="relative" in:fade>
                <div class="flex items-center bg-white rounded-full shadow-xl relative pr-2 h-16">
                    <input
                        bind:value={searchUrl}
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
                            <div class="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
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

    <!-- 탭 네비게이션 -->
    <div class="border-b bg-white">
        <div class="max-w-7xl mx-auto px-4">
            <nav class="flex space-x-8">
                {#each tabs as tab}
                    <button
                        class="px-4 py-4 border-b-2 font-medium text-sm transition-colors relative
                            {activeTab === tab 
                                ? 'border-blue-500 text-blue-600' 
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}"
                        on:click={() => activeTab = tab}
                    >
                        {tab}
                        {#if activeTab === tab}
                            <span class="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500"></span>
                        {/if}
                    </button>
                {/each}
            </nav>
        </div>
    </div>

    <!-- 분석 결과 콘텐츠 -->
    <div class="max-w-7xl mx-auto px-4 py-6">
        {#if isAnalyzing}
            <div class="flex flex-col items-center justify-center py-12">
                <svg class="animate-spin h-16 w-16 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p class="mt-4 text-xl text-gray-600">URL을 분석하는 중입니다...</p>
            </div>
        {:else if error}
            <div class="text-center py-12">
                <p class="text-xl text-red-500">{error}</p>
            </div>
        {:else if results}
            {#if activeTab === 'Summary'}
                <div class="grid grid-cols-12 gap-6">
                    <!-- 분석 결과 카드 부분 수정 -->
                    <div class="col-span-4 bg-white rounded-lg shadow p-6">
                        <h2 class="flex items-center gap-2 text-lg font-medium text-gray-900 mb-4">
                            <img src="/images/result.png" alt="분석 결과" class="w-8 h-8" />
                            분석 결과
                        </h2>
                        <div class="flex flex-col items-center justify-center">
                            <!-- 원형 결과 표시 영역 -->
                            <div class="relative w-48 h-48">
                                <!-- 바깥쪽 원 -->
                                <div class="absolute inset-0 rounded-full border-4 {getStatusColor(status)}"></div>
                                
                                <!-- 안쪽 흰색 배경과 텍스트 -->
                                <div class="absolute inset-2 rounded-full bg-white flex items-center justify-center">
                                    <span class="text-2xl font-medium {getStatusColor(status)}">{status}</span>
                                </div>
                            </div>
                            
                            <!-- 최근 스캔 시간 -->
                            <div class="mt-4 text-sm text-gray-500">
                                최근 스캔 시간: {new Date().toLocaleString()}
                            </div>
                        </div>
                    </div>

                    <!-- URL 정보 카드 -->
                    <div class="col-span-8 bg-white rounded-lg shadow p-6">
                        <h2 class="text-lg font-medium text-gray-900 mb-4">URL 정보</h2>
                        <table class="w-full">
                            <tbody class="divide-y">
                                <tr>
                                    <td class="py-2 text-gray-600">URL</td>
                                    <td class="py-2">{displayUrl}</td> <!-- displayUrl 사용 -->
                                </tr>
                                <tr>
                                    <td class="py-2 text-gray-600">Title</td>
                                    <td class="py-2">{results.info1}</td>
                                </tr>
                                <tr>
                                    <td class="py-2 text-gray-600">상태</td>
                                    <td class="py-2">
                                        <span class="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">normal</span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <!-- 차트 영역 -->
                    <div class="col-span-12 grid grid-cols-2 gap-6">
                        <div class="bg-white rounded-lg shadow p-6">
                            <h2 class="text-lg font-medium text-gray-900 mb-4">파이 차트</h2>
                            <div class="h-64">
                                <Pie data={results.pieChartData} options={{ responsive: true, maintainAspectRatio: false }} />
                            </div>
                        </div>
                        <div class="bg-white rounded-lg shadow p-6">
                            <h2 class="text-lg font-medium text-gray-900 mb-4">바 차트</h2>
                            <div class="h-64">
                                <Bar data={results.barChartData} options={{ responsive: true, maintainAspectRatio: false }} />
                            </div>
                        </div>
                    </div>

                    <!-- 보안 벤더 분석 -->
                    <div class="col-span-12 bg-white rounded-lg shadow p-6">
                        <h2 class="text-lg font-medium text-gray-900 mb-4">보안 벤더 분석</h2>
                        <div class="overflow-x-auto">
                            <table class="w-full">
                                <thead class="bg-gray-50">
                                    <tr>
                                        <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">벤더</th>
                                        <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">상태</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y">
                                    {#each results.securityVendors as vendor}
                                        <tr>
                                            <td class="px-4 py-3">{vendor.name}</td>
                                            <td class="px-4 py-3">
                                                <span class="px-3 py-1 rounded-full text-sm font-medium
                                                    {vendor.status === 'Clean' ? 'bg-green-100 text-green-800' : 
                                                    vendor.status === 'Malicious' ? 'bg-red-100 text-red-800' : 
                                                    'bg-yellow-100 text-yellow-800'}">
                                                    {vendor.status}
                                                </span>
                                            </td>
                                        </tr>
                                    {/each}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            
            {:else if activeTab === 'Resources'}
                <div class="bg-white rounded-lg shadow p-6">
                    <h2 class="text-lg font-medium text-gray-900 mb-4">리소스 분석</h2>
                    <div class="overflow-x-auto">
                        <table class="w-full">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">유형</th>
                                    <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">URL</th>
                                    <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">크기</th>
                                    <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">상태</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y">
                                <tr>
                                    <td class="px-4 py-3 text-sm">JavaScript</td>
                                    <td class="px-4 py-3 text-sm text-blue-600 hover:underline">https://example.com/script.js</td>
                                    <td class="px-4 py-3 text-sm">45.3 KB</td>
                                    <td class="px-4 py-3 text-sm">
                                        <span class="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs">정상</span>
                                    </td>
                                </tr>
                                <!-- 더 많은 리소스 항목들 -->
                            </tbody>
                        </table>
                    </div>
                </div>
            
            {:else if activeTab === 'Links'}
                <div class="bg-white rounded-lg shadow p-6">
                    <h2 class="text-lg font-medium text-gray-900 mb-4">링크 분석</h2>
                    <div class="overflow-x-auto">
                        <table class="w-full">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">URL</th>
                                    <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">유형</th>
                                    <th class="px-4 py-3 text-left text-sm font-medium text-gray-600">상태</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y">
                                <tr>
                                    <td class="px-4 py-3 text-sm text-blue-600 hover:underline">https://example.com/link1</td>
                                    <td class="px-4 py-3 text-sm">내부 링크</td>
                                    <td class="px-4 py-3 text-sm">
                                        <span class="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs">활성</span>
                                    </td>
                                </tr>
                                <!-- 더 많은 링크 항목들 -->
                            </tbody>
                        </table>
                    </div>
                </div>
            {:else if activeTab === 'AI Report'}
                 <AIReport />
            {/if}
            
        {/if}
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
    .bg-gradient-overlay {
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

    @keyframes circle-fade-in {
        from {
            transform: scale(0.9);
            opacity: 0;
        }
        to {
            transform: scale(1);
            opacity: 1;
        }
    }

    .absolute {
        animation: circle-fade-in 0.3s ease-out forwards;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }

    @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: .5; }
    }

    .animate-pulse {
        animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
</style>