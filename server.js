import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
// serve static files (index.html, main.js, css/, etc.)
app.use(express.static(__dirname));

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn("Warning: GEMINI_API_KEY is not set. /api/generate will return an error.");
}

const ai = new GoogleGenAI({ apiKey });

app.post("/api/generate", async (req, res) => {
  const prompt = req.body?.prompt;
  if (!prompt) {
    return res.status(400).json({ error: "プロンプトが指定されていません。" });
  }
  if (!apiKey) {
    return res.status(500).json({ error: "GEMINI_API_KEY is not configured on server." });
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });
    res.json({ text: response.text });
  } catch (err) {
    console.error("Error calling Gemini API:", err);
    res.status(500).json({ error: err.message || String(err) });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
