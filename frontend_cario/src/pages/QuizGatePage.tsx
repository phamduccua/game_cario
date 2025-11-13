import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '@/services/api';


export const QuizGatePage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTypeSelect = (type: string) => {
    setSelectedType(type);
    setError(null);
  };

  const handleStartQuiz = async () => {
    if (!selectedType) {
      setError('Vui lòng chọn loại câu hỏi');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Fetching questions for type:', selectedType);
      const result = await apiService.getQuestions(selectedType);
      
      if (result.success && result.data && result.data.length > 0) {
        console.log('Questions loaded successfully:', result.data);
        
        // Chuyển sang trang quiz với câu hỏi đã load
        navigate('/quiz/start', { 
          state: { 
            difficulty: selectedType,
            type: selectedType,
            questions: result.data // Truyền câu hỏi đã load
          } 
        });
      } else {
        console.error('Failed to load questions:', result.error);
        setError(result.error || 'Không thể tải câu hỏi. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('Error starting quiz:', error);
      setError('Có lỗi xảy ra khi bắt đầu bài thi. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

    const questionTypes = [
    { 
      key: 'stone', 
      label: 'Đồ đá',
      icon: '🪨', 
      description: 'Khám phá thế giới cổ đại',
      color: '#8b5a2b'
    },
    { 
      key: 'fantasy', 
      label: 'Giả tưởng', 
      icon: '🐉', 
      description: 'Thế giới phép thuật và tưởng tượng',
      color: '#7c3aed'
    },
    { 
      key: 'ordinary', 
      label: 'Thường ngày', 
      icon: '🏠', 
      description: 'Cuộc sống hàng ngày',
      color: '#059669'
    },
    { 
      key: 'science', 
      label: 'Khoa học', 
      icon: '🔬', 
      description: 'Khám phá khoa học và công nghệ',
      color: '#dc2626'
    },
  ];

  return (
    <div className="quiz-page">
      <div className="quiz-container">
        <div className="quiz-header quiz-start-header">
          <h1>Chọn loại câu hỏi</h1>
          <p>Hãy chọn loại câu hỏi phù hợp với tính cách của bạn</p>
        </div>

        <div className="question-types-container">
          {questionTypes.map((type) => (
            <div
              key={type.key}
              className={`question-type-card ${selectedType === type.key ? 'selected' : ''}`}
              onClick={() => handleTypeSelect(type.key)}
            >
              <div className="type-icon" style={{ color: type.color }}>
                {type.icon}
              </div>
              <div className="type-content">
                <h3 className="type-label">{type.label}</h3>
                <p className="type-description">{type.description}</p>
              </div>
              {selectedType === type.key && (
                <div className="selection-indicator">✓</div>
              )}
            </div>
          ))}
        </div>

        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}

        <div className="quiz-start-actions">
          <button
            onClick={handleStartQuiz}
            className={`start-quiz-btn ${selectedType ? 'active' : 'disabled'}`}
            disabled={!selectedType || isLoading}
          >
            {isLoading ? 'Đang tải câu hỏi...' : 'Bắt đầu làm bài'}
          </button>
        </div>

        {selectedType && !isLoading && (
          <div className="selected-type-info">
            <p>
              Bạn đã chọn: <strong>{questionTypes.find(t => t.key === selectedType)?.label}</strong>
            </p>
            <p className="info-text">
              Bạn sẽ được hỏi về {selectedType === 'stone' ? 'thế giới cổ đại' : 
                selectedType === 'fantasy' ? 'thế giới phép thuật' : 
                selectedType === 'ordinary' ? 'cuộc sống hàng ngày' : 
                'khoa học và công nghệ'}.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
