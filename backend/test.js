require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function test() {
const model = genAI.getGenerativeModel({ model: "models/gemini-embedding-2" });
const result = await model.embedContent("hello world");
console.log("dimensions:", result.embedding.values.length);
}

test().catch(console.error);