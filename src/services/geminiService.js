import axios from 'axios';
import { message } from 'antd';
import { getAccessToken } from '../utils/auth';
import { signIn } from './userAPI';  // Change import to match available exports
import { GoogleGenerativeAI } from "@google/generative-ai";
import React, { useState, useEffect } from 'react';
import { Input, Button, Spin } from 'antd';

const API_URL = 'http://localhost:3000/api';
const SYSTEM_PROMPT = `Bạn trợ lý hỗ trợ người dùng trong việc chọn trang sức. Bạn đang làm việc trong cửa hàng bán trang sức. Hãy trả lời:
- Ngắn gọn, chính xác
- Lịch sự, không sử dụng ngôn ngữ không phù hợp, 
- Bằng tiếng Việt
- Khi chào thì hãy giới thiệu mình là chatbot hỗ trợ khách hàng chọn trang sức và các dịch vụ của cửa hàng
- Tập trung vào chủ đề được hỏi
- bạn chỉ được phép chào khách hàng khi khách hàng đã chào trước, còn bình thường thì không được chào
- không giải đáp các thắc mắc hay các câu hỏi không liên quan đến cửa hàng trang sức
- Nếu không chắc chắn, hãy nói "Tôi không chắc chắn về điều này"`;

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  maxContentLength: 50 * 1024 * 1024, // 50MB
  maxBodyLength: 50 * 1024 * 1024 // 50MB
});

// Add request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

class GeminiService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  truncateMessage(message, maxLength = 5000) {
    return message.length > maxLength ? message.substring(0, maxLength) + "..." : message;
  }

  chunkMessage(message, chunkSize = 4000) {
    const chunks = [];
    for (let i = 0; i < message.length; i += chunkSize) {
      chunks.push(message.slice(i, i + chunkSize));
    }
    return chunks;
  }
}

const geminiInstance = new GeminiService();

export const chatbotApi = {
  sendMessage: async (message) => {
    try {
      // Debug localStorage data
      console.log('All localStorage data:', {
        token: localStorage.getItem('token'),
        userData: localStorage.getItem('userData'),
        userId: localStorage.getItem('userId'),
        MaTaiKhoan: localStorage.getItem('MaTaiKhoan')
      });

      const truncatedMessage = geminiInstance.truncateMessage(message);
      
      // Get Gemini response first
      const result = await geminiInstance.model.generateContent(
        `${SYSTEM_PROMPT}\n\nUser: ${truncatedMessage}`
      );
      const response = await result.response;
      const botResponse = response.text();

      // Try getting userId from different possible storage keys
      const userId = localStorage.getItem('MaTaiKhoan') || 
                    (localStorage.getItem('userData') ? JSON.parse(localStorage.getItem('userData')).userId : null) ||
                    localStorage.getItem('userId');

      console.log('Using userId for chat:', userId);

      if (userId) {
        try {
          // Save user message
          const userMessageResponse = await axiosInstance.post('/chatbot/message', {
            MaTaiKhoan: parseInt(userId),
            TinNhan: truncatedMessage,
            RoleTinNhan: 'user'
          });
          console.log('User message saved:', userMessageResponse.data);

          // Save bot response
          const botMessageResponse = await axiosInstance.post('/chatbot/message', {
            MaTaiKhoan: parseInt(userId),
            TinNhan: botResponse,
            RoleTinNhan: 'bot'
          });
          console.log('Bot message saved:', botMessageResponse.data);
        } catch (error) {
          console.error('Error saving messages:', error.response?.data || error);
        }
      } else {
        console.warn('No user ID found in any storage location');
      }

      return botResponse;
    } catch (error) {
      console.error("Error in sendMessage:", error);
      throw error;
    }
  },

  getChatHistory: async () => {
    try {
      // Check all possible storage locations
      const userId = localStorage.getItem('MaTaiKhoan') || 
                    (localStorage.getItem('userData') ? JSON.parse(localStorage.getItem('userData')).userId : null) ||
                    localStorage.getItem('userId');

      console.log('Getting chat history for userId:', userId);
      
      if (!userId) {
        console.warn('No user ID found for chat history');
        return [];
      }

      const response = await axiosInstance.get(`/chatbot/messages/${userId}`);
      console.log('Chat history response:', response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching chat history:", error);
      return [];
    }
  },

  clearChatHistory: async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        return []; // Return empty array if not logged in
      }

      const response = await axiosInstance.delete(`/chatbot/messages/${userId}`);
      return response.data;
    } catch (error) {
      console.error("Error clearing chat history:", error);
      throw error;
    }
  }
};

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadChatHistory();
  }, []);

  const loadChatHistory = async () => {
    try {
      const history = await chatbotApi.getChatHistory();
      if (history && Array.isArray(history)) {
        const formattedMessages = history.map(msg => ({
          text: msg.TinNhan,
          sender: msg.RoleTinNhan
        }));
        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      text: inputMessage,
      sender: 'user'
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await chatbotApi.sendMessage(inputMessage);
      const botMessage = {
        text: response,
        sender: 'bot'
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      message.error('Không thể nhận được phản hồi. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chatbot-container">
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender}`}>
            <div className="message-content">{msg.text}</div>
          </div>
        ))}
      </div>
      
      <div className="chat-input">
        <Input.TextArea
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Nhập tin nhắn..."
          disabled={isLoading}
          onPressEnter={(e) => {
            if (!e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
        />
        <Button 
          type="primary" 
          onClick={handleSendMessage}
          loading={isLoading}
        >
          Gửi
        </Button>
      </div>
      
      {isLoading && (
        <div className="loading-indicator">
          <Spin />
        </div>
      )}
    </div>
  );
};

export default Chatbot;

