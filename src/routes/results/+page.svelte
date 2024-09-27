<script>
    import { fade } from 'svelte/transition';
    import { goto } from '$app/navigation';
    import { page } from '$app/stores';
  
    // URL에서 분석한 URL 가져오기
    $: analyzedUrl = $page.url.searchParams.get('url') || '';
  
    // 더미 데이터 (실제로는 API 호출 결과로 대체)
    let results = [
      { title: "막대그래프", data: "막대그래프 데이터", route: "/details/bar-chart" },
      { title: "원형그래프", data: "원형그래프 데이터", route: "/details/pie-chart" },
      { title: "유사 URL", data: ["http://example1.com", "http://example2.com", "http://example3.com"], route: "/details/similar-urls" },
      { title: "위험정도", data: "위험도: 높음", route: "/details/risk-level" }
    ];
  
    const goToDetail = (route, event) => {
      if (event) {
        event.preventDefault();
      }
      goto(route);
    };
  
    const goToHome = () => {
      goto('/');
    };
  </script>
  
  <main class="min-h-screen flex flex-col items-center justify-center p-5" in:fade>
    <h1 class="text-4xl font-bold mb-10 text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500">분석 결과</h1>
  
    <h2 class="text-2xl font-bold mb-5">분석된 URL: {analyzedUrl}</h2>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
      {#each results as { title, data, route }}
        <div 
          class="w-auto h-48 p-5 bg-gray-800 rounded-lg flex flex-col items-center justify-center hover:scale-105 transition-transform cursor-pointer"
          on:click={(event) => goToDetail(route, event)}
        >
          <h3 class="text-xl font-bold mb-3 text-white">{title}</h3>
          {#if Array.isArray(data)}
            <ul class="text-green-300">
              {#each data as item}
                <li>{item}</li>
              {/each}
            </ul>
          {:else}
            <div class="text-green-300">{data}</div>
          {/if}
        </div>
      {/each}
    </div>
  
    <button
      class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
      on:click={goToHome}
    >
      새 URL 분석
    </button>
  </main>