import { useState } from 'react';
import styled from 'styled-components';
import {api} from '../../services/api';

const ChatContainer = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
`;

const ChatButton = styled.button`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: #007bff;
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.1);
  }
`;

const ChatWindow = styled.div<{ isOpen: boolean }>`
  position: fixed;
  bottom: 100px;
  right: 20px;
  width: 350px;
  height: 500px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  display: ${props => props.isOpen ? 'flex' : 'none'};
  flex-direction: column;
  overflow: hidden;
`;

const ChatHeader = styled.div`
  padding: 16px;
  background: #007bff;
  color: white;
  font-weight: bold;
`;

const ChatMessages = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ChatInput = styled.div`
  padding: 16px;
  border-top: 1px solid #eee;
  display: flex;
  gap: 8px;

  input {
    flex: 1;
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 20px;
    outline: none;

    &:focus {
      border-color: #007bff;
    }
  }

  button {
    padding: 8px 16px;
    background: #007bff;
    color: white;
    border: none;
    border-radius: 20px;
    cursor: pointer;

    &:hover {
      background: #0056b3;
    }
  }
`;

const Message = styled.div<{ isUser: boolean }>`
  max-width: 80%;
  padding: 12px 16px;
  border-radius: 16px;
  ${props => props.isUser ? `
    background: #007bff;
    color: white;
    align-self: flex-end;
  ` : `
    background: #f0f0f0;
    color: black;
    align-self: flex-start;
  `}
`;

interface ChatMessage {
  text: string;
  isUser: boolean;
}

export const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { text: "您好！ 我今天可以帮助你什么？", isUser: false }
  ]);
  const [inputText, setInputText] = useState("");

  const getBotResponse = async (userMessage: string): Promise<string> => {
    try {
      const response = await api.getAIresponse(userMessage);
      console.log(response);
      return response.response || "我不是很清楚你的问题，你可以重复一下吗？";
    } catch (error) {
      console.error("Error getting AI response:", error);
      return "不好意思，服务器正忙，您可以之后再来尝试吗？";
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = inputText;
    const newMessages = [
      ...messages,
      { text: userMessage, isUser: true }
    ];
    setMessages(newMessages);
    setInputText("");

    // Add bot response
    try {
      const botResponse = await getBotResponse(userMessage);
      setMessages(prevMessages => [
        ...prevMessages,
        { text: botResponse, isUser: false }
      ]);
    } catch (error) {
      console.error("Error in chat:", error);
    }
  };

  return (
    <ChatContainer>
      <ChatButton onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? '×' : '💬'}
      </ChatButton>
      
      <ChatWindow isOpen={isOpen}>
        <ChatHeader>Office+ Support</ChatHeader>
        
        <ChatMessages>
          {messages.map((message, index) => (
            <Message key={index} isUser={message.isUser}>
              {message.text}
            </Message>
          ))}
        </ChatMessages>
        
        <ChatInput>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="请在输入你的问题。。。"
          />
          <button onClick={handleSendMessage}>Send</button>
        </ChatInput>
      </ChatWindow>
    </ChatContainer>
  );
};
