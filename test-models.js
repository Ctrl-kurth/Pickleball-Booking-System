const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
  try {
    const models = await genAI.getModels();
    console.log(models.map(m => m.name));
  } catch (e) {
    console.error("SDK might not have getModels(). Using fetch fallback.");
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
    const data = await res.json();
    console.log(data.models.map(m => m.name));
  }
}
listModels();
