const { kv } = require('@vercel/kv');

module.exports = async (req, res) => {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const totalVal = await kv.get('STATS:TOTAL');
    const keys = await kv.keys('CAT:*');         // mała skala -> OK
    const byKey = {};
    if (keys.length) {
      const vals = await kv.mget(...keys);
      keys.forEach((k, i) => { byKey[k.replace('CAT:', '')] = Number(vals[i] || 0); });
    }
    const lastReset = await kv.get('STATS:RESET');
    res.status(200).json({ total: Number(totalVal || 0), byKey, lastReset: lastReset || null });
  } catch (e) {
    res.status(500).json({ error: 'kv error' });
  }
};

function setCors(res) {
  const origin = process.env.ALLOW_ORIGIN || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'content-type,authorization');
}
