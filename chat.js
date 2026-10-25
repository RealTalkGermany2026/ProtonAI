module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();
  const { messages } = req.body || {};
  if (!Array.isArray(messages) || !messages.length)
    return res.status(400).json({ error: 'bad request' });
  const contents = messages.slice(-12).map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: String(m.content).slice(0, 20000) }]
  }));
  const model = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
  try {
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': process.env.GEMINI_API_KEY
        },
        body: JSON.stringify({ contents })
      }
    );
    const data = await r.json();
    const text = (data?.candidates?.[0]?.content?.parts || [])
      .map(p => p.text || '').join('');
    if (!r.ok || !text) return res.status(502).json({ error: 'AI unavailable' });
    res.status(200).json({ text });
  } catch (e) {
    res.status(502).json({ error: 'AI unavailable' });
  }
};
