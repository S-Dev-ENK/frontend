<script>
    import { fade } from 'svelte/transition';
    import { goto } from '$app/navigation';
    import { searchHistory } from '$lib/stores/searchHistory';
   
    let url = '';
    let isAnalyzing = false;

    async function handleSubmit() {
        if (url && !isAnalyzing) {
            isAnalyzing = true;
            
            try {
                // 실제로는 여기서 API 호출을 수행합니다
                await new Promise(resolve => setTimeout(resolve, 2000));

                // 임시 점수 생성 (실제로는 API 응답에서 받아와야 함) 여기 실제 종합 점수 넣어야함
                const score = Math.floor(Math.random() * 100);
                
                // 검색 기록 저장
                searchHistory.saveSearchHistory(url, score);
                
                // 결과 페이지로 이동
                goto(`/results?url=${encodeURIComponent(url)}`);
            } catch (error) {
                console.error('Error during URL analysis:', error);
                // 여기에 에러 처리 로직을 추가할 수 있습니다.
            } finally {
                isAnalyzing = false;
            }
        }
    }
</script>

<div class="flex-grow flex flex-col items-center justify-center p-5">
    <h1 class="text-6xl font-bold mb-10 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500">악성 URL 탐지기</h1>

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