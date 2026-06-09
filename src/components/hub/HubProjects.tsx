import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
  useHubProjects,
  useCreateHubProject,
  useDeleteHubProject,
  useToggleProjectLike,
  useProjectComments,
  useAddProjectComment,
  useDeleteProjectComment,
  HubProject,
} from '@/hooks/useHubProjects';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import {
  Heart, MessageCircle, ExternalLink, Github, Eye, Plus, X, Send, Trash2,
  Image, Link as LinkIcon, Tag, Search, TrendingUp, Clock,
  Filter, FolderGit2, Code2, Bookmark,
} from 'lucide-react';

const TECH_FILTERS = ['ყველა', 'React', 'Vue', 'Next.js', 'Node.js', 'TypeScript', 'Python', 'Flutter', 'Tailwind'];

const HubProjects = () => {
  const { user, isAdmin } = useAuth();
  const [sortBy, setSortBy] = useState<'newest' | 'popular'>('newest');
  const { data: projects = [], isLoading } = useHubProjects(sortBy);
  const createProject = useCreateHubProject();
  const deleteProject = useDeleteHubProject();
  const toggleLike = useToggleProjectLike();

  const [showForm, setShowForm] = useState(false);
  const [selectedProject, setSelectedProject] = useState<HubProject | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [techFilter, setTechFilter] = useState('ყველა');
  const [formData, setFormData] = useState({
    title: '', description: '', live_url: '', github_url: '', screenshot_url: '', tagsInput: '',
  });

  const handleSubmit = async () => {
    if (!formData.title.trim()) return;
    const tags = formData.tagsInput.split(',').map(t => t.trim()).filter(Boolean);
    await createProject.mutateAsync({
      title: formData.title.trim(),
      description: formData.description.trim() || undefined,
      live_url: formData.live_url.trim() || undefined,
      github_url: formData.github_url.trim() || undefined,
      screenshot_url: formData.screenshot_url.trim() || undefined,
      tags,
    });
    setFormData({ title: '', description: '', live_url: '', github_url: '', screenshot_url: '', tagsInput: '' });
    setShowForm(false);
  };

  const filteredProjects = projects.filter(p => {
    if (searchQuery && !p.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (techFilter !== 'ყველა' && !p.tags.some(t => t.toLowerCase().includes(techFilter.toLowerCase()))) return false;
    return true;
  });

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header */}
      <div className="px-4 md:px-6 py-4 border-b border-white/[0.06] space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-600 flex items-center justify-center">
              <FolderGit2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-white text-sm">პროექტები</h2>
              <p className="text-[11px] text-white/30">{projects.length} პროექტი</p>
            </div>
          </div>
          {user && (
            <button onClick={() => setShowForm(!showForm)}
              className={cn("flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all",
                showForm
                  ? "bg-red-500/10 text-red-400 border border-red-500/20"
                  : "bg-purple-600 text-white hover:bg-purple-500"
              )}>
              {showForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              {showForm ? 'გაუქმება' : 'პროექტის დამატება'}
            </button>
          )}
        </div>

        {/* Search + Sort */}
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="პროექტის ძიება..."
              className="w-full pl-10 pr-4 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-xl text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-purple-500/30" />
          </div>
          <div className="flex gap-1 p-1 bg-white/[0.03] border border-white/[0.06] rounded-xl">
            {(['newest', 'popular'] as const).map(s => (
              <button key={s} onClick={() => setSortBy(s)}
                className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all",
                  sortBy === s
                    ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                    : "text-white/40 hover:text-white/60 border border-transparent"
                )}>
                {s === 'newest' ? <Clock className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                {s === 'newest' ? 'ახალი' : 'ტრენდული'}
              </button>
            ))}
          </div>
        </div>

        {/* Tech filter pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 -mb-1 scrollbar-hide">
          {TECH_FILTERS.map(tech => (
            <button key={tech} onClick={() => setTechFilter(tech)}
              className={cn("px-3 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all",
                techFilter === tech
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  : 'bg-white/[0.03] border border-white/[0.06] text-white/35 hover:text-white/55 hover:bg-white/[0.05]'
              )}>
              {tech}
            </button>
          ))}
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {/* Create form */}
        {showForm && (
          <div className="rounded-2xl border border-purple-500/20 bg-white/[0.03] p-5 space-y-4">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Plus className="w-4 h-4 text-purple-400" /> ახალი პროექტი
            </h3>
            <input
              placeholder="პროექტის სახელი *"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/[0.06] rounded-xl text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-1 focus:ring-purple-500/30"
            />
            <textarea
              placeholder="აღწერა — რა ტექნოლოგიებს იყენებს, რა პრობლემას წყვეტს..."
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/[0.06] rounded-xl text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-1 focus:ring-purple-500/30 resize-none"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/15" />
                <input placeholder="Live URL" value={formData.live_url}
                  onChange={e => setFormData({ ...formData, live_url: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-white/[0.04] border border-white/[0.06] rounded-xl text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-1 focus:ring-purple-500/30" />
              </div>
              <div className="relative">
                <Github className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/15" />
                <input placeholder="GitHub URL" value={formData.github_url}
                  onChange={e => setFormData({ ...formData, github_url: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-white/[0.04] border border-white/[0.06] rounded-xl text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-1 focus:ring-purple-500/30" />
              </div>
              <div className="relative">
                <Image className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/15" />
                <input placeholder="სქრინშოტის URL" value={formData.screenshot_url}
                  onChange={e => setFormData({ ...formData, screenshot_url: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-white/[0.04] border border-white/[0.06] rounded-xl text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-1 focus:ring-purple-500/30" />
              </div>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/15" />
                <input placeholder="თეგები: React, Tailwind, Node..." value={formData.tagsInput}
                  onChange={e => setFormData({ ...formData, tagsInput: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-white/[0.04] border border-white/[0.06] rounded-xl text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-1 focus:ring-purple-500/30" />
              </div>
            </div>
            <div className="flex justify-end">
              <button onClick={handleSubmit} disabled={!formData.title.trim() || createProject.isPending}
                className="px-6 py-2.5 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-500 disabled:opacity-40 transition-colors">
                {createProject.isPending ? 'იტვირთება...' : 'გამოქვეყნება'}
              </button>
            </div>
          </div>
        )}

        {/* Projects Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-4">
              <Code2 className="w-8 h-8 text-purple-400/40" />
            </div>
            <h3 className="font-bold text-lg text-white mb-1">პროექტები ვერ მოიძებნა</h3>
            <p className="text-sm text-white/35">იყავი პირველი — გააზიარე შენი პროექტი!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredProjects.map(project => (
              <ProjectCard
                key={project.id}
                project={project}
                onLike={() => toggleLike.mutate(project.id)}
                onDelete={() => { if (confirm('ნამდვილად გსურთ წაშლა?')) deleteProject.mutate(project.id); }}
                onOpenComments={() => setSelectedProject(project)}
                canDelete={user?.id === project.user_id || isAdmin}
                isLoggedIn={!!user}
              />
            ))}
          </div>
        )}
      </div>

      {/* Comments modal */}
      {selectedProject && (
        <CommentsModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
          isAdmin={isAdmin}
        />
      )}
    </div>
  );
};

// Project Card Component
const ProjectCard = ({ project, onLike, onDelete, onOpenComments, canDelete, isLoggedIn }: {
  project: HubProject;
  onLike: () => void;
  onDelete: () => void;
  onOpenComments: () => void;
  canDelete: boolean;
  isLoggedIn: boolean;
}) => (
  <div className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden hover:border-white/[0.12] transition-all duration-200">
    {/* Screenshot */}
    {project.screenshot_url ? (
      <div className="h-44 overflow-hidden bg-white/[0.03] relative">
        <img src={project.screenshot_url} alt={project.title}
          className="w-full h-full object-cover" />
      </div>
    ) : project.live_url ? (
      <div className="h-44 overflow-hidden bg-white relative">
        <iframe src={project.live_url} className="w-full h-full border-none pointer-events-none scale-[0.5] origin-top-left"
          style={{ width: '200%', height: '200%' }} title={project.title} sandbox="allow-scripts allow-same-origin" />
      </div>
    ) : (
      <div className="h-32 bg-white/[0.04] flex items-center justify-center">
        <Code2 className="w-10 h-10 text-white/10" />
      </div>
    )}

    <div className="p-4 space-y-3">
      {/* Title & Author */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-bold text-sm text-white truncate">{project.title}</h3>
          <div className="flex items-center gap-2 mt-1.5">
            <Avatar className="w-5 h-5">
              {project.profile?.avatar_url && <AvatarImage src={project.profile.avatar_url} />}
              <AvatarFallback className="bg-purple-500/20 text-purple-300 text-[9px]">
                {(project.profile?.full_name || 'U')[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <Link to={`/user/${project.user_id}`} className="text-[11px] text-white/40 truncate hover:text-purple-300 transition-colors">{project.profile?.full_name || 'ანონიმური'}</Link>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {canDelete && (
            <button onClick={onDelete} className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/10 text-white/20 hover:text-red-400 transition-all">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Description */}
      {project.description && (
        <p className="text-xs text-white/35 line-clamp-2 leading-relaxed">{project.description}</p>
      )}

      {/* Tags */}
      {project.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {project.tags.slice(0, 4).map(tag => (
            <span key={tag} className="px-2 py-0.5 bg-purple-500/10 text-purple-300 text-[10px] font-semibold rounded-md border border-purple-500/20">{tag}</span>
          ))}
          {project.tags.length > 4 && (
            <span className="text-[10px] text-white/20">+{project.tags.length - 4}</span>
          )}
        </div>
      )}

      {/* Links */}
      <div className="flex items-center gap-2">
        {project.live_url && (
          <a href={project.live_url} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-500/10 text-emerald-400 text-[11px] font-semibold rounded-lg hover:bg-emerald-500/20 transition-colors border border-emerald-500/20">
            <ExternalLink className="w-3 h-3" /> Live
          </a>
        )}
        {project.github_url && (
          <a href={project.github_url} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-white/[0.04] text-white/50 text-[11px] font-semibold rounded-lg hover:bg-white/[0.08] hover:text-white/70 transition-colors border border-white/[0.06]">
            <Github className="w-3 h-3" /> GitHub
          </a>
        )}
      </div>

      {/* Actions bar */}
      <div className="flex items-center gap-4 pt-3 border-t border-white/[0.06]">
        <button onClick={isLoggedIn ? onLike : undefined}
          className={cn("flex items-center gap-1.5 text-xs font-medium transition-all",
            project.user_has_liked ? "text-rose-400" : "text-white/30 hover:text-rose-400"
          )}>
          <Heart className={cn("w-4 h-4", project.user_has_liked && "fill-current")} />
          <span>{project.likes_count}</span>
        </button>
        <button onClick={onOpenComments} className="flex items-center gap-1.5 text-xs font-medium text-white/30 hover:text-purple-300 transition-colors">
          <MessageCircle className="w-4 h-4" />
          <span>{project.comments_count}</span>
        </button>
        <span className="flex items-center gap-1.5 text-xs text-white/20 ml-auto">
          <Eye className="w-3.5 h-3.5" />
          <span>{project.views}</span>
        </span>
      </div>
    </div>
  </div>
);

// Comments Modal
const CommentsModal = ({ project, onClose, isAdmin }: {
  project: HubProject;
  onClose: () => void;
  isAdmin: boolean;
}) => {
  const { user } = useAuth();
  const { data: comments = [], isLoading } = useProjectComments(project.id);
  const addComment = useAddProjectComment();
  const deleteComment = useDeleteProjectComment();
  const [commentText, setCommentText] = useState('');

  const handleSend = async () => {
    if (!commentText.trim()) return;
    await addComment.mutateAsync({ projectId: project.id, content: commentText.trim() });
    setCommentText('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className="relative w-full max-w-lg bg-[#111116] border border-white/[0.08] rounded-2xl shadow-2xl flex flex-col max-h-[80vh]"
        onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
          <div>
            <h3 className="font-bold text-white text-sm">{project.title}</h3>
            <p className="text-[11px] text-white/30">კომენტარები ({comments.length})</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-white/[0.06] flex items-center justify-center text-white/30 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Comments list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="w-8 h-8 text-white/10 mx-auto mb-2" />
              <p className="text-sm text-white/30">კომენტარები ჯერ არ არის</p>
            </div>
          ) : (
            comments.map(comment => (
              <div key={comment.id} className="group flex gap-3">
                <Avatar className="w-7 h-7 flex-shrink-0 mt-0.5">
                  {comment.profile?.avatar_url && <AvatarImage src={comment.profile.avatar_url} />}
                  <AvatarFallback className="bg-purple-500/20 text-purple-300 text-[10px]">
                    {(comment.profile?.full_name || 'U')[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Link to={`/user/${comment.user_id}`} className="text-xs font-semibold text-white hover:text-purple-300 transition-colors">{comment.profile?.full_name || 'მომხმარებელი'}</Link>
                    <span className="text-[10px] text-white/20">
                      {new Date(comment.created_at).toLocaleDateString('ka-GE', { day: 'numeric', month: 'short' })}
                    </span>
                    {(user?.id === comment.user_id || isAdmin) && (
                      <button
                        onClick={() => deleteComment.mutate({ commentId: comment.id, projectId: project.id })}
                        className="opacity-0 group-hover:opacity-100 p-0.5 text-white/20 hover:text-red-400 transition-all ml-auto">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-white/60 break-words mt-0.5">{comment.content}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input */}
        {user ? (
          <div className="p-3 border-t border-white/[0.06]">
            <div className="flex items-center gap-2">
              <input
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder="დაწერე კომენტარი..."
                className="flex-1 px-4 py-2.5 bg-white/[0.04] border border-white/[0.06] rounded-xl text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-1 focus:ring-purple-500/30"
              />
              <button onClick={handleSend} disabled={!commentText.trim() || addComment.isPending}
                className="w-9 h-9 rounded-xl bg-purple-500 text-white flex items-center justify-center disabled:opacity-40 hover:bg-purple-400 transition-all">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="p-3 border-t border-white/[0.06] text-center">
            <p className="text-xs text-white/30">კომენტარისთვის გაიარეთ ავტორიზაცია</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HubProjects;
