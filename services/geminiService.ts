
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { GEMINI_MODEL_TEXT } from '../constants';

export class GeminiService {
  private ai: GoogleGenAI | null = null;
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    if (apiKey && apiKey !== 'MOCK_API_KEY_FRONTEND_ONLY') { // Avoid initializing with mock key if it's placeholder
        try {
            this.ai = new GoogleGenAI({ apiKey: this.apiKey });
        } catch (error) {
            console.error("Failed to initialize GoogleGenAI:", error);
            this.ai = null; // Ensure ai is null if initialization fails
        }
    } else {
        console.warn("GeminiService initialized with a mock/missing API key. Real API calls will not be made.");
    }
  }

  public async generateText(prompt: string): Promise<string> {
    if (!this.ai) {
      console.warn("Gemini AI client not initialized or API key missing. Returning placeholder insight.");
      return "Gemini insights are currently unavailable. Please ensure API key is configured.";
    }

    if (this.apiKey === 'MOCK_API_KEY_FRONTEND_ONLY') {
        // Simulate a delay and return a mock response if using the mock key
        await new Promise(resolve => setTimeout(resolve, 750));
        return `(Mock Insight) Considering "${prompt.substring(0,50)}...", this suggests an interesting scenario. Further analysis would provide deeper understanding.`;
    }
    
    try {
      const response: GenerateContentResponse = await this.ai.models.generateContent({
        model: GEMINI_MODEL_TEXT,
        contents: prompt,
      });
      
      // According to guidelines, directly access .text
      const text = response.text;
      if (typeof text === 'string') {
        return text;
      }
      // Fallback if text is not directly available as expected, though guidelines say it should be.
      console.warn("Gemini response.text was not a string:", response);
      return "Received an unexpected response format from Gemini.";

    } catch (error) {
      console.error("Error generating content with Gemini:", error);
      // Check for specific error types if needed, e.g., API key issues
      if (error instanceof Error && error.message.includes("API key not valid")) {
        return "Gemini API key is not valid. Please check your configuration.";
      }
      return "An error occurred while fetching insights from Gemini.";
    }
  }
}
