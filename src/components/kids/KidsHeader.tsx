import { Link } from "react-router-dom";
import { ArrowLeft, Star, Zap } from "lucide-react";
import { type getKidsLevel } from "@/data/kidsLessons";

interface KidsHeaderProps {
  title: string;
  emoji?: string;
  showBack?: boolean;
  xp?: number;
  level?: ReturnType<typeof getKidsLevel>;
}

const KidsHeader = ({ title, showBack = true, xp = 0, level }: KidsHeaderProps) => {
  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 50,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 20px',
      background: 'rgba(13,13,20,0.92)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(124,58,237,0.1)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {showBack && (
          <Link to="/kids" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 34, height: 34, borderRadius: 10,
            background: 'rgba(124,58,237,0.06)',
            border: '1px solid rgba(124,58,237,0.12)',
            color: 'var(--text-secondary)', textDecoration: 'none',
          }}>
            <ArrowLeft size={16} />
          </Link>
        )}
        <h1 style={{
          fontSize: '0.95rem', fontWeight: 800,
          color: 'var(--text-primary)', margin: 0,
          fontFamily: 'var(--font-georgian)',
        }}>{title}</h1>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {level && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 4,
            background: 'rgba(124,58,237,0.06)',
            borderRadius: 8, padding: '5px 10px',
            border: '1px solid rgba(124,58,237,0.12)',
          }}>
            <Star size={11} style={{ color: 'var(--gold)' }} />
            <span style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--gold)' }}>
              Lv.{level.level}
            </span>
          </div>
        )}
        {xp > 0 && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 4,
            background: 'rgba(255,215,0,0.05)',
            borderRadius: 8, padding: '5px 10px',
            border: '1px solid rgba(255,215,0,0.1)',
          }}>
            <Zap size={11} style={{ color: 'var(--gold)' }} />
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--gold)' }}>{xp}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default KidsHeader;
