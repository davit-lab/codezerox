import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Atmosphere from "@/components/layout/Atmosphere";
import Header from "@/components/layout/Header";
import { useAuth } from "@/hooks/useAuth";
import { sendTransactionalEmail } from "@/lib/email";

const PaymentCancel = () => {
  const { user } = useAuth();
  const emailSentRef = useRef(false);

  useEffect(() => {
    if (user?.email && !emailSentRef.current) {
      emailSentRef.current = true;
      sendTransactionalEmail({
        templateName: 'payment-cancelled',
        recipientEmail: user.email,
        idempotencyKey: `payment-cancel-${user.id}-${Date.now()}`,
      }).catch((error) => {
        console.error('Failed to send payment cancelled email:', error);
      });
    }
  }, [user]);
  return (
    <>
      <Atmosphere />
      <Header />
      <main style={{ paddingTop: '140px', paddingBottom: '80px', minHeight: '100vh' }}>
        <div className="container" style={{ maxWidth: '600px', textAlign: 'center' }}>
          <div style={{ 
            background: 'var(--bg-card)', 
            border: '1px solid var(--border-subtle)', 
            borderRadius: 'var(--radius-xl)', 
            padding: '60px 40px' 
          }}>
            <span 
              className="material-symbols-rounded" 
              style={{ 
                fontSize: '80px', 
                color: 'var(--gold)', 
                marginBottom: '24px',
                display: 'block'
              }}
            >
              cancel
            </span>
            <h2 style={{ 
              fontFamily: 'var(--font-display)', 
              color: 'var(--text-white)', 
              fontSize: '2rem',
              marginBottom: '12px' 
            }}>
              გადახდა გაუქმებულია
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>
              გადახდა არ დასრულებულა. თქვენი კალათა შენახულია და შეგიძლიათ სცადოთ თავიდან.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/cart" className="btn btn-gold btn-lg">
                <span className="material-symbols-rounded">shopping_cart</span>
                კალათაში დაბრუნება
              </Link>
              <Link to="/books" className="btn btn-ghost">
                <span className="material-symbols-rounded">library_books</span>
                კატალოგი
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default PaymentCancel;
