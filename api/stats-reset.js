export default async function handler(req, res) {
  const KV_REST_API_URL = "https://eager-eft-54703.upstash.io";
  const KV_REST_API_TOKEN = "AdWvAAIjcDE1YzY4Y2EyZDJmNmM0YmUxOWJjMDdhNTVjODkxMzk0MnAxMA";

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const socialsResponse = await fetch(`${KV_REST_API_URL}/get/socials`, {
    headers: { Authorization: `Bearer ${KV_REST_API_TOKEN}` }
  });
  const socialsData = await socialsResponse.json();
  const socials = socialsData.result ? JSON.parse(socialsData.result).items : [];

  for (const social of socials) {
    const key = `clicks:${social.label}`;
    await fetch(`${KV_REST_API_URL}/del/${key}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${KV_REST_API_TOKEN}` }
    });
  }

  res.status(200).json({ ok: true, message: "Statystyki wyzerowane" });
}
