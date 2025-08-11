// api/socials.js
export default async function handler(req, res) {
  const base = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  const adminPinHash = process.env.ADMIN_PIN_HASH;
  if (!base || !token || !adminPinHash) return res.status(500).json({ error: 'env missing' });

  try {
    if (req.method === 'GET') {
      const gr = await fetch(`${base}/get/socials`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const gj = await gr.json();
      return res.status(200).json({ items: gj?.result || [] });
    }

    if (req.method === 'POST') {
      const { socials, pinHash } = req.body || {};
      if (!Array.isArray(socials)) return res.status(400).json({ error: 'invalid socials' });
      if (!pinHash || pinHash !== adminPinHash) return res.status(401).json({ error: 'unauthorized' });

      const sr = await fetch(`${base}/set/socials`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(socials)
      });
      const sj = await sr.json();
      if (sj?.result !== 'OK') return res.status(500).json({ error: 'kv set failed' });

      return res.status(200).json({ ok: true });
    }

    res.setHeader('Allow', ['GET','POST']);
    res.status(405).end();
  } catch (e) {
    res.status(500).json({ error: String(e?.message || e) });
  }
}
