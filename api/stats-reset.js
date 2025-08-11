// api/stats-reset.js
import crypto from 'crypto';

export default async function handler(req, res) {
  const base = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  const adminPinHash = process.env.ADMIN_PIN_HASH;
  if (!base || !token || !adminPinHash) return res.status(500).json({ error: 'env missing' });

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end();
  }

  try {
    const { pin } = req.body || {};
    const pinHash = crypto.createHash('sha256').update(String(pin || '')).digest('hex');
    if (pinHash !== adminPinHash) return res.status(401).json({ error: 'unauthorized' });

    // Pobierz wszystkie klucze z licznikami
    const kr = await fetch(`${base}/keys/${encodeURIComponent('clicks:*')}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const kj = await kr.json();
    const keys = Array.isArray(kj?.result) ? kj.result : [];

    // Usuń je po kolei (Upstash REST nie ma batch DEL)
    for (const k of keys) {
      await fetch(`${base}/del/${encodeURIComponent(k)}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
    }

    // (opcjonalnie) zapisz timestamp ostatniego resetu
    await fetch(`${base}/set/stats:lastReset`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(new Date().toISOString())
    });

    return res.status(200).json({ ok: true, removed: keys.length });
  } catch (e) {
    res.status(500).json({ error: String(e?.message || e) });
  }
}
