import { GoogleGenAI, Type } from "@google/genai";

// Initialize Gemini
// NOTE: Process.env.API_KEY is handled by the environment
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getFinancialAdvice = async (query: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are 'X100', an advanced AI Agent Builder.
      The user is asking: "${query}".
      
      Your goal is to simulate the creation of a digital employee (e.g., Sales Rep, SEO Manager, Support Bot).
      
      Respond with a JSON object that confirms the creation of the agent.
      
      Structure:
      - Headline: A confirmation like "Sales Agent Created" or "SEO Manager Ready".
      - Insight: A brief description of what this agent will do based on the user's request (e.g. "I've configured this agent to handle WhatsApp inquiries...").
      - ActionItems: 3 steps the user needs to do next (e.g. "Connect Telegram API", "Upload Product Knowledge Base").
      - ForecastChanges: A table showing the estimated efficiency gain. Metric (e.g. "Response Time"), Baseline (e.g. "2 hours"), Change (e.g. "Instant").
      
      Keep it professional, futuristic, and efficient.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            headline: { type: Type.STRING, description: "Confirmation headline." },
            insight: { type: Type.STRING, description: "Description of the created agent." },
            actionItems: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Next steps for deployment."
            },
            forecastChanges: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        metric: { type: Type.STRING },
                        baseline: { type: Type.STRING },
                        change: { type: Type.STRING },
                    }
                },
                description: "Efficiency comparison table"
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini API Error:", error);
    // Mock response for Agent Creation
    return {
      headline: "Sales Manager Configured",
      insight: "I have initialized your Sales Manager agent. It is set to handle incoming leads via Telegram and qualify them based on your script.",
      actionItems: ["Connect Telegram Bot Token", "Upload Sales Script PDF", "Set working hours"],
      forecastChanges: [
        { metric: "Lead Response", baseline: "4 hours", change: "< 1 min" },
        { metric: "Qualifying Rate", baseline: "15%", change: "45%" },
        { metric: "Cost per Lead", baseline: "$25", change: "$2" }
      ]
    };
  }
};