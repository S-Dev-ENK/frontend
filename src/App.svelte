<script>
	let url = ''; // 사용자가 입력한 URL
	let result = null; // API 응답 결과
	let errorMessage = ''; // 오류 메시지
	let loading = false; // 로딩 상태 표시
  
	// Google Safe Browsing API 키
	const API_KEY = 'AIzaSyA-5A5af9sWbv1V6scNw3McieOk1Vh0GFQ'; // 발급받은 API 키로 교체
  
	// URL 피싱 여부 확인 함수
	async function checkURL() {
	  // URL이 비어 있지 않은지 확인
	  if (!url) {
		errorMessage = 'Please enter a URL';
		return;
	  }
  
	  loading = true;
	  result = null;
	  errorMessage = '';
  
	  try {
		// Google Safe Browsing API에 POST 요청
		const response = await fetch(`https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${API_KEY}`, {
		  method: 'POST',
		  headers: {
			'Content-Type': 'application/json',
		  },
		  body: JSON.stringify({
			client: {
			  clientId: 'yourcompanyname', // clientId는 자유롭게 설정 가능
			  clientVersion: '1.0',
			},
			threatInfo: {
			  threatTypes: ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE", "POTENTIALLY_HARMFUL_APPLICATION"],
			  platformTypes: ["ANY_PLATFORM"],
			  threatEntryTypes: ["URL"],
			  threatEntries: [{ url: url }],
			},
		  }),
		});
  
		if (!response.ok) {
		  throw new Error('Failed to fetch the API');
		}
  
		const data = await response.json();
		
		// 악성 URL 탐지 결과 확인
		if (data.matches && data.matches.length > 0) {
		  result = 'This URL is dangerous!';
		} else {
		  result = 'This site is safe.';
		}
	  } catch (error) {
		errorMessage = 'Error: ' + error.message;
	  } finally {
		loading = false;
	  }
	}
  </script>
  
  <style>
	/* 간단한 스타일 추가 */
	.container {
	  padding: 20px;
	  max-width: 600px;
	  margin: auto;
	}
	input {
	  width: 100%;
	  padding: 10px;
	  margin-bottom: 10px;
	}
	button {
	  padding: 10px 20px;
	  cursor: pointer;
	}
	.result {
	  margin-top: 20px;
	}
  </style>
  
  <div class="container">
	<h1>Phishing URL Detector</h1>
  
	<input type="text" bind:value={url} placeholder="Enter URL to check" />
	<button on:click={checkURL} disabled={loading}>Check URL</button>
  
	{#if loading}
	  <p>Checking URL...</p>
	{/if}
  
	{#if errorMessage}
	  <p class="error">{errorMessage}</p>
	{/if}
  
	{#if result}
	  <p class="result">{result}</p>
	{/if}
  </div>
  