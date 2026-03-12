import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Test if Gemini API key is valid and working
 */
export async function testGeminiAPI(): Promise<{
  success: boolean;
  message: string;
  details?: any;
}> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  // Check if API key exists
  if (!apiKey || apiKey === 'your_gemini_api_key_here' || apiKey.trim() === '') {
    return {
      success: false,
      message: '❌ Gemini API key not configured',
      details: {
        error: 'NO_API_KEY',
        help: 'Please add your Gemini API key to the .env file',
        steps: [
          '1. Get free API key from: https://makersuite.google.com/app/apikey',
          '2. Open .env file',
          '3. Replace "your_gemini_api_key_here" with your actual key',
          '4. Save and refresh the browser'
        ]
      }
    };
  }

  // Check if API key format looks valid
  if (!apiKey.startsWith('AIza')) {
    return {
      success: false,
      message: '❌ Invalid API key format',
      details: {
        error: 'INVALID_FORMAT',
        help: 'Gemini API keys should start with "AIza"',
        yourKey: `${apiKey.substring(0, 10)}...`
      }
    };
  }

  // Test API connection with fallback
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const models = ['gemini-2.5-flash-lite', 'gemini-2.5-flash'];
    let lastError: any;
    
    // Try each model
    for (const modelName of models) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });

        // Simple test prompt
        const result = await model.generateContent('Say "Hello!" in one word.');
        const response = await result.response;
        const text = response.text();

        return {
          success: true,
          message: `✅ Gemini API is working! (using ${modelName})`,
          details: {
            apiKey: `${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 4)}`,
            modelUsed: modelName,
            testResponse: text,
            status: 'ACTIVE'
          }
        };
      } catch (error: any) {
        lastError = error;
        const errorStr = error.toString();
        
        // If rate limited, try next model
        if (errorStr.includes('429') || errorStr.includes('quota') || errorStr.includes('QUOTA_EXCEEDED')) {
          console.warn(`Rate limit on ${modelName}, trying next model...`);
          continue;
        }
        
        // For other errors, break and handle below
        break;
      }
    }
    
    // If we get here, all models failed or had an error
    throw  lastError || new Error('All models exhausted');
  } catch (error: any) {
    let errorMessage = 'Unknown error';
    let errorType = 'UNKNOWN';
    let help = '';

    if (error.message) {
      errorMessage = error.message;

      if (errorMessage.includes('API_KEY_INVALID') || errorMessage.includes('invalid API key')) {
        errorType = 'INVALID_KEY';
        help = 'Your API key is invalid. Please check: https://makersuite.google.com/app/apikey';
      } else if (errorMessage.includes('PERMISSION_DENIED')) {
        errorType = 'PERMISSION_DENIED';
        help = 'API key does not have permission. Make sure you created it for Gemini API.';
      } else if (errorMessage.includes('QUOTA_EXCEEDED')) {
        errorType = 'QUOTA_EXCEEDED';
        help = 'You have exceeded your API quota. Try again later or upgrade your plan.';
      } else if (errorMessage.includes('Network')) {
        errorType = 'NETWORK_ERROR';
        help = 'Network error. Check your internet connection.';
      }
    }

    return {
      success: false,
      message: `❌ Gemini API test failed`,
      details: {
        error: errorType,
        message: errorMessage,
        help: help || 'Please check your API key and try again',
        apiKey: `${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 4)}`
      }
    };
  }
}

/**
 * Get API key status without testing connection
 */
export function getAPIKeyStatus(): {
  configured: boolean;
  message: string;
} {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey || apiKey === 'your_gemini_api_key_here' || apiKey.trim() === '') {
    return {
      configured: false,
      message: 'API key not configured'
    };
  }

  if (!apiKey.startsWith('AIza')) {
    return {
      configured: false,
      message: 'Invalid API key format'
    };
  }

  return {
    configured: true,
    message: 'API key configured'
  };
}
