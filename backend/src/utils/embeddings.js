const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: "models/gemini-embedding-001"
});

async function generateEmbedding(text) {
  const result = await model.embedContent({
    content: {
      parts: [{ text }]
    },
    outputDimensionality: 768
  });

  return result.embedding.values;
}


module.exports = {
  generateEmbedding
};