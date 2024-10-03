<script>
	import { fade } from 'svelte/transition';
	import { goto } from '$app/navigation';
	import { writable } from 'svelte/store';
	import { onMount } from 'svelte';
	
	let url = '';
	let isAnalyzing = false;
	let showSearchHistory = false;
  
	// 검색 기록을 저장할 store 생성
	const searchHistory = writable([]);

	// localStorage에서 검색 기록을 불러오는 함수
	const loadSearchHistory = () => {
		const savedHistory = localStorage.getItem('searchHistory');
		return savedHistory ? JSON.parse(savedHistory) : [];
	};

	// 검색 기록을 localStorage에 저장하는 함수
	const saveSearchHistory = (history) => {
		localStorage.setItem('searchHistory', JSON.stringify(history));
	};

	// 컴포넌트가 마운트될 때 localStorage에서 검색 기록을 불러옵니다.
	onMount(() => {
		searchHistory.set(loadSearchHistory());
	});

	const detectURL = () => {
		isAnalyzing = true;
		// 실제로는 여기서 API 호출을 수행합니다
		setTimeout(() => {
			isAnalyzing = false;
			// 검색 기록에 현재 URL 추가
			searchHistory.update(history => {
				const updatedHistory = [{ url, timestamp: new Date() }, ...history];
				saveSearchHistory(updatedHistory);
				return updatedHistory;
			});
			// 결과 페이지로 이동, URL을 쿼리 파라미터로 전달
			goto(`/results?url=${encodeURIComponent(url)}`);
		}, 2000);
	};

	const toggleSearchHistory = () => {
		showSearchHistory = !showSearchHistory;
	};
</script>

<div class="flex-grow flex flex-col">
	<!-- 상단 바 -->
	<nav class="bg-gray-900 p-4 flex justify-between items-center">
		<h2 class="text-2xl font-bold">악성 URL 탐지기</h2>
		<button 
			on:click={toggleSearchHistory}
			class="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-md transition-colors duration-200"
		>
			{showSearchHistory ? '검색 기록 닫기' : '검색 기록 보기'}
		</button>
	</nav>

	<div class="flex-grow flex">
		<!-- 메인 콘텐츠 -->
		<div class="flex-grow flex flex-col items-center justify-center p-5">
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
		</div>

		<!-- 검색 기록 -->
		{#if showSearchHistory}
			<div class="w-1/3 bg-gray-800 p-5 overflow-auto" transition:fade>
				<h3 class="text-xl font-bold mb-4">검색 기록</h3>
				{#if $searchHistory.length === 0}
					<p>검색 기록이 없습니다.</p>
				{:else}
					<table class="w-full text-left">
						<thead>
							<tr>
								<th class="pb-2">URL</th>
								<th class="pb-2">검색 시간</th>
							</tr>
						</thead>
						<tbody>
							{#each $searchHistory as { url, timestamp }}
								<tr class="border-t border-gray-700">
									<td class="py-2">
										<a href={`/results?url=${encodeURIComponent(url)}`} class="text-blue-400 hover:underline">
											{url}
										</a>
									</td>
									<td class="py-2">{new Date(timestamp).toLocaleString()}</td>
								</tr>
							{/each}
						</tbody>
					</table>
				{/if}
			</div>
		{/if}
	</div>
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