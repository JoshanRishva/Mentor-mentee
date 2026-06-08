const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

async function generateJSON(prompt) {
  const result = await model.generateContent(prompt);
  const text   = result.response.text();

  // strip markdown code fences if present
  const clean = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

  try {
    return JSON.parse(clean);
  } catch (e) {
    throw new Error("Gemini returned invalid JSON: " + clean.slice(0, 200));
  }
}

module.exports = { generateJSON };