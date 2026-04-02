export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const TOKEN  = process.env.RUNRUNIT_TOKEN;
  const APPKEY = process.env.RUNRUNIT_APPKEY;
  const clientId = req.query.client_id || '';
  let url = 'https://runrun.it/api/v1.0/tasks?limit=500&is_subtask=true&sort_by=updated_at&sort_order=desc';
  if (clientId) url += '&client_id=' + clientId;

  try {
    const r = await fetch(url, { headers: { 'App-Key': APPKEY, 'User-Token': TOKEN, 'Content-Type': 'application/json' } });
    if (!r.ok) return res.status(r.status).json({ error: await r.text() });
    return res.status(200).json(await r.json());
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
