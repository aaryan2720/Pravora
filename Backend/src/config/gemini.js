const { GoogleGenerativeAI } = require('@google/generative-ai');

let geminiClient = null;

const getGeminiClient = () => {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }
  if (!geminiClient) {
    geminiClient = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return geminiClient;
};

const getGeminiModel = (modelName = 'gemini-1.5-flash') => {
  const client = getGeminiClient();
  if (!client) return null;
  return client.getGenerativeModel({ model: modelName });
};

module.exports = { getGeminiClient, getGeminiModel };
