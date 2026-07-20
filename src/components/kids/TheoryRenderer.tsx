/**
 * Renders theory text with proper formatting:
 * - Newlines become visual line breaks
 * - `code` becomes styled code spans
 * - Lines starting with • or numbered get list styling
 * - Headers detected by bold/title patterns
 */
const TheoryRenderer = ({ text }: { text: string }) => {
  const lines = text.split('\n');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {lines.map((line, i) => {
        let trimmed = line.trim();
        if (!trimmed) return <div key={i} style={{ height: 6 }} />;

        // Strip leading emojis from content
        trimmed = trimmed.replace(/^[\u{1F300}-\u{1FAD6}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F900}-\u{1F9FF}\u{200D}\u{20E3}\u{E0020}-\u{E007F}\u{2702}-\u{27B0}\u{1F1E0}-\u{1F1FF}️⃣]+\s*/gu, '');

        if (!trimmed) return null;

        // Format inline code
        const formatLine = (str: string) => {
          const parts = str.split(/(`[^`]+`)/g);
          return parts.map((part, j) => {
            if (part.startsWith('`') && part.endsWith('`')) {
              return (
                <code key={j} style={{
                  background: 'var(--bg-elevated)',
                  padding: '1px 6px',
                  borderRadius: 4,
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.82em',
                  color: '#7c3aed',
                }}>
                  {part.slice(1, -1)}
                </code>
              );
            }
            return <span key={j}>{part}</span>;
          });
        };

        const isBullet = trimmed.startsWith('•') || trimmed.startsWith('- ');
        const isNumbered = /^\d+[\.\)]\s/.test(trimmed);
        // Detect headers: short lines without bullets, often ending with : or are the first line
        const isHeader = !isBullet && !isNumbered && trimmed.length < 80 && (
          trimmed.endsWith(':') || 
          trimmed.endsWith('?') || 
          (i === 0) ||
          (i > 0 && !lines[i-1]?.trim())
        ) && !trimmed.startsWith('<');

        if (isHeader) {
          return (
            <p key={i} style={{
              color: 'var(--text-primary)',
              fontWeight: 700,
              fontSize: '0.88rem',
              marginTop: i > 0 ? 4 : 0,
              lineHeight: 1.5,
            }}>
              {formatLine(trimmed)}
            </p>
          );
        }

        if (isBullet) {
          const content = trimmed.replace(/^[•\-]\s*/, '');
          return (
            <p key={i} style={{
              color: 'var(--text-secondary)',
              paddingLeft: 14,
              fontSize: '0.84rem',
              lineHeight: 1.6,
              position: 'relative',
            }}>
              <span style={{ position: 'absolute', left: 0, color: 'var(--text-dim)' }}>·</span>
              {formatLine(content)}
            </p>
          );
        }

        if (isNumbered) {
          return (
            <p key={i} style={{
              color: 'var(--text-secondary)',
              paddingLeft: 6,
              fontSize: '0.84rem',
              lineHeight: 1.6,
            }}>
              {formatLine(trimmed)}
            </p>
          );
        }

        return (
          <p key={i} style={{
            color: 'var(--text-secondary)',
            fontSize: '0.84rem',
            lineHeight: 1.65,
          }}>
            {formatLine(trimmed)}
          </p>
        );
      })}
    </div>
  );
};

export default TheoryRenderer;
