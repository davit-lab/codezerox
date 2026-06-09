import { useState } from "react";
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
      <main className="page-content">
        <div className="container">

          {/* Hero */}
          <section className="cert-hero" style={bannerData?.image_url ? { backgroundImage: `url(${bannerData.image_url})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}>
            <div className="cert-hero-bg-overlay" />
            <div className="cert-hero-content">
              <div className="cert-hero-badge">
                <span className="material-symbols-rounded" style={{ fontSize: 16 }}>workspace_premium</span>
                პროფესიონალური სერტიფიკაცია
              </div>
              <h1 className="cert-hero-title">
                დაამტკიცე შენი <span className="text-gold">ცოდნა</span>
              </h1>
              <p className="cert-hero-sub">
                გაიარე გამოცდა და მიიღე CodeZero Academy-ს ოფიციალური სერტიფიკატი
              </p>
              <div className="cert-hero-stats">
                <div className="cert-hero-stat">
                  <span className="cert-hero-stat-num">{exams?.length || 0}</span>
                  <span className="cert-hero-stat-label">გამოცდა</span>
                </div>
                <div className="cert-hero-stat-divider" />
                <div className="cert-hero-stat">
                  <span className="cert-hero-stat-num">10₾</span>
                  <span className="cert-hero-stat-label">მცდელობა</span>
                </div>

                <div className="cert-hero-stat-divider" />
                <div className="cert-hero-stat">
                  <span className="cert-hero-stat-num">{certificates?.length || 0}</span>
                  <span className="cert-hero-stat-label">მიღებული</span>
                </div>
              </div>
            </div>
          </section>

          {/* My Certificates */}
          {certificates && certificates.length > 0 && (
            <section className="cert-my-section">
              <div className="cert-my-title">
                <div className="cert-my-title-icon">
                  <span className="material-symbols-rounded" style={{ color: 'var(--emerald)', fontSize: 22 }}>emoji_events</span>
                </div>
                მიღებული სერტიფიკატები
              </div>
              <div className="cert-my-grid">
                {certificates.map(cert => (
                  <div key={cert.id} className="cert-my-card">
                    <div className="cert-my-card-top">
                      <div>
                        <div className="cert-my-card-name">{cert.certification_exams?.name}</div>
                        <div className="cert-my-card-num">#{cert.certificate_number}</div>
                        <div className="cert-my-card-date">
                          {new Date(cert.issued_at).toLocaleDateString('ka-GE', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>
                      </div>
                      <div className="cert-my-card-icon">
                        <span className="material-symbols-rounded">verified</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Category Tabs */}
          {isLoading ? (
            <div className="cert-loading">
              <div className="cert-spinner" />
              <p>იტვირთება...</p>
            </div>
          ) : (
            <>
              <div className="cert-tabs">
                {categories.map(cat => {
                  const config = categoryConfig[cat] || { icon: "code", label: cat };
                  const isActive = cat === selectedCategory;
                  const count = exams?.filter(e => e.category === cat).length || 0;
                  return (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`cert-tab ${isActive ? 'active' : ''}`}
                    >
                      <span className="material-symbols-rounded">{config.icon}</span>
                      {config.label}
                      {isActive && <span className="cert-tab-count">{count}</span>}
                    </button>
                  );
                })}
              </div>

              {/* Exam Cards */}
              <div className="cert-grid">
                {filteredExams.map(exam => {
                  const certified = hasCertificate(exam.id);
                  const config = categoryConfig[exam.category] || { icon: "code", barClass: "", iconClass: "" };
                  return (
                    <div key={exam.id} className="cert-card">
                      <div className={`cert-card-bar ${config.barClass}`} />

                      {certified && (
                        <div className="cert-certified-badge">
                          <span className="material-symbols-rounded">verified</span>
                          სერტიფიცირებული
                        </div>
                      )}

                      <div className="cert-card-body">
                        <div className="cert-card-head">
                          <div className={`cert-card-icon ${config.iconClass}`}>
                            <span className="material-symbols-rounded">{config.icon}</span>
                          </div>
                          <div>
                            <div className="cert-card-title">{exam.name}</div>
                            {exam.subcategory && (
                              <div className="cert-card-sub">{exam.subcategory}</div>
                            )}
                          </div>
                        </div>

                        {exam.description && (
                          <div className="cert-card-desc">{exam.description}</div>
                        )}

                        <div className="cert-card-stats">
                          <div className="cert-card-stat">
                            <span className="material-symbols-rounded">quiz</span>
                            <span className="cert-card-stat-num">{exam.total_questions}</span>
                            <span className="cert-card-stat-label">კითხვა</span>
                          </div>
                          <div className="cert-card-stat">
                            <span className="material-symbols-rounded">schedule</span>
                            <span className="cert-card-stat-num">{exam.time_limit_minutes}წთ</span>
                            <span className="cert-card-stat-label">დრო</span>
                          </div>
                          <div className="cert-card-stat">
                            <span className="material-symbols-rounded">target</span>
                            <span className="cert-card-stat-num">{exam.pass_threshold}</span>
                            <span className="cert-card-stat-label">ზღვარი</span>
                          </div>
                        </div>

                        {certified && (
                          <button
                            className="cert-card-btn certified"
                            onClick={() => {
                              const cert = certificates?.find(c => c.exam_id === exam.id);
                              if (cert) navigate(`/certificate/${cert.id}`);
                            }}
                            style={{ marginBottom: 8 }}
                          >
                            სერტიფიკატის ნახვა
                            <span className="material-symbols-rounded">open_in_new</span>
                          </button>
                        )}

                        <button
                          className={`cert-card-btn ${certified ? '' : 'primary'}`}
                          onClick={() => {
                            if (!user) navigate('/auth');
                            else navigate(`/exam/${exam.slug}`);
                          }}
                        >
                          {certified ? 'ხელახლა ჩაბარება' : 'გამოცდის დაწყება'}
                          <span className="material-symbols-rounded">arrow_forward</span>
                        </button>

                        <div className="cert-card-price">
                          <span className="material-symbols-rounded">payments</span>
                          10₾ / მცდელობა
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

        </div>
      </main>
    </>
  );
};

export default Certifications;
