import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { GraduationCap, User, Lock, ArrowRight } from 'lucide-react';

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
    <div className="min-h-screen flex items-center justify-center p-5" style={{ background: 'var(--bg-void)' }}>
      <div className="w-full max-w-[400px]">
        {/* Logo */}
        <div className="text-center mb-7">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-3" style={{ background: '#7c3aed' }}>
            <GraduationCap size={32} color="#fff" />
          </div>
          <h1 className="text-xl font-black mb-0.5" style={{ color: 'var(--text-primary)' }}>
            CodeZero Kids
          </h1>
          <p className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-georgian)' }}>
            ისწავლე პროგრამირება
          </p>
        </div>

        {/* Form */}
        <div className="rounded-2xl p-7" style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-light)',
        }}>
          <h2 className="text-base font-bold mb-5 text-center" style={{ 
            color: 'var(--text-primary)', 
            fontFamily: 'var(--font-georgian)' 
          }}>
            შესვლა
          </h2>

          <div className="grid gap-3.5">
            <div>
              <label className="block text-[0.7rem] font-semibold mb-1.5" style={{ 
                color: 'var(--text-muted)', fontFamily: 'var(--font-georgian)' 
              }}>
                მომხმარებლის სახელი
              </label>
              <div className="relative">
                <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-dim)' }} />
                <input
                  value={username}
                  onChange={e => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                  placeholder="username"
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm"
                  style={{
                    border: '1px solid var(--border-light)',
                    background: 'var(--bg-elevated)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                  }}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                />
              </div>
            </div>

            <div>
              <label className="block text-[0.7rem] font-semibold mb-1.5" style={{ 
                color: 'var(--text-muted)', fontFamily: 'var(--font-georgian)' 
              }}>
                პაროლი
              </label>
              <div className="relative">
                <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-dim)' }} />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm"
                  style={{
                    border: '1px solid var(--border-light)',
                    background: 'var(--bg-elevated)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                  }}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                />
              </div>
            </div>

            <button
              onClick={handleLogin}
              disabled={loading}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold mt-1"
              style={{
                background: '#7c3aed',
                border: 'none',
                color: '#fff',
                cursor: loading ? 'wait' : 'pointer',
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? 'მიმდინარეობს...' : (
                <>შესვლა <ArrowRight size={14} /></>
              )}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-5 space-y-2.5">
          <p className="text-[0.68rem]" style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-georgian)' }}>
            ანგარიშს მშობელი ქმნის მშობლის პანელიდან
          </p>
          <div className="flex items-center justify-center gap-2.5">
            <Link to="/" className="text-[0.7rem] px-3.5 py-1.5 rounded-lg" style={{
              color: 'var(--text-muted)',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-light)',
              textDecoration: 'none',
              fontFamily: 'var(--font-georgian)',
            }}>
              მთავარი
            </Link>
            <Link to="/parent" className="text-[0.7rem] px-3.5 py-1.5 rounded-lg" style={{
              color: '#7c3aed',
              background: 'rgba(124,58,237,0.06)',
              border: '1px solid rgba(124,58,237,0.15)',
              textDecoration: 'none',
              fontFamily: 'var(--font-georgian)',
            }}>
              მშობლის პანელი
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KidsLogin;
