import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Atmosphere from "@/components/layout/Atmosphere";
import Header from "@/components/layout/Header";
import SEOHead from "@/components/SEOHead";
import { useCertificationExams, useUserCertificates } from "@/hooks/useCertification";
import { useAuth } from "@/hooks/useAuth";
import { useHeroBanner } from "@/hooks/useHeroBanners";

const categoryConfig: Record<string, { icon: string; label: string; barClass: string; iconClass: string }> = {
  frontend: { icon: "language", label: "Frontend", barClass: "frontend", iconClass: "frontend" },
  backend: { icon: "database", label: "Backend", barClass: "backend", iconClass: "backend" },
  cyber: { icon: "shield", label: "კიბერუსაფრთხოება", barClass: "cyber", iconClass: "cyber" },
};

const Certifications = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: exams, isLoading } = useCertificationExams();
  const { data: certificates } = useUserCertificates();
  const { data: bannerData } = useHeroBanner("certifications");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState({ days: 30, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const launchDate = new Date();
    launchDate.setDate(launchDate.getDate() + 30);

    const timer = setInterval(() => {
      const now = new Date();
      const diff = launchDate.getTime() - now.getTime();

      if (diff <= 0) {
        clearInterval(timer);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const categories = [...new Set(exams?.map(e => e.category) || [])];
  const selectedCategory = activeCategory || categories[0] || "frontend";
  const filteredExams = exams?.filter(e => e.category === selectedCategory) || [];

  const hasCertificate = (examId: string) =>
    certificates?.some(c => c.exam_id === examId);

  return (
    <>
      <SEOHead title="სერტიფიკატები | CodeZero Academy" description="გაიარე პროფესიონალური გამოცდა და მიიღე CodeZero სერტიფიკატი" />
      <Atmosphere />
      <Header />
      <main className="page-content" style={{ minHeight: 'calc(100vh - 80px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="container" style={{ textAlign: 'center', padding: '60px 20px' }}>
          
          {/* Coming Soon Icon */}
          <div style={{ marginBottom: '40px' }}>
            <div style={{
              width: '120px',
              height: '120px',
              margin: '0 auto',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 20px 60px rgba(102, 126, 234, 0.3)',
            }}>
              <span className="material-symbols-rounded" style={{ fontSize: '64px', color: '#fff' }}>
                workspace_premium
              </span>
            </div>
          </div>

          {/* Title */}
          <h1 style={{
            fontSize: '48px',
            fontWeight: 'bold',
            marginBottom: '20px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            Coming Soon
          </h1>

          {/* Subtitle */}
          <p style={{
            fontSize: '20px',
            color: '#666',
            marginBottom: '50px',
            maxWidth: '600px',
            margin: '0 auto 50px',
            lineHeight: '1.6',
          }}>
            ჩვენი სერტიფიკაციის სისტემა მზადდება. მალე შეგეძლებათ გაიაროთ პროფესიონალური გამოცდები და მიიღოთ CodeZero Academy-ს ოფიციალური სერტიფიკატები.
          </p>

          {/* Countdown Timer */}
          <div style={{
            display: 'flex',
            gap: '20px',
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginBottom: '50px',
          }}>
            {[
              { value: timeLeft.days, label: 'დღე' },
              { value: timeLeft.hours, label: 'საათი' },
              { value: timeLeft.minutes, label: 'წუთი' },
              { value: timeLeft.seconds, label: 'წამი' },
            ].map((item, index) => (
              <div key={index} style={{
                background: '#fff',
                borderRadius: '16px',
                padding: '25px 30px',
                minWidth: '100px',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
                border: '1px solid rgba(102, 126, 234, 0.2)',
              }}>
                <div style={{
                  fontSize: '42px',
                  fontWeight: 'bold',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  marginBottom: '8px',
                }}>
                  {String(item.value).padStart(2, '0')}
                </div>
                <div style={{
                  fontSize: '14px',
                  color: '#666',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                }}>
                  {item.label}
                </div>
              </div>
            ))}
          </div>

          {/* Features */}
          <div style={{
            display: 'flex',
            gap: '30px',
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginBottom: '50px',
          }}>
            {[
              { icon: 'school', text: '50+ გამოცდა' },
              { icon: 'verified', text: 'ოფიციალური სერტიფიკატები' },
              { icon: 'trending_up', text: 'კარიერული განვითარება' },
            ].map((feature, index) => (
              <div key={index} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '15px 25px',
                background: 'rgba(102, 126, 234, 0.1)',
                borderRadius: '50px',
              }}>
                <span className="material-symbols-rounded" style={{ color: '#667eea', fontSize: '24px' }}>
                  {feature.icon}
                </span>
                <span style={{ color: '#333', fontWeight: '500' }}>
                  {feature.text}
                </span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div style={{
            marginTop: '40px',
          }}>
            <button
              onClick={() => navigate('/')}
              style={{
                padding: '16px 40px',
                fontSize: '18px',
                fontWeight: '600',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: '50px',
                cursor: 'pointer',
                boxShadow: '0 10px 30px rgba(102, 126, 234, 0.4)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 15px 40px rgba(102, 126, 234, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(102, 126, 234, 0.4)';
              }}
            >
              მთავარ გვერდზე დაბრუნება
            </button>
          </div>

        </div>
      </main>
    </>
  );
};

export default Certifications;
