/**
 * Vercel Serverless Function — /api/analyse
 *
 * Replaces server.js. Vercel auto-discovers this file and serves it at /api/analyse.
 * - No dotenv needed: Vercel injects GEMINI_API_KEY from the project dashboard.
 * - No express/cors needed: Vercel handles HTTP + JSON body parsing natively.
 * - ESM export is used because package.json has "type": "module".
 */

export default async function handler(req, res) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Guard: ensure the API key is configured
  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({
      error: 'Server misconfiguration: GEMINI_API_KEY is not set.',
    });
  }

  try {
    // Vercel automatically parses JSON bodies when Content-Type is application/json
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
          generationConfig: {
            temperature: 0.1,
          },
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

    res.status(200).json(result);
  } catch (error) {
    console.error('Serverless function error:', error);
    res.status(500).json({ error: error.message });
  }
}
