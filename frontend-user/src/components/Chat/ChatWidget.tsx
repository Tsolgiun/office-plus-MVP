import { useState } from 'react';
import styled from 'styled-components';

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
    { text: "Hello! How can I help you today?", isUser: false }
  ]);
  const [inputText, setInputText] = useState("");

  const getBotResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('price') || lowerMessage.includes('cost')) {
      return "Our office prices vary depending on size and location. You can find detailed pricing information on each office's page. Would you like me to help you find a specific office?";
    }
    if (lowerMessage.includes('book') || lowerMessage.includes('reserve')) {
      return "To book an office, you'll need to create an account and submit a booking request. Would you like me to guide you through the process?";
    }
    if (lowerMessage.includes('amenities') || lowerMessage.includes('facilities')) {
      return "Our offices come with various amenities including high-speed internet, meeting rooms, kitchen facilities, and 24/7 access. The specific amenities vary by location.";
    }
    if (lowerMessage.includes('contact') || lowerMessage.includes('support')) {
      return "You can reach our support team at support@officeplus.com or call us at +1-234-567-8900 during business hours.";
    }
    if (lowerMessage.includes('available') || lowerMessage.includes('vacancy')) {
      return "Office availability is updated in real-time on our platform. You can check current availability by browsing our listings. Would you like help finding available offices?";
    }
    
    return "I'm not sure about that. Could you please rephrase your question or ask about office availability, pricing, booking process, amenities, or contact information?";
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const newMessages = [
      ...messages,
      { text: inputText, isUser: true }
    ];
    setMessages(newMessages);
    setInputText("");

    // Add bot response
    setTimeout(() => {
      setMessages([
        ...newMessages,
        { text: getBotResponse(inputText), isUser: false }
      ]);
    }, 500);
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
            placeholder="Type your message..."
          />
          <button onClick={handleSendMessage}>Send</button>
        </ChatInput>
      </ChatWindow>
    </ChatContainer>
  );
};
