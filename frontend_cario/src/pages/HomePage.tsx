
import { Typewriter } from 'react-simple-typewriter';

export const HomePage: React.FC = () => {
  // Lấy thông tin user từ localStorage (không dùng tại đây)


  return (
    <div className="home-page">
      <div className="home-container">
        {/* Hero Section */}
        <div className="hero-section">
          <h1 className="hero-title">
            <Typewriter
              words={["Chào mừng đến với"]}
              loop={0}
              cursor
              cursorStyle="|"
              typeSpeed={77}
              deleteSpeed={55}
              delaySpeed={2000}
            />
            &nbsp;<span className="highlight">Cario</span>
          </h1>
          <p className="hero-subtitle">
            Hệ thống hướng nghiệp qua trắc nghiệm tính cách
          </p>
          {/* Bỏ phần xin chào và username */}
        </div>

        {/* Features Grid */}
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📚</div>
            <h3>Câu hỏi</h3>
            <p>Làm bài trắc nghiệm tính cách để định hướng nghề nghiệp</p>
            <a href="/quiz" className="feature-link">Bắt đầu</a>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🤖</div>
            <h3>Chatbot</h3>
            <p>Trao đổi với AI để hiểu sâu hơn về kết quả và nghề nghiệp phù hợp</p>
            <a href="/chatbot" className="feature-link">Trò chuyện</a>
          </div>

          <div className="feature-card">
            <div className="feature-icon">💬</div>
            <h3>Diễn đàn</h3>
            <p>Thảo luận, chia sẻ định hướng nghề nghiệp cùng cộng đồng</p>
            <a href="/forum" className="feature-link">Vào diễn đàn</a>
          </div>

          {/* Bỏ thẻ tính năng Theo dõi tiến độ */}
        </div>
        {/* Phần giới thiệu và thông tin thêm */}
        <section className="about-section">
          <h2>Thông tin về Cario</h2>
          <p>
            Cario là hệ thống hướng nghiệp qua trắc nghiệm tính cách, giúp bạn khám phá điểm mạnh,
            sở thích và phong cách làm việc để gợi ý những lộ trình nghề nghiệp phù hợp.
          </p>
          <p>
            Tại đây, bạn có thể làm bài trắc nghiệm, trò chuyện cùng chatbot, và tham gia diễn đàn để
            trao đổi kinh nghiệm với cộng đồng.
          </p>
        </section>

        <section className="info-sections">
          <div className="info-card">
            <h3>Nền tảng công nghệ</h3>
            <ul>
              <li>⚛️ React</li>
              <li>🔐 ADK Google</li>
              <li>⚡ FastAPI</li>
              <li>🟢 Spring Boot</li>
            </ul>
          </div>
          <div className="info-card">
            <h3>Tính năng nổi bật</h3>
            <ul>
              <li>🧭 Trắc nghiệm tính cách định hướng nghề nghiệp</li>
              <li>📊 Phân tích kết quả và gợi ý lộ trình</li>
              <li>🤖 Chatbot tư vấn tức thời</li>
              <li>💬 Diễn đàn trao đổi cộng đồng</li>
            </ul>
          </div>
          <div className="info-card">
            <h3>Hỗ trợ khách hàng</h3>
            <ul>
              <li>✉️ Email: khoaai@ptit.edu.vn</li>
              <li>📞 Số điện thoại: 0248888888</li>
              <li>🕒 Hỗ trợ 24/7</li>
            </ul>
          </div>
        </section>

        <section className="why-cario-section">
          <h2>Tại sao nên chọn Cario?</h2>
          <div className="why-cario-grid">
            <div className="why-item">
              <span className="why-icon">🎯</span>
              <h4>Định hướng chính xác</h4>
              <p>Kết hợp trắc nghiệm và phân tích để gợi ý nghề nghiệp sát với cá tính.</p>
            </div>
            <div className="why-item">
              <span className="why-icon">⚡</span>
              <h4>Trải nghiệm nhanh gọn</h4>
              <p>Giao diện hiện đại, thao tác đơn giản, kết quả hiển thị rõ ràng.</p>
            </div>
            <div className="why-item">
              <span className="why-icon">🤝</span>
              <h4>Cộng đồng hỗ trợ</h4>
              <p>Diễn đàn giúp bạn học hỏi và nhận tư vấn từ những người đi trước.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
