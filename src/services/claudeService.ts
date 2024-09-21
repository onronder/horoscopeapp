import axios from 'axios';
import dotenv from 'dotenv';
import logger from '../utils/logger';
import { trackApiUsage } from '../utils/usageTracker';

dotenv.config();

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
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
  const prompt = `Generate a ${type} horoscope for ${zodiacSign}. 
  The horoscope should be positive, inspirational, and around ${type === 'daily' ? '100' : type === 'weekly' ? '200' : '300'} words long. 
  Include advice for love, career, and personal growth.`;

  try {
    const horoscope = await callClaudeWithRetry(prompt);
    logger.info(`Generated ${type} horoscope for ${zodiacSign}`);
    return horoscope;
  } catch (error) {
    logger.error(`Failed to generate ${type} horoscope for ${zodiacSign}:`, error);
    throw error;
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