require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json());

const GROQ_API = 'https://api.groq.com/openai/v1/chat/completions';

// Modèles autorisés (whitelist)
const ALLOWED_MODELS = [
  'llama-3.3-70b-versatile',
  'llama-3.1-8b-instant',
  'mixtral-8x7b-32768',
  'gemma2-9b-it',
];

app.post('/api/chat', async (req, res) => {
  const { messages, systemPrompt, model } = req.body;

  // Utilise le modèle envoyé ou le défaut
  const selectedModel = ALLOWED_MODELS.includes(model)
    ? model
    : 'llama-3.3-70b-versatile';

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    const groqRes = await fetch(GROQ_API, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: [
          { role: 'system', content: systemPrompt || 'Tu es Iris, une assistante IA utile.' },
          ...messages,
        ],
        stream: true,
        max_tokens: 4096,
        temperature: 0.7,
      }),
    });

    if (!groqRes.ok) {
      const err = await groqRes.text();
      console.error('Groq error:', err);
      res.write(`data: ${JSON.stringify({ choices: [{ delta: { content: 'Erreur API Groq. Vérifiez votre clé dans .env' } }] })}\n\n`);
      res.write('data: [DONE]\n\n');
      return res.end();
    }

    groqRes.body.on('data', chunk => res.write(chunk));
    groqRes.body.on('end', () => { res.write('data: [DONE]\n\n'); res.end(); });
    groqRes.body.on('error', () => res.end());
  } catch (err) {
    console.error('Server error:', err);
    res.write(`data: ${JSON.stringify({ choices: [{ delta: { content: 'Erreur interne du serveur.' } }] })}\n\n`);
    res.write('data: [DONE]\n\n');
    res.end();
  }
});

app.get('/api/health', (req, res) => res.json({ status: 'ok', version: '5.0' }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Iris AI backend v5 — port ${PORT}`));
