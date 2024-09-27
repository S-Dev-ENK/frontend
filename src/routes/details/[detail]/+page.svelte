<script>
    import { page } from '$app/stores';
    
    // URL 파라미터에서 detail 값을 가져옵니다
    $: detail = $page.params.detail;
    
    // 실제로는 여기서 상세 데이터를 불러오거나 계산합니다
    $: detailData = getDetailData(detail);
    
    function getDetailData(detailType) {
      switch(detailType) {
        case 'bar-chart':
          return "막대 그래프에 대한 상세 정보입니다.";
        case 'pie-chart':
          return "원형 그래프에 대한 상세 정보입니다.";
        case 'similar-urls':
          return "유사 URL에 대한 상세 정보입니다.";
        case 'risk-level':
          return "위험 수준에 대한 상세 정보입니다.";
        default:
          return "알 수 없는 항목입니다.";
      }
    }

    function goBack() {
        history.back();
    }
  </script>
  
  <main class="min-h-screen flex flex-col items-center justify-center p-5">
    <h1 class="text-3xl font-bold mb-10">{detail.replace('-', ' ')} 상세 정보</h1>
  
    <div class="bg-gray-800 p-5 rounded-lg max-w-2xl w-full">
      <p class="text-white">{detailData}</p>
    </div>
  
    <button 
        on:click={goBack}
        class="mt-5 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
        뒤로 가기
     </button>
  </main>