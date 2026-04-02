export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const TOKEN  = process.env.RUNRUNIT_TOKEN;
  const APPKEY = process.env.RUNRUNIT_APPKEY;
  const clientId = req.query.client_id || '';
  const headers = { 'App-Key': APPKEY, 'User-Token': TOKEN, 'Content-Type': 'application/json' };
  const base = 'https://runrun.it/api/v1.0/tasks?limit=200&is_subtask=false&sort_by=updated_at&sort_order=desc';
  const suffix = clientId ? '&client_id=' + clientId : '';

  try {
    const [r1, r2] = await Promise.all([
      fetch(base + suffix, { headers }),
      fetch(base + '&is_closed=true' + suffix, { headers }),
    ]);
    const d1 = r1.ok ? await r1.json() : [];
    const d2 = r2.ok ? await r2.json() : [];
    const open   = Array.isArray(d1) ? d1 : (d1.tasks || d1.data || []);
    const closed = Array.isArray(d2) ? d2 : (d2.tasks || d2.data || []);
    closed.forEach(t => { if (!t.state || t.state === 'queued') t.state = 'done'; });
    return res.status(200).json([...open, ...closed]);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
