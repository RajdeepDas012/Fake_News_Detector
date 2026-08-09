/**
 * Local development server — mirrors api/analyse.js for use with Vite proxy.
 * Only used locally via `npm run dev`. On Vercel, api/analyse.js is used instead.
 */

import express from 'express';
import cors from 'cors';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// Load .env manually for local dev
const __dirname = dirname(fileURLToPath(import.meta.url));
try {
  const envContent = readFileSync(resolve(__dirname, '.env'), 'utf-8');
  envContent.split('\n').forEach((line) => {
    const [key, ...rest] = line.split('=');
    if (key && rest.length) process.env[key.trim()] = rest.join('=').trim();
  });
} catch {
  // .env not found — env vars may already be set in the shell
}

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.post('/api/analyse', async (req, res) => {
  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: 'GEMINI_API_KEY is not set in .env' });
  }

  try {
    const { article } = req.body;

    if (!article) {
      return res.status(400).json({ error: 'No article provided' });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are a fake news detector. 
Analyse this article/headline and return ONLY raw valid JSON 
with no markdown, no backticks, no extra text:
{
  "verdict": "REAL" or "FAKE" or "MISLEADING",
  "confidence": number between 0 and 100,
  "reason": "2-3 sentence explanation",
  "redFlags": ["flag1", "flag2"]
}
Article: ${article}`,
                },
              ],
            },
          ],
          generationConfig: { temperature: 0.1 },
        }),
      }
    );

    const data = await response.json();

    if (!data.candidates || !data.candidates[0]) {
      return res.status(500).json({ error: 'Gemini API error', details: data });
    }

    const text = data.candidates[0].content.parts[0].text;
    const cleaned = text.replace(/```json|```/g, '').trim();
    const result = JSON.parse(cleaned);

    res.json(result);
  } catch (error) {
    console.error('Dev server error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`[Dev] API server running at http://localhost:${PORT}`);
});
