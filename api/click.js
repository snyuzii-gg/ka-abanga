export default async function handler(req, res) {
  const KV_REST_API_URL = "https://eager-eft-54703.upstash.io";
  const KV_REST_API_TOKEN = "AdWvAAIjcDE1YzY4Y2EyZDJmNmM0YmUxOWJjMDdhNTVjODkxMzk0MnAxMA";

  const { social } = req.query;
  const key = `clicks:${social}`;

  const response = await fetch(`${KV_REST_API_URL}/incr/${key}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${KV_REST_API_TOKEN}` }
  });

  const data = await response.json();
  res.status(200).json({ ok: true, count: data.result });
}
