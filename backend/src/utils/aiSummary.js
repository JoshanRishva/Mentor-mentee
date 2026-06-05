const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

async function generateProjectSummary({ title, description, requiredSkills }) {
  const skillsList =
    Array.isArray(requiredSkills) && requiredSkills.length > 0
      ? requiredSkills.join(", ")
      : "Not specified";

  const prompt = `You are a technical project summarizer for a mentor-matching platform.

Given the following project details, write a concise professional project summary (3-5 sentences) that:
- States what the project is and what it aims to achieve
- Highlights the core technical stack and domain
- Makes it easy for a mentor to understand what expertise is needed
- Plain paragraph prose only — no bullet points, no headers

Project Title: ${title}
Project Description: ${description}
Required Skills: ${skillsList}

Write only the summary paragraph. No preamble, no labels, no extra formatting.`;

  const result = await model.generateContent(prompt);
  const summary = result.response.text().trim();

  if (!summary) throw new Error("Gemini returned an empty summary.");

  return summary;
}

module.exports = { generateProjectSummary };