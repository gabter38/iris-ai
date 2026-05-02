const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const GROQ_API_KEY = process.env.GROQ_API_KEY;

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  const { messages, mode } = req.body;

  const systemPrompt = mode === 'code'
    ? `Tu es Iris, une IA experte en programmation. Tu écris du code propre, commenté, et expliques chaque étape. Tu maîtrises tous les langages: Python, JavaScript, HTML/CSS, C++, Java, Bash, etc. Tu identifies les bugs rapidement et proposes des solutions optimisées.`
    : `Tu es Iris, une IA assistante intelligente, sympathique et polyvalente. Tu réponds en français par défaut sauf si on te parle dans une autre langue. Tu es directe, utile, et honnête.`;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        max_tokens: 4096,
        temperature: mode === 'code' ? 0.2 : 0.7,
        stream: true
      })
    });

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    response.body.on('data', chunk => res.write(chunk));
    response.body.on('end', () => res.end());
    response.body.on('error', err => {
      console.error(err);
      res.end();
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Image generation endpoint (using Pollinations.ai - FREE)
app.post('/api/image', async (req, res) => {
  const { prompt } = req.body;
  const encoded = encodeURIComponent(prompt);
  const seed = Math.floor(Math.random() * 999999);
  const url = `https://image.pollinations.ai/prompt/${encoded}?width=512&height=512&seed=${seed}&nologo=true`;
  res.json({ url });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Iris AI backend running on port ${PORT}`));
