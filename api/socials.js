const { kv } = require('@vercel/kv');
const crypto = require('crypto');

module.exports = async (req, res) => {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    const raw = await kv.get('SOCIALS:DATA');
    return res.status(200).json({ items: raw ? JSON.parse(raw) : [] });
  }

  if (req.method === 'POST') {
    const body = await readJson(req);
    const pin = String(body.pin || '');
    const hash = crypto.createHash('sha256').update(pin).digest('hex');
    if (hash !== process.env.ADMIN_PIN_HASH) return res.status(401).json({ error: 'unauthorized' });

    const items = Array.isArray(body.items) ? body.items : [];
    await kv.set('SOCIALS:DATA', JSON.stringify(items));
    return res.status(200).json({ ok: true });
  }

  res.status(405).json({ error: 'Method not allowed' });
};

function setCors(res) {
  const origin = process.env.ALLOW_ORIGIN || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'content-type,authorization');
}

async function readJson(req) {
  const chunks = [];
  for await (const ch of req) chunks.push(ch);
  const str = Buffer.concat(chunks).toString('utf8') || '{}';
  try { return JSON.parse(str); } catch { return {}; }
}
