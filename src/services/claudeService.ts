import axios from 'axios';

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;

interface ClaudeResponse {
  content: string;
}

async function callClaude(prompt: string): Promise<ClaudeResponse> {
  try {
    const response = await axios.post(
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

    return response.data.content[0];
  } catch (error) {
    console.error('Error calling Claude API:', error);
    throw new Error('Failed to generate content with Claude');
  }
}

export async function generateHoroscope(zodiacSign: string, date: string, type: 'daily' | 'weekly' | 'monthly'): Promise<string> {
  const prompt = `Generate a ${type} horoscope for ${zodiacSign} starting from ${date}. 
  The horoscope should be positive, inspirational, and around ${type === 'daily' ? '100' : type === 'weekly' ? '200' : '300'} words long. 
  Include advice for love, career, and personal growth.`;

  const response = await callClaude(prompt);
  return response.content;
}

export async function generateMotivationalQuote(zodiacSign: string): Promise<string> {
  const prompt = `Generate a short, inspiring motivational quote (around 20 words) for someone with the zodiac sign ${zodiacSign}. 
  The quote should be uplifting and relate to the general characteristics of the sign.`;

  const response = await callClaude(prompt);
  return response.content;
}