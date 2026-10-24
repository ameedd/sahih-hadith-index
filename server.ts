import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';
import searchHandler from './api/search';
import { safeParseCommentaryJSON, generateClassicalCommentaryFallback, getOfflineTranslation } from './src/utils/commentaryFallback';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);

  app.use(express.json({ limit: '10mb' }));

  // Helper to initialize the Google GenAI client
  const getGeminiClient = (customKey?: string) => {
    const key = customKey?.trim() || process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("No Gemini API key available. Please configure your API key.");
    }
    return new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  };

  // Resilient generator with automatic model fallback and graceful 402 credits depletion detection
  const generateWithFallback = async (
    ai: GoogleGenAI,
    prompt: string,
    preferredModel: string = 'gemini-3.1-flash-lite',
    isJson: boolean = false
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
          config: isJson ? { responseMimeType: "application/json" } : undefined
        });
        if (response?.text) {
          return { text: response.text.trim(), modelUsed: model, isCreditsDepleted: false };
        }
      } catch (err: any) {
        const msg = String(err?.message || err);
        if (msg.includes('prepayment credits are depleted') || msg.includes('402') || (msg.includes('RESOURCE_EXHAUSTED') && msg.includes('billing'))) {
          console.warn(`[Gemini Engine] Prepayment credits depleted on key. Gracefully switching to classical offline sharh database.`);
          isCreditsDepleted = true;
          lastError = err;
          break; // Avoid futile attempts across other models with depleted key
        }
        console.warn(`[Gemini Engine] Model ${model} returned error, trying fallback model:`, msg.slice(0, 150));
        lastError = err;
      }
    }

    if (isCreditsDepleted) {
      const err = new Error("Your prepayment credits are depleted. Switched to classical offline database.");
      (err as any).code = 402;
      (err as any).isCreditsDepleted = true;
      throw err;
    }

    throw lastError || new Error("Failed to generate content with available Gemini models");
  };

  // Health / Status check endpoint
  app.get('/api/status', (_req, res) => {
    res.json({
      status: 'ok',
      hasServerKey: !!process.env.GEMINI_API_KEY,
      defaultModel: 'gemini-3.1-flash-lite'
    });
  });

  // Universal Hadith Search across 32,000+ canonical narrations
  app.get('/api/search', searchHandler);

  // Translation route with resilient classical fallback
  app.post('/api/translate', async (req, res) => {
    const { text, hadith, model, apiKey } = req.body || {};
    if (!text && !hadith?.ar && !hadith?.arFull) {
      return res.status(400).json({ error: "No text provided for translation" });
    }

    const targetText = text || hadith?.arFull || hadith?.ar || "";

    try {
      const ai = getGeminiClient(apiKey);
      const prompt = `Translate this authentic Hadith Arabic text into accurate, fluent, dignified English:\n${targetText}\nReturn ONLY the plain English translation, with no commentary.`;
      const result = await generateWithFallback(ai, prompt, model, false);

      return res.json({ translation: result.text, modelUsed: result.modelUsed, isFallback: false });
    } catch (err: any) {
      const isDepleted = err?.code === 402 || (err?.message && String(err.message).includes('depleted'));
      const fallbackTranslation = getOfflineTranslation(hadith || { ar: targetText, arFull: targetText });
      return res.status(200).json({
        translation: fallbackTranslation,
        modelUsed: 'classical-translation-database',
        isFallback: true,
        isCreditsDepleted: isDepleted,
        warning: isDepleted ? "Gemini prepayment credits depleted. Showing verified classical English translation." : undefined
      });
    }
  });

  // Commentary route with resilient classical fallback and safe JSON parser
  app.post('/api/commentary', async (req, res) => {
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

      const result = await generateWithFallback(ai, promptText, model, true);
      const parsed = safeParseCommentaryJSON(result.text, scholars);

      return res.json({
        commentary: parsed,
        modelUsed: result.modelUsed,
        isFallback: false
      });
    } catch (err: any) {
      const isDepleted = err?.code === 402 || (err?.message && String(err.message).includes('depleted'));
      const fallbackCommentary = generateClassicalCommentaryFallback(hadith, scholars);

      return res.status(200).json({
        commentary: fallbackCommentary,
        modelUsed: 'classical-sharh-database',
        isFallback: true,
        isCreditsDepleted: isDepleted,
        warning: isDepleted
          ? "Gemini prepayment credits depleted on active key. Classical commentary loaded from offline classical knowledge base."
          : "Classical commentary loaded from verified classical sharh database."
      });
    }
  });

  // Vite integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
