import React, { useState } from 'react';
import { Input, Button, Spin, message } from 'antd';
import './chatbot.css';
import geminiService from '../../services/geminiService';

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (inputMessage.trim()) {
      const userMessage = {
        text: inputMessage,
        sender: 'user'
      };
      
      setMessages(prev => [...prev, userMessage]);
      setInputMessage('');
      setIsLoading(true);

      try {
        const response = await geminiService.sendMessage(inputMessage);
        const botMessage = {
          text: response || 'Xin lỗi, tôi không thể tạo câu trả lời. Vui lòng thử lại.',
          sender: 'bot'
        };
        setMessages(prev => [...prev, botMessage]);
      } catch (error) {
        message.error('Không thể nhận được phản hồi. Vui lòng thử lại.');
        const errorMessage = {
          text: 'Đã xảy ra lỗi. Vui lòng thử lại sau.',
          sender: 'bot'
        };
        setMessages(prev => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <h2>Store Assistant</h2>
      </div>
      
      <div className="messages-container">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.sender}`}>
            <div className="message-bubble">
              {message.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="message bot">
            <div className="message-bubble loading">
              <Spin size="small" />
            </div>
          </div>
        )}
      </div>

      <div className="input-container">
        <Input
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onPressEnter={handleSendMessage}
          placeholder="Type a message..."
          disabled={isLoading}
        />
        <Button 
          type="primary" 
          onClick={handleSendMessage}
          loading={isLoading}
        >
          Send
        </Button>
      </div>
    </div>
  );
};

export default Chatbot;
