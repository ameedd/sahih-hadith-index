import { GoogleGenAI } from '@google/genai';
import type { Request, Response } from 'express';
import { getOfflineTranslation } from '../src/utils/commentaryFallback';

const getGeminiClient = (customKey?: string) => {
  const key = customKey?.trim() || process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error("No Gemini API key configured. Please set GEMINI_API_KEY in your environment or provide apiKey in the request.");
  }
  return new GoogleGenAI({
    apiKey: key,
    httpOptions: {
      headers: {
        'User-Agent': 'sahih-hadith-index',
      }
    }
  });
};

const generateWithFallback = async (
  ai: GoogleGenAI,
  prompt: string,
  preferredModel: string = 'gemini-3.1-flash-lite'
) => {
  const sanitizedPreferred = (preferredModel && !preferredModel.includes('2.5-flash'))
    ? preferredModel
    : 'gemini-3.1-flash-lite';

  const modelsToTry = [
    sanitizedPreferred,
    'gemini-3.1-flash-lite',
    'gemini-3.8-flash',
    'gemini-flash-latest'
  ].filter((m, i, arr) => m && arr.indexOf(m) === i);

  let lastError: any = null;
  let isCreditsDepleted = false;

  for (const model of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt
      });
      if (response?.text) {
        return { text: response.text.trim(), modelUsed: model };
      }
    } catch (err: any) {
      const msg = String(err?.message || err);
      if (msg.includes('prepayment credits are depleted') || msg.includes('402') || (msg.includes('RESOURCE_EXHAUSTED') && msg.includes('billing'))) {
        isCreditsDepleted = true;
        lastError = err;
        break;
      }
      console.warn(`[Vercel API] Model ${model} returned error, falling back:`, msg.slice(0, 150));
      lastError = err;
    }
  }

  if (isCreditsDepleted) {
    const err = new Error("Prepayment credits depleted");
    (err as any).code = 402;
    throw err;
  }

  throw lastError || new Error("Failed to generate translation with available Gemini models");
};

export default async function handler(req: Request, res: Response) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { text, hadith, model, apiKey } = req.body || {};
  const targetText = text || hadith?.arFull || hadith?.ar || "";

  if (!targetText) {
    return res.status(400).json({ error: "No text provided for translation" });
  }

  try {
    const ai = getGeminiClient(apiKey);
    const prompt = `Translate this authentic Hadith Arabic text into accurate, fluent, dignified English:\n${targetText}\nReturn ONLY the plain English translation, with no commentary.`;
    const result = await generateWithFallback(ai, prompt, model);

    return res.status(200).json({ translation: result.text, modelUsed: result.modelUsed, isFallback: false });
  } catch (err: any) {
    const isDepleted = err?.code === 402 || (err?.message && String(err.message).includes('depleted'));
    const fallbackTranslation = getOfflineTranslation(hadith || { ar: targetText, arFull: targetText });
    return res.status(200).json({
      translation: fallbackTranslation,
      modelUsed: 'classical-translation-database',
      isFallback: true,
      isCreditsDepleted: isDepleted,
      warning: isDepleted ? "Gemini prepayment credits depleted. Provided authentic classical English translation." : undefined
    });
  }
}
