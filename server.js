import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import Groq from 'groq-sdk';
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const app = express();

// 1. Strict CORS for production (replace '*' with actual production frontend URL in deployment)
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'], // Add production URL here later
  methods: ['POST', 'OPTIONS'],
}));

app.use(express.json());

// 2. DDoS Protection & Rate Limiting for the Chat API
const chatLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 15, // Limit each IP to 15 requests per windowMs
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true, 
  legacyHeaders: false,
});

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

// Load all use cases from Supabase at startup
let useCases = [];
async function loadUseCases() {
  let all = [];
  let from = 0;
  const PAGE = 500;
  while (true) {
    const { data, error } = await supabase
      .from('use_cases')
      .select('company, industry, category, description, provider')
      .order('company')
      .range(from, from + PAGE - 1);
    if (error) { console.error('Failed to load use cases:', error.message); break; }
    if (!data || data.length === 0) break;
    all = all.concat(data);
    if (data.length < PAGE) break;
    from += PAGE;
  }
  
  useCases = all;
  console.log(`📚 Loaded ${useCases.length} use cases from Supabase`);
}

// Simple keyword search to find relevant use cases
function findRelevant(query, maxResults = 20) {
  const keywords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  
  const scored = useCases.map(uc => {
    const text = `${uc.company} ${uc.industry} ${uc.category} ${uc.provider} ${uc.description}`.toLowerCase();
    const score = keywords.reduce((acc, kw) => {
      if (text.includes(kw)) acc += text.split(kw).length - 1;
      return acc;
    }, 0);
    return { ...uc, score };
  });

  return scored
    .filter(uc => uc.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults);
}

app.post('/api/chat', chatLimiter, async (req, res) => {
  const { message, history = [], captchaToken } = req.body;
  if (!message) return res.status(400).json({ error: 'No message provided' });
  
  // 3. Prompt Injection Defense (Input length limitation)
  if (message.length > 500) {
    return res.status(400).json({ error: 'Message exceeds maximum length of 500 characters.' });
  }

  // 4. CAPTCHA Validation Placeholder
  // Uncomment and implement this when you get your Turnstile/reCAPTCHA secret key:
  /*
  if (!captchaToken) return res.status(403).json({ error: 'CAPTCHA token missing.' });
  const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ secret: process.env.CAPTCHA_SECRET_KEY, response: captchaToken })
  });
  const verifyData = await verifyRes.json();
  if (!verifyData.success) return res.status(403).json({ error: 'CAPTCHA verification failed.' });
  */

  // Find relevant use cases
  const relevant = findRelevant(message);
  
  const contextBlock = relevant.length > 0
    ? relevant.map(uc => `- [${uc.provider}] ${uc.company} (${uc.industry} / ${uc.category}): ${uc.description}`).join('\n')
    : 'No specific use cases found for this query — answer based on general GenAI knowledge.';

  const systemPrompt = `You are an expert AI consultant specializing in GenAI enterprise implementations. You have access to a curated database of ${useCases.length} real-world enterprise GenAI deployments across multiple providers (Google Cloud, AWS, Anthropic, Microsoft, OpenAI).

Answer the user's questions conversationally and insightfully, drawing from the relevant use cases provided. Be specific, cite company names and approaches when relevant. Keep answers concise but rich.

RELEVANT USE CASES FROM DATABASE:
${contextBlock}

Guidelines:
- Be conversational and engaging
- Cite specific companies and their approaches
- If asked for stats (how many, which industries etc.) calculate from the context
- Always answer in the same language the user uses (Italian or English)
- Don't just list data — synthesize and provide insight`;

  try {
    const messages = [
      ...history.slice(-6), // Keep last 3 turns for context
      { role: 'user', content: message }
    ];

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
      temperature: 0.7,
      max_tokens: 800,
    });

    const reply = completion.choices[0].message.content;
    res.json({ reply, sourcesCount: relevant.length });

  } catch (err) {
    console.error('Groq error:', err.message);
    res.status(500).json({ error: 'AI error: ' + err.message });
  }
});

// Start server after loading data
loadUseCases().then(() => {
  app.listen(3002, () => console.log('🤖 GenAI Chatbot server running on http://localhost:3002'));
});
