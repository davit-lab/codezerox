import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { GraduationCap, User, Lock, ArrowRight, Puzzle, Monitor, Star } from 'lucide-react';

const FLOATING_CODES = ['</>', 'CSS', 'JS', 'HTML', '{ }', '( )', '#id', '.class'];

const KidsLogin = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      toast.error('შეავსე ორივე ველი');
      return;
    }
    setLoading(true);
    const email = `${username.trim().toLowerCase()}@kids.codezero.internal`;
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error('სახელი ან პაროლი არასწორია');
      return;
    }
    navigate('/kids');
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', background: '#070709', overflow: 'hidden',
    }}>
      {/* LEFT: Hero */}
      <div style={{
        flex: 1, position: 'relative', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', padding: '40px 48px',
        background: 'linear-gradient(135deg, #0d0a1a 0%, #0e0b1f 40%, #070714 100%)',
        overflow: 'hidden',
      }}>
        {/* Purple glow */}
        <div style={{
          position: 'absolute', width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 70%)',
          top: '30%', left: '30%', transform: 'translate(-50%,-50%)',
          pointerEvents: 'none',
        }} />

        {/* Floating code snippets */}
        {FLOATING_CODES.map((code, i) => (
          <div key={code} style={{
            position: 'absolute',
            top: `${10 + (i * 11) % 80}%`,
            left: `${5 + (i * 17) % 85}%`,
            color: `rgba(${i % 2 === 0 ? '124,58,237' : '139,92,246'},0.25)`,
            fontSize: '0.85rem', fontFamily: 'monospace', fontWeight: 700,
            pointerEvents: 'none', userSelect: 'none',
            animation: `float ${3 + i * 0.4}s ease-in-out infinite alternate`,
          }}>
            {code}
          </div>
        ))}

        {/* Kid hacker silhouette */}
        <div style={{
          width: 220, height: 220, borderRadius: '50%', marginBottom: 28,
          background: 'radial-gradient(circle at 40% 35%, #1a0f35 0%, #0d0818 60%, transparent 100%)',
          border: '1px solid rgba(124,58,237,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative', flexShrink: 0,
        }}>
          <div style={{
            width: 180, height: 180, borderRadius: '50%',
            background: 'linear-gradient(145deg, #160d2e 0%, #0a0618 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: 18,
              background: 'linear-gradient(135deg, #7c3aed, #5b21b6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <GraduationCap size={34} color="#fff" />
            </div>
          </div>
          {/* Orbit dots */}
          {[0, 60, 120, 180, 240, 300].map((deg, i) => (
            <div key={i} style={{
              position: 'absolute', width: 6, height: 6, borderRadius: '50%',
              background: i % 2 === 0 ? '#7c3aed' : '#a78bfa',
              top: `${50 - 47 * Math.cos(deg * Math.PI / 180)}%`,
              left: `${50 + 47 * Math.sin(deg * Math.PI / 180)}%`,
              opacity: 0.6,
            }} />
          ))}
        </div>

        <h1 style={{
          fontSize: '1.9rem', fontWeight: 900, color: '#fff', marginBottom: 10, textAlign: 'center',
        }}>
          CodeZero Kids
        </h1>
        <p style={{
          color: 'rgba(255,255,255,0.45)', fontSize: '0.9rem', textAlign: 'center',
          maxWidth: 320, lineHeight: 1.6, marginBottom: 28,
        }}>
        </p>

        {/* Feature badges */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
          {[
            { icon: <Puzzle size={13} />, label: 'პაზლები' },
            { icon: <Monitor size={13} />, label: 'კოდ რედაქტირი' },
            { icon: <Star size={13} />, label: 'XP სისტება' },
          ].map(b => (
            <div key={b.label} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '7px 14px', borderRadius: 20,
              background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.2)',
              color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', fontWeight: 600,
            }}>
              <span style={{ color: '#a78bfa' }}>{b.icon}</span>
              {b.label}
            </div>
          ))}
        </div>

        <style>{`
          @keyframes float {
            from { transform: translateY(0px); }
            to { transform: translateY(-10px); }
          }
        `}</style>
      </div>

      {/* RIGHT: Login form */}
      <div style={{
        width: 420, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 36, background: '#0c0c10', borderLeft: '1px solid rgba(255,255,255,0.05)',
      }}>
        <div style={{ width: '100%' }}>
          <div style={{
            background: '#111116', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 20, padding: '32px 28px',
          }}>
            <h2 style={{
              fontSize: '1.2rem', fontWeight: 800, color: '#fff', marginBottom: 22, textAlign: 'center',
            }}>
              შესვლა
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: 'rgba(255,255,255,0.45)', marginBottom: 6 }}>
                  მომხმარებლის სახელი
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={14} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.25)' }} />
                  <input
                    value={username}
                    onChange={e => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                    placeholder="მაგ: nini2015"
                    style={{
                      width: '100%', paddingLeft: 38, paddingRight: 14, paddingTop: 11, paddingBottom: 11,
                      borderRadius: 12, background: '#18181f', border: '1px solid rgba(255,255,255,0.1)',
                      color: '#fff', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box',
                    }}
                    onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: 'rgba(255,255,255,0.45)', marginBottom: 6 }}>
                  პაროლი
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={14} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.25)' }} />
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="შეიყვანე პაროლი"
                    style={{
                      width: '100%', paddingLeft: 38, paddingRight: 14, paddingTop: 11, paddingBottom: 11,
                      borderRadius: 12, background: '#18181f', border: '1px solid rgba(255,255,255,0.1)',
                      color: '#fff', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box',
                    }}
                    onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  />
                </div>
              </div>

              <button
                onClick={handleLogin}
                disabled={loading}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  width: '100%', padding: '12px', borderRadius: 12, marginTop: 4,
                  background: '#7c3aed', border: 'none', color: '#fff',
                  cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.6 : 1,
                  fontSize: '0.95rem', fontWeight: 700,
                }}
              >
                {loading ? 'მიმდინარეობს...' : <><span>შესვლა</span> <ArrowRight size={15} /></>}
              </button>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: 18 }}>
            <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.25)', marginBottom: 10 }}>
              ანგარიშს მშობელი ქმნის მშობლის პანელიდან
            </p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
              <Link to="/" style={{
                fontSize: '0.78rem', padding: '7px 16px', borderRadius: 9,
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontWeight: 600,
              }}>
                მთავარი
              </Link>
              <Link to="/parent" style={{
                fontSize: '0.78rem', padding: '7px 16px', borderRadius: 9,
                background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)',
                color: '#a78bfa', textDecoration: 'none', fontWeight: 600,
              }}>
                მშობლის პანელი
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KidsLogin;
