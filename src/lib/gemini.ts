import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI with updated model
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

// Model fallback order: try flash-lite first (fastest, 15 RPM), then flash (10 RPM)
const MODELS = ['gemini-2.5-flash-lite', 'gemini-2.5-flash'];

export interface AIPromptOptions {
  type: 'generate' | 'improve' | 'expand' | 'summarize' | 'rewrite' | 'bulletPoints';
  context: string;
  section: string;
  currentContent?: string;
  additionalInfo?: string;
}

// System prompts for different resume sections
const SECTION_PROMPTS = {
  summary: 'You are an expert resume writer. Create professional, compelling resume content that highlights achievements and skills.',
  experience: 'You are an expert at writing professional experience descriptions. Focus on achievements, metrics, and impact.',
  education: 'You are an expert at describing educational background professionally.',
  skills: 'You are an expert at organizing and presenting technical and professional skills.',
  projects: 'You are an expert at describing technical projects with focus on technologies, challenges, and outcomes.',
  custom: 'You are an expert resume writer. Create professional, relevant content for this resume section.',
};

class GeminiService {
  /**
   * Try generating content with fallback between models
   * Tries gemini-2.5-flash-lite first, falls back to gemini-2.5-flash if rate limited
   */
  private async tryWithFallback<T>(
    operation: (model: any) => Promise<T>
  ): Promise<T> {
    if (!genAI) {
      throw new Error('Gemini API key not configured. Please add VITE_GEMINI_API_KEY to your .env file.');
    }

    let lastError: any;
    
    for (const modelName of MODELS) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        return await operation(model);
      } catch (error: any) {
        lastError = error;
        const errorStr = error.toString();
        
        // Check if it's a rate limit/quota error
        if (errorStr.includes('429') || errorStr.includes('quota') || errorStr.includes('QUOTA_EXCEEDED')) {
          console.warn(`Rate limit hit for ${modelName}, trying next model...`);
          continue; // Try next model
        }
        
        // For other errors, throw immediately
        throw error;
      }
    }
    
    // All models failed with rate limits
    console.error('All models exhausted:', lastError);
    throw new Error('All AI models are currently rate limited. Please try again in a few minutes.');
  }

  async generateContent(options: AIPromptOptions): Promise<string> {
    const prompt = this.buildPrompt(options);
    
    try {
      return await this.tryWithFallback(async (model) => {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
      });
    } catch (error) {
      console.error('Gemini API error:', error);
      throw new Error('Failed to generate content. Please try again.');
    }
  }

  private buildPrompt(options: AIPromptOptions): string {
    const sectionPrompt = SECTION_PROMPTS[options.section as keyof typeof SECTION_PROMPTS] || SECTION_PROMPTS.custom;
    
    let prompt = `${sectionPrompt}\n\n`;

    switch (options.type) {
      case 'generate':
        prompt += `Generate professional resume content for the ${options.section} section.\n`;
        prompt += `Context: ${options.context}\n`;
        if (options.additionalInfo) {
          prompt += `Additional information: ${options.additionalInfo}\n`;
        }
        prompt += `\nProvide concise, impactful content suitable for a resume. Use bullet points where appropriate.`;
        break;

      case 'improve':
        prompt += `Improve the following resume content to make it more professional, impactful, and achievement-oriented:\n\n`;
        prompt += `Current content: ${options.currentContent}\n\n`;
        prompt += `Context: ${options.context}\n`;
        prompt += `\nProvide an improved version that highlights achievements and uses strong action verbs.`;
        break;

      case 'expand':
        prompt += `Expand the following resume content with more details and achievements:\n\n`;
        prompt += `Current content: ${options.currentContent}\n\n`;
        prompt += `Context: ${options.context}\n`;
        prompt += `\nAdd relevant details, metrics, and impacts while keeping it professional and concise.`;
        break;

      case 'summarize':
        prompt += `Summarize the following content into a concise, impactful resume statement:\n\n`;
        prompt += `Content: ${options.currentContent}\n\n`;
        prompt += `Keep it brief but powerful, focusing on key achievements and skills.`;
        break;

      case 'rewrite':
        prompt += `Rewrite the following resume content with a different approach while maintaining the same information:\n\n`;
        prompt += `Current content: ${options.currentContent}\n\n`;
        prompt += `Context: ${options.context}\n`;
        prompt += `\nProvide a fresh perspective that's equally professional and impactful.`;
        break;

      case 'bulletPoints':
        prompt += `Convert the following text into professional resume bullet points:\n\n`;
        prompt += `Content: ${options.currentContent}\n\n`;
        prompt += `Format as bullet points starting with strong action verbs. Focus on achievements and quantifiable results.`;
        break;
    }

    return prompt;
  }

  async chat(message: string, conversationHistory: Array<{role: string, content: string}> = []): Promise<string> {
    try {
      // Filter and validate conversation history
      // Gemini requires first message to be from user, not model
      let validHistory = conversationHistory
        .filter(msg => msg.role && msg.content) // Remove any invalid messages
        .map(msg => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }],
        }));

      // If history starts with model message, remove it
      if (validHistory.length > 0 && validHistory[0].role === 'model') {
        validHistory = validHistory.slice(1);
      }

      // Make sure history alternates user/model (remove consecutive messages from same role)
      const alternatingHistory: any[] = [];
      let lastRole: string | null = null;
      for (const msg of validHistory) {
        if (msg.role !== lastRole) {
          alternatingHistory.push(msg);
          lastRole = msg.role;
        }
      }

      return await this.tryWithFallback(async (model) => {
        const chat = model.startChat({
          history: alternatingHistory,
          generationConfig: {
            maxOutputTokens: 1000,
            temperature: 0.7,
          },
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;
        return response.text();
      });
    } catch (error: any) {
      console.error('Gemini chat error:', error);
      
      // Provide more helpful error messages
      if (error.message?.includes('API_KEY_INVALID')) {
        throw new Error('Invalid API key. Please check your Gemini API key in .env file.');
      } else if (error.message?.includes('QUOTA_EXCEEDED') || error.message?.includes('rate limited')) {
        throw new Error('API quota exceeded. Please try again later.');
      } else {
        throw new Error('Failed to process chat message. Please try again.');
      }
    }
  }

  isConfigured(): boolean {
    return !!genAI;
  }
}

export const geminiService = new GeminiService();

// Convenience functions
export async function generateResumeContent(section: string, context: string, additionalInfo?: string): Promise<string> {
  return geminiService.generateContent({
    type: 'generate',
    section,
    context,
    additionalInfo,
  });
}

export async function improveContent(section: string, currentContent: string, context: string): Promise<string> {
  return geminiService.generateContent({
    type: 'improve',
    section,
    context,
    currentContent,
  });
}

export async function expandContent(section: string, currentContent: string, context: string): Promise<string> {
  return geminiService.generateContent({
    type: 'expand',
    section,
    context,
    currentContent,
  });
}

export async function summarizeContent(currentContent: string, context: string): Promise<string> {
  return geminiService.generateContent({
    type: 'summarize',
    section: 'custom',
    context,
    currentContent,
  });
}

export async function rewriteContent(section: string, currentContent: string, context: string): Promise<string> {
  return geminiService.generateContent({
    type: 'rewrite',
    section,
    context,
    currentContent,
  });
}

export async function convertToBulletPoints(content: string, context: string): Promise<string> {
  return geminiService.generateContent({
    type: 'bulletPoints',
    section: 'experience',
    context,
    currentContent: content,
  });
}

export async function chatWithAI(message: string, history: Array<{role: string, content: string}> = []): Promise<string> {
  return geminiService.chat(message, history);
}

export function isGeminiConfigured(): boolean {
  return geminiService.isConfigured();
}
