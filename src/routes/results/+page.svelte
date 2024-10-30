<script>
    import { page } from '$app/stores';
    import { onMount } from 'svelte';
    import { Pie, Bar } from 'svelte-chartjs';
    import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale, BarElement } from 'chart.js';
    import { goto } from '$app/navigation';
    import { searchHistory } from '$lib/stores/searchHistory';
    import api from '$lib/api';

    ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale, BarElement);

    let url = '';
    let results = null;
    let isAnalyzing = false;
    let error = null;

    // URL 해싱을 위한 함수
    async function sha256(message) {
        const msgBuffer = new TextEncoder().encode(message);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex;
    }

    onMount(async () => {
        const urlHash = $page.url.searchParams.get('hash');
        if (!urlHash) {
            error = '올바르지 않은 접근입니다.';
            return;
        }

        // localStorage에서 URL 복원
        try {
            const urlMap = JSON.parse(localStorage.getItem('urlHashMap') || '{}');
            url = urlMap[urlHash];

            if (!url) {
                error = 'URL 정보를 찾을 수 없습니다.';
                return;
            }

            await fetchResults(url);
        } catch (err) {
            console.error('URL 복원 오류:', err);
            error = 'URL 정보 복원에 실패했습니다.';
        }
    });

    async function fetchResults(urlToAnalyze, currentHash) {  // currentHash 매개변수 추가
        isAnalyzing = true;
        error = null;
        try {
            const analysisResult = await api.analyzeUrl(urlToAnalyze);
            if (!analysisResult.isSuccess) {
                throw new Error('URL 분석에 실패했습니다.');
            }

            const detailsResult = await api.getDomainDetails(analysisResult.urlUuid);
            
            results = {
                isSuccess: detailsResult.isSuccess,
                statusCode: detailsResult.statusCode,
                isMalicious: detailsResult.isMalicious,
                info1: detailsResult.details?.info1 || 'N/A',
                info2: detailsResult.details?.info2 || 'N/A',
                info3: detailsResult.details?.info3 || 'N/A',
                barChartData: analysisResult.barChartData || {
                    labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
                    datasets: [{
                        label: '# of Votes',
                        data: [12, 19, 3, 5, 2, 3],
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.2)',
                            'rgba(54, 162, 235, 0.2)',
                            'rgba(255, 206, 86, 0.2)',
                            'rgba(75, 192, 192, 0.2)',
                            'rgba(153, 102, 255, 0.2)',
                            'rgba(255, 159, 64, 0.2)'
                        ],
                        borderColor: [
                            'rgba(255, 99, 132, 1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(255, 206, 86, 1)',
                            'rgba(75, 192, 192, 1)',
                            'rgba(153, 102, 255, 1)',
                            'rgba(255, 159, 64, 1)'
                        ],
                        borderWidth: 1
                    }]
                },
                pieChartData: analysisResult.pieChartData || {
                    labels: ['Red', 'Blue', 'Yellow'],
                    datasets: [{
                        data: [300, 50, 100],
                        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
                        hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56']
                    }]
                },
                securityVendors: analysisResult.securityVendors || [
                    { name: 'Abusix', status: 'Clean' },
                    { name: 'Acronis', status: 'unknown' },
                    { name: 'ADMINUSLabs', status: 'Clean' },
                    { name: 'AegisLab', status: 'Malicious' },
                    { name: 'AlienVault', status: 'Clean' },
                ]
            };
  
            searchHistory.saveSearchHistory(urlToAnalyze, results.statusCode, currentHash);

        } catch (err) {
            console.error('결과 가져오기 오류:', err);
            error = err.message;
        } finally {
            isAnalyzing = false;
        }
    }

    async function handleSubmit() {
        if (url) {
            const newUrlHash = await sha256(url);
            
            // URL과 해시값을 localStorage에 저장
            const urlMap = JSON.parse(localStorage.getItem('urlHashMap') || '{}');
            urlMap[newUrlHash] = url;
            localStorage.setItem('urlHashMap', JSON.stringify(urlMap));

            goto(`/results?${newUrlHash}`);
            await fetchResults(url, newUrlHash);
        }
    }
</script>

<div class="min-h-screen bg-gray-900 text-white p-4">
    <header class="mb-6">
        <div class="flex justify-between items-center mb-4">
        
        </div>
        <form on:submit|preventDefault={handleSubmit} class="flex gap-2">
            <input
                bind:value={url}
                type="text"
                placeholder="분석할 URL을 입력하세요"
                class="flex-grow p-3 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
                type="submit"
                class="px-6 py-3 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                disabled={isAnalyzing}
            >
                {isAnalyzing ? '분석 중...' : '탐지 시작'}
            </button>
        </form>
    </header>

    <main class="grid grid-cols-3 gap-6">
        {#if isAnalyzing}
            <div class="col-span-3 flex flex-col items-center justify-center">
                <svg class="animate-spin h-16 w-16 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p class="mt-4 text-xl animate-pulse">URL을 분석하는 중입니다...</p>
            </div>
        {:else if error}
            <p class="col-span-3 text-center text-xl text-red-500">{error}</p>
        {:else if results}
        <div class="col-span-2 space-y-6">
            <div id="summary" class="bg-gray-800 p-6 rounded-lg h-auto">
                <h2 class="text-2xl font-bold mb-4">요약</h2>
                <div class="overflow-x-auto overflow-y-auto h-dvh max-h-[30vh]">
                    <table class="w-full">
                        <tr class="border-b border-gray-700">
                            <td class="py-2 text-lg">Is Success</td>
                            <td class="py-2 text-lg">{results.isSuccess ? 'Yes' : 'No'}</td>
                        </tr>
                        <tr class="border-b border-gray-700">
                            <td class="py-2 text-lg">Status Code</td>
                            <td class="py-2">
                                <span class="text-lg font-bold px-3 py-1 rounded-full 
                                    {results.statusCode === 200 ? 'bg-green-500' : 'bg-red-500'}">
                                    {results.statusCode}
                                </span>
                            </td>
                        </tr>
                        <tr class="border-b border-gray-700">
                            <td class="py-2 text-lg">Is Malicious</td>
                            <td class="py-2 text-lg">{results.isMalicious ? 'Yes' : 'No'}</td>
                        </tr>
                        <tr class="border-b border-gray-700">
                            <td class="py-2 text-lg">Info 1</td>
                            <td class="py-2 text-lg">{results.info1}</td>
                        </tr>
                        <tr class="border-b border-gray-700">
                            <td class="py-2 text-lg">Info 2</td>
                            <td class="py-2 text-lg">{results.info2}</td>
                        </tr>
                        <tr>
                            <td class="py-2 text-lg">Info 3</td>
                            <td class="py-2 text-lg">{results.info3}</td>
                        </tr>
                    </table>
                </div>    
            </div>

            <div id="vendorData" class="bg-gray-800 p-6 rounded-lg h-auto">
                <h2 class="text-2xl font-bold mb-4">보안 벤더 분석</h2>
                <div class="overflow-x-auto overflow-y-auto h-dvh max-h-[30vh]">
                    <table class="w-full text-left">
                        <thead>
                            <tr>
                                <th class="pb-3 text-lg">벤더</th>
                                <th class="pb-3 text-lg">상태</th>
                            </tr>
                        </thead>
                        <tbody>
                            {#each results.securityVendors as vendor}
                                <tr class="border-t border-gray-700 h-auto">
                                    <td class="py-3 text-lg">{vendor.name}</td>
                                    <td class="py-3">
                                        <span 
                                            class="px-3 py-1 rounded-full text-sm font-medium" 
                                            class:bg-green-500={vendor.status === 'Clean'}
                                            class:bg-red-500={vendor.status === 'Malicious'}
                                            class:bg-orange-500={vendor.status !== 'Clean' && vendor.status !== 'Malicious'}
                                        >
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

        <div class="space-y-6">
            <div id="pieChart" class="bg-gray-800 p-6 rounded-lg h-auto">
                <h2 class="text-2xl font-bold mb-4">파이 차트</h2>
                <div class="h-dvh max-h-[30vh]">
                    <Pie data={results.pieChartData} options={{ responsive: true, maintainAspectRatio: false }} />
                </div>
            </div>

            <div id="barChart" class="bg-gray-800 p-6 rounded-lg h-auto">
                <h2 class="text-2xl font-bold mb-4">바 차트</h2>
                <div class="h-dvh max-h-[30vh]">
                    <Bar data={results.barChartData} options={{ responsive: true, maintainAspectRatio: false }} />
                </div>
            </div>
        </div>

        {:else}
            <p class="col-span-3 text-center text-xl">URL을 입력하고 '탐지 시작' 버튼을 클릭하세요.</p>
        {/if}
    </main>
</div>

<style>
    :global(body) {
        @apply bg-gray-900 text-white;
    }

    @keyframes pulse {
        0%, 100% {
            opacity: 1;
        }
        50% {
            opacity: .5;
        }
    }

    .animate-pulse {
        animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }

    @keyframes spin {
        from {
            transform: rotate(0deg);
        }
        to {
            transform: rotate(360deg);
        }
    }

    .animate-spin {
        animation: spin 1s linear infinite;
    }
</style>