export default async function handler(req, res) {
  const KV_REST_API_URL = "https://eager-eft-54703.upstash.io";
  const KV_REST_API_TOKEN = "AdWvAAIjcDE1YzY4Y2EyZDJmNmM0YmUxOWJjMDdhNTVjODkxMzk0MnAxMA";

  if (req.method === "GET") {
    const response = await fetch(`${KV_REST_API_URL}/get/socials`, {
      headers: { Authorization: `Bearer ${KV_REST_API_TOKEN}` }
    });
    const data = await response.json();
    res.status(200).json(data ? JSON.parse(data.result) : { items: [] });
  }

  if (req.method === "POST") {
    const body = req.body;
    await fetch(`${KV_REST_API_URL}/set/socials`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${KV_REST_API_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ value: JSON.stringify(body) })
    });
    res.status(200).json({ ok: true });
  }
}

