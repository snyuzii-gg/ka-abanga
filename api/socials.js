// /api/socials.js
export default async function handler(req, res) {
  const URL = process.env.KV_REST_API_URL;
  const TOKEN = process.env.KV_REST_API_TOKEN; // pełny token (nie read-only)
  const ADMIN = process.env.ADMIN_PIN_HASH;
  const KEY = 'socials_v1';

  if (!URL || !TOKEN) {
    return res.status(500).json({ ok: false, error: 'KV env missing' });
  }

  // helper do czytania i zawsze zwracania tablicy
  async function readItems() {
    const r = await fetch(`${URL}/get/${KEY}`, {
      headers: { Authorization: `Bearer ${TOKEN}` },
      cache: 'no-store'
    });
    const j = await r.json();
    if (!j.result) return [];
    // j.result to string przechowywany w KV -> parsujemy raz
    let parsed = j.result;
    try { parsed = JSON.parse(j.result); } catch {}
    // jeśli parsed też jest stringiem (podwójne z-serializowanie) -> parsujemy drugi raz
    if (typeof parsed === 'string') {
      try { parsed = JSON.parse(parsed); } catch {}
    }
    return Array.isArray(parsed) ? parsed : [];
  }

  if (req.method === 'GET') {
    try {
      const items = await readItems();
      return res.status(200).json({ ok: true, items });
    } catch (e) {
      return res.status(500).json({ ok: false, error: String(e) });
    }
  }

  if (req.method === 'POST') {
    try {
      const { socials, pinHash } = req.body || {};
      if (!Array.isArray(socials)) return res.status(400).json({ ok: false, error: 'bad socials' });
      if (!ADMIN || pinHash !== ADMIN) return res.status(401).json({ ok: false, error: 'unauthorized' });

      // zapisujemy JEDEN raz zserializowaną tablicę
      const payload = JSON.stringify(socials);
      const r = await fetch(`${URL}/set/${KEY}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ value: payload })
      });
      if (!r.ok) {
        const txt = await r.text().catch(()=> '');
        throw new Error('kv set failed: ' + txt);
      }
      return res.status(200).json({ ok: true });
    } catch (e) {
      return res.status(500).json({ ok: false, error: String(e) });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end('Method Not Allowed');
}
