import { GoogleGenAI, Type } from "@google/genai";
import { RawAnalysisResponse, ExposureLevel, SkillClass } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
You are a workforce transformation analyst expert. Your goal is to provide a consistent, objective, and scientifically grounded analysis of job postings.

Analyze the provided job posting content (text or file) to extract distinct tasks and skills.
Classify each strictly based on the defined GenAI exposure frameworks below.

### 1. Task Exposure (E-Score) - Automation Potential
Determine the level of Generative AI exposure for each task.
- **E0 (No Exposure):** Tasks requiring physical presence, manual manipulation, deep interpersonal empathy, or complex sensory judgment.
- **E1 (Direct LLM Exposure):** Cognitive tasks heavily based on text/code/data (e.g., writing, summarizing, coding, basic analysis) where LLMs can reduce time by >50%.
- **E2 (App-Based Exposure):** Tasks requiring specialized software (Excel, ERP, CAD) where GenAI acts as a "Copilot" or embedded feature.
- **E3 (Multimodal Exposure):** Tasks requiring visual, audio, or video processing/generation.

### 2. Augmentation Potential (Human-AI Synergy)
Determine how humans and AI interact for this task.
- **Low:** Minimal synergy. The task is either fully automatable (AI-driven) or strictly manual (Human-driven).
- **Medium:** Sequential hand-off. AI generates drafts or performs analysis; Human reviews, edits, and approves.
- **High:** Deep collaboration. Complex reasoning, creative iteration, or strategic synthesis where Human and AI interact continuously (Iterative loop).

### 3. Skill Classification (S-Score)
Classify skills to determine the role's AI Readiness.
- **S0 (Irrelevant):** Physical or manual skills unaffected by GenAI.
- **S1 (AI-Relevant / Technical):** Skills needed to operate or build AI (e.g., Python, Data Literacy, Prompt Engineering, System Architecture). These drive the *Technical Readiness* score.
- **S2 (Complemented / Strategic):** High-value human skills that are enhanced by AI (e.g., Strategic Planning, Leadership, Complex Problem Solving, Negotiation). These drive the *Strategic Readiness* score.
- **S3 (Substitutable):** Routine cognitive skills that AI can largely replace (e.g., Basic Translation, Copywriting, Data Entry).

### Guidelines for Consistency
1. **Granularity**: Break down the job into specific, granular tasks. Avoid broad buckets.
2. **Objectivity**: Use the definitions strictly. Do not assume exposure if the task is purely physical (E0).
3. **Comprehensiveness**: Extract all technical AND soft skills mentioned.
`;

export const analyzeJobPosting = async (
  content: string,
  isBase64Pdf: boolean = false
): Promise<RawAnalysisResponse> => {
  
  let contentsPayload: any = content;

  if (isBase64Pdf) {
    contentsPayload = {
      parts: [
        {
          inlineData: {
            mimeType: "application/pdf",
            data: content,
          },
        },
        {
          text: "Analyze this job description PDF.",
        },
      ],
    };
  } else {
    contentsPayload = content;
  }

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: contentsPayload,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      thinkingConfig: {
        thinkingBudget: 32768, 
      },
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          jobTitle: { type: Type.STRING },
          executiveSummary: { type: Type.STRING },
          riskCategory: { type: Type.STRING, enum: ["Low", "Medium", "High", "Critical"] },
          tasks: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                description: { type: Type.STRING },
                exposureLevel: { type: Type.STRING, enum: ["E0", "E1", "E2", "E3"] },
                augmentationPotential: { type: Type.STRING, enum: ["Low", "Medium", "High"] },
                rationale: { type: Type.STRING },
              },
              required: ["description", "exposureLevel", "augmentationPotential", "rationale"],
            },
          },
          skills: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                classification: { type: Type.STRING, enum: ["S0", "S1", "S2", "S3"] },
                rationale: { type: Type.STRING },
              },
              required: ["name", "classification", "rationale"],
            },
          },
          recommendations: {
            type: Type.OBJECT,
            properties: {
              roleRedesign: { type: Type.ARRAY, items: { type: Type.STRING } },
              reskillingPriorities: { type: Type.ARRAY, items: { type: Type.STRING } },
              techIntegration: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ["roleRedesign", "reskillingPriorities", "techIntegration"]
          }
        },
        required: ["jobTitle", "executiveSummary", "riskCategory", "tasks", "skills", "recommendations"],
      },
    },
  });

  if (!response.text) {
    throw new Error("No response text received from Gemini.");
  }

  const data = JSON.parse(response.text) as RawAnalysisResponse;
  
  return data;
};