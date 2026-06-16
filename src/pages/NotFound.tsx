import { useLocation, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Terminal, AlertTriangle, Home, ArrowLeft } from "lucide-react";

const GLITCH_TEXTS = [
  "ACCESS_DENIED",
  "PAGE_NOT_FOUND",
  "404_ERROR",
  "UNKNOWN_ROUTE",
];

const NotFound = () => {
  const location = useLocation();
  const [glitchText, setGlitchText] = useState(GLITCH_TEXTS[0]);
  const [glitching, setGlitching] = useState(false);

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  useEffect(() => {
    const interval = setInterval(() => {
      setGlitching(true);
      setTimeout(() => {
        setGlitchText(GLITCH_TEXTS[Math.floor(Math.random() * GLITCH_TEXTS.length)]);
        setGlitching(false);
      }, 150);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const [typedPath, setTypedPath] = useState("");
  useEffect(() => {
    const path = location.pathname;
    let i = 0;
    const timer = setInterval(() => {
      setTypedPath(path.slice(0, i));
      i++;
      if (i > path.length) clearInterval(timer);
    }, 50);
    return () => clearInterval(timer);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-[#0c0a09] text-white relative overflow-hidden flex items-center justify-center">
      {/* Matrix rain background */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#5F13CA" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Scanlines */}
      <div
        className="absolute inset-0 pointer-events-none z-[1]"
        style={{
          background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(95,19,202,0.03) 2px, rgba(95,19,202,0.03) 4px)",
        }}
      />

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none z-[2]"
        style={{
          background: "radial-gradient(ellipse at center, transparent 0%, rgba(12,10,9,0.8) 100%)",
        }}
      />

      <div className="relative z-10 text-center px-6 max-w-lg">
        {/* Terminal header */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <Terminal className="w-4 h-4 text-[#5F13CA]" />
          <span className="font-mono text-xs text-[#5F13CA] tracking-widest">SYSTEM_ERROR.exe</span>
        </div>

        {/* Glitching 404 */}
        <div className="relative mb-4">
          <h1
            className={`font-mono text-8xl font-black tracking-tighter transition-all duration-150 ${
              glitching ? "text-red-500 translate-x-1" : "text-white"
            }`}
            style={{
              textShadow: glitching
                ? "2px 0 #ff0000, -2px 0 #00ff00"
                : "0 0 40px rgba(95,19,202,0.3)",
            }}
          >
            404
          </h1>
        </div>

        {/* Glitch text */}
        <div className="h-8 mb-6">
          <p
            className={`font-mono text-sm tracking-[0.3em] transition-all duration-150 ${
              glitching ? "text-red-400 skew-x-6" : "text-[#5F13CA]"
            }`}
          >
            {glitchText}
          </p>
        </div>

        {/* Terminal-style path display */}
        <div className="bg-black/40 border border-white/10 rounded-lg p-4 mb-8 text-left font-mono text-sm">
          <div className="flex items-center gap-2 text-stone-500 text-xs mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
            <span className="ml-2">terminal</span>
          </div>
          <div className="text-stone-400">
            <span className="text-emerald-500">root@codezero:~$</span>{" "}
            <span className="text-white">find</span>{" "}
            <span className="text-yellow-400">{typedPath}</span>
            <span className="animate-pulse">_</span>
          </div>
          <div className="mt-2 text-red-400">
            Error: Route not found in system registry.
          </div>
          <div className="mt-1 text-stone-500">
            Hint: Use <span className="text-[#5F13CA]">navigate</span> to return to safe zone.
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#5F13CA] text-white font-mono font-semibold rounded-lg transition-all hover:shadow-lg hover:shadow-[#5F13CA]/30 hover:-translate-y-0.5 active:translate-y-0"
          >
            <Home className="w-4 h-4" />
            RETURN_HOME
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 text-stone-300 font-mono font-semibold rounded-lg transition-all hover:bg-white/10 hover:-translate-y-0.5 active:translate-y-0"
          >
            <ArrowLeft className="w-4 h-4" />
            GO_BACK
          </button>
        </div>

        {/* Warning badge */}
        <div className="mt-8 inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-full">
          <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
          <span className="font-mono text-[10px] text-red-400 tracking-wider">
            SECURITY LEVEL: RESTRICTED
          </span>
        </div>
      </div>

      {/* Corner decorations */}
      <div className="absolute top-6 left-6 font-mono text-[10px] text-stone-700">
        <p>ERR_CODE: 0x404</p>
        <p>STATUS: NOT_FOUND</p>
      </div>
      <div className="absolute bottom-6 right-6 font-mono text-[10px] text-stone-700 text-right">
        <p>SYS: CODEZERO_OS</p>
        <p>VER: 2.0.1</p>
      </div>
    </div>
  );
};

export default NotFound;
