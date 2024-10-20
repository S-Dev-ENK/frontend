<script>
    import { fade } from 'svelte/transition';
    import { goto } from '$app/navigation';
    import { searchHistory } from '$lib/stores/searchHistory';
    import api from '$lib/api';
   
    let url = '';
    let isAnalyzing = false;
    let error = null;

    async function handleSubmit() {
        if (url && !isAnalyzing) {
            isAnalyzing = true;
            error = null;
            
            try {
                const result = await api.analyzeUrl(url);
                
                // 검색 기록 저장 2depth에서 저장
                //searchHistory.saveSearchHistory(url, result.score);
                
                // 결과 페이지로 이동
                goto(`/results?url=${encodeURIComponent(url)}`);
            } catch (err) {
                console.error('URL 분석 중 오류 발생:', err);
                error = 'URL 분석 중 오류가 발생했습니다. 다시 시도해주세요.';
            } finally {
                isAnalyzing = false;
            }
        }
    }
</script>

<div class="flex-grow flex flex-col items-center justify-center p-5">
    <h1 class="text-4xl font-semibold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">Malicious URL Detector</h1>

    <form on:submit|preventDefault={handleSubmit} class="w-full max-w-md mx-auto mb-10" in:fade>
        <input
            bind:value={url}
            type="text"
            class="w-full p-3 rounded-md bg-gray-800 text-green-300 placeholder-gray-500 focus:ring-2 focus:ring-green-400 outline-none"
            placeholder="URL을 입력하세요"
        />
        <button
            type="submit"
            class="mt-5 w-full px-6 py-3 bg-blue-500 hover:bg-blue-700 text-white font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            disabled={isAnalyzing}
        >
            {isAnalyzing ? '분석 중...' : '탐지 시작'}
        </button>
    </form>
    
    {#if isAnalyzing}
        <div class="loader mx-auto"></div>
    {/if}

    {#if error}
        <p class="text-red-500 mt-4">{error}</p>
    {/if}
</div>

<style>
    .loader {
        border: 5px solid #f3f3f3;
        border-top: 5px solid #3498db;
        border-radius: 50%;
        width: 50px;
        height: 50px;
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
</style>