<script>
    // 기존 스크립트 코드는 그대로 유지
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
</script>

<div class="min-h-screen relative z-0">
    <!-- 배경 이미지와 오버레이 -->
    <div class="absolute inset-0 z-0">
        <div class="absolute inset-0 bg-gradient-overlay"></div>
        <div class="absolute bottom-0 left-0 right-0 h-1/2 bg-white"></div>
    </div>

    <!-- 컨텐츠 -->
      <!-- 헤더 섹션 -->
      <div class="text-center pt-12 pb-8  relative z-1">
        <div class="mb-10">
            <img 
                src="src/lib/images/bmw-logo.png" 
                alt="bmw" 
                class="h-12 mx-auto"
            />
        </div>
        <div class=" relative z-1">
            <h1 class="text-4xl font-bold mb-4 text-white">악성 URL 탐지 및 분석 서비스</h1>
            <p class="text-lg text-gray-300 mb-6">
                Domain info,YARA, DNS Foot printing 등의 분석기법을 통해 악성 URL로 인한<br/>
                사이버 위협을 유사도 분석 기술과 사회공학기법을 융합하여 탐지하고 분석합니다.
            </p>
        </div>
    </div>

    <!-- 검색 섹션 -->
    <div class="max-w-6xl mx-auto px-8 mb-6">
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