<script>
    import { fade } from 'svelte/transition';
    import { onMount } from 'svelte';
    import ApiDocs from '$lib/components/ApiDocs.svelte';  // 컴포넌트 import 추가

    let userName = '';
    let phoneNumber = '';
    let email = '';
    let apiKey = '';
    let selectedFeatures = {
        summary: false,
        resource: false,
        link: false,
        aiReport: false
    };
    let isGenerating = false;
    let error = null;
    let success = false;

    // 전화번호 형식 변환 함수
    function formatPhoneNumber(value) {
        // 숫자만 추출
        const numbers = value.replace(/[^\d]/g, '');
        
        // 숫자가 없으면 빈 문자열 반환
        if (!numbers) return '';
        
        // 숫자 길이에 따라 형식 적용
        if (numbers.length <= 3) {
            return numbers;
        } else if (numbers.length <= 7) {
            return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
        } else {
            return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
        }
    }

    // 전화번호 입력 핸들러
    function handlePhoneNumberInput(event) {
        const input = event.target;
        const formattedNumber = formatPhoneNumber(input.value);
        phoneNumber = formattedNumber;
    }

    // 전화번호 유효성 검사 함수
    function isValidPhoneNumber(number) {
        // 숫자만 추출하여 길이 확인
        const numbers = number.replace(/[^\d]/g, '');
        return numbers.length === 11; // 한국 전화번호 기준
    }

    // API 키 생성 함수 로컬 키 생성 - 추후 삭제
    async function generateRandomApiKey() {
        const array = new Uint8Array(32);
        window.crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }

    // API 키 생성 함수
    async function generateApiKey() {
        if (!userName || !email) {
            error = '이름과 이메일을 입력해주세요.';
            return;
        }

        if (!isValidPhoneNumber(phoneNumber)) {
            error = '올바른 전화번호 형식이 아닙니다.';
            return;
        }


        if (!Object.values(selectedFeatures).some(v => v)) {
            error = '최소 하나 이상의 기능을 선택해주세요.';
            return;
        }

        isGenerating = true;
        error = null;
        success = false;

        try {
            // API 키 생성
            const newApiKey = await generateRandomApiKey();
            
            // 사용자 정보와 API 키 저장
            const apiKeyData = {
                userName,
                phoneNumber,
                email,
                features: selectedFeatures,
                apiKey: newApiKey,
                createdAt: new Date().toISOString()
            };

            // 로컬 스토리지에 저장
            const apiKeys = JSON.parse(localStorage.getItem('apiKeys') || '{}');
            apiKeys[newApiKey] = apiKeyData;
            localStorage.setItem('apiKeys', JSON.stringify(apiKeys));

            // 이메일을 키로 하여 사용자별 API 키 저장
            const userApiKeys = JSON.parse(localStorage.getItem('userApiKeys') || '{}');
            if (!userApiKeys[email]) {
                userApiKeys[email] = [];
            }
            userApiKeys[email].push(newApiKey);
            localStorage.setItem('userApiKeys', JSON.stringify(userApiKeys));

            apiKey = newApiKey;
            success = true;

            // 폼 초기화
            userName = '';
            phoneNumber = '';
            email = '';
            selectedFeatures = {
                summary: false,
                resource: false,
                link: false,
                aiReport: false
            };

        } catch (err) {
            console.error('API 키 생성 오류:', err);
            error = 'API 키 생성 중 오류가 발생했습니다.';
        } finally {
            isGenerating = false;
        }
        // api 부분 추후 백엔드 구축 후 부활 예정
        // try {
        //     const response = await fetch('/api/generate-key', {
        //         method: 'POST',
        //         headers: {
        //             'Content-Type': 'application/json',
        //         },
        //         body: JSON.stringify({
        //             userName,
        //             phoneNumber,
        //             email,
        //             features: selectedFeatures
        //         })
        //     });

        //     if (!response.ok) {
        //         throw new Error('API 키 생성에 실패했습니다.');
        //     }

        //     const data = await response.json();
        //     apiKey = data.apiKey;
        //     success = true;
        // } catch (err) {
        //     error = err.message;
        // } finally {
        //     isGenerating = false;
        // }
    }

    // API 키 복사 함수
    async function copyApiKey() {
        try {
            await navigator.clipboard.writeText(apiKey);
            alert('API 키가 클립보드에 복사되었습니다.');
        } catch (err) {
            error = '클립보드 복사에 실패했습니다.';
        }
    }

        // 컴포넌트 마운트 시 기존 API 키 로드
    onMount(() => {
        const apiKeys = JSON.parse(localStorage.getItem('apiKeys') || '{}');
        const userApiKeys = JSON.parse(localStorage.getItem('userApiKeys') || '{}');
        console.log('Loaded API keys:', { apiKeys, userApiKeys });
    });
</script>

<!-- 페이지가 제대로 마운트되었는지 확인하기 위한 테스트 -->
<svelte:head>
    <title>API Service - Luckybicky</title>
</svelte:head>

<div class="w-full min-h-screen bg-gray-100 pb-20">
    <!-- 배경 이미지와 오버레이 -->
    <div class="absolute inset-0 z-0">
        <div class="absolute search-height-overlay bg-gradient-overlay"></div>
    </div>

    <!-- 헤더 섹션 -->
    <div class="header-search-container relative z-1">
        <div class="text-center pt-8 sm:pt-12">
            <div class="mb-4 sm:mb-6">
                <img 
                    src="/images/bmw-logo.png" 
                    alt="bmw" 
                    class="h-16 sm:h-20 mx-auto"
                />
            </div>
            <div class="relative px-4">
                <h1 class="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 text-white">API 서비스</h1>
                <p class="text-base sm:text-lg font-bold text-gray-100 mb-4 sm:mb-6 mx-auto max-w-4xl px-4">
                    <span class="hidden sm:inline">악성 URL 탐지 및 분석 서비스의 API를 활용하여<br/>
                    당신의 서비스에 보안 기능을 통합하세요.</span>
                    <span class="sm:hidden">
                        악성 URL 탐지 API로 서비스 보안을 강화하세요.
                    </span>
                </p>
            </div>
        </div>
    </div>

    <!-- API 키 생성 컨텐츠 -->
    <div class="relative w-[95%] max-w-screen-2xl mx-auto mt-20 sm:mt-40 bg-white rounded-lg shadow-lg overflow-hidden pb-4 fixed-content mb-8">
        <!-- API 설명 섹션 -->
        <div class="p-6 bg-blue-50 border-b border-blue-100">
            <h2 class="text-xl font-semibold text-blue-900 mb-4 flex items-center gap-2">
                <img src="/images/api-info.png" alt="API 정보" class="w-6 h-6 sm:w-8 sm:h-8" />
                API 사용 안내
            </h2>
            <div class="space-y-4 text-blue-800 text-sm sm:text-base">
                <p>• API를 통해 URL 분석 기능을 프로그래밍 방식으로 이용할 수 있습니다.</p>
                <p>• 선택한 기능에 따라 API 응답이 달라집니다.</p>
                <p>• API 호출 시 발급받은 키를 헤더에 포함해야 합니다.</p>
                <p>• API 사용량은 일일 1,000회로 제한됩니다.</p>
            </div>
        </div>

        <!-- 키 생성 폼 -->
        <div class="p-6">
            <form on:submit|preventDefault={generateApiKey} class="space-y-6">
                <!-- 사용자 정보 -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label for="userName" class="block text-sm font-medium text-gray-700 mb-1">
                            이름 *
                        </label>
                        <input
                            type="text"
                            id="userName"
                            bind:value={userName}
                            class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            placeholder="홍길동"
                            required
                        />
                    </div>

                    <!-- 전화번호 입력 필드 수정 -->
                    <div>
                        <label for="phoneNumber" class="block text-sm font-medium text-gray-700 mb-1">
                            전화번호 *
                        </label>
                        <input
                            type="tel"
                            id="phoneNumber"
                            bind:value={phoneNumber}
                            on:input={handlePhoneNumberInput}
                            class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            placeholder="010-0000-0000"
                            maxlength="13"
                            required
                        />
                        <p class="mt-1 text-xs text-gray-500">예시: 010-1234-5678</p>
                    </div>

                    <div class="md:col-span-2">
                        <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
                            이메일 *
                        </label>
                        <input
                            type="email"
                            id="email"
                            bind:value={email}
                            class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            placeholder="example@domain.com"
                            required
                        />
                    </div>
                </div>

                <!-- 기능 선택 -->
                <div>
                    <h3 class="text-lg font-medium text-gray-900 mb-4">API 기능 선택</h3>
                    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        <label class="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                            <input
                                type="checkbox"
                                bind:checked={selectedFeatures.summary}
                                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span class="text-gray-900">Summary</span>
                        </label>

                        <label class="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                            <input
                                type="checkbox"
                                bind:checked={selectedFeatures.resource}
                                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span class="text-gray-900">Resource</span>
                        </label>

                        <label class="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                            <input
                                type="checkbox"
                                bind:checked={selectedFeatures.link}
                                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span class="text-gray-900">Link</span>
                        </label>

                        <label class="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                            <input
                                type="checkbox"
                                bind:checked={selectedFeatures.aiReport}
                                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span class="text-gray-900">AI Report</span>
                        </label>
                    </div>
                </div>

                <!-- 에러 메시지 -->
                {#if error}
                    <div class="bg-red-50 border-l-4 border-red-400 p-4" transition:fade>
                        <p class="text-red-700">{error}</p>
                    </div>
                {/if}

                <!-- 제출 버튼 -->
                <div class="flex justify-end">
                    <button
                        type="submit"
                        class="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
                        disabled={isGenerating}
                    >
                        {#if isGenerating}
                            <span class="flex items-center">
                                <div class="loader mr-2"></div>
                                생성 중...
                            </span>
                        {:else}
                            API 키 생성하기
                        {/if}
                    </button>
                </div>
            </form>
        </div>

        <!-- API 키 결과 -->
        {#if success && apiKey}
            <div class="p-6 bg-green-50 border-t border-green-100" transition:fade>
                <h3 class="text-lg font-medium text-green-900 mb-4">API 키가 생성되었습니다</h3>
                <div class="flex items-center space-x-4">
                    <code class="flex-1 p-4 bg-white rounded-lg border border-green-200 font-mono text-sm break-all">
                        {apiKey}
                    </code>
                    <button
                        on:click={copyApiKey}
                        class="px-4 py-2 text-sm font-medium text-green-700 bg-green-100 rounded-md hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                    >
                        복사
                    </button>
                </div>
                <p class="mt-4 text-sm text-green-700">
                    이 키를 안전한 곳에 보관하세요. 다시 확인할 수 없습니다.
                </p>
            </div>
        {/if}
    </div>
    <div class="relative w-[95%] max-w-screen-2xl mx-auto mt-20 sm:mt-40 bg-white rounded-lg shadow-lg overflow-hidden pb-4 fixed-content mb-8">
        <ApiDocs />
    </div>
</div>


    

<!-- Footer -->
<div class="w-full bg-white text-gray-600 text-xs border-t-4">
    <div class="mx-auto p-4">
        <div class="flex flex-col gap-2">
            <!-- 로고 섹션 -->
            <div class="flex items-center gap-2 mb-2">
                <img src="/images/lucky_logo_row.png" alt="Logo" class="h-4 sm:h-6" />
                <span class="text-gray-400">v1.0.0</span>
            </div>
            
            <!-- 정보 섹션 -->
            <div class="flex flex-col gap-1 text-[10px] sm:text-xs">
                <div class="flex items-center gap-1 sm:gap-2 flex-wrap">
                    <span>이용약관</span>
                    <span class="text-gray-300">|</span>
                    <span>개인정보처리방침</span>
                    <span class="text-gray-300">|</span>
                    <span class="text-blue-800 font-bold">사업자번호:</span>
                    <span>000-00-00000</span>
                </div>
                
                <div class="text-gray-500">
                    <span class="text-[10px] sm:text-xs">(05717) 서울 송파구 중대로 135 서관 14층 (재)한국정보보호산업협회, KISIA</span>
                </div>
                
                <div class="flex items-center gap-1 sm:gap-2 text-gray-500 flex-wrap text-[10px] sm:text-xs">
                    <span class="text-blue-800 font-bold">대표이사:</span>
                    <span>KISIA</span>
                    <span class="text-gray-300">|</span>
                    <span class="text-blue-800 font-bold">대표전화:</span>
                    <span>02-0000-0000</span>
                    <span class="text-gray-300">|</span>
                    <span class="text-blue-800 font-bold">기술지원:</span>
                    <span>02-0000-0000</span>
                    <span class="text-gray-300">|</span>
                    <span class="text-blue-800 font-bold">팩스:</span>
                    <span>02-0000-0000</span>
                </div>
                
                <div class="text-gray-500 text-[10px] sm:text-xs">
                    <span>이메일: luckybicky@luckybicky.com</span>
                </div>
            </div>
        </div>
    </div>
</div>

<style>
    .header-search-container {
        min-height: 400px;
        height: auto;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding-bottom: 30px;
    }

    .search-height-overlay {
        min-height: 400px;
        height: auto;
        width: 100%;
        background-image: url('/images/background.jpg');
        background-size: cover;
        background-position: center;
    }

    .fixed-content {
        min-width: 320px;
        max-height: none;
        margin-bottom: 2rem;
        position: relative;
        z-index: 1;
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

    /* 반응형 디자인 */
    @media (max-width: 640px) {
        .header-search-container {
            min-height: 300px;
            padding-bottom: 40px;
        }

        .search-height-overlay {
            min-height: 300px;
        }

        .fixed-content {
            width: 95%;
            margin: 1rem auto;
        }
    }

    @media (min-width: 641px) and (max-width: 1024px) {
        .header-search-container {
            min-height: 350px;
            padding-bottom: 50px;
        }

        .search-height-overlay {
            min-height: 350px;
        }

        .fixed-content {
            width: 90%;
            margin: 2rem auto;
        }
    }

    @media (min-width: 1025px) {
        .header-search-container {
            min-height: 400px;
        }

        .search-height-overlay {
            min-height: 400px;
        }

        .fixed-content {
            width: 85%;
            max-width: 1920px;
            margin: 3rem auto;
        }
    }

    /* 입력 필드 포커스 효과 */
    input:focus, textarea:focus {
        outline: none;
        box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
    }
</style>