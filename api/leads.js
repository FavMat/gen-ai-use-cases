import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

const rateMap = new Map();
const WINDOW_MS = 60 * 1000;
const MAX_PER_WINDOW = 3;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function rateLimit(ip) {
  const now = Date.now();
  const bucket = (rateMap.get(ip) || []).filter(t => now - t < WINDOW_MS);
  bucket.push(now);
  rateMap.set(ip, bucket);
  return bucket.length <= MAX_PER_WINDOW;
}

function clean(v, max) {
  if (typeof v !== 'string') return '';
  return v.trim().slice(0, max);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown';
  if (!rateLimit(ip)) {
    return res.status(429).json({ error: 'Too many requests. Please try again later.' });
  }

  const body = req.body || {};
  const first_name = clean(body.first_name, 80);
  const last_name = clean(body.last_name, 80);
  const company = clean(body.company, 120);
  const email = clean(body.email, 254).toLowerCase();
  const interest = clean(body.interest, 80);
  const use_case_context = clean(body.use_case_context, 200);

  if (!first_name || !last_name || !email) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }
  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'Invalid email.' });
  }

  try {
    const { error } = await supabase
      .from('leads')
      .insert([{ first_name, last_name, company, email, interest, use_case_context }]);
    if (error) {
      console.error('Supabase insert error:', error.message);
      return res.status(500).json({ error: 'Could not save lead.' });
    }
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Leads handler error:', err.message);
    return res.status(500).json({ error: 'Server error.' });
  }
}
