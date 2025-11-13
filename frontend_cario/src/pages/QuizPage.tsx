import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Question } from '@/types';
import { apiService } from '@/services/api';

export const QuizPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const difficulty = location.state?.difficulty || 'easy';
  const questionType = location.state?.type || difficulty;
  const preloadedQuestions = location.state?.questions; // Câu hỏi đã được load từ QuizGatePage
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);

  // Khởi tạo câu hỏi khi component mount
  useEffect(() => {
    if (preloadedQuestions && preloadedQuestions.length > 0) {
      // Sử dụng câu hỏi đã được load từ QuizGatePage
      console.log('Using preloaded questions:', preloadedQuestions);
      setQuestions(preloadedQuestions);
      setIsLoading(false);
    } else {
      // Fallback: gọi API nếu không có câu hỏi preloaded
      console.log('No preloaded questions, fetching from API for type:', questionType);
      fetchQuestions();
    }
  }, [preloadedQuestions, questionType]);

  // Hàm gọi API để lấy câu hỏi (fallback)
  const fetchQuestions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Fetching questions with type:', questionType);
      const result = await apiService.getQuestions(questionType);
      
      if (result.success && result.data) {
        console.log('Questions loaded successfully:', result.data);
        setQuestions(result.data);
      } else {
        console.error('Failed to load questions:', result.error);
        setError(result.error || 'Không thể tải kết quả phân tích');
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
      setError('Có lỗi xảy ra khi tải câu hỏi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (qIndex: number, answerId: number) => {
    setAnswers((prev) => ({ ...prev, [qIndex]: answerId }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    setError(null);
    setAnalysisResult(null);
    
    try {
      // Tạo JSON với format items chứa question và answer
      const quizAnswers = {
        items: questions.map((q, i) => {
          const selectedAnswerId = answers[i];
          const selectedAnswer = q.answers.find(a => a.id === selectedAnswerId);
          
          return {
            question: q.content,
            answer: selectedAnswer ? selectedAnswer.content : 'Chưa trả lời'
          };
        })
      };
      
      console.log('Quiz answers:', quizAnswers);
      console.log('JSON stringified:', JSON.stringify(quizAnswers));
      
      // Lưu tạm thời vào localStorage
      localStorage.setItem('quizResults', JSON.stringify(quizAnswers));
      
      // Gọi API phân tích qua service (tương tự chatbot)
      const analysis = await apiService.analyzeAnswers(quizAnswers);
      if (analysis.success && analysis.data) {
        console.log('Analysis result:', analysis.data);
        const result = analysis.data;
        const markdownContent = result.analysis || result.content || result.message || result;
        setAnalysisResult(markdownContent);
      } else {
        console.error('AnalyzeAnswers Error:', analysis.error);
        setError(analysis.error || 'Không thể tải kết quả phân tích');
      }
    } catch (err) {
      console.error('Error submitting quiz:', err);
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi phân tích kết quả');
    } finally {
      setIsSubmitting(false);
      setShowResults(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  // Removed handleRestart as the restart action now navigates to /quiz

  // Nếu đang loading, hiển thị loading
  if (isLoading) {
    return (
      <div className="quiz-page">
        <div className="quiz-container">
          <div className="quiz-loading">
            <div className="loading-spinner"></div>
            <p>Đang tải câu hỏi...</p>
          </div>
        </div>
      </div>
    );
  }

  // Nếu có lỗi, hiển thị error
  if (error) {
    return (
      <div className="quiz-page">
        <div className="quiz-container">
          <div className="quiz-error">
            <h2>Không thể tải kết quả phân tích</h2>
            <p>{error}</p>
            <button onClick={() => navigate('/quiz')} className="retry-btn">
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Nếu không có câu hỏi, hiển thị thông báo
  if (!questions || questions.length === 0) {
    return (
      <div className="quiz-page">
        <div className="quiz-container">
          <div className="quiz-error">
            <h2>Không có câu hỏi nào</h2>
            <p>Không tìm thấy câu hỏi cho độ khó này.</p>
            <button onClick={() => navigate('/quiz')} className="retry-btn">
              Quay lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-page">
      <div className="quiz-container">
        <div className="quiz-header">
          <h1>Khảo sát - {questionType === 'stone' ? 'Đồ đá' : 
            questionType === 'fantasy' ? 'Giả tưởng' : 
            questionType === 'ordinary' ? 'Thường ngày' : 
            'Khoa học'}</h1>
          <div className="quiz-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
              ></div>
            </div>
            <span className="progress-text">
              {currentQuestion + 1} / {questions.length}
            </span>
          </div>
        </div>

        {showResults && (
          <div className="quiz-results">
            <div className="score-display">
              <h2>Kết quả phân tích</h2>

              {isSubmitting ? (
                <div className="loading-analysis">
                  <div className="loading-spinner"></div>
                  <p>Đang phân tích kết quả...</p>
                </div>
              ) : error ? (
                <div className="error-analysis">
                  <p>❌ {error}</p>
                </div>
              ) : analysisResult ? (
                <div className="analysis-content">
                  <div 
                    className="markdown-content"
                    dangerouslySetInnerHTML={{ 
                      __html: analysisResult
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/\*(.*?)\*/g, '<em>$1</em>')
                        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
                        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
                        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
                        .replace(/^\* (.*$)/gim, '<li>$1</li>')
                        .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
                        .replace(/\n/g, '<br>')
                    }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
                    <button onClick={() => navigate('/quiz')} className="restart-btn">
                      Làm lại câu hỏi
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        )}

        {!showResults && (
        <form onSubmit={handleSubmit}>
          <div className="question-container">
            <div className="question-header">
              <span className="question-number">Câu {currentQuestion + 1}</span>
              <h3 className="question-text">{questions[currentQuestion].content}</h3>
            </div>

            <div className="choices-container">
              {questions[currentQuestion].answers.map((answer) => (
                <label 
                  key={answer.id} 
                  className={`choice-item ${answers[currentQuestion] === answer.id ? 'selected' : ''}`}
                >
                  <input
                    type="radio"
                    name={`question-${currentQuestion}`}
                    value={answer.id.toString()}
                    checked={answers[currentQuestion] === answer.id}
                    onChange={() => handleSelect(currentQuestion, answer.id)}
                    disabled={showResults}
                  />
                  <span className="choice-text">{answer.content}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="quiz-navigation">
            <button 
              type="button" 
              className="nav-btn prev-btn"
              onClick={handlePrev}
              disabled={currentQuestion === 0}
            >
              ← Trước
            </button>
            
            {currentQuestion < questions.length - 1 ? (
              <button 
                type="button" 
                className="nav-btn next-btn"
                onClick={handleNext}
              >
                Tiếp →
              </button>
            ) : (
              <button 
                type="submit" 
                className="submit-btn"
                disabled={Object.keys(answers).length < questions.length || isSubmitting}
              >
                {isSubmitting ? 'Đang nộp bài...' : 'Nộp bài'}
              </button>
            )}
          </div>
        </form>
        )}
      </div>
    </div>
  );
};
