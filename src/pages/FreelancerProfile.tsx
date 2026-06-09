import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Atmosphere from "@/components/layout/Atmosphere";
import Header from "@/components/layout/Header";
import ChatWidget from "@/components/chat/ChatWidget";
import { useAuth } from "@/hooks/useAuth";
import { useMyFreelancerProfile, useUpsertFreelancerProfile, useAddFreelancerProject, useDeleteFreelancerProject, useDeleteFreelancerProfile } from "@/hooks/useFreelancers";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, X, Trash2, Upload, Save, Camera, Globe, Github, ExternalLink, AlertTriangle, User, Code, Briefcase, Languages } from "lucide-react";
import freelancersHeroBg from "@/assets/freelancers-hero-bg.jpg";

const EXPERIENCE_OPTIONS = [
  { value: 'junior', label: 'Junior (0-2 წელი)' },
  { value: 'mid', label: 'Mid-Level (2-4 წელი)' },
  { value: 'senior', label: 'Senior (4-7 წელი)' },
  { value: 'lead', label: 'Lead / Expert (7+ წელი)' },
];

const COMMON_LANGUAGES = ['ქართული', 'English', 'Русский', 'Deutsch', 'Français', 'Español', 'Türkçe'];

const FreelancerProfile = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isPaid = searchParams.get('paid') === '1';
  const { user, profile, isLoading: authLoading, isAdmin } = useAuth();
  const { data: myProfile, isLoading } = useMyFreelancerProfile();
  const [subChecked, setSubChecked] = useState(false);
  const [subscription, setSubscription] = useState<{ status: string; expires_at: string | null } | null>(null);
  const [notifications, setNotifications] = useState<Array<{ id: string; title: string; body: string | null; is_read: boolean; created_at: string }>>([]);
  const [cancellingSubscription, setCancellingSubscription] = useState(false);
  const upsertProfile = useUpsertFreelancerProfile();
  const addProject = useAddFreelancerProject();
  const deleteProject = useDeleteFreelancerProject();
  const deleteProfileMut = useDeleteFreelancerProfile();

  const [title, setTitle] = useState("");
  const [bio, setBio] = useState("");
  const [hourlyRate, setHourlyRate] = useState<number | "">("");
  const [availability, setAvailability] = useState("available");
  const [experienceLevel, setExperienceLevel] = useState("junior");
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [languages, setLanguages] = useState<string[]>([]);
  const [newLang, setNewLang] = useState("");

  // Avatar
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Project form
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [projTitle, setProjTitle] = useState("");
  const [projDesc, setProjDesc] = useState("");
  const [projLiveUrl, setProjLiveUrl] = useState("");
  const [projGithubUrl, setProjGithubUrl] = useState("");
  const [projImage, setProjImage] = useState<File | null>(null);
  const [projImagePreview, setProjImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate('/auth');
  }, [authLoading, user]);

  useEffect(() => {
    if (authLoading || !user) return;
    if (isPaid || isAdmin) { setSubChecked(true); return; }
    supabase
      .from('freelancer_subscriptions')
      .select('status, expires_at')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle()
      .then(({ data }: { data: { status: string; expires_at: string | null } | null }) => {
        if (!data || (data.expires_at && new Date(data.expires_at) < new Date())) {
          navigate('/packages?mode=freelancer');
        } else {
          setSubscription(data);
          setSubChecked(true);
        }
      });
  }, [authLoading, user, isPaid]);

  useEffect(() => {
    if (!user || !subChecked) return;
    supabase
      .from('user_notifications')
      .select('id, title, body, is_read, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10)
      .then(({ data }: { data: Array<{ id: string; title: string; body: string | null; is_read: boolean; created_at: string }> | null }) => {
        if (data) setNotifications(data);
      });
  }, [user, subChecked]);

  const handleCancelSubscription = async () => {
    if (!user || cancellingSubscription) return;
    setCancellingSubscription(true);
    try {
      const { error } = await supabase
        .from('freelancer_subscriptions')
        .update({ status: 'cancelled' })
        .eq('user_id', user.id);
      if (error) throw error;
      setSubscription(prev => prev ? { ...prev, status: 'cancelled' } : prev);
      toast.success('სააბონემენტო გაუქმდა. ვადის ბოლომდე პროფილი აქტიური რჩება.');
    } catch {
      toast.error('შეცდომა გაუქმებისას');
    } finally {
      setCancellingSubscription(false);
    }
  };

  const markNotificationRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    await supabase.from('user_notifications').update({ is_read: true }).eq('id', id);
  };

  useEffect(() => {
    if (myProfile) {
      setTitle(myProfile.title || "");
      setBio(myProfile.bio || "");
      setHourlyRate(myProfile.hourly_rate ?? "");
      setAvailability(myProfile.availability);
      setExperienceLevel(myProfile.experience_level || "junior");
      setSkills(myProfile.skills || []);
      setLanguages(myProfile.languages || []);
    }
  }, [myProfile]);

  useEffect(() => {
    if (profile?.avatar_url && !avatarPreview) {
      setAvatarPreview(profile.avatar_url);
    }
  }, [profile]);

  const addSkill = () => {
    const s = newSkill.trim();
    if (s && !skills.includes(s)) { setSkills([...skills, s]); setNewSkill(""); }
  };

  const addLanguage = (lang: string) => {
    if (lang && !languages.includes(lang)) setLanguages([...languages, lang]);
    setNewLang("");
  };

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { toast.error("ფაილი ძალიან დიდია (მაქს 5MB)"); return; }
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveProfile = async () => {
    if (!title.trim()) { toast.error("პროფესიული ტიტული აუცილებელია"); return; }
    setSaving(true);
    try {
      if (avatarFile && user) {
        const ext = avatarFile.name.split('.').pop();
        const path = `${user.id}/avatar.${ext}`;
        const { error: uploadErr } = await supabase.storage.from('avatars').upload(path, avatarFile, { upsert: true });
        if (uploadErr) throw uploadErr;
        const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path);
        await supabase.from('profiles').update({ avatar_url: urlData.publicUrl }).eq('user_id', user.id);
      }

      await upsertProfile.mutateAsync({
        title, bio, hourly_rate: hourlyRate === "" ? null : hourlyRate, availability, skills,
        experience_level: experienceLevel, languages,
      });
      toast.success("პროფილი წარმატებით შენახულია!");
    } catch (err: any) {
      toast.error(err?.message || "პროფილის შენახვა ვერ მოხერხდა");
    } finally {
      setSaving(false);
    }
  };

  const handleAddProject = async () => {
    if (!myProfile?.id || !projTitle.trim()) { toast.error("პროექტის სახელი აუცილებელია"); return; }
    setSaving(true);
    try {
      let imageUrl: string | null = null;
      if (projImage && user) {
        const ext = projImage.name.split('.').pop();
        const path = `${user.id}/${Date.now()}.${ext}`;
        const { error: uploadErr } = await supabase.storage.from('project-images').upload(path, projImage);
        if (uploadErr) throw uploadErr;
        const { data: urlData } = supabase.storage.from('project-images').getPublicUrl(path);
        imageUrl = urlData.publicUrl;
      }
      await addProject.mutateAsync({
        profile_id: myProfile.id, title: projTitle, description: projDesc || null,
        image_url: imageUrl, live_url: projLiveUrl || null, github_url: projGithubUrl || null,
      });
      setProjTitle(""); setProjDesc(""); setProjLiveUrl(""); setProjGithubUrl("");
      setProjImage(null); setProjImagePreview(null); setShowProjectForm(false);
      toast.success("პროექტი დამატებულია!");
    } catch { toast.error("პროექტის დამატება ვერ მოხერხდა"); }
    finally { setSaving(false); }
  };

  const handleDeleteProfile = async () => {
    if (!myProfile?.id) return;
    try {
      await deleteProfileMut.mutateAsync(myProfile.id);
      toast.success("პროფილი წაშლილია");
      navigate('/freelancers');
    } catch { toast.error("წაშლა ვერ მოხერხდა"); }
  };

  if (authLoading || isLoading || !subChecked) {
    return (
      <>
        <Atmosphere /><Header />
        <main className="page-content">
          <div className="container flex items-center justify-center min-h-[60vh]">
            <div className="flp-loading">
              <div className="flp-loading-ring" />
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Atmosphere />
      <Header />
      <ChatWidget />
      <main className="page-content">
        <div className="container">

          {/* ═══ Hero Banner ═══ */}
          <section className="flp-hero" style={{ backgroundImage: `url(${freelancersHeroBg})` }}>
            <div className="flp-hero-overlay" />
            <div className="flp-hero-content">
              <div className="flp-hero-avatar-area">
                <div className="flp-avatar-ring group" onClick={() => avatarInputRef.current?.click()}>
                  <Avatar className="w-full h-full">
                    {avatarPreview ? <AvatarImage src={avatarPreview} className="object-cover" /> : null}
                    <AvatarFallback className="bg-primary/15 text-primary font-black text-4xl">
                      {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flp-avatar-hover">
                    <Camera className="w-6 h-6 text-white" />
                    <span className="text-white text-[10px] font-semibold mt-1">ფოტოს შეცვლა</span>
                  </div>
                  <div className="flp-avatar-badge">
                    <Camera className="w-3 h-3" />
                  </div>
                </div>
                <input ref={avatarInputRef} type="file" accept="image/*" onChange={handleAvatarSelect} className="hidden" />
              </div>
              <div className="flp-hero-info">
                <h1 className="flp-hero-name">{profile?.full_name || 'თქვენი სახელი'}</h1>
                <p className="flp-hero-email">{profile?.email}</p>
                {myProfile?.id && (
                  <div className="flp-hero-status">
                    <span className="flp-status-dot" />
                    პროფილი აქტიურია
                  </div>
                )}
              </div>
            </div>
            {myProfile?.id && (
              <button onClick={() => setShowDeleteConfirm(true)} className="flp-delete-btn">
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </section>

          {/* Delete Confirmation */}
          {showDeleteConfirm && (
            <div className="flp-delete-confirm animate-in slide-in-from-top-2 duration-300">
              <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">ნამდვილად გსურთ პროფილის წაშლა?</p>
                <p className="text-xs text-muted-foreground mt-0.5">ეს წაშლის თქვენს პროფილს, უნარებს და პროექტებს.</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => setShowDeleteConfirm(false)} className="px-4 py-2 text-xs bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors">გაუქმება</button>
                <button onClick={handleDeleteProfile} className="px-4 py-2 text-xs bg-destructive text-destructive-foreground rounded-xl hover:bg-destructive/90 transition-colors font-semibold">წაშლა</button>
              </div>
            </div>
          )}

          {/* ═══ Subscription Banner ═══ */}
          {subscription && (
            <div className={`flp-sub-banner${subscription.status === 'cancelled' ? ' flp-sub-banner-cancelled' : ''}`}>
              <div className="flp-sub-info">
                <span className="material-symbols-rounded flp-sub-icon">
                  {subscription.status === 'cancelled' ? 'cancel' : 'verified'}
                </span>
                <div>
                  <div className="flp-sub-title">
                    {subscription.status === 'cancelled'
                      ? 'სააბონემენტო გაუქმებულია'
                      : 'ფრილანსერის სააბონემენტო — აქტიური'}
                  </div>
                  {subscription.expires_at && (
                    <div className="flp-sub-expiry">
                      {subscription.status === 'cancelled'
                        ? `პროფილი აქტიურია: ${new Date(subscription.expires_at).toLocaleDateString('ka-GE', { day: 'numeric', month: 'long', year: 'numeric' })}-მდე`
                        : `განახლება: ${new Date(subscription.expires_at).toLocaleDateString('ka-GE', { day: 'numeric', month: 'long', year: 'numeric' })}`}
                    </div>
                  )}
                </div>
              </div>
              {subscription.status === 'active' && (
                <button
                  className="flp-sub-cancel-btn"
                  onClick={handleCancelSubscription}
                  disabled={cancellingSubscription}
                >
                  {cancellingSubscription
                    ? <><span className="flp-mini-spinner" />გაუქმება...</>
                    : <>სააბონემენტოს გაუქმება</>}
                </button>
              )}
            </div>
          )}

          {/* ═══ Notifications ═══ */}
          {notifications.filter(n => !n.is_read).length > 0 && (
            <div className="flp-notifs">
              {notifications.filter(n => !n.is_read).map(n => (
                <div key={n.id} className="flp-notif">
                  <span className="material-symbols-rounded flp-notif-icon">notifications</span>
                  <div className="flp-notif-body">
                    <div className="flp-notif-title">{n.title}</div>
                    {n.body && <div className="flp-notif-text">{n.body}</div>}
                  </div>
                  <button className="flp-notif-close" onClick={() => markNotificationRead(n.id)} title="წაკითხულად მონიშვნა">
                    <span className="material-symbols-rounded">close</span>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* ═══ Form Sections ═══ */}
          <div className="flp-grid">

            {/* Left Column — Main Info */}
            <div className="flp-col-main">

              {/* Professional Info */}
              <div className="flp-card flp-card-animate" style={{ animationDelay: '0ms' }}>
                <div className="flp-card-header">
                  <div className="flp-card-icon"><User className="w-4 h-4" /></div>
                  <h2 className="flp-card-title">პროფესიული ინფორმაცია</h2>
                </div>

                <div className="flp-field">
                  <label className="flp-label">პროფესიული ტიტული <span className="text-primary">*</span></label>
                  <input value={title} onChange={e => setTitle(e.target.value)} placeholder="მაგ: Full-Stack Developer, UI/UX Designer"
                    className="flp-input" />
                </div>

                <div className="flp-field">
                  <label className="flp-label">ბიო / აღწერა</label>
                  <textarea value={bio} onChange={e => setBio(e.target.value)} rows={4}
                    placeholder="მოკლედ აღწერეთ თქვენი გამოცდილება..."
                    className="flp-input flp-textarea" />
                </div>

                <div className="flp-row-3">
                  <div className="flp-field">
                    <label className="flp-label">ტარიფი ($/სთ)</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-semibold">$</span>
                      <input type="number" value={hourlyRate} onChange={e => setHourlyRate(e.target.value ? Number(e.target.value) : "")}
                        placeholder="50" className="flp-input pl-8" />
                    </div>
                  </div>
                  <div className="flp-field">
                    <label className="flp-label">ხელმისაწვდომობა</label>
                    <select value={availability} onChange={e => setAvailability(e.target.value)} className="flp-input flp-select">
                      <option value="available">ხელმისაწვდომი</option>
                      <option value="busy">დაკავებული</option>
                      <option value="open_to_offers">ღია შეთავაზებებისთვის</option>
                    </select>
                  </div>
                  <div className="flp-field">
                    <label className="flp-label">გამოცდილება</label>
                    <select value={experienceLevel} onChange={e => setExperienceLevel(e.target.value)} className="flp-input flp-select">
                      {EXPERIENCE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div className="flp-card flp-card-animate" style={{ animationDelay: '80ms' }}>
                <div className="flp-card-header">
                  <div className="flp-card-icon"><Code className="w-4 h-4" /></div>
                  <h2 className="flp-card-title">უნარები / ტექნოლოგიები</h2>
                  <span className="flp-card-count">{skills.length}</span>
                </div>

                <div className="flp-skills-grid">
                  {skills.map((s, i) => (
                    <div key={s} className="flp-skill-tag" style={{ animationDelay: `${i * 30}ms` }}>
                      <span>{s}</span>
                      <button onClick={() => setSkills(skills.filter(sk => sk !== s))} className="flp-skill-remove">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {skills.length === 0 && <span className="text-xs text-muted-foreground/50 py-2">ჯერ არ გაქვთ უნარები</span>}
                </div>

                <div className="flex gap-2 mt-3">
                  <input value={newSkill} onChange={e => setNewSkill(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                    placeholder="მაგ: React, Python, Figma..."
                    className="flp-input flex-1" />
                  <button onClick={addSkill} disabled={!newSkill.trim()} className="flp-add-btn">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Languages */}
              <div className="flp-card flp-card-animate" style={{ animationDelay: '160ms' }}>
                <div className="flp-card-header">
                  <div className="flp-card-icon"><Languages className="w-4 h-4" /></div>
                  <h2 className="flp-card-title">ენები</h2>
                </div>

                <div className="flp-skills-grid">
                  {languages.map(l => (
                    <div key={l} className="flp-lang-tag">
                      <span>{l}</span>
                      <button onClick={() => setLanguages(languages.filter(ll => ll !== l))} className="flp-skill-remove">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-1.5 mt-3">
                  {COMMON_LANGUAGES.filter(l => !languages.includes(l)).map(l => (
                    <button key={l} onClick={() => addLanguage(l)} className="flp-quick-lang">
                      + {l}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2 mt-3">
                  <input value={newLang} onChange={e => setNewLang(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addLanguage(newLang.trim()))}
                    placeholder="სხვა ენა..."
                    className="flp-input flex-1" />
                  <button onClick={() => addLanguage(newLang.trim())} disabled={!newLang.trim()} className="flp-add-btn">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Save Button */}
              <button onClick={handleSaveProfile} disabled={saving} className="flp-save-btn flp-card-animate" style={{ animationDelay: '240ms' }}>
                {saving ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    პროფილის შენახვა
                    
                  </>
                )}
              </button>
            </div>

            {/* Right Column — Portfolio */}
            <div className="flp-col-side">
              <div className="flp-card flp-card-animate" style={{ animationDelay: '100ms' }}>
                <div className="flp-card-header">
                  <div className="flp-card-icon"><Briefcase className="w-4 h-4" /></div>
                  <h2 className="flp-card-title">პორტფოლიო</h2>
                  {myProfile?.projects && <span className="flp-card-count">{myProfile.projects.length}</span>}
                </div>

                {myProfile?.id && (
                  <button onClick={() => setShowProjectForm(!showProjectForm)}
                    className="flp-add-project-btn">
                    <Plus className="w-4 h-4" />
                    ახალი პროექტი
                  </button>
                )}

                {!myProfile?.id && (
                  <div className="flp-empty-state">
                    <Briefcase className="w-8 h-8 text-muted-foreground/20" />
                    <p>ჯერ შეინახეთ პროფილი</p>
                  </div>
                )}

                {showProjectForm && (
                  <div className="flp-project-form animate-in slide-in-from-top-2 duration-300">
                    <input value={projTitle} onChange={e => setProjTitle(e.target.value)} placeholder="პროექტის სახელი *" className="flp-input" />
                    <textarea value={projDesc} onChange={e => setProjDesc(e.target.value)} placeholder="აღწერა (არასავალდებულო)" rows={3} className="flp-input flp-textarea" />
                    <div className="grid grid-cols-2 gap-2">
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                        <input value={projLiveUrl} onChange={e => setProjLiveUrl(e.target.value)} placeholder="Live URL" className="flp-input pl-9" />
                      </div>
                      <div className="relative">
                        <Github className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                        <input value={projGithubUrl} onChange={e => setProjGithubUrl(e.target.value)} placeholder="GitHub" className="flp-input pl-9" />
                      </div>
                    </div>

                    <label className="flp-upload-area">
                      <Upload className="w-5 h-5 text-muted-foreground/40" />
                      <span className="text-xs text-muted-foreground">სურათის ატვირთვა</span>
                      <input type="file" accept="image/*" onChange={e => {
                        const f = e.target.files?.[0];
                        if (f) { setProjImage(f); setProjImagePreview(URL.createObjectURL(f)); }
                      }} className="hidden" />
                    </label>
                    {projImagePreview && (
                      <div className="relative inline-block">
                        <img src={projImagePreview} alt="Preview" className="h-24 rounded-xl object-cover" />
                        <button onClick={() => { setProjImage(null); setProjImagePreview(null); }}
                          className="absolute -top-2 -right-2 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center text-xs">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button onClick={handleAddProject} disabled={saving || !projTitle.trim()} className="flp-btn-primary flex-1">
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "დამატება"}
                      </button>
                      <button onClick={() => { setShowProjectForm(false); setProjTitle(""); setProjDesc(""); setProjImage(null); setProjImagePreview(null); }}
                        className="flp-btn-ghost">გაუქმება</button>
                    </div>
                  </div>
                )}

                {myProfile?.projects && myProfile.projects.length > 0 && (
                  <div className="flp-projects-list">
                    {myProfile.projects.map(p => (
                      <div key={p.id} className="flp-project-item group">
                        {p.image_url && <img src={p.image_url} alt={p.title} className="flp-project-img" />}
                        <div className="flp-project-info">
                          <h2 className="font-bold text-sm">{p.title}</h2>
                          {p.description && <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{p.description}</p>}
                          <div className="flex gap-3 mt-2">
                            {p.live_url && (
                              <a href={p.live_url} target="_blank" rel="noopener noreferrer" className="text-[11px] text-primary hover:underline flex items-center gap-1 font-medium">
                                <ExternalLink className="w-3 h-3" /> Live
                              </a>
                            )}
                            {p.github_url && (
                              <a href={p.github_url} target="_blank" rel="noopener noreferrer" className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1">
                                <Github className="w-3 h-3" /> Source
                              </a>
                            )}
                          </div>
                        </div>
                        <button onClick={() => { if (confirm('წაშალეთ ეს პროექტი?')) deleteProject.mutate(p.id); }}
                          className="flp-project-delete">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {myProfile?.id && (!myProfile.projects || myProfile.projects.length === 0) && !showProjectForm && (
                  <div className="flp-empty-state">
                    <Briefcase className="w-8 h-8 text-muted-foreground/20" />
                    <p>დაამატეთ პროექტები</p>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </main>
    </>
  );
};

export default FreelancerProfile;
