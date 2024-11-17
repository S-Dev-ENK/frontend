<script>
    import { page } from '$app/stores';
    import { onMount } from 'svelte';
    import { Pie, Bar } from 'svelte-chartjs';
    import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale, BarElement } from 'chart.js';
    import { goto } from '$app/navigation';
    import { searchHistory } from '$lib/stores/searchHistory';
    import { AnalysisStatus } from '$lib/types/analysisTypes';
    import { analysisStore } from '$lib/stores/analysisStore';
    import { aiReportStore } from '$lib/stores/aiReportStore';
    import { fade } from 'svelte/transition';
    import AIReport from '$lib/components/AIReport.svelte';
    import api from '$lib/api';
    import { urlValidation } from '$lib/utils/urlValidation';

    ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale, BarElement);

    let searchUrl = ''; // URL 정보 표시용 변수와 검색용 변수를 분리
    let displayUrl = $page.url.searchParams.get('url') || '';
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

    // loadResultsByHash 함수 수정
        async function loadResultsByHash(urlHash) {
        try {
            console.log('결과 페이지 로드:', urlHash);
            const urlMap = JSON.parse(localStorage.getItem('urlHashMap') || '{}');
            const targetUrl = urlMap[urlHash];

            if (!targetUrl) {
                throw new Error('URL 정보를 찾을 수 없습니다.');
            }

            displayUrl = targetUrl;
            searchHistory.updateSearchStatus(urlHash, AnalysisStatus.PROCESSING);
            
            // API 응답 대기 및 처리
            try {
                console.log('API 응답 대기 중...');
                const result = await api.analyzeUrl(targetUrl);
                
                if (result.isSuccess) {
                    console.log('API 응답 성공:', result);
                    searchHistory.updateSearchStatus(urlHash, AnalysisStatus.COMPLETE, result);
                    // 결과 데이터 설정
                    results = {
                        isSuccess: true,
                        statusCode: result.statusCode,
                        isMalicious: result.isMalicious,
                        info1: result.info1,
                        info2: result.info2,
                        info3: result.info3,
                        barChartData: {
                            labels: ['위험도', '신뢰도', '악성코드', '피싱', '스팸', '평판'],
                            datasets: [{
                                label: '보안 분석 결과',
                                data: [
                                    result.riskScore || 0,
                                    result.trustScore || 0,
                                    result.malwareScore || 0,
                                    result.phishingScore || 0,
                                    result.spamScore || 0,
                                    result.reputationScore || 0
                                ],
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
                                data: [
                                    result.safeScore || 65,
                                    result.suspiciousScore || 25,
                                    result.dangerScore || 10
                                ],
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
                        domainInfo: {
                            registrar: {
                                name: result.registrar?.name || "Unknown",
                                url: result.registrar?.url || "#"
                            },
                            dates: {
                                creation: result.dates?.creation || "Unknown",
                                expiration: result.dates?.expiration || "Unknown"
                            },
                            nameservers: result.nameservers || [],
                            registrant: {
                                organization: result.registrant?.organization || "Unknown",
                                country: result.registrant?.country || "Unknown",
                                state: result.registrant?.state || "Unknown",
                                email: result.registrant?.email || "Unknown"
                            },
                            certificate: {
                                exists: result.certificate?.exists || false,
                                issuer: result.certificate?.issuer || "Unknown",
                                subject: result.certificate?.subject || "Unknown",
                                validFrom: result.certificate?.validFrom || "Unknown",
                                validTo: result.certificate?.validTo || "Unknown",
                                algorithm: result.certificate?.algorithm || "Unknown"
                            }
                        }
                    };
                    // 활성 탭을 Summary로 설정
                    activeTab = 'Summary';
                    error = null;
                    } else {
                    throw new Error('분석에 실패했습니다.');
                }
            } catch (err) {
            // API 호출 자체가 실패하거나 응답이 실패한 경우
            console.error('API 응답 처리 실패:', err);
            searchHistory.updateSearchStatus(urlHash, AnalysisStatus.ERROR);
            error = err.message;
            // 분석 상태 종료 및 에러 상태 설정
            analysisStore.setError(err.message);
            analysisStore.finishAnalysis();
            }
        } catch (err) {
            // URL 정보를 찾지 못한 경우 등 기타 에러
            console.error('결과 로드 에러:', err);
            error = err.message;
            analysisStore.setError(err.message);
            analysisStore.finishAnalysis();
        }  finally {
            // 성공적으로 결과를 받았을 때만 분석 상태 종료
            if (results) {
                analysisStore.finishAnalysis();
            }
        }
    }

    // URL 분석 함수
    async function analyzeUrl(targetUrl) {
        try {
            const result = await api.analyzeUrl(targetUrl);
            
            if (result.isSuccess) {
                // 결과를 받아서 UI 업데이트
                const urlHash = await sha256(targetUrl);
                
                // 검색 기록 업데이트
                searchHistory.addSearch({
                    url: targetUrl,
                    urlHash: urlHash,
                    title: result.title || targetUrl,  // API 응답에서 제목 받기
                    status: 'Online',
                    resourceCount: result.resourceCount || 0,
                    linkCount: result.linkCount || 0,
                    tags: result.tags || ['normal'],
                    country: result.country || '-'
                });

                // 분석 결과 데이터 설정
                results = {
                    isSuccess: true,
                    statusCode: result.statusCode,
                    isMalicious: result.isMalicious,
                    info1: result.info1,
                    info2: result.info2,
                    info3: result.info3,
                    barChartData: {
                        labels: ['위험도', '신뢰도', '악성코드', '피싱', '스팸', '평판'],
                        datasets: [{
                            label: '보안 분석 결과',
                            data: [
                                result.riskScore || 0,
                                result.trustScore || 0,
                                result.malwareScore || 0,
                                result.phishingScore || 0,
                                result.spamScore || 0,
                                result.reputationScore || 0
                            ],
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
                            data: [
                                result.safeScore || 65,
                                result.suspiciousScore || 25,
                                result.dangerScore || 10
                            ],
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
                    domainInfo: {
                        registrar: {
                            name: result.registrar?.name || "Unknown",
                            url: result.registrar?.url || "#"
                        },
                        dates: {
                            creation: result.dates?.creation || "Unknown",
                            expiration: result.dates?.expiration || "Unknown"
                        },
                        nameservers: result.nameservers || [],
                        registrant: {
                            organization: result.registrant?.organization || "Unknown",
                            country: result.registrant?.country || "Unknown",
                            state: result.registrant?.state || "Unknown",
                            email: result.registrant?.email || "Unknown"
                        },
                        certificate: {
                            exists: result.certificate?.exists || false,
                            issuer: result.certificate?.issuer || "Unknown",
                            subject: result.certificate?.subject || "Unknown",
                            validFrom: result.certificate?.validFrom || "Unknown",
                            validTo: result.certificate?.validTo || "Unknown",
                            algorithm: result.certificate?.algorithm || "Unknown"
                        }
                    }
                };

                // 활성 탭을 Summary로 설정
                activeTab = 'Summary';
                error = null;

            } else {
                throw new Error('분석에 실패했습니다.');
            }
        } catch (err) {
            console.error('URL 분석 중 오류 발생:', err);
            analysisStore.setError(err.message);
            error = err.message;
        } finally {
            analysisStore.finishAnalysis();
            isAnalyzing = false;
        }
    }



    // onMount와 URL 매개변수 변경 감지는 그대로 유지
    onMount(async () => {
        const urlHash = $page.url.searchParams.get('hash');
        console.log('onMount - URL 해시:', urlHash);
        
        if (!urlHash) {
            error = '올바르지 않은 접근입니다.';
            return;
        }
        await loadResultsByHash(urlHash);
    });

    // URL 매개변수 변경 감지
    // $: {
    //     const urlHash = $page.url.searchParams.get('hash');
    //     if (urlHash) {
    //         console.log('URL 해시 변경 감지:', urlHash);
    //         loadResultsByHash(urlHash);
    //     }
    // }

    // 새로운 URL 검색 처리
        async function handleSearch() {
        if (searchUrl && !$analysisStore.isAnalyzing) {
            try {
                const validation = urlValidation.isValidUrl(searchUrl);
                if (!validation.isValid) {
                    throw new Error(validation.error);
                }

                const validatedUrl = validation.url;
                const urlHash = await sha256(validatedUrl);
                
                displayUrl = validatedUrl; // displayUrl 업데이트

                // 검색 기록 저장
                searchHistory.addSearch({
                    url: validatedUrl,
                    urlHash: urlHash,
                    title: '분석 중...',
                    status: 'Processing',
                    resourceCount: 0,
                    linkCount: 0,
                    tags: ['analyzing'],
                    country: '-'
                });

                // URL 맵 업데이트
                const urlMap = JSON.parse(localStorage.getItem('urlHashMap') || '{}');
                urlMap[urlHash] = validatedUrl;
                localStorage.setItem('urlHashMap', JSON.stringify(urlMap));

                // 분석 시작
                analysisStore.startAnalysis(validatedUrl);
                window.history.pushState({}, '', `/results?hash=${urlHash}`);
                await analyzeUrl(validatedUrl);

            } catch (err) {
                console.error('결과 페이지 에러:', err);
                analysisStore.setError(err.message);
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

    function handleTabChange(tab) {
        // AI Report 탭은 독립적으로 동작하므로 별도 처리 없이 탭만 변경
        activeTab = tab;
    }

    // 상태 변수 (예시)
</script>

<svelte:head>
    <title>Result - Luckybicky</title>
</svelte:head>

<!-- 메인 콘텐츠 영역 -->
<div class="w-full min-h-screen bg-gray-100">
    <!-- 검색 섹션 -->
    <div class="bg-gradient-overlay relative h-[12vh] sm:h-[15vh] flex items-center">
        <div class="max-w-6xl mx-auto w-full px-4">
            <form on:submit|preventDefault={handleSearch} class="relative" in:fade>
                <div class="flex flex-col gap-2">
                    <div class="flex items-center bg-white rounded-full shadow-xl relative pr-2 h-12 sm:h-16">
                        <input
                            bind:value={searchUrl}
                            type="text"
                            class="flex-1 pl-4 sm:pl-6 pr-12 py-2 sm:py-4 text-sm sm:text-base text-gray-700 focus:outline-none rounded-full
                                {error ? 'border-red-500 focus:border-red-500' : ''}"
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
                                <div class="w-8 h-8 sm:w-12 sm:h-12 bg-blue-500 rounded-full flex items-center justify-center">
                                    <img 
                                        src="/images/search.png" 
                                        alt="search" 
                                        class="w-5 h-5 sm:w-8 sm:h-8"
                                    />
                                </div>
                            {/if}
                        </button>
                    </div>
                    {#if error}
                        <div class="text-red-500 text-sm px-4" transition:fade>
                            {error}
                        </div>
                    {/if}
                </div>
            </form>
        </div>
    </div>

    <!-- 탭 네비게이션 -->
    <div class="border-b bg-white">
        <div class="max-w-7xl mx-auto px-4">
            <nav class="flex space-x-4 sm:space-x-8 overflow-x-auto hide-scrollbar">
                {#each tabs as tab}
                    <button
                        class="px-3 sm:px-4 py-3 sm:py-4 border-b-2 text-sm sm:text-base font-medium transition-colors relative whitespace-nowrap
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
    <div class="max-w-7xl mx-auto px-4 py-4 sm:py-6">
        {#if activeTab === 'AI Report'}
            <AIReport />
        {:else if $analysisStore.isAnalyzing}
            <!-- 로딩 상태 UI -->
            <div class="min-h-[60vh] flex items-center justify-center">
                <div class="text-center">
                    <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto"></div>
                    <p class="mt-4 text-lg font-medium">보고서 생성 중...</p>
                    <p class="mt-2 text-sm text-gray-500">잠시만 기다려주세요.</p>
                </div>
            </div>
        {:else if error}
            <div class="text-center py-8 sm:py-12">
                <p class="text-base sm:text-xl text-red-500">{error}</p>
            </div>
        {:else if results}
            {#if activeTab === 'Summary'}
                <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
                    <!-- 분석 결과 카드 -->
                    <div class="lg:col-span-4 bg-white rounded-lg shadow p-4 sm:p-6">
                        <h2 class="flex items-center gap-2 text-base sm:text-lg font-medium text-gray-900 mb-4">
                            <img src="/images/result.png" alt="분석 결과" class="w-6 h-6 sm:w-8 sm:h-8" />
                            분석 결과
                        </h2>
                        <div class="flex flex-col items-center justify-center">
                            <div class="relative w-32 h-32 sm:w-48 sm:h-48">
                                <div class="absolute inset-0 rounded-full border-4 {getStatusColor(status)}"></div>
                                <div class="absolute inset-2 rounded-full bg-white flex items-center justify-center">
                                    <span class="text-xl sm:text-2xl font-medium {getStatusColor(status)}">{status}</span>
                                </div>
                            </div>
                            <div class="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-500">
                                최근 스캔 시간: {new Date().toLocaleString()}
                            </div>
                        </div>
                    </div>

                    <!-- URL 정보 카드 -->
                    <div class="lg:col-span-8 bg-white rounded-lg shadow p-4 sm:p-6">
                        <h2 class="text-base sm:text-lg font-medium text-gray-900 mb-4">URL 정보</h2>
                        <div class="overflow-x-auto">
                            <table class="w-full">
                                <tbody class="divide-y">
                                    <tr>
                                        <td class="py-2 sm:py-3 text-sm sm:text-base text-gray-600 w-24 sm:w-32">URL</td>
                                        <td class="py-2 sm:py-3 text-sm sm:text-base break-all">{displayUrl}</td>
                                    </tr>
                                    <tr>
                                        <td class="py-2 sm:py-3 text-sm sm:text-base text-gray-600">Title</td>
                                        <td class="py-2 sm:py-3 text-sm sm:text-base">{results.info1}</td>
                                    </tr>
                                    <tr>
                                        <td class="py-2 sm:py-3 text-sm sm:text-base text-gray-600">상태</td>
                                        <td class="py-2 sm:py-3">
                                            <span class="px-2 sm:px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs sm:text-sm">
                                                normal
                                            </span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- 차트 영역 -->
                    <div class="lg:col-span-6 bg-white rounded-lg shadow p-4 sm:p-6">
                        <h2 class="text-base sm:text-lg font-medium text-gray-900 mb-4">파이 차트</h2>
                        <div class="h-48 sm:h-64">
                            <Pie data={results.pieChartData} options={{ 
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: {
                                        position: 'right',
                                        labels: {
                                            font: {
                                                size: window.innerWidth < 640 ? 10 : 12
                                            }
                                        }
                                    }
                                }
                            }} />
                        </div>
                    </div>

                    <div class="lg:col-span-6 bg-white rounded-lg shadow p-4 sm:p-6">
                        <h2 class="text-base sm:text-lg font-medium text-gray-900 mb-4">바 차트</h2>
                        <div class="h-48 sm:h-64">
                            <Bar data={results.barChartData} options={{ 
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: {
                                        labels: {
                                            font: {
                                                size: window.innerWidth < 640 ? 10 : 12
                                            }
                                        }
                                    }
                                },
                                scales: {
                                    y: {
                                        ticks: {
                                            font: {
                                                size: window.innerWidth < 640 ? 10 : 12
                                            }
                                        }
                                    },
                                    x: {
                                        ticks: {
                                            font: {
                                                size: window.innerWidth < 640 ? 10 : 12
                                            }
                                        }
                                    }
                                }
                            }} />
                        </div>
                    </div>

                        <!-- 보안벤더 분석 섹션을 대체할 도메인 정보 섹션 -->
                <div class="lg:col-span-12 bg-white rounded-lg shadow p-4 sm:p-6">
                    <h2 class="flex items-center gap-2 text-base sm:text-lg font-medium text-gray-900 mb-4">
                        <img src="/images/domain-info.png" alt="도메인 정보" class="w-6 h-6 sm:w-8 sm:h-8" />
                        도메인 기본 정보
                    </h2>
                    
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <!-- 도메인 등록 정보 -->
                        <div class="space-y-4">
                            <h3 class="text-sm sm:text-base font-medium text-gray-700">등록 정보</h3>
                            <div class="bg-gray-50 rounded-lg p-4 space-y-3">
                                <div class="grid grid-cols-3 gap-2 text-sm">
                                    <span class="text-gray-600">등록기관:</span>
                                    <span class="col-span-2 text-gray-900">{results.domainInfo.registrar.name}</span>
                                </div>
                                <div class="grid grid-cols-3 gap-2 text-sm">
                                    <span class="text-gray-600">등록일:</span>
                                    <span class="col-span-2 text-gray-900">{new Date(results.domainInfo.dates.creation).toLocaleDateString()}</span>
                                </div>
                                <div class="grid grid-cols-3 gap-2 text-sm">
                                    <span class="text-gray-600">만료일:</span>
                                    <span class="col-span-2 text-gray-900">{new Date(results.domainInfo.dates.expiration).toLocaleDateString()}</span>
                                </div>
                                <div class="grid grid-cols-3 gap-2 text-sm">
                                    <span class="text-gray-600">네임서버:</span>
                                    <div class="col-span-2 space-y-1">
                                        {#each results.domainInfo.nameservers as ns}
                                            <span class="block text-gray-900">{ns}</span>
                                        {/each}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- 등록자 정보 -->
                        <div class="space-y-4">
                            <h3 class="text-sm sm:text-base font-medium text-gray-700">등록자 정보</h3>
                            <div class="bg-gray-50 rounded-lg p-4 space-y-3">
                                <div class="grid grid-cols-3 gap-2 text-sm">
                                    <span class="text-gray-600">조직명:</span>
                                    <span class="col-span-2 text-gray-900">{results.domainInfo.registrant.organization}</span>
                                </div>
                                <div class="grid grid-cols-3 gap-2 text-sm">
                                    <span class="text-gray-600">국가:</span>
                                    <span class="col-span-2 text-gray-900">{results.domainInfo.registrant.country}</span>
                                </div>
                                <div class="grid grid-cols-3 gap-2 text-sm">
                                    <span class="text-gray-600">지역:</span>
                                    <span class="col-span-2 text-gray-900">{results.domainInfo.registrant.state}</span>
                                </div>
                                <div class="grid grid-cols-3 gap-2 text-sm">
                                    <span class="text-gray-600">이메일:</span>
                                    <span class="col-span-2 text-gray-900">{results.domainInfo.registrant.email}</span>
                                </div>
                            </div>
                        </div>

                        <!-- SSL 인증서 정보 -->
                        <div class="lg:col-span-2 space-y-4">
                            <h3 class="text-sm sm:text-base font-medium text-gray-700">SSL 인증서 정보</h3>
                            <div class="bg-gray-50 rounded-lg p-4">
                                {#if results.domainInfo.certificate.exists}
                                    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                                        <div>
                                            <span class="block text-gray-600 mb-1">발급기관</span>
                                            <span class="text-gray-900">{results.domainInfo.certificate.issuer}</span>
                                        </div>
                                        <div>
                                            <span class="block text-gray-600 mb-1">발급대상</span>
                                            <span class="text-gray-900">{results.domainInfo.certificate.subject}</span>
                                        </div>
                                        <div>
                                            <span class="block text-gray-600 mb-1">유효기간</span>
                                            <span class="text-gray-900">
                                                {new Date(results.domainInfo.certificate.validFrom).toLocaleDateString()} ~ 
                                                {new Date(results.domainInfo.certificate.validTo).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div>
                                            <span class="block text-gray-600 mb-1">암호화 알고리즘</span>
                                            <span class="text-gray-900">{results.domainInfo.certificate.algorithm}</span>
                                        </div>
                                    </div>
                                {:else}
                                    <div class="text-center text-gray-500 py-2">
                                        인증서 정보 없음
                                    </div>
                                {/if}
                            </div>
                        </div>
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
                <!-- {:else if activeTab === 'AI Report'}
                    <AIReport />
                {/if}
                -->
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
        transition: transform 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10;
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
    .hide-scrollbar {
        -ms-overflow-style: none;
        scrollbar-width: none;
    }
    
    .hide-scrollbar::-webkit-scrollbar {
        display: none;
    }

    .loader {
        border: 2px solid rgba(255,255,255,0.3);
        border-top: 2px solid #ffffff;
        border-radius: 50%;
        width: 16px;
        height: 16px;
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }

    @media (max-width: 640px) {
        .search-button {
            right: 4px; /* 모바일에서 오른쪽 여백 줄임 */
        }
        
        .search-button div {
            transform: scale(0.8); /* 모바일에서 버튼 크기 조정 */
            transform-origin: center;
        }
        
        /* loader 크기도 조정 */
        .loader {
            width: 14px;
            height: 14px;
        }
    }

</style>