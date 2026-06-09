import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useBooks, useCategories } from '@/hooks/useBooks';
import {
  BookOpen, Star, ChevronRight, Globe, Server,
  Smartphone, Palette, Database, Shield, GitBranch, Terminal,
  Lightbulb, GraduationCap, Code2,
  Layout, Layers, Search, ShoppingCart,
} from 'lucide-react';

interface RoadmapStep {
  title: string;
  desc: string;
  icon: any;
  color: string;
  skills: string[];
}

const ROADMAPS: { id: string; title: string; desc: string; icon: any; color: string; bg: string; steps: RoadmapStep[] }[] = [
  {
    id: 'frontend',
    title: 'Frontend Developer',
    desc: 'ვებ-ინტერფეისის დეველოპერი',
    icon: Layout,
    color: 'text-blue-400',
    bg: 'bg-blue-600',
    steps: [
      { title: 'საფუძვლები', desc: 'HTML, CSS, JavaScript-ის საფუძვლები', icon: Globe, color: 'text-emerald-400', skills: ['HTML5', 'CSS3', 'JavaScript ES6+', 'Git'] },
      { title: 'ფრეიმვორკი', desc: 'React, Vue ან Angular-ის შესწავლა', icon: Code2, color: 'text-blue-400', skills: ['React / Vue / Angular', 'State Management', 'Routing', 'TypeScript'] },
      { title: 'სტაილინგი', desc: 'თანამედროვე CSS და ანიმაციები', icon: Palette, color: 'text-pink-400', skills: ['Tailwind CSS', 'Styled Components', 'Framer Motion', 'Responsive Design'] },
      { title: 'ინსტრუმენტები', desc: 'Build tools და ტესტირება', icon: Terminal, color: 'text-amber-400', skills: ['Vite / Webpack', 'Jest / Vitest', 'CI/CD', 'Performance'] },
    ],
  },
  {
    id: 'backend',
    title: 'Backend Developer',
    desc: 'სერვერული დეველოპერი',
    icon: Server,
    color: 'text-emerald-400',
    bg: 'bg-emerald-600',
    steps: [
      { title: 'ენა', desc: 'Python, Node.js, Go ან Java', icon: Code2, color: 'text-blue-400', skills: ['Node.js / Python / Go', 'OOP / FP', 'Async Programming', 'Error Handling'] },
      { title: 'API', desc: 'REST და GraphQL API-ების შექმნა', icon: Layers, color: 'text-purple-400', skills: ['REST API', 'GraphQL', 'Authentication', 'Validation'] },
      { title: 'მონაცემთა ბაზა', desc: 'SQL და NoSQL ბაზები', icon: Database, color: 'text-emerald-400', skills: ['PostgreSQL / MySQL', 'MongoDB / Redis', 'ORM / Prisma', 'Migrations'] },
      { title: 'DevOps', desc: 'დეპლოიმენტი და ინფრასტრუქტურა', icon: Shield, color: 'text-amber-400', skills: ['Docker', 'AWS / GCP / Vercel', 'Nginx', 'Monitoring'] },
    ],
  },
  {
    id: 'mobile',
    title: 'Mobile Developer',
    desc: 'მობილური აპლიკაციების დეველოპერი',
    icon: Smartphone,
    color: 'text-purple-400',
    bg: 'bg-purple-600',
    steps: [
      { title: 'საფუძვლები', desc: 'მობილური UI/UX პრინციპები', icon: Smartphone, color: 'text-blue-400', skills: ['UI/UX Principles', 'Platform Guidelines', 'Responsive Layout', 'Navigation'] },
      { title: 'ფრეიმვორკი', desc: 'React Native ან Flutter', icon: Code2, color: 'text-cyan-400', skills: ['React Native / Flutter', 'State Management', 'Native Modules', 'Animations'] },
      { title: 'ინტეგრაციები', desc: 'API და სერვისები', icon: Layers, color: 'text-emerald-400', skills: ['REST / GraphQL', 'Push Notifications', 'Maps / Camera', 'Local Storage'] },
      { title: 'პუბლიკაცია', desc: 'App Store და Play Store', icon: Star, color: 'text-amber-400', skills: ['App Store Connect', 'Google Play Console', 'CI/CD', 'Analytics'] },
    ],
  },
];


const HubResources = () => {
  const [activeTab, setActiveTab] = useState<'roadmaps' | 'books'>('roadmaps');
  const [expandedRoadmap, setExpandedRoadmap] = useState<string | null>('frontend');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const { data: books = [], isLoading: booksLoading } = useBooks({ search: searchTerm || undefined, categoryId: selectedCat || undefined });
  const { data: categories = [] } = useCategories();

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header */}
      <div className="px-4 md:px-6 py-4 border-b border-white/[0.06] space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-600 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-white text-sm">რესურსები</h2>
              <p className="text-[11px] text-white/30">roadmap-ები და ლინკები</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-white/[0.03] border border-white/[0.06] rounded-xl w-fit">
          {[
            { id: 'roadmaps' as const, label: 'Roadmaps', icon: GitBranch },
            { id: 'books' as const, label: 'ჩვენი წიგნები', icon: BookOpen },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  : 'text-white/40 hover:text-white/60 border border-transparent'
              }`}>
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {activeTab === 'roadmaps' ? (
          <div className="space-y-4 max-w-4xl">
            {ROADMAPS.map(roadmap => (
              <div key={roadmap.id}
                className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                  expandedRoadmap === roadmap.id ? 'border-purple-500/20 bg-white/[0.03]' : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12]'
                }`}>
                {/* Roadmap Header */}
                <button onClick={() => setExpandedRoadmap(expandedRoadmap === roadmap.id ? null : roadmap.id)}
                  className="w-full p-4 md:p-5 flex items-center gap-4 text-left">
                  <div className={`w-12 h-12 rounded-xl ${roadmap.bg} flex items-center justify-center flex-shrink-0`}>
                    <roadmap.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white text-sm md:text-base">{roadmap.title}</h3>
                    <p className="text-xs text-white/40 mt-0.5">{roadmap.desc} • {roadmap.steps.length} ეტაპი</p>
                  </div>
                  <ChevronRight className={`w-5 h-5 text-white/20 transition-transform duration-300 flex-shrink-0 ${expandedRoadmap === roadmap.id ? 'rotate-90' : ''}`} />
                </button>

                {/* Roadmap Steps */}
                {expandedRoadmap === roadmap.id && (
                  <div className="px-4 md:px-5 pb-5">
                    <div className="relative">
                      {/* Vertical line */}
                      <div className="absolute left-6 top-0 bottom-0 w-px bg-white/[0.06]" />

                      <div className="space-y-4">
                        {roadmap.steps.map((step, idx) => (
                          <div key={idx} className="relative flex gap-4">
                            {/* Step number */}
                            <div className="relative z-10 w-12 flex-shrink-0 flex items-start justify-center pt-1">
                              <div className={`w-8 h-8 rounded-lg bg-white/[0.06] border border-white/[0.08] flex items-center justify-center`}>
                                <span className="text-xs font-bold text-white/60">{idx + 1}</span>
                              </div>
                            </div>

                            <div className="flex-1 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.10] transition-colors">
                              <div className="flex items-center gap-2 mb-2">
                                <step.icon className={`w-4 h-4 ${step.color}`} />
                                <h4 className="font-bold text-sm text-white">{step.title}</h4>
                              </div>
                              <p className="text-xs text-white/40 mb-3">{step.desc}</p>
                              <div className="flex flex-wrap gap-1.5">
                                {step.skills.map(skill => (
                                  <span key={skill} className="px-2 py-0.5 bg-white/[0.05] border border-white/[0.08] rounded-md text-[10px] text-white/50 font-medium">
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4 max-w-5xl">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
              <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                placeholder="წიგნის ძიება..."
                className="w-full pl-10 pr-4 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-xl text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-purple-500/30" />
            </div>

            {/* Category filter */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 -mb-1 scrollbar-hide">
              <button onClick={() => setSelectedCat(null)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all ${
                  !selectedCat ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-white/[0.03] border border-white/[0.06] text-white/40 hover:text-white/60'
                }`}>ყველა</button>
              {categories.map((cat: any) => (
                <button key={cat.id} onClick={() => setSelectedCat(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all ${
                    selectedCat === cat.id ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-white/[0.03] border border-white/[0.06] text-white/40 hover:text-white/60'
                  }`}>{cat.name}</button>
              ))}
            </div>

            {/* Books grid */}
            {booksLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
              </div>
            ) : books.length === 0 ? (
              <div className="text-center py-16">
                <BookOpen className="w-12 h-12 text-white/10 mx-auto mb-3" />
                <p className="text-sm text-white/30">წიგნები ვერ მოიძებნა</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {books.map((book: any) => (
                  <Link key={book.id} to={`/books/${book.id}`}
                    className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12] overflow-hidden transition-all">
                    {book.cover_url ? (
                      <div className="h-40 overflow-hidden bg-white/[0.03]">
                        <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      </div>
                    ) : (
                      <div className="h-32 bg-white/[0.04] flex items-center justify-center">
                        <BookOpen className="w-10 h-10 text-white/10" />
                      </div>
                    )}
                    <div className="p-3.5 space-y-2">
                      <h4 className="font-bold text-sm text-white truncate group-hover:text-purple-300 transition-colors">{book.title}</h4>
                      <p className="text-[11px] text-white/35 line-clamp-2">{book.description || book.author}</p>
                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-2">
                          {book.rating > 0 && (
                            <span className="flex items-center gap-1 text-[10px] text-amber-400">
                              <Star className="w-3 h-3" /> {book.rating.toFixed(1)}
                            </span>
                          )}
                          {book.category?.name && (
                            <span className="text-[10px] text-white/25 bg-white/[0.04] px-2 py-0.5 rounded-md">{book.category.name}</span>
                          )}
                        </div>
                        <span className={`text-xs font-bold ${book.is_free ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {book.is_free ? 'უფასო' : `₾${book.price}`}
                        </span>
                      </div>
                      {(book.is_new || book.is_popular) && (
                        <div className="flex gap-1.5">
                          {book.is_new && <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold rounded-md">ახალი</span>}
                          {book.is_popular && <span className="px-2 py-0.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-bold rounded-md">პოპულარული</span>}
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HubResources;
