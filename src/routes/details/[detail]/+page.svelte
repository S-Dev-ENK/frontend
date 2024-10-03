<script>
  import { page } from '$app/stores';
  import { Pie, Bar } from 'svelte-chartjs';
  import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale, BarElement } from 'chart.js';

  ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale, BarElement);
  
  // URL 파라미터에서 detail 값을 가져옵니다
  $: detail = $page.params.detail;
  
  // 더미 데이터 (실제로는 API 호출 결과로 대체)
  const dummyData = {
      'bar-chart': {
          chartData: {
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
          dbData: [
              { Category: 'Red', Value: 12 },
              { Category: 'Blue', Value: 19 },
              { Category: 'Yellow', Value: 3 },
              { Category: 'Green', Value: 5 },
              { Category: 'Purple', Value: 2 },
              { Category: 'Orange', Value: 3 }
          ]
      },
      'pie-chart': {
          chartData: {
              labels: ['Red', 'Blue', 'Yellow'],
              datasets: [{
                  data: [300, 50, 100],
                  backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
                  hoverBackgroundColor: ['#FF6384', '#36A2EB', '#FFCE56']
              }]
          },
          dbData: [
              { Segment: 'Red', Percentage: 66.67 },
              { Segment: 'Blue', Percentage: 11.11 },
              { Segment: 'Yellow', Percentage: 22.22 }
          ]
      },
      'similar-urls': {
          dbData: Array(20).fill().map((_, i) => ({ 
              'URL': `http://example${i+1}.com`, 
              'Similarity Score': (Math.random() * 0.5 + 0.5).toFixed(2)
          }))
      },
      'risk-level': {
          dbData: Array(20).fill().map((_, i) => ({ 
              'Risk Factor': `Risk ${i+1}`, 
              'Score': (Math.random()).toFixed(2)
          }))
      }
  };
  
  $: detailData = dummyData[detail] || { dbData: [] };

  function goBack() {
      history.back();
  }
</script>

<main class="min-h-screen flex flex-col items-center justify-start p-5">
  <h1 class="text-3xl font-bold mb-10">{detail.replace('-', ' ')} 상세 정보</h1>

  {#if detail === 'bar-chart' || detail === 'pie-chart'}
      <div class="w-full max-w-8xl flex flex-col justify-center md:flex-row gap-5">
          <div class="w-full md:w-1/3 bg-gray-800 p-5 rounded-lg">
              {#if detail === 'bar-chart'}
                  <Bar data={detailData.chartData} options={{ responsive: true, maintainAspectRatio: false }} />
              {:else}
                  <Pie data={detailData.chartData} options={{ responsive: true, maintainAspectRatio: false }} />
              {/if}
          </div>
          <div class="w-full md:w-1/3 bg-gray-800 p-5 rounded-lg overflow-auto">
              <table class="w-full text-left border-collapse">
                  <thead>
                      <tr>
                          {#each Object.keys(detailData.dbData[0] || {}) as column}
                              <th class="p-3 border-b border-gray-700">{column}</th>
                          {/each}
                      </tr>
                  </thead>
                  <tbody>
                      {#each detailData.dbData as row}
                          <tr class="hover:bg-gray-700">
                              {#each Object.values(row) as value}
                                  <td class="p-3 border-b border-gray-700">
                                      {typeof value === 'number' ? value.toFixed(2) : value}
                                  </td>
                              {/each}
                          </tr>
                      {/each}
                  </tbody>
              </table>
          </div>
      </div>
  {:else}
      <div class="w-full max-w-4xl bg-gray-800 p-5 rounded-lg overflow-auto">
          <table class="w-full text-left border-collapse">
              <thead>
                  <tr>
                      {#each Object.keys(detailData.dbData[0] || {}) as column}
                          <th class="p-3 border-b border-gray-700">{column}</th>
                      {/each}
                  </tr>
              </thead>
              <tbody>
                  {#each detailData.dbData as row}
                      <tr class="hover:bg-gray-700">
                          {#each Object.values(row) as value}
                              <td class="p-3 border-b border-gray-700">
                                  {typeof value === 'number' ? value.toFixed(2) : value}
                              </td>
                          {/each}
                      </tr>
                  {/each}
              </tbody>
          </table>
      </div>
  {/if}

  <button 
      on:click={goBack}
      class="mt-5 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
  >
      뒤로 가기
  </button>
</main>

<style>
  main {
      display: flex;
      flex-direction: column;
      width: 100%;
      min-height: 100vh;
  }
</style>