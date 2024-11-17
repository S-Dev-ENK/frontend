// gptService.js
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

const DUMMY_URL_DATA = {
    url: "https://example.com",
    status: "active",
    ipAddress: "192.168.1.1",
    registrationDate: "2023-01-01",
    lastModified: "2024-03-15",
    serverLocation: "United States",
    tlsVersion: "TLS 1.3",
    headers: {
        server: "nginx/1.18.0",
        contentType: "text/html",
    }
};

const SYSTEM_PROMPT = `
당신은 URL 보안 분석 전문가입니다. 제공된 URL 정보를 기반으로 STIG(Security Technical Implementation Guide) 프레임워크에 따른 위협 분석 보고서를 생성해주세요.
URL의 보안성이 아닌 URL을 접속함에 따라 발생할 수 있는 사용자에 대한 위험입니다.
반드시 다음 JSON 형식으로만 응답해야 합니다. 추가 설명이나 다른 텍스트를 포함하지 마세요.
typosqutting도 고려해서 분석해주세요.(작은 오타도 고려해달라는 주문입니다. 사용자를 기만하는 행위 등)
다음 형식으로 JSON 응답을 제공해주세요:
{
    "riskAnalysis": {
        "score": number, // 0-100 사이의 위험도 점수
        "level": string, // "낮음", "중간", "높음" 중 하나
        "description": string // 반드시 입력받은 URL을 표시한 후 위험도 설명
    },
    "detailedAnalysis": {
        "keyFindings": string[], // 주요 발견사항 목록
        "technicalDetails": string[], // 기술적 세부사항
        "vulnerabilities": string[] // 취약점 목록
    },
    "stigAnalysis": {
        "overview": string, // STIG 기반 종합 평가
        "complianceStatus": {
            "passed": string[], // 충족된 STIG 규칙들
            "failed": string[], // 위반된 STIG 규칙들
            "notApplicable": string[] // 해당없는 STIG 규칙들
        },
        "remediationPlan": string, // STIG 기반 개선 계획
        "recommendations": string // 보안 강화를 위한 권장사항
    },
    "aiSummary": string, // AI 종합 의견
    "similarDomains": [
        {
            "domain": string,
            "similarity": number, // 0-100 사이의 유사도 숫자
            "riskLevel": string
        }
    ]
}`;

export async function generateAIReport(urlData = DUMMY_URL_DATA) {
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-4",
                messages: [
                    {
                        role: "system",
                        content: SYSTEM_PROMPT
                    },
                    {
                        role: "user",
                        content: `다음 URL에 대한 보안 분석을 진행해주세요: ${JSON.stringify(urlData, null, 2)}`
                    }
                ],
                temperature: 0.7
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // 응답 형식 확인 및 에러 처리
        if (!data.choices || !data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
            console.error('Unexpected API response format:', data);
            return getDummyResponse();
        }

        try {
            const parsedContent = JSON.parse(data.choices[0].message.content);
            return parsedContent;
        } catch (parseError) {
            console.error('Failed to parse GPT response:', data.choices[0].message.content);
            return getDummyResponse();
        }

    } catch (error) {
        console.error('GPT API 호출 실패:', error);
        return getDummyResponse();
    }
}

// API 연동 전 테스트용 더미 응답
function getDummyResponse() {
    return {
        riskAnalysis: {
            score: 75,
            level: "중간",
            description: "이 URL은 중간~높은 수준의 위험도를 보이고 있습니다."
        },
        detailedAnalysis: {
            keyFindings: [
                "의심스러운 리다이렉션 패턴이 감지됨",
                "알려진 악성 도메인과의 유사성 발견",
                "비정상적인 JavaScript 코드 사용"
            ],
            technicalDetails: [
                "TLS 인증서 검증 실패",
                "의심스러운 DNS 레코드",
                "불명확한 WHOIS 정보"
            ],
            vulnerabilities: [
                "XSS 취약점 가능성",
                "불안전한 리다이렉션",
                "취약한 인증 메커니즘"
            ]
        },
        stigAnalysis: {
            overview: "해당 URL은 STIG 보안 규정 중 일부를 위반하고 있습니다.",
            complianceStatus: {
                passed: [
                    "기본적인 TLS 구현",
                    "HTTP 헤더 구성"
                ],
                failed: [
                    "안전하지 않은 리다이렉션 사용",
                    "취약한 인증 메커니즘"
                ],
                notApplicable: [
                    "클라우드 보안 규정"
                ]
            },
            remediationPlan: "즉시 보안 취약점 개선이 필요하며, 특히 인증 메커니즘 강화가 시급합니다.",
            recommendations: "보안 인증서 업데이트 및 리다이렉션 정책 재검토가 필요합니다."
        },
        aiSummary: "분석된 URL은 피싱 사이트의 특징을 보이고 있습니다. 특히 사용된 JavaScript 코드와 리다이렉션 패턴이 의심됩니다.",
        similarDomains: [
            {
                domain: "example-similar1.com",
                similarity: 92,
                riskLevel: "높음"
            },
            {
                domain: "example-similar2.com",
                similarity: 85,
                riskLevel: "중간"
            }
        ]
    };
}