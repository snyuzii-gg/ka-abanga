const { kv } = require('@vercel/kv');

module.exports = async (req, res) => {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const body = await readJson(req);
  const key = String(body.key || '').trim();
  if (!key) return res.status(400).json({ error: 'missing key' });

  try {
    const total = await kv.incr('STATS:TOTAL');
    const cat = await kv.incr(`CAT:${key}`);
    return res.status(200).json({ ok: true, total, category: { key, count: cat } });
  } catch (e) {
    return res.status(500).json({ error: 'kv error' });
  }
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
