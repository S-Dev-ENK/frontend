<!-- 향상된 API 문서 컴포넌트 (src/lib/components/ApiDocs.svelte) -->
<script>
    import { slide } from 'svelte/transition';
    
    let openEndpoint = 'url-analysis';
    let openSection = 'endpoints'; // 'endpoints', 'errors', 'limits', 'versions'

    // API 버전 정보
    const versions = [
        {
            version: 'v1 (현재)',
            status: 'stable',
            releaseDate: '2024-01-01',
            endOfLife: '2025-01-01',
            changes: [
                'URL 분석 기능 제공',
                'AI 기반 리포트 생성',
                'Resource 스캐닝'
            ]
        },
        {
            version: 'v2 (베타)',
            status: 'beta',
            releaseDate: '2024-04-01',
            endOfLife: null,
            changes: [
                'WebSocket 실시간 분석',
                '향상된 AI 리포트',
                '멀티 URL 배치 분석'
            ]
        }
    ];

    // 에러 코드 정보
    const errors = [
        {
            code: 400,
            name: 'Bad Request',
            description: '잘못된 요청 형식',
            examples: [
                {
                    message: '유효하지 않은 URL 형식',
                    solution: 'URL이 올바른 형식(http:// 또는 https://)인지 확인하세요.'
                },
                {
                    message: '필수 파라미터 누락',
                    solution: '모든 필수 파라미터가 포함되었는지 확인하세요.'
                }
            ]
        },
        {
            code: 401,
            name: 'Unauthorized',
            description: 'API 키 인증 실패',
            examples: [
                {
                    message: '유효하지 않은 API 키',
                    solution: 'API 키가 올바르게 설정되었는지 확인하세요.'
                },
                {
                    message: 'API 키 만료',
                    solution: '새로운 API 키를 발급받으세요.'
                }
            ]
        },
        {
            code: 429,
            name: 'Too Many Requests',
            description: '요청 한도 초과',
            examples: [
                {
                    message: '일일 요청 한도 초과',
                    solution: '사용량을 확인하고 필요한 경우 요청 수를 조절하세요.'
                }
            ]
        },
        {
            code: 500,
            name: 'Internal Server Error',
            description: '서버 내부 오류',
            examples: [
                {
                    message: '서비스 일시적 장애',
                    solution: '잠시 후 다시 시도하거나 지원팀에 문의하세요.'
                }
            ]
        }
    ];

    // 사용량 제한 정보
    const limits = {
        basic: {
            name: '기본 플랜',
            daily: 1000,
            monthly: 30000,
            concurrent: 5,
            features: [
                '기본 URL 분석',
                'Resource 스캐닝',
                'AI 리포트 (일일 100건)'
            ]
        },
        premium: {
            name: '프리미엄 플랜',
            daily: 5000,
            monthly: 150000,
            concurrent: 20,
            features: [
                '고급 URL 분석',
                'Resource 스캐닝',
                '무제한 AI 리포트',
                '우선 순위 처리'
            ]
        }
    };

// API 엔드포인트 정보
const endpoints = {
        'url-analysis': {
            title: 'URL 분석',
            method: 'POST',
            path: '/api/v1/analyze',
            description: 'URL을 분석하여 악성 여부와 상세 정보를 제공합니다.',
            parameters: [
                {
                    name: 'url',
                    type: 'string',
                    required: true,
                    description: '분석할 URL'
                },
                {
                    name: 'features',
                    type: 'object',
                    required: true,
                    description: '분석할 기능 목록 (summary, resource, link, aiReport)'
                }
            ],
            headers: [
                {
                    name: 'X-API-Key',
                    required: true,
                    description: '발급받은 API 키'
                },
                {
                    name: 'Content-Type',
                    required: true,
                    description: 'application/json'
                }
            ],
            example: {
                request: `curl -X POST https://api.luckybicky.com/v1/analyze \\
  -H "X-API-Key: your-api-key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "url": "https://example.com",
    "features": {
      "summary": true,
      "resource": true,
      "link": false,
      "aiReport": true
    }
  }'`,
                response: `{
  "status": "success",
  "data": {
    "url": "https://example.com",
    "malicious": false,
    "summary": {
      "title": "Example Domain",
      "description": "안전한 웹사이트",
      "score": 0.98
    },
    "resources": [
      {
        "type": "script",
        "url": "https://example.com/script.js",
        "malicious": false
      }
    ],
    "aiReport": {
      "risk_level": "low",
      "analysis": "해당 URL은 정상적인 웹사이트로 판단됩니다."
    }
  }
}`
            }
        },
        'api-status': {
            title: 'API 상태 확인',
            method: 'GET',
            path: '/api/v1/status',
            description: 'API 서비스의 현재 상태와 사용량을 확인합니다.',
            parameters: [],
            headers: [
                {
                    name: 'X-API-Key',
                    required: true,
                    description: '발급받은 API 키'
                }
            ],
            example: {
                request: `curl https://api.luckybicky.com/v1/status \\
  -H "X-API-Key: your-api-key"`,
                response: `{
  "status": "success",
  "data": {
    "service_status": "operational",
    "usage": {
      "daily_requests": 150,
      "remaining_requests": 850
    }
  }
}`
            }
        }
    };

    // 코드 복사 함수
    async function copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            alert('코드가 클립보드에 복사되었습니다.');
        } catch (err) {
            console.error('클립보드 복사 실패:', err);
        }
    }
</script>

<div class="w-[95%] max-w-screen-2xl mx-auto mt-8 bg-white rounded-lg shadow-lg overflow-hidden">
    <!-- API 문서 헤더 -->
    <div class="p-6 bg-gray-50 border-b border-gray-200">
        <h2 class="text-2xl font-bold text-gray-900 mb-4">API 문서</h2>
        <p class="text-gray-600 mb-6">
            Luckybicky API를 사용하여 URL 분석 기능을 프로그래밍 방식으로 통합하세요.
            모든 API 요청에는 발급받은 API 키가 필요합니다.
        </p>

        <!-- 네비게이션 탭 -->
        <div class="flex space-x-1 border-b">
            {#each [
                ['endpoints', '엔드포인트'],
                ['errors', '에러 코드'],
                ['limits', '사용량 제한'],
                ['versions', 'API 버전']
            ] as [value, label]}
                <button
                    class="px-4 py-2 font-medium text-sm rounded-t-lg {
                        openSection === value
                            ? 'bg-white text-blue-600 border-t border-x border-gray-200'
                            : 'text-gray-500 hover:text-gray-700'
                    }"
                    on:click={() => openSection = value}
                >
                    {label}
                </button>
            {/each}
        </div>
    </div>

    <!-- 컨텐츠 영역 -->
    <div class="p-6">
        <!-- 엔드포인트 섹션 -->
        {#if openSection === 'endpoints'}
            <div class="space-y-6">

                {#each Object.entries(endpoints) as [key, endpoint]}
                    <div class="border rounded-lg overflow-hidden">
                        <!-- 엔드포인트 헤더 -->
                        <button 
                            class="w-full px-6 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
                            on:click={() => openEndpoint = openEndpoint === key ? null : key}
                        >
                            <div class="flex items-center space-x-4">
                                <span class="px-2 py-1 text-sm rounded {
                                    endpoint.method === 'GET' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                                }">
                                    {endpoint.method}
                                </span>
                                <span class="font-mono text-gray-800">{endpoint.path}</span>
                            </div>
                            <svg 
                                class="h-5 w-5 transform transition-transform {openEndpoint === key ? 'rotate-180' : ''}"
                                xmlns="http://www.w3.org/2000/svg" 
                                viewBox="0 0 20 20" 
                                fill="currentColor"
                            >
                                <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                            </svg>
                        </button>
        
                        <!-- 엔드포인트 상세 내용 -->
                        {#if openEndpoint === key}
                            <div class="p-6 border-t" transition:slide>
                                <h3 class="text-lg font-semibold mb-4">{endpoint.title}</h3>
                                <p class="text-gray-600 mb-6">{endpoint.description}</p>
        
                                <!-- 파라미터 섹션 -->
                                {#if endpoint.parameters.length > 0}
                                    <div class="mb-6">
                                        <h4 class="text-sm font-semibold text-gray-900 mb-2">요청 파라미터</h4>
                                        <div class="bg-gray-50 rounded-lg p-4">
                                            {#each endpoint.parameters as param}
                                                <div class="mb-4 last:mb-0">
                                                    <div class="flex items-center space-x-2">
                                                        <span class="font-mono text-sm">{param.name}</span>
                                                        <span class="text-xs text-gray-500">{param.type}</span>
                                                        {#if param.required}
                                                            <span class="text-xs text-red-500">필수</span>
                                                        {/if}
                                                    </div>
                                                    <p class="text-sm text-gray-600 mt-1">{param.description}</p>
                                                </div>
                                            {/each}
                                        </div>
                                    </div>
                                {/if}
        
                                <!-- 헤더 섹션 -->
                                <div class="mb-6">
                                    <h4 class="text-sm font-semibold text-gray-900 mb-2">헤더</h4>
                                    <div class="bg-gray-50 rounded-lg p-4">
                                        {#each endpoint.headers as header}
                                            <div class="mb-4 last:mb-0">
                                                <div class="flex items-center space-x-2">
                                                    <span class="font-mono text-sm">{header.name}</span>
                                                    {#if header.required}
                                                        <span class="text-xs text-red-500">필수</span>
                                                    {/if}
                                                </div>
                                                <p class="text-sm text-gray-600 mt-1">{header.description}</p>
                                            </div>
                                        {/each}
                                    </div>
                                </div>
        
                                <!-- 예제 섹션 -->
                                <div>
                                    <h4 class="text-sm font-semibold text-gray-900 mb-2">예제</h4>
                                    <div class="space-y-4">
                                        <!-- 요청 예제 -->
                                        <div class="relative">
                                            <button
                                                on:click={() => copyToClipboard(endpoint.example.request)}
                                                class="absolute right-2 top-2 p-2 text-gray-400 hover:text-gray-100 transition-colors"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                    <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                                                    <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                                                </svg>
                                            </button>
                                            <pre class="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto">
                                                <code>{endpoint.example.request}</code>
                                            </pre>
                                        </div>
        
                                        <!-- 응답 예제 -->
                                        <div class="relative">
                                            <button
                                                on:click={() => copyToClipboard(endpoint.example.response)}
                                                class="absolute right-2 top-2 p-2 text-gray-400 hover:text-gray-100 transition-colors"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                    <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                                                    <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                                                </svg>
                                            </button>
                                            <pre class="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto">
                                                <code>{endpoint.example.response}</code>
                                            </pre>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        {/if}
                    </div>
                {/each}
            </div>

        <!-- 에러 코드 섹션 -->
        {:else if openSection === 'errors'}
            <div class="space-y-6">
                {#each errors as error}
                    <div class="border rounded-lg overflow-hidden">
                        <div class="px-6 py-4 bg-gray-50 border-b flex items-center justify-between">
                            <div class="flex items-center space-x-4">
                                <span class="px-2 py-1 text-sm rounded {
                                    error.code >= 500 ? 'bg-red-100 text-red-800' :
                                    error.code >= 400 ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-gray-100 text-gray-800'
                                }">
                                    {error.code}
                                </span>
                                <span class="font-semibold">{error.name}</span>
                            </div>
                        </div>
                        <div class="p-6">
                            <p class="text-gray-600 mb-4">{error.description}</p>
                            <div class="space-y-4">
                                {#each error.examples as example}
                                    <div class="bg-gray-50 rounded-lg p-4">
                                        <div class="font-mono text-sm text-gray-800 mb-2">{example.message}</div>
                                        <div class="text-sm text-gray-600">{example.solution}</div>
                                    </div>
                                {/each}
                            </div>
                        </div>
                    </div>
                {/each}
            </div>

        <!-- 사용량 제한 섹션 -->
        {:else if openSection === 'limits'}
            <div class="space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {#each Object.entries(limits) as [key, plan]}
                        <div class="border rounded-lg overflow-hidden">
                            <div class="px-6 py-4 bg-gray-50 border-b">
                                <h3 class="text-lg font-semibold">{plan.name}</h3>
                            </div>
                            <div class="p-6">
                                <dl class="space-y-4">
                                    <div>
                                        <dt class="text-sm font-medium text-gray-500">일일 요청 한도</dt>
                                        <dd class="mt-1 text-lg font-semibold">{plan.daily.toLocaleString()}회</dd>
                                    </div>
                                    <div>
                                        <dt class="text-sm font-medium text-gray-500">월간 요청 한도</dt>
                                        <dd class="mt-1 text-lg font-semibold">{plan.monthly.toLocaleString()}회</dd>
                                    </div>
                                    <div>
                                        <dt class="text-sm font-medium text-gray-500">동시 요청 수</dt>
                                        <dd class="mt-1 text-lg font-semibold">{plan.concurrent}개</dd>
                                    </div>
                                    <div>
                                        <dt class="text-sm font-medium text-gray-500">제공 기능</dt>
                                        <dd class="mt-2">
                                            <ul class="space-y-2">
                                                {#each plan.features as feature}
                                                    <li class="flex items-center text-sm">
                                                        <svg class="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                            <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
                                                        </svg>
                                                        {feature}
                                                    </li>
                                                {/each}
                                            </ul>
                                        </dd>
                                    </div>
                                </dl>
                            </div>
                        </div>
                    {/each}
                </div>
                <div class="mt-6 bg-blue-50 rounded-lg p-4">
                    <p class="text-sm text-blue-800">
                        * 레이트 리미팅은 API 키 단위로 적용됩니다. 한도 초과 시 429 에러가 반환됩니다.
                    </p>
                </div>
            </div>

        <!-- API 버전 섹션 -->
        {:else if openSection === 'versions'}
            <div class="space-y-6">
                {#each versions as version}
                    <div class="border rounded-lg overflow-hidden">
                        <div class="px-6 py-4 bg-gray-50 border-b flex items-center justify-between">
                            <div class="flex items-center space-x-4">
                                <span class="font-semibold">{version.version}</span>
                                <span class="px-2 py-1 text-xs rounded {
                                    version.status === 'stable' ? 'bg-green-100 text-green-800' :
                                    version.status === 'beta' ? 'bg-blue-100 text-blue-800' :
                                    'bg-gray-100 text-gray-800'
                                }">
                                    {version.status}
                                </span>
                            </div>
                        </div>
                        <div class="p-6">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <dt class="text-sm font-medium text-gray-500">출시일</dt>
                                    <dd class="mt-1">{version.releaseDate}</dd>
                                </div>
                                <div>
                                    <dt class="text-sm font-medium text-gray-500">지원 종료일</dt>
                                    <dd class="mt-1">{version.endOfLife || '미정'}</dd>
                                </div>
                            </div>
                            <div>
                                <dt class="text-sm font-medium text-gray-500 mb-2">주요 변경사항</dt>
                                <dd>
                                    <ul class="space-y-2">
                                        {#each version.changes as change}
                                            <li class="flex items-center text-sm">
                                                <svg class="h-4 w-4 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                                                </svg>
                                                {change}
                                            </li>
                                        {/each}
                                    </ul>
                                </dd>
                            </div>
                        </div>
                    </div>
                {/each}
                <div class="mt-6 bg-yellow-50 rounded-lg p-4">
                    <p class="text-sm text-yellow-800">
                        * API 버전은 최소 12개월간 지원됩니다. 지원 종료 3개월 전에 사전 공지됩니다.
                    </p>
                </div>
            </div>
        {/if}
    </div>
</div>

<style>
    /* 필요한 추가 스타일 */
    :global(pre) {
        white-space: pre-wrap;
        word-wrap: break-word;
    }
</style>