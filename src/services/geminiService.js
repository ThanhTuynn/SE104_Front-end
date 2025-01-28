import { GoogleGenerativeAI } from "@google/generative-ai";

const SYSTEM_PROMPT = `Bạn trợ lý hỗ trợ người dùng trong việc chọn trang sức. Bạn đang làm việc trong cửa hàng bán trang sức. Hãy trả lời:
- Ngắn gọn, chính xác
- Lịch sự, thân thiện
- Bằng tiếng Việt
- Khi chào thì hãy giới thiệu mình là chatbot hỗ trợ khách hàng chọn trang sức và các dịch vụ của cửa hàng
- Tập trung vào chủ đề được hỏi
- không giải đáp các thắc mắc hay các câu hỏi không liên quan đến cửa hàng trang sức
- Nếu không chắc chắn, hãy nói "Tôi không chắc chắn về điều này"`;

class GeminiService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  async sendMessage(message) {
    try {
      // Combine system prompt with user message
      const fullMessage = `${SYSTEM_PROMPT}\n\nUser: ${message}`;
      const result = await this.model.generateContent(fullMessage);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error("Gemini API error:", error);
      throw error;
    }
  }
}

export default new GeminiService();