<script>
	import { fade } from 'svelte/transition';
	import { goto } from '$app/navigation';
	
	let url = '';
	let isAnalyzing = false;
  
	const detectURL = () => {
	  isAnalyzing = true;
	  // 실제로는 여기서 API 호출을 수행합니다
	  setTimeout(() => {
		isAnalyzing = false;
		// 결과 페이지로 이동, URL을 쿼리 파라미터로 전달
		goto(`/results?url=${encodeURIComponent(url)}`);
	  }, 2000);
	};
  </script>
  
  <main class="min-h-screen flex flex-col items-center justify-center">
	<h1 class="text-6xl font-bold mb-10 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500">악성 URL 탐지기</h1>
  
	<div class="w-full max-w-md mx-auto mb-10" in:fade>
	  <input
		bind:value={url}
		type="text"
		class="w-full p-3 rounded-md bg-gray-800 text-green-300 placeholder-gray-500 focus:ring-2 focus:ring-green-400 outline-none"
		placeholder="URL을 입력하세요"
	  />
	  <button
		class="mt-5 w-full px-6 py-3 bg-blue-500 hover:bg-blue-700 text-white font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
		on:click={detectURL}
		disabled={isAnalyzing}
	  >
		{isAnalyzing ? '분석 중...' : '탐지 시작'}
	  </button>
	</div>
	
	{#if isAnalyzing}
	  <div class="loader mx-auto"></div>
	{/if}
  </main>
  
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