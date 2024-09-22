import fs from 'fs/promises';
import path from 'path';
import logger from './logger';

const USAGE_FILE = path.join(__dirname, '..', '..', 'api_usage.json');

interface DailyUsage {
  date: string;
  count: number;
}

async function readUsage(): Promise<DailyUsage[]> {
  try {
    const data = await fs.readFile(USAGE_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      // File doesn't exist, return an empty array
      return [];
    }
    // For other errors, log and rethrow
    logger.error('Error reading usage file:', error);
    throw error;
  }
}

async function writeUsage(usage: DailyUsage[]): Promise<void> {
  try {
    await fs.writeFile(USAGE_FILE, JSON.stringify(usage, null, 2));
  } catch (error) {
    logger.error('Error writing usage file:', error);
    throw error;
  }
}

export async function trackApiUsage(): Promise<void> {
  try {
    const usage = await readUsage();
    const today = new Date().toISOString().split('T')[0];
    const todayUsage = usage.find(u => u.date === today);

    if (todayUsage) {
      todayUsage.count++;
    } else {
      usage.push({ date: today, count: 1 });
    }

    await writeUsage(usage);
    logger.info(`API usage for ${today}: ${todayUsage ? todayUsage.count : 1}`);
  } catch (error) {
    logger.error('Error tracking API usage:', error);
    // Don't throw here, as we don't want to interrupt the main application flow
    // if usage tracking fails
  }
}

export async function getApiUsage(): Promise<DailyUsage[]> {
  try {
    return await readUsage();
  } catch (error) {
    logger.error('Error getting API usage:', error);
    return [];
  }
}