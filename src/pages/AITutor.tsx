import Atmosphere from "@/components/layout/Atmosphere";
import Header from "@/components/layout/Header";
import AITutorChat from "@/components/ai/AITutorChat";
import SEOHead from "@/components/SEOHead";

const AITutor = () => {
  return (
    <>
      <SEOHead
        title="AI ტუტორი"
        description="დაუსვი ნებისმიერი კითხვა პროგრამირებაზე AI ტუტორს და მიიღე დეტალური პასუხი ქართულ ენაზე."
        path="/ai-tutor"
      />
      <Atmosphere />
      <Header />
      <main style={{ paddingTop: '140px', paddingBottom: '80px' }}>
        <div className="container">
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <h1 className="ai-tutor-title" style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', marginBottom: '16px', wordBreak: 'break-word' }}>
                <span style={{ color: 'var(--gold)' }}>AI</span> ტუტორი
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', wordBreak: 'break-word' }}>
                დაუსვი ნებისმიერი კითხვა პროგრამირებაზე და მიიღე დეტალური პასუხი
              </p>
            </div>
            <AITutorChat />
          </div>
        </div>
      </main>
    </>
  );
};

export default AITutor;
