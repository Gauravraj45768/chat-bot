require('dotenv').config();
const express = require('express');
const WebSocket = require('ws');
const path = require('path');
const OpenAI = require('openai');

const app = express();
const PORT = 3000;

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Start HTTP server
const server = app.listen(PORT, () => {
  console.log(`🌐 Server running at http://localhost:${PORT}`);
});

// Setup WebSocket server
const wss = new WebSocket.Server({ server });

// Configure OpenRouter client
const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    'HTTP-Referer': 'http://localhost:3000',
    'X-Title': 'ChatbotWebSocket',
  },
});

wss.on('connection', (ws) => {
  console.log('🟢 Client connected');

  ws.on('message', async (message) => {
    const userMessage = message.toString();
    console.log('👤 User:', userMessage);

    try {
      const completion = await openai.chat.completions.create({
        model: 'openai/gpt-4o',
        max_tokens: 500,        // ✅ Limit to avoid 402 errors
        temperature: 0.7,       // Optional: controls creativity
        messages: [
          {
            role: 'user',
            content: userMessage,
          },
        ],
      });

      const botReply = completion.choices[0].message.content.trim();
      console.log('🤖 Bot:', botReply);
      ws.send(botReply);
    } catch (err) {
      console.error('❌ OpenRouter error:', err.message);
      ws.send("❌ Error: " + err.message);
    }
  });
});
