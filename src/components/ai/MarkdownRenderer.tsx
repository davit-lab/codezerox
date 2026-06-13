import { useEffect, useRef, memo } from 'react';
import Prism from 'prismjs';
// Only import commonly used languages that don't have complex dependencies
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-kotlin';
import 'prismjs/components/prism-swift';
import 'prismjs/components/prism-ruby';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer = memo(({ content }: MarkdownRendererProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      Prism.highlightAllUnder(containerRef.current);
    }
  }, [content]);

  const parseMarkdown = (text: string): string => {
    if (!text) return '';

    // Process code blocks first
    let result = text.replace(
      /```(\w+)?\n([\s\S]*?)```/g,
      (_, lang, code) => {
        const language = lang || 'javascript';
        const escapedCode = code
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .trim();
        return `<div class="code-block"><div class="code-header"><span class="code-lang">${language}</span><button class="code-copy" onclick="navigator.clipboard.writeText(this.parentElement.nextElementSibling.textContent)"><span class="material-symbols-rounded">content_copy</span></button></div><pre class="language-${language}"><code class="language-${language}">${escapedCode}</code></pre></div>`;
      }
    );

    // Inline code
    result = result.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');

    // Bold
    result = result.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

    // Italic
    result = result.replace(/\*([^*]+)\*/g, '<em>$1</em>');

    // Headers
    result = result.replace(/^### (.+)$/gm, '<h4 class="md-h4">$1</h4>');
    result = result.replace(/^## (.+)$/gm, '<h3 class="md-h3">$1</h3>');
    result = result.replace(/^# (.+)$/gm, '<h2 class="md-h2">$1</h2>');

    // Lists
    result = result.replace(/^\- (.+)$/gm, '<li class="md-li">$1</li>');
    result = result.replace(/^\d+\. (.+)$/gm, '<li class="md-li-num">$1</li>');

    // Line breaks (but not inside code blocks)
    result = result.replace(/\n(?![^<]*<\/pre>)/g, '<br>');

    return result;
  };

  return (
    <div
      ref={containerRef}
      className="markdown-content"
      dangerouslySetInnerHTML={{ __html: parseMarkdown(content) }}
    />
  );
});

MarkdownRenderer.displayName = 'MarkdownRenderer';

export default MarkdownRenderer;
