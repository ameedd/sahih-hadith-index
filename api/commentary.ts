import { GoogleGenAI } from '@google/genai';
import type { Request, Response } from 'express';
import { safeParseCommentaryJSON, generateClassicalCommentaryFallback } from '../src/utils/commentaryFallback';

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
        contents: prompt,
        config: { responseMimeType: "application/json" }
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
      console.warn(`[Vercel API] Model ${model} commentary returned error, falling back:`, msg.slice(0, 150));
      lastError = err;
    }
  }

  if (isCreditsDepleted) {
    const err = new Error("Prepayment credits depleted");
    (err as any).code = 402;
    throw err;
  }

  throw lastError || new Error("Failed to generate commentary with available Gemini models");
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

  const { hadith, scholars, model, apiKey } = req.body || {};
  if (!hadith || !scholars) {
    return res.status(400).json({ error: "Missing hadith or scholars parameters" });
  }

  try {
    const ai = getGeminiClient(apiKey);
    const promptText = `You are an expert scholar of Hadith sciences.
Hadith:
Book: ${hadith.book}
Number: ${hadith.num}
Chapter: ${hadith.chapter}
Arabic Text: ${hadith.ar || hadith.arFull}

Required Commentators:
${scholars.join("; ")}

For each scholar above, give:
"text": ONE short English line summarizing their core understanding.
"full": A 2-4 sentence English explanation from their original sharh.
CRITICAL RULE: If you are unsure or do not know the authentic commentary, write "UNVERIFIED" for text and full. Never invent quotes.
Return ONLY a valid JSON array of 3 objects: [{"scholar":"","text":"","full":""}].`;

    const result = await generateWithFallback(ai, promptText, model);
    const parsed = safeParseCommentaryJSON(result.text, scholars);

    return res.status(200).json({ commentary: parsed, modelUsed: result.modelUsed, isFallback: false });
  } catch (err: any) {
    const isDepleted = err?.code === 402 || (err?.message && String(err.message).includes('depleted'));
    const fallbackCommentary = generateClassicalCommentaryFallback(hadith, scholars);
    return res.status(200).json({
      commentary: fallbackCommentary,
      modelUsed: 'classical-sharh-database',
      isFallback: true,
      isCreditsDepleted: isDepleted,
      warning: isDepleted ? "Gemini prepayment credits depleted. Retrieved authentic commentary from classical database." : undefined
    });
  }
}
