import axios from 'axios';
import dotenv from 'dotenv';
import logger from '../utils/logger';
import { trackApiUsage } from '../utils/usageTracker';

dotenv.config();

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/completions';
const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
const MAX_RETRIES = 3;

interface ClaudeResponse {
  content: Array<{ text: string }>;
}

async function callClaudeWithRetry(prompt: string, retries = 0): Promise<string> {
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

    // Check for rate limiting
    if (response.headers['x-ratelimit-remaining']) {
      logger.info(`API calls remaining: ${response.headers['x-ratelimit-remaining']}`);
    }

    // Track API usage
    await trackApiUsage();

    return response.data.content[0].text;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      if (error.response.status === 429 && retries < MAX_RETRIES) {
        // Rate limited, wait and retry
        const waitTime = parseInt(error.response.headers['retry-after'] || '5', 10) * 1000;
        logger.warn(`Rate limited. Retrying after ${waitTime}ms`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        return callClaudeWithRetry(prompt, retries + 1);
      }
      logger.error(`Claude API error: ${error.response.status} - ${error.response.data}`);
    } else {
      logger.error('Unexpected error calling Claude API:', error);
    }
    throw new Error('Failed to generate content with Claude');
  }
}

export async function generateHoroscope(zodiacSign: string, type: 'daily' | 'weekly' | 'monthly'): Promise<string> {
  try {
    const response = await axios.post(
      CLAUDE_API_URL,
      {
        model: 'claude-v1',
        prompt: `Generate a ${type} horoscope for ${zodiacSign}.`,
        max_tokens_to_sample: 300,
        temperature: 0.7,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': CLAUDE_API_KEY,
        },
      }
    );

    return response.data.completion;
  } catch (error) {
    console.error('Error generating horoscope:', error);
    throw new Error('Failed to generate horoscope');
  }
}

export async function generateMotivationalQuote(zodiacSign: string): Promise<string> {
  const prompt = `Generate a short, inspiring motivational quote (around 20 words) for someone with the zodiac sign ${zodiacSign}. 
  The quote should be uplifting and relate to the general characteristics of the sign.`;

  try {
    const quote = await callClaudeWithRetry(prompt);
    logger.info(`Generated motivational quote for ${zodiacSign}`);
    return quote;
  } catch (error) {
    logger.error(`Failed to generate motivational quote for ${zodiacSign}:`, error);
    throw error;
  }
}