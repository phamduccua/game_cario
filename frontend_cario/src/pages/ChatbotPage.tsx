import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { apiService } from '@/services/api';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export const ChatbotPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: 'm1', role: 'assistant', content: 'Xin chào! Tôi có thể giúp gì cho bạn?' },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || isLoading) return;
    
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await apiService.chat(text);
      
      if (response.success && response.data) {
        const reply: Message = {
          id: Date.now().toString() + '-a',
          role: 'assistant',
          content: response.data.response,
        };
        setMessages((prev) => [...prev, reply]);
      } else {
        const errorMsg: Message = {
          id: Date.now().toString() + '-e',
          role: 'assistant',
          content: response.error || 'Có lỗi xảy ra khi gửi tin nhắn.',
        };
        setMessages((prev) => [...prev, errorMsg]);
      }
    } catch (error) {
      const errorMsg: Message = {
        id: Date.now().toString() + '-e',
        role: 'assistant',
        content: 'Không thể kết nối đến chatbot. Vui lòng thử lại sau.',
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="chat-page">
      <div className="chat-container">
        <div className="chat-header">Chatbot Cario</div>
        <div className="chat-messages" ref={listRef}>
          {messages.map((m) => (
            <div key={m.id} className={`chat-message ${m.role}`}>
              <div className="bubble">
                {m.role === 'assistant' ? (
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                ) : (
                  m.content
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="chat-message assistant">
              <div className="bubble">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="chat-input-row">
          <input
            className="chat-input"
            placeholder="Nhập câu hỏi của bạn..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            disabled={isLoading}
          />
          <button 
            className="chat-send" 
            onClick={send}
            disabled={isLoading || !input.trim()}
          >
            Gửi
          </button>
        </div>
      </div>
    </div>
  );
};
