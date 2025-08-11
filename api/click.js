// api/click.js
export default async function handler(req, res) {
  const base = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!base || !token) return res.status(500).json({ error: 'KV env not set' });

  try {
    if (req.method === 'POST') {
      const { name } = req.body || {};
      const key = String(name || '').trim();
      if (!key) return res.status(400).json({ error: 'missing name' });

      // INCR clicks:<key>
      const r = await fetch(`${base}/incr/${encodeURIComponent('clicks:' + key)}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const j = await r.json();
      return res.status(200).json({ ok: true, key, count: j?.result ?? null });
    }

    if (req.method === 'GET') {
      // LIST KEYS clicks:*
      const kr = await fetch(`${base}/keys/${encodeURIComponent('clicks:*')}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const kj = await kr.json();
      const keys = Array.isArray(kj?.result) ? kj.result : [];

      const stats = {};
      for (const k of keys) {
        const vr = await fetch(`${base}/get/${encodeURIComponent(k)}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const vj = await vr.json();
        stats[k.replace(/^clicks:/, '')] = Number(vj?.result || 0);
      }
      return res.status(200).json({ byKey: stats, total: Object.values(stats).reduce((a,b)=>a+b,0) });
    }

    res.setHeader('Allow', ['GET','POST']);
    res.status(405).end();
  } catch (e) {
    res.status(500).json({ error: String(e?.message || e) });
  }
}
