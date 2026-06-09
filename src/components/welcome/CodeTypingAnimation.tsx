import { useState, useEffect } from 'react';

const codeLines = [
  'import { createApp } from "better-programmer";',
  '',
  'const app = createApp({',
  '  name: "CodeZero Academy",',
  '  version: "2.0",',
  '  language: "Georgian",',
  '});',
  '',
  'app.features = [',
  '  "AI Tutor",',
  '  "Code Playground",',
  '  "Premium Books",',
  '  "Community Hub",',
  '];',
  '',
  'app.init().then(() => {',
  '  console.log("🚀 Welcome to CodeZero Academy!");',
  '  app.start();',
  '});',
];

const CodeTypingAnimation = ({ onComplete }: { onComplete: () => void }) => {
  const [displayedLines, setDisplayedLines] = useState<string[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    if (currentLineIndex >= codeLines.length) {
      setTimeout(() => {
        setIsFading(true);
        setTimeout(() => {
          setIsComplete(true);
          onComplete();
        }, 800);
      }, 600);
      return;
    }

    const currentLine = codeLines[currentLineIndex];
    
    if (currentCharIndex <= currentLine.length) {
      const timeout = setTimeout(() => {
        setDisplayedLines(prev => {
          const newLines = [...prev];
          newLines[currentLineIndex] = currentLine.slice(0, currentCharIndex);
          return newLines;
        });
        setCurrentCharIndex(prev => prev + 1);
      }, currentLine === '' ? 50 : 25);
      
      return () => clearTimeout(timeout);
    } else {
      setCurrentLineIndex(prev => prev + 1);
      setCurrentCharIndex(0);
    }
  }, [currentLineIndex, currentCharIndex, onComplete]);

  if (isComplete) return null;

  return (
    <div 
      className={`fixed top-0 left-0 w-screen h-screen z-[9999] flex items-center justify-center transition-opacity duration-800 ${isFading ? 'opacity-0' : 'opacity-100'}`}
      style={{ 
        background: 'linear-gradient(135deg, #0a0a0f 0%, #0d0d14 50%, #0a0a0f 100%)',
        minHeight: '100vh',
        minWidth: '100vw',
      }}
    >
      {/* Background Grid Effect */}
      <div 
        className="absolute top-0 left-0 w-full h-full opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(95, 19, 202, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(95, 19, 202, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          animation: 'gridMove 20s linear infinite',
        }}
      />

      {/* Floating Particles */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full"
            style={{
              background: `hsl(var(--primary) / ${0.3 + Math.random() * 0.4})`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Glow Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl" 
        style={{ background: 'hsl(var(--primary))' }} 
      />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-15 blur-3xl" 
        style={{ background: 'hsl(var(--gold))' }} 
      />

      {/* Code Container */}
      <div className="relative max-w-3xl w-full mx-4">
        {/* Terminal Header */}
        <div 
          className="flex items-center gap-2 px-4 py-3 rounded-t-xl border-b"
          style={{ 
            background: 'hsl(var(--bg-elevated))',
            borderColor: 'hsl(var(--border-subtle))',
          }}
        >
          <div className="flex gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500" />
            <span className="w-3 h-3 rounded-full bg-yellow-500" />
            <span className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <span className="ml-4 text-sm font-mono" style={{ color: 'hsl(var(--text-muted))' }}>
            better-programmer.ts
          </span>
        </div>

        {/* Code Area */}
        <div 
          className="p-6 rounded-b-xl font-mono text-sm leading-relaxed overflow-hidden"
          style={{ 
            background: 'hsl(var(--bg-card) / 0.9)',
            backdropFilter: 'blur(20px)',
            border: '1px solid hsl(var(--border-subtle))',
            borderTop: 'none',
            minHeight: '400px',
          }}
        >
          {displayedLines.map((line, index) => (
            <div key={index} className="flex">
              <span 
                className="w-8 text-right mr-4 select-none"
                style={{ color: 'hsl(var(--text-muted) / 0.5)' }}
              >
                {index + 1}
              </span>
              <span>
                <SyntaxHighlight code={line} />
                {index === currentLineIndex && (
                  <span 
                    className="inline-block w-2 h-5 ml-0.5 animate-pulse"
                    style={{ background: 'hsl(var(--primary))' }}
                  />
                )}
              </span>
            </div>
          ))}
        </div>

        {/* Loading Text */}
        <div className="mt-6 text-center">
          <p 
            className="text-lg font-medium animate-pulse"
            style={{ color: 'hsl(var(--text-muted))' }}
          >
            იტვირთება...
          </p>
        </div>
      </div>

      {/* Skip Button */}
      <button
        onClick={() => {
          setIsFading(true);
          setTimeout(() => {
            setIsComplete(true);
            onComplete();
          }, 300);
        }}
        className="absolute bottom-8 right-8 px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 hover:scale-105 flex items-center gap-2"
        style={{
          background: 'hsl(var(--bg-elevated) / 0.8)',
          border: '1px solid hsl(var(--border-subtle))',
          color: 'hsl(var(--text-secondary))',
          backdropFilter: 'blur(10px)',
        }}
      >
        <span>გამოტოვება</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="5 4 15 12 5 20 5 4" />
          <line x1="19" y1="5" x2="19" y2="19" />
        </svg>
      </button>

      <style>{`
        @keyframes gridMove {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.5; }
          50% { transform: translateY(-20px) scale(1.2); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

const SyntaxHighlight = ({ code }: { code: string }) => {
  const highlightCode = (text: string) => {
    const keywords = ['import', 'from', 'const', 'app', 'then', 'console', 'log'];
    const strings = /"[^"]*"/g;
    const comments = /\/\/.*/g;
    
    let result = text;
    
    // Highlight strings
    result = result.replace(strings, (match) => 
      `<span style="color: hsl(var(--gold))">${match}</span>`
    );
    
    // Highlight keywords
    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'g');
      result = result.replace(regex, 
        `<span style="color: hsl(var(--primary))">${keyword}</span>`
      );
    });

    // Highlight brackets and special chars
    result = result.replace(/[{}[\]()]/g, (match) => 
      `<span style="color: hsl(var(--text-muted))">${match}</span>`
    );

    return result;
  };

  return (
    <span 
      style={{ color: 'hsl(var(--text-secondary))' }}
      dangerouslySetInnerHTML={{ __html: highlightCode(code) }} 
    />
  );
};

export default CodeTypingAnimation;
