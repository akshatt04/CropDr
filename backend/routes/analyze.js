const express = require('express');
const multer = require('multer');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { stmts } = require('../database/db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed.'));
  },
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// POST /api/analyze
router.post('/', authMiddleware, upload.array('images', 5), async (req, res) => {
  try {
    const files = req.files || [];
    const language = req.body.language || 'English';
    const description = req.body.description || '';

    if (files.length === 0 && !description.trim())
      return res.status(400).json({ error: 'Please upload at least one crop image or provide a description.' });

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE')
      return res.status(500).json({ error: 'Gemini API key not configured. Add it to backend/.env' });

    const imageParts = files.map(file => ({
      inlineData: { mimeType: file.mimetype, data: file.buffer.toString('base64') },
    }));

    let prompt = `You are CropDr., an expert agricultural AI for Indian farmers. `;
    if (files.length > 0 && description.trim()) {
      prompt += `Analyze these ${files.length} crop image(s) ALONG WITH the following description provided by the farmer: "${description.trim()}". `;
    } else if (files.length > 0) {
      prompt += `Analyze these ${files.length} crop image(s). `;
    } else {
      prompt += `Analyze the following description of a crop problem provided by the farmer: "${description.trim()}". `;
    }
    prompt += `Respond in ${language}.\nReturn ONLY valid JSON (no markdown, no code fences):\n{"cropType":"crop name","diseaseDetected":"disease or Healthy","confidenceScore":87,"severityLevel":"Early|Moderate|Severe|None","severityPercent":35,"affectedArea":"description","rootCause":"brief cause","immediateAction":"urgent step","summary":"2-3 sentences for farmer","treatmentPlan":[{"day":"Day 1","action":"action","type":"organic|chemical|monitoring"},{"day":"Day 3","action":"action","type":"organic"},{"day":"Day 7","action":"action","type":"monitoring"},{"day":"Day 14","action":"action","type":"monitoring"}],"organicTreatments":["t1","t2"],"chemicalTreatments":["t1 with dosage","t2"],"availablePesticides":["India pesticide 1","pesticide 2"],"fertilizers":["f1","f2"],"prevention":["p1","p2","p3"],"spreadRisk":"Low|Moderate|High","recoveryChance":78}`;

    let responseText = null;
    const fallbackModels = ['gemini-flash-lite-latest', 'gemini-3.5-flash-lite', 'gemini-3.5-flash', 'gemini-3.6-flash'];
    let lastError = null;

    for (const modelName of fallbackModels) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: { responseMimeType: 'application/json' },
        });
        const result = await model.generateContent([prompt, ...imageParts]);
        responseText = result.response.text();
        break;
      } catch (err) {
        lastError = err;
        console.warn(`Model ${modelName} failed, trying next...:`, err.message);
      }
    }

    if (!responseText) {
      throw lastError || new Error('All AI models failed due to high demand. Please try again in a few minutes.');
    }

    const clean = responseText.replace(/```json\s*/gi, '').replace(/```/g, '').trim();
    let analysisResult;
    try {
      analysisResult = JSON.parse(clean);
    } catch {
      const jsonMatch = clean.match(/\{[\s\S]*\}/);
      if (jsonMatch) analysisResult = JSON.parse(jsonMatch[0]);
      else throw new Error('Could not parse AI response as JSON');
    }

    const scanResult = await stmts.createScan({
      userId: req.user.userId,
      cropType: analysisResult.cropType || 'Unknown',
      diseaseDetected: analysisResult.diseaseDetected || 'Unknown',
      confidenceScore: analysisResult.confidenceScore || 0,
      severityLevel: analysisResult.severityLevel || 'None',
      severityPercent: analysisResult.severityPercent || 0,
      spreadRisk: analysisResult.spreadRisk || 'Low',
      recoveryChance: analysisResult.recoveryChance || 0,
      language,
      imageCount: files.length,
      resultJson: JSON.stringify(analysisResult),
    });

    analysisResult.scanId = scanResult.lastID;
    res.json(analysisResult);
  } catch (err) {
    console.error('Analysis error:', err);
    if (err.status === 429) return res.status(429).json({ error: '⚠️ API rate limit reached. Please wait and try again.' });
    res.status(500).json({ error: '⚠️ Analysis failed: ' + err.message });
  }
});

module.exports = router;
