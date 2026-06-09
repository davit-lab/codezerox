import { useEffect, useRef } from "react";

interface LivePreviewProps {
  html: string;
  css?: string;
  className?: string;
}

const LivePreview = ({ html, css, className = "" }: LivePreviewProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!iframeRef.current) return;
    const doc = iframeRef.current.contentDocument;
    if (!doc) return;

    doc.open();
    doc.write(`<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  * { box-sizing: border-box; }
  body {
    font-family: 'Noto Sans Georgian', system-ui, sans-serif;
    margin: 16px;
    background: white;
    color: #1e293b;
  }
  ${css || ''}
</style>
</head>
<body>${html}</body>
</html>`);
    doc.close();
  }, [html, css]);

  return (
    <iframe
      ref={iframeRef}
      className={className}
      style={{
        width: '100%', height: '100%',
        border: 'none', borderRadius: 10,
        background: 'white',
      }}
      sandbox="allow-scripts allow-same-origin"
      title="კოდის შედეგი"
    />
  );
};

export default LivePreview;
