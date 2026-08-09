import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
  // 1. Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
  }

  try {
    // 2. Validate environment variable
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ 
        error: 'Missing GEMINI_API_KEY. Please set it in Vercel Environment Variables.' 
      });
    }

    // 3. Extract text from request body
    const { text } = req.body || {};
    if (!text || text.trim() === '') {
      return res.status(400).json({ error: 'No text provided for analysis.' });
    }

    // 4. Initialize Gemini API
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      generationConfig: { responseMimeType: 'application/json' }
    });

    // 5. Structured prompt to get clean JSON output
    const prompt = `
      You are an expert AI Fake News Detector. Analyze the following news text carefully.
      
      News Content:
      "${text}"

      Respond strictly in JSON format matching this structure:
      {
        "verdict": "Real" | "Fake" | "Unverified",
        "confidence_score": 85,
        "summary": "Brief explanation of why it is real or fake.",
        "red_flags": ["List of potential indicators or logical fallacies found"]
      }
    `;

    // 6. Generate analysis
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const data = JSON.parse(responseText);

    // 7. Return success response
    return res.status(200).json(data);

  } catch (error) {
    console.error('Gemini API Error:', error);
    return res.status(500).json({ 
      error: 'Failed to process fake news analysis.', 
      details: error.message 
    });
  }
}