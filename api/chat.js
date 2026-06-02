import Groq from 'groq-sdk';
import { createClient } from '@supabase/supabase-js';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

let useCasesCache = null;
let loadingPromise = null;

async function loadUseCases() {
  if (useCasesCache) return useCasesCache;
  if (loadingPromise) return loadingPromise;

  loadingPromise = (async () => {
    let all = [];
    let from = 0;
    const PAGE = 500;
    while (true) {
      const { data, error } = await supabase
        .from('use_cases')
        .select('company, industry, category, description, provider')
        .order('company')
        .range(from, from + PAGE - 1);
      if (error) {
        console.error('Failed to load use cases:', error.message);
        break;
      }
      if (!data || data.length === 0) break;
      all = all.concat(data);
      if (data.length < PAGE) break;
      from += PAGE;
    }
    useCasesCache = all;
    console.log(`Loaded ${all.length} use cases from Supabase`);
    return all;
  })();

  return loadingPromise;
}

function findRelevant(useCases, query, maxResults = 20) {
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

const rateMap = new Map();
const WINDOW_MS = 60 * 1000;
const MAX_PER_WINDOW = 15;

function rateLimit(ip) {
  const now = Date.now();
  const bucket = rateMap.get(ip) || [];
  const recent = bucket.filter(t => now - t < WINDOW_MS);
  recent.push(now);
  rateMap.set(ip, recent);
  return recent.length <= MAX_PER_WINDOW;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown';
  if (!rateLimit(ip)) {
    return res.status(429).json({ error: 'Too many requests, please try again later.' });
  }

  const { message, history = [] } = req.body || {};
  if (!message) return res.status(400).json({ error: 'No message provided' });
  if (typeof message !== 'string' || message.length > 500) {
    return res.status(400).json({ error: 'Message exceeds maximum length of 500 characters.' });
  }

  let useCases = [];
  try {
    useCases = await loadUseCases();
  } catch (err) {
    console.error('Supabase load failed:', err.message);
  }

  const relevant = findRelevant(useCases, message);

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
- Don't just list data, synthesize and provide insight`;

  try {
    const safeHistory = Array.isArray(history) ? history.slice(-6) : [];
    const messages = [
      { role: 'system', content: systemPrompt },
      ...safeHistory,
      { role: 'user', content: message }
    ];

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages,
      temperature: 0.7,
      max_tokens: 800,
    });

    const reply = completion.choices[0].message.content;
    return res.status(200).json({ reply, sourcesCount: relevant.length });
  } catch (err) {
    console.error('Groq error:', err.message);
    return res.status(500).json({ error: 'AI error: ' + err.message });
  }
}
