
import { GoogleGenAI, Type } from "@google/genai";
import type { GeminiNoteResponse } from '../types';

// Ensure the API key is set in the environment variables
const API_KEY = process.env.API_KEY;
if (!API_KEY) {
    throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const getGeminiPrompt = (pdfText: string, audioTranscripts: string[], imageCount: number) => {
    let transcriptSection = '';
    audioTranscripts.forEach((transcript, index) => {
        transcriptSection += `
[교수님 강의 녹음 ${index + 1} 텍스트]
${transcript}
`;
    });

    const maxImageIndex = imageCount > 0 ? imageCount - 1 : 0;

    return `
# 역할 (Role)
당신은 '강의 내용 정리' 전문 튜터 AI입니다. 강의 자료와 강의 녹음 내용을 종합하여, 학습자가 핵심 내용을 효과적으로 학습하고 시각적으로 중요한 정보를 놓치지 않도록 돕는 것이 당신의 임무입니다.

# 지시사항 (Instructions)
제공된 '강의 자료 텍스트'를 주된 정보원으로 삼아 핵심 요약 노트를 생성해 주세요. '강의 녹음 텍스트'는 강의의 흐름을 파악하고, 교수님이 특별히 강조한 부분을 찾아내는 데 참고 자료로 활용하세요. 강의 자료의 텍스트와 이미지를 종합적으로 분석하여, 학습자가 핵심 내용을 쉽게 이해할 수 있도록 체계적으로 정리해야 합니다.

[입력 정보]
- 강의 자료 텍스트
- 교수님 강의 녹음 텍스트
- 총 ${imageCount}개의 관련 이미지 (인덱스 0부터 ${maxImageIndex}까지)

# 출력 형식 (Output Format)
반드시 JSON 객체만 반환해야 합니다. 다른 텍스트는 포함하지 마세요. JSON 스키마는 다음과 같습니다.
- note: Markdown 형식으로 생성된 노트 텍스트입니다. 노트 내용 중 이미지가 들어가야 할 위치에 \`[IMG:인덱스]\` 자리표시자를 사용하세요. 이 인덱스는 아래 \`images\` 배열의 인덱스와 일치합니다.
- images: 노트에 포함할 이미지 목록입니다.
  - sourceImageIndex: 원본으로 제공된 전체 페이지 스크린샷 이미지의 0부터 시작하는 인덱스입니다. **반드시 0과 ${maxImageIndex} 사이의 유효한 인덱스만 사용하세요.**
  - description: 해당 페이지 이미지에 대한 간결한 설명입니다. (예: '컴퓨터의 구성 요소 다이어그램')

# 세부 규칙 (Detailed Rules)
1.  **강의 자료 우선:** 노트는 '강의 자료 텍스트'의 구조와 순서를 최우선으로 따라 구성해야 합니다. '강의 녹음 텍스트'는 내용을 보충하거나, 강의에서만 언급된 추가적인 설명, 예시, 강조점을 파악하는 데 사용하세요.
2.  **교수님 강조 부분 표시:** 강의 녹음 내용 중 "중요합니다", "시험에 나옵니다" 등 명시적으로 중요하다고 언급되거나, 내용상 핵심이라고 판단되는 부분은 **\`⚡️ [교수님 강조]: ...\`** 형식으로 특별히 표시해 주세요.
3.  **체계적인 구조:**
    -   가장 중요한 핵심 주제를 Markdown 제목(#)으로 사용하세요.
    -   내용은 글머리 기호('-')를 사용하여 요약합니다. **각 글머리 기호 항목은 반드시 줄바꿈 문자(\\n)로 끝나야 합니다.**
    -   중요 키워드는 **굵은 글씨**로 강조하세요. (\\*\\*키워드\\*\\*)
    -   문단과 문단 사이, 그리고 제목 다음에는 명확한 줄바꿈을 넣어 가독성을 높여주세요.

4.  **이미지 처리 규칙 (매우 중요)**:
    -   **전체 페이지 이미지 사용**: 이제 이미지를 잘라내지 않고, 제공된 전체 페이지 스크린샷을 그대로 사용합니다.
    -   **관련 페이지 선택**: 노트 내용과 시각적으로 가장 관련성이 높은 페이지의 스크린샷을 선택하세요. 예를 들어, '컴퓨터의 구성 요소'에 대해 설명하는 부분에서는 해당 다이어그램이 포함된 페이지 전체를 참조해야 합니다.
    -   **이미지 설명 추가**: 각 이미지에 대해, 해당 페이지의 핵심 내용을 요약하는 간결한 설명을 \`description\` 필드에 추가해주세요. (예: '컴퓨터의 기본 구성 요소 다이어그램', '컴퓨터 아키텍처의 정의')
    -   **노트에 이미지 삽입**: 선택한 전체 페이지 이미지는 강의 내용 흐름상 가장 적절한 위치에 \`[IMG:인덱스]\` 자리표시자를 사용하여 삽입하세요.

[최종 결과물]
노트 작성이 모두 끝난 후, 노트의 가장 마지막 부분에 다음 형식으로 **예상 문제** 두 가지를 반드시 포함해주세요.

**예상 문제**
1. [문제 1 내용]
2. [문제 2 내용]

---
[강의 자료 텍스트]
${pdfText}
${transcriptSection}
[관련 이미지]
${imageCount}개의 이미지가 입력에 포함되어 있습니다. 이 이미지들만을 사용하여 참조하고, 잘라낼 영역의 좌표를 계산하세요.
`;
};

export const generateNotesFromGemini = async (
    pdfText: string,
    audioTranscripts: string[],
    images: string[] // base64 data URLs
): Promise<GeminiNoteResponse> => {
    try {
        const prompt = getGeminiPrompt(pdfText, audioTranscripts, images.length);

        const imageParts = images.map(dataUrl => {
            const base64Data = dataUrl.split(',')[1];
            const mimeType = dataUrl.substring(dataUrl.indexOf(':') + 1, dataUrl.indexOf(';'));
            return {
                inlineData: {
                    data: base64Data,
                    mimeType,
                },
            };
        });

        const contents = {
            parts: [
                { text: prompt },
                ...imageParts,
            ],
        };

        const responseSchema = {
            type: Type.OBJECT,
            properties: {
                note: { type: Type.STRING, description: "Generated notes with [IMG:index] placeholders." },
                images: {
                    type: Type.ARRAY,
                    description: "List of full-page images to be placed in the note.",
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            sourceImageIndex: { type: Type.INTEGER, description: "The 0-based index of the original full-page screenshot." },
                            description: { type: Type.STRING, description: "A brief description of the full-page image." },
                        },
                        required: ["sourceImageIndex", "description"],
                    },
                },
            },
            required: ["note", "images"],
        };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: contents,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            },
        });
        
        const parsedResult: GeminiNoteResponse = JSON.parse(response.text);
        return parsedResult;

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("Failed to generate notes from Gemini API.");
    }
};
