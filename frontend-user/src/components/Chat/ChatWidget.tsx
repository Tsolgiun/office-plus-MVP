import { useState, useRef ,useEffect} from 'react';
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

const ChatWindow = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  bottom: 100px;
  right: 20px;
  width: 350px;
  height: 500px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  display: ${props => props.$isOpen ? 'flex' : 'none'};
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

const Message = styled.div<{ $isUser: boolean }>`
  max-width: 80%;
  padding: 12px 16px;
  border-radius: 16px;
  ${props => props.$isUser ? `
    background: #007bff;
    color: white;
    align-self: flex-end;
  ` : `
    background: #f0f0f0;
    color: black;
    align-self: flex-start;
  `}
`;

const BotMessage = styled.div`
  background-color: #f0f0f0;
  color: #333;
  padding: 8px 12px;
  border-radius: 18px;
  margin-bottom: 8px;
  max-width: 80%;
  word-wrap: break-word;
  align-self: flex-start;

  &.typing {
    display: flex;
    align-items: center;
    height: 32px;
  }

  .typing-indicator {
    display: flex;
    align-items: center;
  }

  .typing-dot {
    background-color: #999;
    border-radius: 50%;
    width: 8px;
    height: 8px;
    margin: 0 2px;
    animation: typing-animation 1.5s infinite ease-in-out;
  }

  .typing-dot:nth-child(1) {
    animation-delay: 0s;
  }

  .typing-dot:nth-child(2) {
    animation-delay: 0.2s;
  }

  .typing-dot:nth-child(3) {
    animation-delay: 0.4s;
  }

  @keyframes typing-animation {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-5px);
    }
  }
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
  const [userInput, setUserInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Function to scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

  useEffect(() => {
    return () => {
      // Clean up on unmount
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const getStreamingResponse = (userMessage: string) => {
    // Close any existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    
    // Add placeholder message that will be updated with streaming content
    setMessages(prev => [...prev, { text: '...', isUser: false }]);
    setIsProcessing(true);
    
    // Get the correct URL from the API service - use path parameter format now
    const encodedMessage = encodeURIComponent(userMessage);
    const eventSourceUrl = api.getEventSourceUrl(`/auth/getAIresponse/${encodedMessage}`);
    
    // Create new EventSource connection
    const eventSource = new EventSource(eventSourceUrl);
    eventSourceRef.current = eventSource;
    
    let responseText = '';
    
    // Handle regular message chunks
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        responseText += data.text;
        
        // Update the last message with the accumulating text
        setMessages(prev => [
          ...prev.slice(0, prev.length - 1),
          { text: responseText, isUser: false }
        ]);
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    };
    
    // Listen for end of stream
    eventSource.addEventListener('end', () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      setIsProcessing(false);
    });
    
    // Listen for errors
    eventSource.onerror = (error) => {
      console.error('EventSource error:', error);
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      
      // If we haven't received any content yet, show an error message
      if (!responseText) {
        setMessages(prev => [
          ...prev.slice(0, prev.length - 1),
          { text: "Sorry, I'm having trouble connecting. Please try again later.", isUser: false }
        ]);
      }
      setIsProcessing(false);
    };
  };

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    // Add user message
    const userMessage = userInput.trim();
    setMessages(prev => [...prev, { text: userMessage, isUser: true }]);
    setUserInput("");

    // Use streaming response (don't await it or try to use its return value)
    getStreamingResponse(userMessage);
  };

  const renderMessages = () => {
    return messages.map((msg, index) => (
      <Message key={index} $isUser={msg.isUser}>
        {msg.isUser ? (
          msg.text
        ) : (
          msg.text === '...' ? (
            <BotMessage className="typing">
              <div className="typing-indicator">
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
              </div>
            </BotMessage>
          ) : (
            msg.text
          )
        )}
      </Message>
    ));
  };

  return (
    <ChatContainer>
      <ChatButton onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? '×' : '💬'}
      </ChatButton>
      
      <ChatWindow $isOpen={isOpen}>
        <ChatHeader>Office+ Support</ChatHeader>
        
        <ChatMessages>
          {renderMessages()}
          <div ref={messagesEndRef} />
        </ChatMessages>
        
        <ChatInput>
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="请在输入你的问题。。。"
          />
          <button onClick={handleSendMessage}>Send</button>
        </ChatInput>
      </ChatWindow>
    </ChatContainer>
  );
};
