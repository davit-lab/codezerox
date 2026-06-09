import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Atmosphere from "@/components/layout/Atmosphere";
import Header from "@/components/layout/Header";
import {
  LayoutDashboard, FolderGit2, MessageCircle, Code2, BookOpen, Trophy,
  LogIn, Code, Users, Hash, ChevronLeft, ChevronRight, Menu, X,
} from "lucide-react";
import HubOverview from "@/components/hub/HubOverview";
import HubProjects from "@/components/hub/HubProjects";
import HubChat from "@/components/hub/HubChat";
import HubSnippets from "@/components/hub/HubSnippets";
import HubResources from "@/components/hub/HubResources";
import HubChallenges from "@/components/hub/HubChallenges";

type HubView = 'overview' | 'projects' | 'chat' | 'snippets' | 'resources' | 'challenges';

const NAV_ITEMS: { id: HubView; label: string; icon: any; color: string }[] = [
  { id: 'overview', label: 'მთავარი', icon: LayoutDashboard, color: 'text-purple-400' },
  { id: 'projects', label: 'პროექტები', icon: FolderGit2, color: 'text-violet-400' },
  { id: 'chat', label: 'ჩატი', icon: MessageCircle, color: 'text-blue-400' },
  { id: 'snippets', label: 'სნიპეტები', icon: Code2, color: 'text-emerald-400' },
  { id: 'resources', label: 'რესურსები', icon: BookOpen, color: 'text-amber-400' },
  { id: 'challenges', label: 'გამოწვევები', icon: Trophy, color: 'text-rose-400' },
];

const Hub = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const [activeView, setActiveView] = useState<HubView>('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  if (isLoading) {
    return (
      <>
        <Atmosphere />
        <Header />
        <main className="pt-32 pb-20 min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto" />
            <p className="text-white/40">იტვირთება...</p>
          </div>
        </main>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Atmosphere />
        <Header />
        <main className="pt-28 pb-20 min-h-screen">
          <div className="container max-w-4xl mx-auto px-4">
            <div className="relative">
              <div className="absolute -inset-4 bg-purple-900/10 rounded-[32px]" />
              <div className="relative bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-3xl overflow-hidden">
                {/* Hero background */}
                <div className="relative p-8 sm:p-12 md:p-16 text-center">
                  <div className="absolute inset-0 bg-purple-900/10" />

                  <div className="relative">
                    <div className="w-20 h-20 rounded-2xl bg-purple-600 flex items-center justify-center mx-auto mb-8">
                      <Code className="w-10 h-10 text-white" />
                    </div>

                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
                      დეველოპერების
                      <span className="text-purple-400"> ჰაბი</span>
                    </h1>
                    <p className="text-sm sm:text-base text-white/45 mb-10 max-w-lg mx-auto leading-relaxed">
                      ჩატი, პროექტები, კოდის სნიპეტები და კოდინგ გამოწვევები — ყველაფერი ერთ ადგილას.
                    </p>

                    {/* Feature Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10 max-w-2xl mx-auto">
                      {[
                        { icon: MessageCircle, title: "ჩატი", desc: "წერე და უპასუხე", color: 'bg-blue-600' },
                        { icon: FolderGit2, title: "პროექტები", desc: "დადე შენი ნამუშევარი", color: 'bg-purple-600' },
                        { icon: Trophy, title: "გამოწვევები", desc: "კოდინგ ამოცანები", color: 'bg-rose-600' },
                      ].map((f, i) => (
                        <div key={i} className="p-5 rounded-2xl bg-white/[0.04] border border-white/[0.06] hover:border-white/[0.12] transition-all group">
                          <div className={`w-10 h-10 rounded-xl ${f.color} flex items-center justify-center mb-3`}>
                            <f.icon className="w-5 h-5 text-white" />
                          </div>
                          <h3 className="font-bold text-sm text-white mb-1">{f.title}</h3>
                          <p className="text-xs text-white/35">{f.desc}</p>
                        </div>
                      ))}
                    </div>

                    <button onClick={() => navigate("/auth")}
                      className="inline-flex items-center gap-2.5 px-8 py-4 bg-purple-600 text-white rounded-xl font-bold text-base hover:bg-purple-500 transition-colors">
                      <LogIn className="w-5 h-5" />
                      შესვლა
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }

  const activeNav = NAV_ITEMS.find(n => n.id === activeView) || NAV_ITEMS[0];

  const handleNavigate = (view: string) => {
    setActiveView(view as HubView);
    setMobileNavOpen(false);
  };

  return (
    <>
      <Atmosphere />
      <Header />
      <main className="pt-[72px] pb-0 min-h-screen flex flex-col">
        <div className="flex-1 flex min-h-0" style={{ height: 'calc(100vh - 72px)' }}>

          {/* Desktop Sidebar */}
          <aside className={`hidden md:flex flex-col border-r border-white/[0.06] bg-white/[0.01] transition-all duration-300 flex-shrink-0 ${
            sidebarCollapsed ? 'w-[68px]' : 'w-[220px]'
          }`}>
            {/* Sidebar Header */}
            <div className="p-3 border-b border-white/[0.06] flex items-center justify-between">
              {!sidebarCollapsed && (
                <div className="flex items-center gap-2.5 px-1">
                  <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center">
                    <Hash className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white leading-none">DevHub</h2>
                    <p className="text-[10px] text-white/25 mt-0.5"></p>
                  </div>
                </div>
              )}
              <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className={`w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-white/30 hover:text-white/60 hover:bg-white/[0.08] transition-all ${sidebarCollapsed ? 'mx-auto' : ''}`}>
                {sidebarCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Nav Items */}
            <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
              {NAV_ITEMS.map(item => {
                const isActive = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveView(item.id)}
                    className={`w-full flex items-center gap-3 rounded-xl transition-all duration-200 ${
                      sidebarCollapsed ? 'justify-center px-0 py-3' : 'px-3 py-2.5'
                    } ${
                      isActive
                        ? 'bg-purple-500/15 text-purple-300 border border-purple-500/25 shadow-sm'
                        : 'text-white/40 hover:text-white/70 hover:bg-white/[0.04] border border-transparent'
                    }`}
                    title={sidebarCollapsed ? item.label : undefined}
                  >
                    <div className={`flex-shrink-0 ${isActive ? '' : ''}`}>
                      <item.icon className={`w-[18px] h-[18px] ${isActive ? item.color : ''}`} />
                    </div>
                    {!sidebarCollapsed && (
                      <span className="text-xs font-semibold truncate">{item.label}</span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Sidebar Footer */}
            {!sidebarCollapsed && (
              <div className="p-3 border-t border-white/[0.06]">
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <p className="text-[10px] text-white/40 leading-relaxed">
                    CodeZeroX — დეველოპერების ჰაბი
                  </p>
                </div>
              </div>
            )}
          </aside>

          {/* Mobile Bottom Nav */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-white/[0.06] bg-[#0c0c10]/95 backdrop-blur-xl">
            <div className="flex items-center justify-around px-2 py-1.5">
              {NAV_ITEMS.map(item => {
                const isActive = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigate(item.id)}
                    className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg transition-all ${
                      isActive ? 'text-purple-400' : 'text-white/30'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="text-[9px] font-semibold">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col min-h-0 min-w-0 pb-16 md:pb-0">
            {/* Mobile Header Bar */}
            <div className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-white/[0.06]">
              <div className="w-8 h-8 rounded-lg bg-white/[0.08] border border-white/[0.06] flex items-center justify-center">
                <activeNav.icon className="w-4 h-4 text-white" />
              </div>
              <h1 className="font-bold text-sm text-white">{activeNav.label}</h1>
            </div>

            {/* Content Area */}
            <div className="flex-1 flex flex-col min-h-0 bg-white/[0.01]">
              {activeView === 'overview' && <HubOverview onNavigate={handleNavigate} />}
              {activeView === 'projects' && (
                <div className="flex-1 flex flex-col min-h-0 bg-white/[0.02] border-l-0 md:border-l border-white/[0.04]">
                  <HubProjects />
                </div>
              )}
              {activeView === 'chat' && (
                <div className="flex-1 flex flex-col min-h-0 hub-chat-container">
                  <HubChat />
                </div>
              )}
              {activeView === 'snippets' && (
                <div className="flex-1 flex flex-col min-h-0">
                  <HubSnippets />
                </div>
              )}
              {activeView === 'resources' && (
                <div className="flex-1 flex flex-col min-h-0">
                  <HubResources />
                </div>
              )}
              {activeView === 'challenges' && (
                <div className="flex-1 flex flex-col min-h-0">
                  <HubChallenges />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default Hub;
