import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Code2, Copy, Check, Eye, Plus, X, Search, Filter,
  Heart, Clock, Grid3X3, Terminal, FileCode, Braces,
  Palette, Globe, Database, Smartphone, ChevronDown,
} from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface Snippet {
  id: string;
  title: string;
  html_code: string;
  css_code: string;
  js_code: string;
  language: string;
  user_id: string | null;
  is_public: boolean;
  views: number;
  created_at: string;
  profile?: { full_name: string | null; avatar_url: string | null };
}

const CATEGORIES = [
  { id: 'all', label: 'ყველა', icon: Grid3X3, color: 'text-purple-400' },
  { id: 'html', label: 'HTML', icon: Globe, color: 'text-orange-400' },
  { id: 'css', label: 'CSS', icon: Palette, color: 'text-blue-400' },
  { id: 'javascript', label: 'JavaScript', icon: Braces, color: 'text-yellow-400' },
  { id: 'react', label: 'React', icon: Code2, color: 'text-cyan-400' },
  { id: 'api', label: 'API', icon: Database, color: 'text-emerald-400' },
  { id: 'mobile', label: 'მობილური', icon: Smartphone, color: 'text-pink-400' },
];

const HubSnippets = () => {
  const { user } = useAuth();
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [showCreate, setShowCreate] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '', html_code: '', css_code: '', js_code: '', language: 'web',
  });

  useEffect(() => {
    fetchSnippets();
  }, []);

  const fetchSnippets = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('code_snippets')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;

      const userIds = [...new Set((data || []).map((s: any) => s.user_id).filter(Boolean))];
      let profilesMap: Record<string, any> = {};
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, full_name, avatar_url')
          .in('user_id', userIds);
        (profiles || []).forEach((p: any) => { profilesMap[p.user_id] = p; });
      }

      setSnippets((data || []).map((s: any) => ({
        ...s,
        profile: s.user_id ? profilesMap[s.user_id] : null,
      })));
    } catch {
      toast.error('სნიპეტების ჩატვირთვა ვერ მოხერხდა');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.title.trim()) return;
    try {
      const { data: session } = await supabase.auth.getSession();
      const userId = session?.session?.user?.id || null;
      const { error } = await supabase.from('code_snippets').insert({
        title: formData.title.trim(),
        html_code: formData.html_code,
        css_code: formData.css_code,
        js_code: formData.js_code,
        language: formData.language,
        user_id: userId,
        is_public: true,
      } as any);
      if (error) throw error;
      toast.success('სნიპეტი დაემატა!');
      setFormData({ title: '', html_code: '', css_code: '', js_code: '', language: 'web' });
      setShowCreate(false);
      fetchSnippets();
    } catch {
      toast.error('სნიპეტის შენახვა ვერ მოხერხდა');
    }
  };

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    toast.success('კოპირებულია!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filtered = snippets.filter(s => {
    if (search && !s.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (category !== 'all' && !s.language?.toLowerCase().includes(category)) return false;
    return true;
  });

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header */}
      <div className="px-4 md:px-6 py-4 border-b border-white/[0.06] space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center">
              <Code2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-white text-sm">სნიპეტები</h2>
              <p className="text-[11px] text-white/30">კოდის ნაწყვეტები</p>
            </div>
          </div>
          {user && (
            <button onClick={() => setShowCreate(!showCreate)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                showCreate
                  ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                  : 'bg-purple-600 text-white hover:bg-purple-500'
              }`}>
              {showCreate ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              {showCreate ? 'გაუქმება' : 'სნიპეტის დამატება'}
            </button>
          )}
        </div>

        {/* Search & Filters */}
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="სნიპეტის ძიება..."
              className="w-full pl-10 pr-4 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-xl text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-purple-500/30" />
          </div>
        </div>

        {/* Categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 -mb-1 scrollbar-hide">
          {CATEGORIES.map(cat => (
            <button key={cat.id} onClick={() => setCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all ${
                category === cat.id
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  : 'bg-white/[0.03] border border-white/[0.06] text-white/40 hover:text-white/60 hover:bg-white/[0.05]'
              }`}>
              <cat.icon className="w-3 h-3" />
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Create Form */}
      {showCreate && (
        <div className="px-4 md:px-6 py-4 border-b border-white/[0.06] bg-white/[0.01] space-y-3">
          <input placeholder="სნიპეტის სახელი *" value={formData.title}
            onChange={e => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/[0.06] rounded-xl text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-1 focus:ring-purple-500/30" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-orange-400 flex items-center gap-1"><Globe className="w-3 h-3" /> HTML</label>
              <textarea value={formData.html_code} onChange={e => setFormData({ ...formData, html_code: e.target.value })}
                placeholder="<div>...</div>" rows={5}
                className="w-full px-3 py-2 bg-white/[0.04] border border-white/[0.06] rounded-xl text-xs text-white/80 placeholder:text-white/15 focus:outline-none focus:ring-1 focus:ring-purple-500/30 resize-none font-mono" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-blue-400 flex items-center gap-1"><Palette className="w-3 h-3" /> CSS</label>
              <textarea value={formData.css_code} onChange={e => setFormData({ ...formData, css_code: e.target.value })}
                placeholder=".class { ... }" rows={5}
                className="w-full px-3 py-2 bg-white/[0.04] border border-white/[0.06] rounded-xl text-xs text-white/80 placeholder:text-white/15 focus:outline-none focus:ring-1 focus:ring-purple-500/30 resize-none font-mono" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-yellow-400 flex items-center gap-1"><Braces className="w-3 h-3" /> JavaScript</label>
              <textarea value={formData.js_code} onChange={e => setFormData({ ...formData, js_code: e.target.value })}
                placeholder="const fn = () => ..." rows={5}
                className="w-full px-3 py-2 bg-white/[0.04] border border-white/[0.06] rounded-xl text-xs text-white/80 placeholder:text-white/15 focus:outline-none focus:ring-1 focus:ring-purple-500/30 resize-none font-mono" />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <select value={formData.language} onChange={e => setFormData({ ...formData, language: e.target.value })}
              className="px-3 py-2 bg-white/[0.04] border border-white/[0.06] rounded-xl text-xs text-white/60 focus:outline-none">
              <option value="web">Web (HTML/CSS/JS)</option>
              <option value="react">React</option>
              <option value="javascript">JavaScript</option>
              <option value="css">CSS Only</option>
              <option value="api">API / Backend</option>
            </select>
            <button onClick={handleCreate} disabled={!formData.title.trim()}
              className="px-5 py-2 bg-emerald-500 text-white rounded-xl text-xs font-semibold disabled:opacity-40 hover:bg-emerald-400 transition-all">
              გამოქვეყნება
            </button>
          </div>
        </div>
      )}

      {/* Snippets List */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <FileCode className="w-12 h-12 text-white/10 mx-auto mb-3" />
            <p className="text-sm text-white/30 mb-1">სნიპეტები ვერ მოიძებნა</p>
            <p className="text-xs text-white/20">გააზიარე პირველი კოდის ფრაგმენტი!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filtered.map(snippet => (
              <SnippetCard
                key={snippet.id}
                snippet={snippet}
                isExpanded={expandedId === snippet.id}
                onToggle={() => setExpandedId(expandedId === snippet.id ? null : snippet.id)}
                onCopy={handleCopy}
                copiedId={copiedId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const SnippetCard = ({ snippet, isExpanded, onToggle, onCopy, copiedId }: {
  snippet: Snippet;
  isExpanded: boolean;
  onToggle: () => void;
  onCopy: (code: string, id: string) => void;
  copiedId: string | null;
}) => {
  const mainCode = snippet.js_code || snippet.html_code || snippet.css_code || '';
  const langLabel = snippet.language === 'web' ? 'HTML/CSS/JS' : snippet.language;
  const langColor = snippet.language === 'css' ? 'text-blue-400 bg-blue-500/10 border-blue-500/20'
    : snippet.language === 'javascript' ? 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
    : snippet.language === 'react' ? 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20'
    : 'text-purple-400 bg-purple-500/10 border-purple-500/20';

  return (
    <div className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
      isExpanded ? 'border-purple-500/30 bg-white/[0.04]' : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12]'
    }`}>
      {/* Header */}
      <div className="p-4 cursor-pointer" onClick={onToggle}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${langColor}`}>
                {langLabel}
              </span>
              <span className="flex items-center gap-1 text-[10px] text-white/25">
                <Eye className="w-3 h-3" /> {snippet.views}
              </span>
            </div>
            <h3 className="font-bold text-sm text-white truncate">{snippet.title}</h3>
            <div className="flex items-center gap-2 mt-1.5">
              {snippet.profile ? (
                <>
                  <Avatar className="w-4 h-4">
                    {snippet.profile.avatar_url && <AvatarImage src={snippet.profile.avatar_url} />}
                    <AvatarFallback className="bg-purple-500/20 text-purple-300 text-[8px]">
                      {(snippet.profile.full_name || 'U')[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-[11px] text-white/35">{snippet.profile.full_name || 'ანონიმური'}</span>
                </>
              ) : (
                <span className="text-[11px] text-white/25">ანონიმური</span>
              )}
              <span className="text-[10px] text-white/15">•</span>
              <span className="text-[10px] text-white/20 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(snippet.created_at).toLocaleDateString('ka-GE', { day: 'numeric', month: 'short' })}
              </span>
            </div>
          </div>
          <ChevronDown className={`w-4 h-4 text-white/20 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </div>

        {/* Code Preview (collapsed) */}
        {!isExpanded && mainCode && (
          <div className="mt-3 p-3 bg-black/30 rounded-lg border border-white/[0.04] overflow-hidden">
            <pre className="text-[11px] text-white/50 font-mono leading-relaxed line-clamp-3 whitespace-pre-wrap">
              {mainCode.slice(0, 200)}
            </pre>
          </div>
        )}
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-3">
          {snippet.html_code && (
            <CodeBlock label="HTML" code={snippet.html_code} id={`${snippet.id}-html`}
              onCopy={onCopy} copiedId={copiedId} color="text-orange-400" />
          )}
          {snippet.css_code && (
            <CodeBlock label="CSS" code={snippet.css_code} id={`${snippet.id}-css`}
              onCopy={onCopy} copiedId={copiedId} color="text-blue-400" />
          )}
          {snippet.js_code && (
            <CodeBlock label="JavaScript" code={snippet.js_code} id={`${snippet.id}-js`}
              onCopy={onCopy} copiedId={copiedId} color="text-yellow-400" />
          )}
        </div>
      )}
    </div>
  );
};

const CodeBlock = ({ label, code, id, onCopy, copiedId, color }: {
  label: string; code: string; id: string;
  onCopy: (code: string, id: string) => void;
  copiedId: string | null; color: string;
}) => (
  <div className="rounded-xl border border-white/[0.06] overflow-hidden">
    <div className="flex items-center justify-between px-3 py-2 bg-white/[0.03] border-b border-white/[0.04]">
      <span className={`text-[11px] font-bold ${color}`}>{label}</span>
      <button onClick={() => onCopy(code, id)}
        className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold text-white/40 hover:text-white/70 hover:bg-white/[0.06] transition-all">
        {copiedId === id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
        {copiedId === id ? 'კოპირებულია' : 'კოპირება'}
      </button>
    </div>
    <pre className="p-3 text-[11px] text-white/60 font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap bg-black/20">
      {code}
    </pre>
  </div>
);

export default HubSnippets;
