import { useState } from 'react';
import {
  generateResumeContent,
  improveContent,
  expandContent,
  summarizeContent,
  rewriteContent,
  convertToBulletPoints,
} from '../lib/gemini';

export interface UseAIAssistantOptions {
  section: string;
  currentContent: string;
  context?: string;
}

export function useAIAssistant() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async (section: string, context: string, additionalInfo?: string): Promise<string> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await generateResumeContent(section, context, additionalInfo);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate content';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const improve = async (section: string, currentContent: string, context: string): Promise<string> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await improveContent(section, currentContent, context);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to improve content';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const expand = async (section: string, currentContent: string, context: string): Promise<string> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await expandContent(section, currentContent, context);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to expand content';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const summarize = async (currentContent: string, context: string): Promise<string> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await summarizeContent(currentContent, context);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to summarize content';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const rewrite = async (section: string, currentContent: string, context: string): Promise<string> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await rewriteContent(section, currentContent, context);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to rewrite content';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const toBullets = async (content: string, context: string): Promise<string> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await convertToBulletPoints(content, context);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to convert to bullets';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    generate,
    improve,
    expand,
    summarize,
    rewrite,
    toBullets,
    isLoading,
    error,
  };
}

export default useAIAssistant;
