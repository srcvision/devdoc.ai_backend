const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
async function test() {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro-latest' });
    const result = await model.generateContent("hello");
    console.log("Success with gemini-1.5-pro-latest!");
  } catch (e) {
    console.log("Failed 1.5-pro-latest:", e.message);
    try {
      const model2 = genAI.getGenerativeModel({ model: 'gemini-pro' });
      const result2 = await model2.generateContent("hello");
      console.log("Success with gemini-pro!");
    } catch(e2) {
      console.log("Failed gemini-pro:", e2.message);
    }
  }
}
test();
