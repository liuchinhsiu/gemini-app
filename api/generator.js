// 這是我們的後端 Node.js 程式 (在 Vercel 伺服器上運行)
import { GoogleGenerativeAI } from "@google/generative-ai";

// 關鍵！Vercel 會讀取我們設定的「環境變數」
// 這樣我們的 API 金鑰就不會外洩
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 這是 Vercel 的標準寫法，用來處理 API 請求
export default async function handler(req, res) {
    // 我們只接受 POST 請求
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // 從前端傳來的 body 中讀取 prompt
    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
    }

    try {
        // 呼叫 Gemini AI
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        
        // 這裡可以客製化您的提示
        const fullPrompt = `
            You are a professional medical assistant. 
            Please generate a clinical note in SOAP format based on the following information:
            ---
            ${prompt}
            ---
        `;

        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        const text = response.text();
        
        // 將 AI 生成的純文字結果回傳給前端
        res.status(200).json({ text: text });

    } catch (error) {
        console.error('AI call failed:', error);
        res.status(500).json({ error: 'AI generation failed' });
    }
}