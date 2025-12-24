
import { GoogleGenAI } from "@google/genai";
import { AdmissionRecord } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getAdmissionInsights = async (data: AdmissionRecord[]): Promise<string> => {
  if (data.length === 0) return "분석할 데이터가 없습니다.";

  const summary = data.slice(0, 50).map(r => 
    `${r.university} ${r.department} (${r.admissionType}): ${r.result}`
  ).join(', ');

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `다음은 입시 결과 데이터의 일부입니다: ${summary}. 이 데이터를 바탕으로 현재 입시 경향에 대해 한 문장으로 요약하고, 수험생에게 줄 수 있는 짧은 조언을 한국어로 작성해줘.`,
      config: {
        systemInstruction: "당신은 입시 전문가입니다. 데이터를 분석하여 짧고 명확한 통찰을 제공하세요.",
        temperature: 0.7,
      },
    });
    return response.text || "분석 결과를 가져오지 못했습니다.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "AI 분석 중 오류가 발생했습니다.";
  }
};
