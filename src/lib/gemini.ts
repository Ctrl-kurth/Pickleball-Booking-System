import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export const getGeminiModel = (modelName = "gemini-2.5-flash") => {
  return genAI.getGenerativeModel({ model: modelName });
};

/**
 * System Prompt for the Pickleball Coaching Assistant
 */
const SYSTEM_PROMPT = `
You are an expert Pickleball Coaching Assistant. Your goal is to help users book the right coach and answer questions about techniques, rules, and availability.
You have access to real-time data from the MongoDB schedule.
Always maintain a professional, sharp, and helpful tone (Senior Developer style).
Be concise. If a user asks for available slots, present them clearly.
`;

export async function askAssistant(userQuery: string, context: string) {
  const model = getGeminiModel();
  
  const prompt = `
  ${SYSTEM_PROMPT}

  CONTEXT FROM DATABASE:
  ${context}

  USER QUERY:
  ${userQuery}

  RESPONSE:
  `;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}
