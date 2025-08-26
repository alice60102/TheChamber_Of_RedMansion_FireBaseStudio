
/**
 * @fileOverview Core AI configuration for the Red Mansion learning platform.
 * 
 * This file sets up the GenKit framework with Google's Gemini 2.0 Flash model
 * to power all AI-driven features throughout the application including:
 * - Text analysis and explanations for classical Chinese literature
 * - Character relationship mapping and insights
 * - Learning progress analysis and personalized recommendations
 * - Writing assistance for literary analysis
 * - Google Search Grounding for accurate and cited responses
 */

// Import the core GenKit framework for AI functionality
import { genkit } from 'genkit';
// Import Google AI plugin to access Gemini models
import { googleAI } from '@genkit-ai/googleai';

// NOTE: keep API keys and credentials in server-side environment variables
// This file is intended to be executed server-side only. Do NOT import this
// module into client-side code to avoid leaking credentials.

// Build plugin options from environment variables. The plugin may accept
// different credential shapes; here we set `apiKey` if present. If you prefer
// to use a service account JSON file, set GOOGLE_APPLICATION_CREDENTIALS
// accordingly and adapt the plugin options per @genkit-ai/googleai docs.
const googlePluginOptions: Record<string, any> = {};
if (process.env.GEMINI_API_KEY) {
  googlePluginOptions.apiKey = process.env.GEMINI_API_KEY;
}

/**
 * Enhanced GenKit configuration with Google AI support
 * 
 * This configuration enables:
 * - Gemini 2.0 Flash model for Chinese literature processing
 * - Google AI integration for accurate responses
 * - Support for grounding capabilities through model features
 */
export const ai = genkit({
  plugins: [googleAI(googlePluginOptions)], // Enable Google AI services integration
  model: 'googleai/gemini-2.0-flash', // Use Gemini 2.0 Flash for Chinese literature processing
});

/**
 * Configuration constants for grounded responses
 * 接地回應的配置常數
 */
export const GROUNDING_CONFIG = {
  DEFAULT_MAX_SEARCH_RESULTS: 10,
  DEFAULT_TEMPERATURE: 0.7,
  DEFAULT_MAX_OUTPUT_TOKENS: 2048,
  RESPONSE_TIMEOUT_SECONDS: 30,
  ENABLE_CITATION_PARSING: true,
} as const;

/**
 * Enhanced generation configuration with grounding support
 * 支援接地功能的增強生成配置
 */
export const createGroundedGenerationConfig = (options?: {
  temperature?: number;
  maxOutputTokens?: number;
  enableGrounding?: boolean;
}) => {
  const config = {
    temperature: options?.temperature ?? GROUNDING_CONFIG.DEFAULT_TEMPERATURE,
    maxOutputTokens: options?.maxOutputTokens ?? GROUNDING_CONFIG.DEFAULT_MAX_OUTPUT_TOKENS,
  };

  return config;
};
