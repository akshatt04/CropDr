const express = require('express');
const crypto = require('crypto');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { stmts } = require('../database/db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_PROMPT = `You are CropDr. AI, a helpful agricultural assistant for Indian farmers. You know about crop diseases, organic and chemical treatments, fertilizers, Indian government schemes (PM-KISAN, PMFBY etc.), and regional weather effects. Be concise, practical, and use emojis. Recommend organic options first.`;

// POST /api/chat
router.post('/', authMiddleware, async (req, res) => {
  try {
    let { message, history = [], language = 'English', sessionId } = req.body;
    if (!sessionId) sessionId = crypto.randomUUID();
    if (!message?.trim()) return res.status(400).json({ error: 'Message is required.' });
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE')
      return res.status(500).json({ error: 'Gemini API key not configured.' });

    // Filter history so it only includes prior messages and begins with user
    let filteredHistory = [...history];
    if (filteredHistory.length > 0 && filteredHistory[filteredHistory.length - 1].content === message.trim()) {
      filteredHistory.pop();
    }
    while (filteredHistory.length > 0 && filteredHistory[0].role !== 'user') {
      filteredHistory.shift();
    }

    const geminiHistory = filteredHistory.slice(-10).map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    const dynamicPrompt = `${SYSTEM_PROMPT}\n\nCRITICAL INSTRUCTION: You MUST respond in the EXACT same language that the user used in their latest message. If they write in English, reply entirely in English. If they write in Hindi or Marathi, reply in that respective language. (The user's UI is set to ${language}, so if you are unsure, default to ${language}).`;

    const fallbackModels = ['gemini-flash-lite-latest', 'gemini-3.5-flash-lite', 'gemini-3.5-flash', 'gemini-3.6-flash'];
    let reply = null;
    let lastError = null;

    for (const modelName of fallbackModels) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName, systemInstruction: dynamicPrompt });
        const chat = model.startChat({ history: geminiHistory });
        const result = await chat.sendMessage(message.trim());
        reply = result.response.text();
        break; // Success
      } catch (err) {
        lastError = err;
        console.warn(`Model ${modelName} failed in chat, trying next...:`, err.message);
      }
    }

    if (!reply) {
      throw lastError || new Error('All AI models failed due to high demand. Please try again later.');
    }

    await stmts.saveChatMsg(req.user.userId, sessionId, 'user', message.trim());
    await stmts.saveChatMsg(req.user.userId, sessionId, 'assistant', reply);

    res.json({ reply, sessionId });
  } catch (err) {
    console.error('Chat error:', err);
    if (err.status === 429) return res.status(429).json({ error: '⚠️ Rate limit reached. Please wait.' });
    res.status(500).json({ error: '⚠️ Chat failed: ' + err.message });
  }
});

// GET /api/chat/sessions
router.get('/sessions', authMiddleware, async (req, res) => {
  try {
    const sessions = await stmts.getChatSessions(req.user.userId);
    res.json({ sessions });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load chat sessions.' });
  }
});

// GET /api/chat/history/:sessionId
router.get('/history/:sessionId', authMiddleware, async (req, res) => {
  try {
    const messages = (await stmts.getChatHistory(req.user.userId, req.params.sessionId)).reverse();
    res.json({ messages });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load chat history.' });
  }
});

// DELETE /api/chat/history/:sessionId
router.delete('/history/:sessionId', authMiddleware, async (req, res) => {
  try {
    await stmts.deleteChatSession(req.user.userId, req.params.sessionId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete chat session.' });
  }
});

module.exports = router;
