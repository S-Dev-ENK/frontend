<script>
    import { page } from '$app/stores';
    import { onMount } from 'svelte';
    import { generateAIReport } from '$lib/services/gptService';

    let aiReport = null;
    let isLoading = true;
    let error = null;

    async function loadReport(forceRefresh = false) {
        isLoading = true;
        try {
            const urlHash = $page.url.searchParams.get('hash');
            if (!urlHash) {
                throw new Error('URL 해시를 찾을 수 없습니다.');
            }

            if (!forceRefresh) {
                // 저장된 GPT 분석 결과 확인
                const savedResult = localStorage.getItem(`gptResult_${urlHash}`);
                if (savedResult) {
                    const parsed = JSON.parse(savedResult);
                    aiReport = parsed.result;
                    isLoading = false;
                    return;
                }
            }

            // 저장된 결과가 없거나 강제 새로고침인 경우
            const urlMap = JSON.parse(localStorage.getItem('urlHashMap') || '{}');
            const url = urlMap[urlHash];
            
            if (!url) {
                throw new Error('URL 정보를 찾을 수 없습니다.');
            }

            // 새로운 분석 시작
            const result = await generateAIReport({
                url: url,
                timestamp: new Date().toISOString()
            });

            // 결과 저장
            localStorage.setItem(`gptResult_${urlHash}`, JSON.stringify({
                timestamp: new Date().toISOString(),
                result: result
            }));

            aiReport = result;
        } catch (error) {
            console.error('AI 보고서 로드 실패:', error);
            this.error = error.message;
        } finally {
            isLoading = false;
        }
    }

    onMount(() => {
        loadReport();
    });

    function handleRefresh() {
        loadReport(true);
    }
</script>

{#if isLoading}
    <div class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
{:else if aiReport}
    <div class="space-y-8">
        <!-- 위험도 분석 -->
        <div class="border rounded-lg p-6 bg-white">
            <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
                <span class="text-blue-500">위험도 분석</span>
                <span class="text-sm font-normal text-gray-500">Risk Analysis</span>
            </h3>
            <div class="flex items-center gap-4">
                <div class="flex-1">
                    <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                            class="h-full transition-all duration-500 ease-out"
                            class:bg-green-500={aiReport.riskAnalysis.score < 50}
                            class:bg-yellow-500={aiReport.riskAnalysis.score >= 50 && aiReport.riskAnalysis.score < 75}
                            class:bg-red-500={aiReport.riskAnalysis.score >= 75}
                            style="width: {aiReport.riskAnalysis.score}%"
                        ></div>
                    </div>
                </div>
                <span class="text-2xl font-bold {
                    aiReport.riskAnalysis.score < 50 ? 'text-green-500' :
                    aiReport.riskAnalysis.score < 75 ? 'text-yellow-500' : 'text-red-500'
                }">{aiReport.riskAnalysis.score}%</span>
            </div>
            <p class="mt-2 text-gray-600">{aiReport.riskAnalysis.description}</p>
        </div>

        <!-- 상세 분석 -->
        <div class="border rounded-lg p-6 bg-white">
            <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
                <span class="text-blue-500">상세 분석</span>
                <span class="text-sm font-normal text-gray-500">Detailed Analysis</span>
            </h3>
            <div class="space-y-4">
                <!-- 주요 발견사항 -->
                <div>
                    <h4 class="font-medium text-gray-700 mb-2">주요 발견사항</h4>
                    <ul class="list-disc list-inside space-y-1 text-gray-600">
                        {#each aiReport.detailedAnalysis.keyFindings as finding}
                            <li>{finding}</li>
                        {/each}
                    </ul>
                </div>
                
                <!-- 기술적 세부사항 -->
                <div>
                    <h4 class="font-medium text-gray-700 mb-2">기술적 세부사항</h4>
                    <ul class="list-disc list-inside space-y-1 text-gray-600">
                        {#each aiReport.detailedAnalysis.technicalDetails as detail}
                            <li>{detail}</li>
                        {/each}
                    </ul>
                </div>
            </div>
        </div>

        <!-- 기존의 권장 조치사항 부분을 이 코드로 교체 -->
        <div class="border rounded-lg p-6 bg-white">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-semibold flex items-center gap-2">
                    <span class="text-blue-500">STIG 기반 분석</span>
                    <span class="text-sm font-normal text-gray-500">STIG Analysis</span>
                </h3>
                <button
                    on:click={handleRefresh}
                    class="px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                >
                    새로 분석하기
                </button>
            </div>
            <div class="space-y-6">
                <div class="bg-gray-50 p-4 rounded-lg">
                    <h4 class="font-medium text-gray-900 mb-3">종합 평가</h4>
                    <p class="text-gray-700">{aiReport.stigAnalysis.overview}</p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="bg-green-50 p-4 rounded-lg">
                        <h4 class="font-medium text-green-900 mb-2">충족된 규칙</h4>
                        <ul class="list-disc list-inside space-y-1 text-green-800">
                            {#each aiReport.stigAnalysis.complianceStatus.passed as rule}
                                <li>{rule}</li>
                            {/each}
                        </ul>
                    </div>

                    <div class="bg-red-50 p-4 rounded-lg">
                        <h4 class="font-medium text-red-900 mb-2">위반된 규칙</h4>
                        <ul class="list-disc list-inside space-y-1 text-red-800">
                            {#each aiReport.stigAnalysis.complianceStatus.failed as rule}
                                <li>{rule}</li>
                            {/each}
                        </ul>
                    </div>
                </div>

                <div class="bg-blue-50 p-4 rounded-lg">
                    <h4 class="font-medium text-blue-900 mb-2">개선 계획</h4>
                    <p class="text-blue-800">{aiReport.stigAnalysis.remediationPlan}</p>
                </div>

                <div class="bg-gray-50 p-4 rounded-lg">
                    <h4 class="font-medium text-gray-900 mb-2">권장사항</h4>
                    <p class="text-gray-700">{aiReport.stigAnalysis.recommendations}</p>
                </div>
            </div>
        </div>

        <!-- AI 종합 의견 -->
        <div class="border rounded-lg p-6 bg-blue-50">
            <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
                <span class="text-blue-500">AI 종합 의견</span>
                <span class="text-sm font-normal text-gray-500">AI Summary</span>
            </h3>
            <p class="text-gray-700 leading-relaxed">
                {aiReport.aiSummary}
            </p>
        </div>

        <!-- 유사 도메인 분석 -->
        <div class="border rounded-lg p-6 bg-white">
            <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
                <span class="text-blue-500">유사 도메인 분석</span>
                <span class="text-sm font-normal text-gray-500">Similar Domains</span>
            </h3>
            <div class="overflow-x-auto">
                <table class="min-w-full">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">도메인</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">유사도</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">위험도</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        {#each aiReport.similarDomains as domain}
                            <tr>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {domain.domain}
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {domain.similarity}%
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                                        {domain.riskLevel === '높음' ? 'bg-red-100 text-red-800' :
                                        domain.riskLevel === '중간' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-green-100 text-green-800'}">
                                        {domain.riskLevel}
                                    </span>
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
{:else}
    <div class="text-center py-12 text-gray-500">
        AI 보고서를 생성하는데 실패했습니다.
    </div>
{/if}