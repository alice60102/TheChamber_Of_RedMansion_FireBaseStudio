
/**
 * @fileOverview Core AI configuration for the Red Mansion learning platform.
 * 
 * This file sets up the GenKit framework with Google's Gemini 2.0 Flash model
 * to power all AI-driven features throughout the application including:
 * - Text analysis and explanations for classical Chinese literature
 * - Character relationship mapping and insights
 * - Learning progress analysis and personalized recommendations
 * - Writing assistance for literary analysis
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

export const ai = genkit({
  plugins: [googleAI(googlePluginOptions)], // Enable Google AI services integration
  model: 'googleai/gemini-2.0-flash', // Use Gemini 2.0 Flash for Chinese literature processing
});
