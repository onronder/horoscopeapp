import axios from 'axios';
import dotenv from 'dotenv';
import logger from '../utils/logger';

dotenv.config();

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const CLAUDE_API_KEY = 'y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'

interface ClaudeResponse {
  content: Array<{ text: string }>;
}

async function callClaude(prompt: string): Promise<string> {
  try {
    const response = await axios.post<ClaudeResponse>(
      CLAUDE_API_URL,
      {
        model: 'claude-3-sonnet-20240229',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': CLAUDE_API_KEY,
          'anthropic-version': '2023-06-01'
        }
      }
    );

    return response.data.content[0].text;
  } catch (error) {
    logger.error('Error calling Claude API:', error);
    throw new Error('Failed to generate content with Claude');
  }
}

export async function generateHoroscope(zodiacSign: string, type: 'daily' | 'weekly' | 'monthly'): Promise<string> {
  const prompt = `Generate a ${type} horoscope for ${zodiacSign}. 
  The horoscope should be positive, inspirational, and around ${type === 'daily' ? '100' : type === 'weekly' ? '200' : '300'} words long. 
  Include advice for love, career, and personal growth.`;

  return await callClaude(prompt);
}