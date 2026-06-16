import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import SEOHead from "@/components/SEOHead";

import { Eye, EyeOff, Check, ChevronDown } from "lucide-react";
type AuthMode = "login" | "register" | "forgot" | "verify-code" | "new-password";

const Auth = () => {
  const [stats, setStats] = useState({ books: 0, users: 0, courses: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      const [booksRes, usersRes, coursesRes] = await Promise.all([
        supabase.from("books").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("courses").select("id", { count: "exact", head: true }).eq("is_published", true),
      ]);
      setStats({
        books: booksRes.count || 0,
        users: usersRes.count || 0,
        courses: coursesRes.count || 0,
      });
    };
    fetchStats();
  }, []);
  const [mode, setMode] = useState<AuthMode>("register");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  
  const [emailError, setEmailError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const navigate = useNavigate();
  const { signIn, signUp, user, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && user) {
      navigate("/");
    }
  }, [user, authLoading, navigate]);

  // Handle OAuth callback - Supabase getSession() auto-exchanges PKCE code
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    if (query.get('code') || window.location.hash.includes('access_token')) {
      // Clean URL after Supabase auth handler processes it
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    }
  }, []);

  // Custom cursor effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (cursorRef.current) {
        cursorRef.current.style.left = `${e.clientX}px`;
        cursorRef.current.style.top = `${e.clientY}px`;
      }
      if (cursorDotRef.current) {
        cursorDotRef.current.style.left = `${e.clientX}px`;
        cursorDotRef.current.style.top = `${e.clientY}px`;
      }
    };

    const handleMouseEnter = () => {
      cursorRef.current?.classList.add("--hover");
    };
    const handleMouseLeave = () => {
      cursorRef.current?.classList.remove("--hover");
    };

    document.addEventListener("mousemove", handleMouseMove);
    
    const interactiveElements = document.querySelectorAll("a, button, input, select, .cursor-hover");
    interactiveElements.forEach(el => {
      el.addEventListener("mouseenter", handleMouseEnter);
      el.addEventListener("mouseleave", handleMouseLeave);
    });

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      interactiveElements.forEach(el => {
        el.removeEventListener("mouseenter", handleMouseEnter);
        el.removeEventListener("mouseleave", handleMouseLeave);
      });
    };
  }, [mode]);

  // Canvas background animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: { x: number; y: number; vx: number; vy: number; radius: number }[] = [];
    const particleCount = 50;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 2 + 1
      });
    }

    const animate = () => {
      ctx.fillStyle = "rgba(12, 10, 9, 0.1)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(95, 19, 202, 0.3)";
        ctx.fill();
      });

      particles.forEach((p1, i) => {
        particles.slice(i + 1).forEach(p2 => {
          const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(95, 19, 202, ${0.1 * (1 - dist / 150)})`;
            ctx.stroke();
          }
        });
      });

      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const validateEmail = async (emailToValidate: string): Promise<boolean> => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailToValidate)) {
      setEmailError("არასწორი ელფოსტის ფორმატი");
      return false;
    }

    try {
      const { data, error } = await supabase.functions.invoke("validate-email", {
        body: { email: emailToValidate },
      });

      if (error) {
        console.error("Email validation error:", error);
        return true;
      }

      if (!data.valid) {
        if (data.reason === "Email domain does not exist") {
          setEmailError("ელფოსტის დომეინი არ არსებობს");
        } else if (data.reason === "Disposable email addresses are not allowed") {
          setEmailError("დროებითი ელფოსტები არ არის დაშვებული");
        } else {
          setEmailError("არასწორი ელფოსტა");
        }
        return false;
      }

      setEmailError("");
      return true;
    } catch (err) {
      console.error("Email validation exception:", err);
      return true;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "login") {
        const { error } = await signIn(email, password);
        if (error) {
          toast.error(error.message || "შესვლა ვერ მოხერხდა");
        } else {
          toast.success("წარმატებით შეხვედით!");
        }
      } else if (mode === "register") {
        if (!fullName.trim()) {
          toast.error("გთხოვთ შეიყვანოთ სახელი");
          setLoading(false);
          return;
        }

        if (!agreeTerms) {
          toast.error("გთხოვთ დაეთანხმოთ წესებსა და პირობებს");
          setLoading(false);
          return;
        }

        const isValidEmail = await validateEmail(email);
        if (!isValidEmail) {
          toast.error(emailError || "გთხოვთ შეიყვანოთ სწორი ელფოსტა");
          setLoading(false);
          return;
        }

        const displayName = lastName ? `${fullName} ${lastName}` : fullName;
        const { error, needsEmailVerification } = await signUp(email, password, displayName);
        if (error) {
          if (error.message.includes("already registered")) {
            toast.error("ეს ელფოსტა უკვე რეგისტრირებულია");
          } else {
            toast.error(error.message || "რეგისტრაცია ვერ მოხერხდა");
          }
        } else {
          if (needsEmailVerification) {
            toast.success("ანგარიში შეიქმნა — დაადასტურე ელფოსტა და შემდეგ შეხვდი სისტემაში");
            setMode("login");
            setPassword("");
          } else {
            toast.success("წარმატებით დარეგისტრირდით!");
            navigate("/");
          }
        }
      }
    } catch (err) {
      toast.error("მოხდა შეცდომა");
    } finally {
      setLoading(false);
    }
  };


  const getPasswordStrength = (pwd: string) => {
    let strength = 0;
    if (pwd.length >= 6) strength++;
    if (pwd.length >= 10) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[^A-Za-z0-9]/.test(pwd)) strength++;
    return Math.min(strength, 4);
  };

  const passwordStrength = getPasswordStrength(password);
  const strengthColors = ["r", "r", "y", "l", "g"];
  const strengthTexts = ["", "სუსტი", "საშუალო", "კარგი", "ძლიერი"];

  return (
    <>
      <SEOHead title="ავტორიზაცია — CodeZero Academy" description="შედით ან დარეგისტრირდით CodeZero Academy-ში" path="/auth" />
      <div className="auth-page">
      <div ref={cursorRef} className="cursor hidden lg:block" />
      <div ref={cursorDotRef} className="cursor-dot hidden lg:block" />
      <canvas ref={canvasRef} className="fixed inset-0 z-0" />
      <div className="grain" />

      <div className="page relative z-10 min-h-screen grid grid-cols-1 lg:grid-cols-2">
        {/* მარცხენა მხარე */}
        <div className="typo-side hidden lg:flex flex-col justify-between p-8 xl:p-12 relative overflow-hidden">
          <nav className="nav relative z-10">
            <a href="/" className="logo group">
              <div className="logo__box w-10 h-10 bg-[#5F13CA] rounded-xl flex items-center justify-center transform -rotate-6 group-hover:rotate-0 group-hover:scale-105 transition-transform duration-400">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="16 18 22 12 16 6" />
                  <polyline points="8 6 2 12 8 18" />
                </svg>
              </div>
              <span className="logo__name font-serif text-2xl tracking-tight text-white">CodeZero Academy</span>
            </a>
            
            <ul className="nav-pills flex gap-2">
              <li><a href="/books" className="text-xs text-stone-500 hover:text-stone-300 hover:border-stone-700 hover:bg-white/5 px-4 py-2 rounded-full border border-transparent transition-all font-medium">წიგნები</a></li>
              <li><a href="/courses" className="text-xs text-stone-500 hover:text-stone-300 hover:border-stone-700 hover:bg-white/5 px-4 py-2 rounded-full border border-transparent transition-all font-medium">კურსები</a></li>
              <li><a href="/hub" className="text-xs text-stone-500 hover:text-stone-300 hover:border-stone-700 hover:bg-white/5 px-4 py-2 rounded-full border border-transparent transition-all font-medium">ჰაბი</a></li>
            </ul>
          </nav>

          <div className="hero-text my-auto py-8 relative z-10">
            <div className="hero-text__line font-serif text-6xl xl:text-7xl leading-[0.92] tracking-tight overflow-hidden">
              <span className="inline-block animate-text-reveal" style={{ animationDelay: "0.1s" }}>ისწავლე</span>
            </div>
            <div className="hero-text__line font-serif text-6xl xl:text-7xl leading-[0.92] tracking-tight overflow-hidden">
              <span className="inline-block animate-text-reveal" style={{ animationDelay: "0.2s" }}>პროგრამირება</span>
            </div>
            <div className="hero-text__line font-serif text-6xl xl:text-7xl leading-[0.92] tracking-tight overflow-hidden">
              <span className="inline-block animate-text-reveal text-[#5F13CA] italic" style={{ animationDelay: "0.3s" }}>ქართულად.</span>
            </div>
            
            <p className="hero-sub mt-10 text-base xl:text-lg text-stone-500 max-w-md leading-relaxed opacity-0 animate-fade-up" style={{ animationDelay: "0.6s" }}>
              პირველი ქართული პლატფორმა პროგრამისტებისთვის. წიგნები, კურსები, AI მენტორი და დეველოპერთა საზოგადოება — ყველაფერი ერთ სივრცეში.
            </p>
          </div>

          <div className="typo-bottom relative z-10 flex items-center justify-between pt-8 border-t border-white/5 opacity-0 animate-fade-up" style={{ animationDelay: "1s" }}>
            <div className="stats flex gap-12">
              <div>
                <div className="stat__val font-serif text-3xl tracking-tight text-white">{stats.users}+</div>
                <div className="stat__label text-xs text-stone-500 uppercase tracking-wider mt-1">მომხმარებელი</div>
              </div>
              <div>
                <div className="stat__val font-serif text-3xl tracking-tight text-white">{stats.books}</div>
                <div className="stat__label text-xs text-stone-500 uppercase tracking-wider mt-1">წიგნი</div>
              </div>
              <div>
                <div className="stat__val font-serif text-3xl tracking-tight text-white">{stats.courses}</div>
                <div className="stat__label text-xs text-stone-500 uppercase tracking-wider mt-1">კურსი</div>
              </div>
            </div>

            <div className="social-proof flex items-center gap-3">
              <div className="avatar-stack flex">
                <div className="w-9 h-9 rounded-full border-2 border-black bg-violet-600 flex items-center justify-center text-xs font-semibold text-white z-[4]">გ.კ</div>
                <div className="w-9 h-9 rounded-full border-2 border-black bg-cyan-600 flex items-center justify-center text-xs font-semibold text-white -ml-2.5 z-[3]">ნ.ბ</div>
                <div className="w-9 h-9 rounded-full border-2 border-black bg-pink-700 flex items-center justify-center text-xs font-semibold text-white -ml-2.5 z-[2]">ა.თ</div>
                <div className="w-9 h-9 rounded-full border-2 border-black bg-[#5F13CA] flex items-center justify-center text-xs font-semibold text-white -ml-2.5 z-[1]">+</div>
              </div>
              <div className="text-xs text-stone-400 leading-snug">
                <strong className="text-white font-semibold">ახალი წევრები</strong><br />შემოუერთდნენ
              </div>
            </div>
          </div>
        </div>

        {/* მარჯვენა მხარე - ფორმა */}
        <div className="form-side flex items-center justify-center p-6 lg:p-12 min-h-screen">
          <div className="auth-card w-full max-w-[460px] bg-stone-900/60 backdrop-blur-xl border border-white/5 rounded-3xl p-8 relative opacity-0 animate-card-in shadow-2xl">
            <div className="absolute -top-px right-16 w-20 h-0.5 bg-[#5F13CA] rounded-b" />
            
            <div className="card-header mb-8">
              <div className="font-mono text-xs text-[#5F13CA] mb-3 tracking-wider opacity-0 animate-fade-up" style={{ animationDelay: "0.7s" }}>
                // {mode === "register" ? "ანგარიშის_შექმნა" : mode === "login" ? "შესვლა" : mode === "forgot" ? "პაროლის_აღდგენა" : mode === "verify-code" ? "კოდის_შეყვანა" : "ახალი_პაროლი"}
              </div>
              <h1 className="font-serif text-3xl tracking-tight text-white opacity-0 animate-fade-up" style={{ animationDelay: "0.8s" }}>
                {mode === "register" ? "შექმენი ანგარიში" : mode === "login" ? "კეთილი იყოს შენი დაბრუნება" : mode === "forgot" ? "პაროლის აღდგენა" : mode === "verify-code" ? "კოდის შეყვანა" : "ახალი პაროლი"}
              </h1>
              <p className="text-sm text-stone-500 mt-2 opacity-0 animate-fade-up" style={{ animationDelay: "0.9s" }}>
                {mode === "register" ? "რეგისტრაცია მხოლოდ 30 წამს წაიღებს." : mode === "login" ? "შედი შენს ანგარიშზე" : mode === "forgot" ? "შეიყვანე ელფოსტა კოდის მისაღებად" : mode === "verify-code" ? "შეამოწმე ელფოსტა და შეიყვანე კოდი" : "დააყენე ახალი პაროლი"}
              </p>
            </div>

            {(mode === "login" || mode === "register") && (
              <div className="tabs inline-flex bg-white/5 border border-white/5 rounded-xl p-1 mb-7 relative opacity-0 animate-fade-up" style={{ animationDelay: "1s" }}>
                <div className={`tabs__bg absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] bg-[#5F13CA] rounded-lg transition-transform duration-500 ease-out shadow-lg shadow-[#5F13CA]/25 ${mode === "login" ? "translate-x-full" : ""}`} />
                <button
                  type="button"
                  onClick={() => setMode("register")}
                  className={`tab relative z-10 px-7 py-2.5 text-sm font-semibold transition-colors ${mode === "register" ? "text-white" : "text-stone-500 hover:text-stone-300"}`}
                >
                  რეგისტრაცია
                </button>
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className={`tab relative z-10 px-7 py-2.5 text-sm font-semibold transition-colors ${mode === "login" ? "text-white" : "text-stone-500 hover:text-stone-300"}`}
                >
                  შესვლა
                </button>
              </div>
            )}

            <div className="fields opacity-0 animate-fade-up" style={{ animationDelay: "1.1s" }}>
              {/* რეგისტრაციის ფორმა */}
              {mode === "register" && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="f">
                      <label className="block text-xs font-semibold text-stone-400 mb-1.5 tracking-wide">სახელი</label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="გიორგი"
                        className="w-full px-3.5 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-stone-700 text-sm focus:border-[#5F13CA] focus:bg-[#5F13CA]/5 focus:ring-2 focus:ring-[#5F13CA]/10 outline-none transition-all"
                        required
                      />
                    </div>
                    <div className="f">
                      <label className="block text-xs font-semibold text-stone-400 mb-1.5 tracking-wide">გვარი</label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="კაპანაძე"
                        className="w-full px-3.5 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-stone-700 text-sm focus:border-[#5F13CA] focus:bg-[#5F13CA]/5 focus:ring-2 focus:ring-[#5F13CA]/10 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="f">
                    <label className="block text-xs font-semibold text-stone-400 mb-1.5 tracking-wide">ელფოსტა</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setEmailError(""); }}
                      placeholder="giorgi@example.com"
                      className={`w-full px-3.5 py-3 bg-white/5 border rounded-xl text-white placeholder-stone-700 text-sm focus:border-[#5F13CA] focus:bg-[#5F13CA]/5 focus:ring-2 focus:ring-[#5F13CA]/10 outline-none transition-all ${emailError ? "border-red-500" : "border-white/10"}`}
                      required
                    />
                    {emailError && <p className="text-xs text-red-500 mt-1">{emailError}</p>}
                  </div>

                  <div className="f">
                    <label className="block text-xs font-semibold text-stone-400 mb-1.5 tracking-wide">მომხმარებლის სახელი</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-700 text-sm">@</span>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="giorgik"
                        className="w-full pl-8 pr-3.5 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-stone-700 text-sm focus:border-[#5F13CA] focus:bg-[#5F13CA]/5 focus:ring-2 focus:ring-[#5F13CA]/10 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="f">
                    <label className="block text-xs font-semibold text-stone-400 mb-1.5 tracking-wide">
                      სპეციალობა <span className="text-stone-700 font-normal text-[10px]">(არასავალდებულო)</span>
                    </label>
                    <div className="relative">
                      <select
                        value={specialty}
                        onChange={(e) => setSpecialty(e.target.value)}
                        className="w-full px-3.5 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:border-[#5F13CA] focus:bg-[#5F13CA]/5 focus:ring-2 focus:ring-[#5F13CA]/10 outline-none transition-all appearance-none cursor-pointer pr-10"
                      >
                        <option value="" className="bg-stone-900">აირჩიე მიმართულება</option>
                        <option value="frontend" className="bg-stone-900">Frontend</option>
                        <option value="backend" className="bg-stone-900">Backend</option>
                        <option value="fullstack" className="bg-stone-900">Full-Stack</option>
                        <option value="devops" className="bg-stone-900">DevOps</option>
                        <option value="mobile" className="bg-stone-900">მობილური</option>
                        <option value="ml" className="bg-stone-900">ML / Data</option>
                        <option value="security" className="bg-stone-900">კიბერუსაფრთხოება</option>
                        <option value="student" className="bg-stone-900">სტუდენტი</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-700 pointer-events-none" />
                    </div>
                  </div>

                  <div className="f">
                    <label className="block text-xs font-semibold text-stone-400 mb-1.5 tracking-wide">პაროლი</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="მინიმუმ 6 სიმბოლო"
                        className="w-full px-3.5 py-3 pr-10 bg-white/5 border border-white/10 rounded-xl text-white placeholder-stone-700 text-sm focus:border-[#5F13CA] focus:bg-[#5F13CA]/5 focus:ring-2 focus:ring-[#5F13CA]/10 outline-none transition-all"
                        minLength={6}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-700 hover:text-[#5F13CA] transition-colors p-1"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {password && (
                      <>
                        <div className="meter flex gap-1 mt-2">
                          {[0, 1, 2, 3].map((i) => (
                            <i key={i} className={`h-0.5 flex-1 rounded ${i < passwordStrength ? strengthColors[passwordStrength] === "r" ? "bg-red-500" : strengthColors[passwordStrength] === "y" ? "bg-yellow-500" : strengthColors[passwordStrength] === "l" ? "bg-lime-500" : "bg-emerald-500" : "bg-white/10"}`} />
                          ))}
                        </div>
                        <p className="text-[10px] text-stone-700 mt-1 font-medium">{strengthTexts[passwordStrength]}</p>
                      </>
                    )}
                  </div>

                  <div className="check flex items-start gap-3 my-5">
                    <div className="check-box w-5 h-5 shrink-0 relative mt-0.5">
                      <input
                        type="checkbox"
                        checked={agreeTerms}
                        onChange={(e) => setAgreeTerms(e.target.checked)}
                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                      />
                      <div className={`check-vis absolute inset-0 border-2 rounded-md flex items-center justify-center transition-all ${agreeTerms ? "bg-[#5F13CA] border-[#5F13CA] shadow-lg shadow-[#5F13CA]/25" : "border-white/10 bg-white/5"}`}>
                        <Check className={`w-3 h-3 text-white transition-all ${agreeTerms ? "opacity-100 scale-100" : "opacity-0 scale-0"}`} />
                      </div>
                    </div>
                    <span className="text-xs text-stone-500 leading-relaxed">
                      ვეთანხმები <a href="/terms" target="_blank" className="text-[#8B5CF6] hover:border-[#8B5CF6] border-b border-[#8B5CF6]/20 transition-colors">წესებსა და პირობებს</a> და <a href="/privacy" target="_blank" className="text-[#8B5CF6] hover:border-[#8B5CF6] border-b border-[#8B5CF6]/20 transition-colors">კონფიდენციალურობის პოლიტიკას</a>
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="submit w-full py-3.5 bg-[#5F13CA] text-white font-semibold rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#5F13CA]/30 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
                  >
                    {loading ? (
                      <span className="material-symbols-rounded animate-spin">progress_activity</span>
                    ) : (
                      "ანგარიშის შექმნა →"
                    )}
                  </button>

                  <p className="switch-text text-center mt-6 text-sm text-stone-500">
                    უკვე გაქვს ანგარიში? <button type="button" onClick={() => setMode("login")} className="text-[#8B5CF6] font-semibold hover:underline">შესვლა</button>
                  </p>
                </form>
              )}

              {/* შესვლის ფორმა */}
              {mode === "login" && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="f">
                    <label className="block text-xs font-semibold text-stone-400 mb-1.5 tracking-wide">ელფოსტა</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="giorgi@example.com"
                      className="w-full px-3.5 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-stone-700 text-sm focus:border-[#5F13CA] focus:bg-[#5F13CA]/5 focus:ring-2 focus:ring-[#5F13CA]/10 outline-none transition-all"
                      required
                    />
                  </div>

                  <div className="f">
                    <label className="block text-xs font-semibold text-stone-400 mb-1.5 tracking-wide">პაროლი</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="შეიყვანე პაროლი"
                        className="w-full px-3.5 py-3 pr-10 bg-white/5 border border-white/10 rounded-xl text-white placeholder-stone-700 text-sm focus:border-[#5F13CA] focus:bg-[#5F13CA]/5 focus:ring-2 focus:ring-[#5F13CA]/10 outline-none transition-all"
                        minLength={6}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-700 hover:text-[#5F13CA] transition-colors p-1"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="login-row flex justify-between items-center my-3">
                    <div className="check flex items-center gap-2.5">
                      <div className="check-box w-4 h-4 shrink-0 relative">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="absolute inset-0 opacity-0 cursor-pointer z-10"
                        />
                        <div className={`check-vis absolute inset-0 border-2 rounded flex items-center justify-center transition-all ${rememberMe ? "bg-[#5F13CA] border-[#5F13CA] shadow-lg shadow-[#5F13CA]/25" : "border-white/10 bg-white/5"}`}>
                          <Check className={`w-2.5 h-2.5 text-white transition-all ${rememberMe ? "opacity-100 scale-100" : "opacity-0 scale-0"}`} />
                        </div>
                      </div>
                      <span className="text-xs text-stone-500">დამიმახსოვრე</span>
                    </div>
                    <button type="button" onClick={() => { setMode("forgot"); setResetEmail(email); }} className="text-xs text-[#8B5CF6] hover:underline">დაგავიწყდა პაროლი?</button>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="submit w-full py-3.5 bg-[#5F13CA] text-white font-semibold rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#5F13CA]/30 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
                  >
                    {loading ? (
                      <span className="material-symbols-rounded animate-spin">progress_activity</span>
                    ) : (
                      "შესვლა →"
                    )}
                  </button>

                  <p className="switch-text text-center mt-6 text-sm text-stone-500">
                    ახალი ხარ? <button type="button" onClick={() => setMode("register")} className="text-[#8B5CF6] font-semibold hover:underline">შექმენი ანგარიში</button>
                  </p>
                </form>
              )}

              {/* პაროლის აღდგენა - ელფოსტის შეყვანა */}
              {mode === "forgot" && (
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  setResetLoading(true);
                  try {
                    const { data, error } = await supabase.functions.invoke("send-reset-code", {
                      body: { email: resetEmail },
                    });
                    if (error) throw error;
                    toast.success("კოდი გაიგზავნა თქვენს ელფოსტაზე!");
                    setMode("verify-code");
                  } catch (err: any) {
                    toast.error(err.message || "შეცდომა კოდის გაგზავნისას");
                  } finally {
                    setResetLoading(false);
                  }
                }} className="space-y-4">
                  <div className="f">
                    <label className="block text-xs font-semibold text-stone-400 mb-1.5 tracking-wide">ელფოსტა</label>
                    <input
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="შეიყვანეთ ელფოსტა"
                      className="w-full px-3.5 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-stone-700 text-sm focus:border-[#5F13CA] focus:bg-[#5F13CA]/5 focus:ring-2 focus:ring-[#5F13CA]/10 outline-none transition-all"
                      required
                    />
                  </div>
                  <p className="text-xs text-stone-500">4-ნიშნა კოდი გამოგეგზავნებათ academy@codezero.ge-დან</p>
                  <button type="submit" disabled={resetLoading}
                    className="submit w-full py-3.5 bg-[#5F13CA] text-white font-semibold rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#5F13CA]/30 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed">
                    {resetLoading ? <span className="material-symbols-rounded animate-spin">progress_activity</span> : "კოდის გაგზავნა →"}
                  </button>
                  <p className="switch-text text-center mt-4 text-sm text-stone-500">
                    <button type="button" onClick={() => setMode("login")} className="text-[#8B5CF6] font-semibold hover:underline">← შესვლაზე დაბრუნება</button>
                  </p>
                </form>
              )}

              {/* კოდის ვერიფიკაცია */}
              {mode === "verify-code" && (
                <form onSubmit={(e) => {
                  e.preventDefault();
                  if (resetCode.length !== 4) {
                    toast.error("შეიყვანეთ 4-ნიშნა კოდი");
                    return;
                  }
                  setMode("new-password");
                }} className="space-y-4">
                  <div className="f">
                    <label className="block text-xs font-semibold text-stone-400 mb-1.5 tracking-wide">4-ნიშნა კოდი</label>
                    <input
                      type="text"
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      placeholder="0000"
                      maxLength={4}
                      className="w-full px-3.5 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-stone-700 text-2xl text-center tracking-[12px] font-mono focus:border-[#5F13CA] focus:bg-[#5F13CA]/5 focus:ring-2 focus:ring-[#5F13CA]/10 outline-none transition-all"
                      required
                    />
                  </div>
                  <p className="text-xs text-stone-500 text-center">კოდი გამოგეგზავნათ <strong className="text-stone-300">{resetEmail}</strong>-ზე</p>
                  <button type="submit"
                    className="submit w-full py-3.5 bg-[#5F13CA] text-white font-semibold rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#5F13CA]/30 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed">
                    დადასტურება →
                  </button>
                  <p className="switch-text text-center mt-4 text-sm text-stone-500">
                    <button type="button" onClick={() => setMode("forgot")} className="text-[#8B5CF6] font-semibold hover:underline">← თავიდან გაგზავნა</button>
                  </p>
                </form>
              )}

              {/* ახალი პაროლის დაყენება */}
              {mode === "new-password" && (
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  setResetLoading(true);
                  try {
                    const { data, error } = await supabase.functions.invoke("verify-reset-code", {
                      body: { email: resetEmail, code: resetCode, newPassword },
                    });
                    if (error) throw error;
                    if (data?.error) {
                      toast.error(data.error);
                      return;
                    }
                    toast.success("პაროლი წარმატებით შეიცვალა!");
                    setMode("login");
                    setResetEmail("");
                    setResetCode("");
                    setNewPassword("");
                  } catch (err: any) {
                    toast.error(err.message || "შეცდომა პაროლის შეცვლისას");
                  } finally {
                    setResetLoading(false);
                  }
                }} className="space-y-4">
                  <div className="f">
                    <label className="block text-xs font-semibold text-stone-400 mb-1.5 tracking-wide">ახალი პაროლი</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="მინიმუმ 6 სიმბოლო"
                        className="w-full px-3.5 py-3 pr-10 bg-white/5 border border-white/10 rounded-xl text-white placeholder-stone-700 text-sm focus:border-[#5F13CA] focus:bg-[#5F13CA]/5 focus:ring-2 focus:ring-[#5F13CA]/10 outline-none transition-all"
                        minLength={6}
                        required
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-700 hover:text-[#5F13CA] transition-colors p-1">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <button type="submit" disabled={resetLoading}
                    className="submit w-full py-3.5 bg-[#5F13CA] text-white font-semibold rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#5F13CA]/30 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed">
                    {resetLoading ? <span className="material-symbols-rounded animate-spin">progress_activity</span> : "პაროლის შეცვლა →"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .auth-page {
          background: #0c0a09;
          color: #fafaf9;
          font-family: 'General Sans', -apple-system, sans-serif;
          min-height: 100vh;
          overflow-x: hidden;
        }

        @media (min-width: 1024px) {
          .auth-page { cursor: none; }
        }

        .cursor {
          position: fixed;
          width: 20px;
          height: 20px;
          border: 1.5px solid #5F13CA;
          border-radius: 50%;
          pointer-events: none;
          z-index: 10000;
          transform: translate(-50%, -50%);
          transition: width 0.3s cubic-bezier(0.23,1,0.32,1),
                      height 0.3s cubic-bezier(0.23,1,0.32,1),
                      background 0.3s ease,
                      border-color 0.3s ease;
          mix-blend-mode: difference;
        }

        .cursor.--hover {
          width: 56px;
          height: 56px;
          background: #5F13CA;
          border-color: #5F13CA;
          mix-blend-mode: normal;
          opacity: 0.15;
        }

        .cursor-dot {
          position: fixed;
          width: 5px;
          height: 5px;
          background: #5F13CA;
          border-radius: 50%;
          pointer-events: none;
          z-index: 10001;
          transform: translate(-50%, -50%);
        }

        .grain {
          position: fixed;
          inset: 0;
          z-index: 1;
          pointer-events: none;
          opacity: 0.035;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 256px;
        }

        @keyframes text-reveal {
          to { transform: translateY(0); }
        }

        .animate-text-reveal {
          transform: translateY(110%);
          animation: text-reveal 1s cubic-bezier(0.22,1,0.36,1) forwards;
        }

        @keyframes fade-up {
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-fade-up {
          opacity: 0;
          transform: translateY(20px);
          animation: fade-up 0.8s ease forwards;
        }

        @keyframes card-in {
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-card-in {
          opacity: 0;
          transform: translateY(30px);
          animation: card-in 0.9s cubic-bezier(0.22,1,0.36,1) forwards 0.3s;
        }
      `}</style>
    </div>
    </>
  );
};

export default Auth;
