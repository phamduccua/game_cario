import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { apiService } from '@/services/api';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const QUICK_QUESTIONS = [
  'Lộ trình học lập trình cho người mới bắt đầu?',
  'CV sinh viên ngành Marketing gồm những gì?',
  'Ý nghĩa logo PTIT là gì?',
];

export const ChatbotPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: 'm1', role: 'assistant', content: 'Xin chào! Tôi là trợ lý ảo Cario. Tôi có thể giúp gì cho bạn?' },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showQuickQuestions, setShowQuickQuestions] = useState(true);
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const send = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || isLoading) return;

    setShowQuickQuestions(false);
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: messageText };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await apiService.chat(messageText);

      if (response.success && response.data) {
        const reply: Message = {
          id: Date.now().toString() + '-a',
          role: 'assistant',
          content: response.data.response,
        };
        setMessages((prev) => [...prev, reply]);
      } else {
        // Xử lý lỗi chi tiết
        let errorContent = response.error || 'Có lỗi xảy ra khi gửi tin nhắn.';

        // Kiểm tra lỗi 403 cụ thể
        if (errorContent.includes('403')) {
          errorContent = '⚠️ **Lỗi 403 - Truy cập bị từ chối**\n\nCó thể do:\n- API chatbot đang bảo trì\n- Rate limiting (gửi quá nhiều tin nhắn)\n- Cần xác thực thêm\n\nVui lòng thử lại sau vài phút. Nếu vẫn lỗi, hãy liên hệ quản trị viên.';
        } else if (errorContent.includes('404')) {
          errorContent = '⚠️ **Lỗi 404 - Không tìm thấy endpoint**\n\nAPI chatbot có thể đã thay đổi địa chỉ. Vui lòng liên hệ quản trị viên.';
        } else if (errorContent.includes('500') || errorContent.includes('502') || errorContent.includes('503')) {
          errorContent = '⚠️ **Lỗi Server**\n\nServer chatbot đang gặp sự cố. Vui lòng thử lại sau.';
        }

        console.error('Chatbot error:', errorContent);

        const errorMsg: Message = {
          id: Date.now().toString() + '-e',
          role: 'assistant',
          content: errorContent,
        };
        setMessages((prev) => [...prev, errorMsg]);
      }
    } catch (error) {
      console.error('Chatbot network error:', error);
      const errorMsg: Message = {
        id: Date.now().toString() + '-e',
        role: 'assistant',
        content: '⚠️ **Không thể kết nối đến chatbot**\n\nKiểm tra:\n- Kết nối internet của bạn\n- API chatbot có đang hoạt động không\n\nChi tiết lỗi: ' + (error instanceof Error ? error.message : 'Unknown error'),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickQuestion = (question: string) => {
    send(question);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="chat-page">
      <div className="chat-layout">
        {/* Sidebar trái - FAQ và Tips */}
        <div className="chat-sidebar chat-sidebar-left">
          <div className="sidebar-section">
            <h3 className="sidebar-title">💡 Gợi ý</h3>
            <div className="sidebar-content">
              <div className="tip-item">
                <strong>Trò chuyện thông thường</strong>
                <p>Tôi có thể trò chuyện với bạn về nhiều chủ đề khác nhau</p>
              </div>
              <div className="tip-item">
                <strong>Tư vấn lộ trình học</strong>
                <p>Gợi ý các khóa học và lộ trình học tập phù hợp</p>
              </div>
              <div className="tip-item">
                <strong>Thông tin tuyển sinh PTIT</strong>
                <p>Cung cấp thông tin về ngành học, điểm chuẩn, học phí tại PTIT</p>
              </div>
            </div>
          </div>
        </div>

        {/* Chat chính */}
        <div className="chat-container">
          <div className="chat-header">
            <h2>Chatbot Cario</h2>
            <p>Trợ lý ảo của bạn</p>
          </div>
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
          {showQuickQuestions && messages.length === 1 && (
            <div className="quick-questions">
              {QUICK_QUESTIONS.map((q, idx) => (
                <button
                  key={idx}
                  className="quick-question-btn"
                  onClick={() => handleQuickQuestion(q)}
                  disabled={isLoading}
                >
                  {q}
                </button>
              ))}
            </div>
          )}
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
              onClick={() => send()}
              disabled={isLoading || !input.trim()}
            >
              Gửi
            </button>
          </div>
        </div>

        {/* Sidebar phải - Thông tin */}
        <div className="chat-sidebar chat-sidebar-right">
          <div className="sidebar-section">
            <h3 className="sidebar-title">📚 Thông tin</h3>
            <div className="sidebar-content">
              <div className="info-item">
                <div className="info-icon">💬</div>
                <div className="info-text">
                  <strong>{messages.length - 1}</strong>
                  <span>Tin nhắn</span>
                </div>
              </div>
              <div className="info-item">
                <div className="info-icon">⚡</div>
                <div className="info-text">
                  <strong>{isLoading ? 'Đang trả lời...' : 'Sẵn sàng'}</strong>
                  <span>Trạng thái</span>
                </div>
              </div>
            </div>
          </div>

          <div className="sidebar-section">
            <h3 className="sidebar-title">🎯 Chủ đề phổ biến</h3>
            <div className="sidebar-content">
              <button
                className="topic-btn"
                onClick={() => send('PTIT có những ngành nào?')}
                disabled={isLoading}
              >
                Ngành học tại PTIT
              </button>
              <button
                className="topic-btn"
                onClick={() => send('Lộ trình học lập trình cho người mới')}
                disabled={isLoading}
              >
                Lộ trình học lập trình
              </button>
              <button
                className="topic-btn"
                onClick={() => send('Review và chỉnh sửa CV xin việc')}
                disabled={isLoading}
              >
                Review CV
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
