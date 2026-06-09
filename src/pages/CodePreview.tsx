import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCodeSnippets } from '@/hooks/useCodeSnippets';
import Atmosphere from '@/components/layout/Atmosphere';
import Prism from 'prismjs';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-kotlin';
import 'prismjs/components/prism-swift';
import 'prismjs/components/prism-ruby';

interface Snippet {
  id: string;
  title: string;
  html_code: string;
  css_code: string;
  js_code: string;
  language: string;
  views: number;
  created_at: string;
  hide_code?: boolean;
}

const LANGUAGE_INFO: Record<string, { name: string; prismLang: string; icon: string }> = {
  'web': { name: 'Web', prismLang: 'html', icon: 'language' },
  'python': { name: 'Python', prismLang: 'python', icon: 'code' },
  'javascript': { name: 'JavaScript', prismLang: 'javascript', icon: 'javascript' },
  'typescript': { name: 'TypeScript', prismLang: 'typescript', icon: 'code' },
  'java': { name: 'Java', prismLang: 'java', icon: 'coffee' },
  'csharp': { name: 'C#', prismLang: 'csharp', icon: 'code' },
  'cpp': { name: 'C++', prismLang: 'cpp', icon: 'memory' },
  'go': { name: 'Go', prismLang: 'go', icon: 'code' },
  'rust': { name: 'Rust', prismLang: 'rust', icon: 'settings' },
  'ruby': { name: 'Ruby', prismLang: 'ruby', icon: 'diamond' },
  'php': { name: 'PHP', prismLang: 'php', icon: 'code' },
  'swift': { name: 'Swift', prismLang: 'swift', icon: 'phone_iphone' },
  'kotlin': { name: 'Kotlin', prismLang: 'kotlin', icon: 'android' },
  'sql': { name: 'SQL', prismLang: 'sql', icon: 'storage' },
};

const CodePreview = () => {
  const { id } = useParams<{ id: string }>();
  const { getSnippet } = useCodeSnippets();
  const [snippet, setSnippet] = useState<Snippet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCode, setShowCode] = useState(false);

  useEffect(() => {
    const fetchSnippet = async () => {
      if (!id) {
        setError('არასწორი ლინკი');
        setIsLoading(false);
        return;
      }

      const data = await getSnippet(id);
      if (data) {
        setSnippet(data as Snippet);
        // For non-web languages, show code by default (unless hidden)
        if (data.language !== 'web' && !(data as any).hide_code) {
          setShowCode(true);
        }
      } else {
        setError('კოდი ვერ მოიძებნა');
      }
      setIsLoading(false);
    };

    fetchSnippet();
  }, [id]);

  useEffect(() => {
    if (snippet && showCode) {
      Prism.highlightAll();
    }
  }, [snippet, showCode]);

  const getPreviewContent = () => {
    if (!snippet) return '';
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>${snippet.css_code}</style>
        </head>
        <body>
          ${snippet.html_code.replace(/<\/?html>|<\/?head>|<\/?body>|<!DOCTYPE html>/gi, '')}
          <script>${snippet.js_code}<\/script>
        </body>
      </html>
    `;
  };

  const handleCopyCode = () => {
    if (!snippet) return;
    const code = snippet.language === 'web' 
      ? `<!-- HTML -->\n${snippet.html_code}\n\n/* CSS */\n${snippet.css_code}\n\n// JavaScript\n${snippet.js_code}`
      : snippet.js_code;
    navigator.clipboard.writeText(code);
  };

  if (isLoading) {
    return (
      <>
        <Atmosphere />
        <div className="code-preview-loading">
          <div className="code-preview-spinner" />
          <p>იტვირთება...</p>
        </div>
      </>
    );
  }

  if (error || !snippet) {
    return (
      <>
        <Atmosphere />
        <div className="code-preview-error">
          <span className="material-symbols-rounded" style={{ fontSize: '4rem', color: 'var(--gold)' }}>
            error
          </span>
          <h1>{error || 'კოდი ვერ მოიძებნა'}</h1>
          <p>შესაძლოა ლინკი არასწორია ან კოდი წაშლილია.</p>
          <Link to="/playground" className="btn btn-primary">
            <span className="material-symbols-rounded">code</span>
            ახალი კოდის შექმნა
          </Link>
        </div>
      </>
    );
  }

  const langInfo = LANGUAGE_INFO[snippet.language] || LANGUAGE_INFO['web'];
  const isWebMode = snippet.language === 'web';
  const codeHidden = !!(snippet as any).hide_code;

  return (
    <>
      <Atmosphere />
      <main className="code-preview-page" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <header className="code-preview-header">
          <div className="code-preview-header-left">
            <Link to="/playground" className="code-preview-logo">
              <span className="material-symbols-rounded">code</span>
              <span>Playground</span>
            </Link>
            <div className="code-preview-divider" />
            <div className="code-preview-lang-badge">
              <span className="material-symbols-rounded">{langInfo.icon}</span>
              {langInfo.name}
            </div>
            <h1 className="code-preview-title">{snippet.title}</h1>
          </div>
          <div className="code-preview-header-right">
            <div className="code-preview-stat">
              <span className="material-symbols-rounded">visibility</span>
              <span>{snippet.views} ნახვა</span>
            </div>
            {isWebMode && !codeHidden && (
              <button 
                className={`btn btn-ghost ${showCode ? 'active' : ''}`}
                onClick={() => setShowCode(!showCode)}
              >
                <span className="material-symbols-rounded">
                  {showCode ? 'preview' : 'code'}
                </span>
                {showCode ? 'Preview' : 'Code'}
              </button>
            )}
            {!codeHidden && (
              <button className="btn btn-ghost" onClick={handleCopyCode}>
                <span className="material-symbols-rounded">content_copy</span>
                კოპირება
              </button>
            )}
            {!codeHidden && (
              <Link 
                to={`/playground?fork=${snippet.id}`} 
                className="btn btn-ghost"
              >
                <span className="material-symbols-rounded">fork_right</span>
                Fork
              </Link>
            )}
            <Link to="/playground" className="btn btn-primary">
              <span className="material-symbols-rounded">add</span>
              ახალი
            </Link>
          </div>
        </header>

        {/* Main Content */}
        <main className="code-preview-main" style={{ flex: 1, display: 'flex', minHeight: 'calc(100vh - 120px)' }}>
          {isWebMode && !showCode ? (
            <iframe
              srcDoc={getPreviewContent()}
              className="code-preview-iframe"
              title="Code Preview"
              sandbox="allow-scripts"
              style={{ width: '100%', height: '100%', minHeight: 'calc(100vh - 120px)', border: 'none', background: '#fff' }}
            />
          ) : (
            <div className="code-preview-code-view" style={{ width: '100%', overflow: 'auto' }}>
              {isWebMode ? (
                <div className="code-preview-multi-code">
                  <div className="code-preview-code-section">
                    <div className="code-preview-code-header">
                      <span>HTML</span>
                    </div>
                    <pre className="language-html"><code className="language-html">{snippet.html_code}</code></pre>
                  </div>
                  <div className="code-preview-code-section">
                    <div className="code-preview-code-header">
                      <span>CSS</span>
                    </div>
                    <pre className="language-css"><code className="language-css">{snippet.css_code}</code></pre>
                  </div>
                  <div className="code-preview-code-section">
                    <div className="code-preview-code-header">
                      <span>JavaScript</span>
                    </div>
                    <pre className="language-javascript"><code className="language-javascript">{snippet.js_code}</code></pre>
                  </div>
                </div>
              ) : (
                <div className="code-preview-single-code">
                  <pre className={`language-${langInfo.prismLang}`}>
                    <code className={`language-${langInfo.prismLang}`}>{snippet.js_code}</code>
                  </pre>
                </div>
              )}
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="code-preview-footer">
          <span>შექმნილია CodeZero Academy Playground-ით</span>
          <span>•</span>
          <span>{new Date(snippet.created_at).toLocaleDateString('ka-GE')}</span>
        </footer>
      </main>
    </>
  );
};

export default CodePreview;
