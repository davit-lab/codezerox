import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Atmosphere from "@/components/layout/Atmosphere";
import Header from "@/components/layout/Header";
import ChatWidget from "@/components/chat/ChatWidget";
import { useAuth } from "@/hooks/useAuth";
import { useUserCredits } from "@/hooks/useCredits";
import { usePurchases } from "@/hooks/usePurchases";
import { useMyCoursePurchases } from "@/hooks/useCourses";
import { useMyWarnings } from "@/hooks/useMarketplace";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  User, Mail, Calendar, Shield, LogOut, Save, Camera, 
  BookOpen, CreditCard, Receipt, Coins, ChevronRight,
  Settings, MapPin, Github, Globe, Briefcase, Code, Plus, X, Eye, Trash2, AlertTriangle,
  Linkedin, Facebook, FileText
} from "lucide-react";

const Profile = () => {
  const navigate = useNavigate();
  const { user, profile, isAdmin, signOut, updateProfile, isLoading } = useAuth();
  const { data: credits } = useUserCredits();
  const { data: purchases = [] } = usePurchases();
  const { data: coursePurchases = [] } = useMyCoursePurchases();
  const { data: warnings = [] } = useMyWarnings();
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [bio, setBio] = useState(profile?.bio || "");
  const [experience, setExperience] = useState(profile?.experience || "");
  const [githubUrl, setGithubUrl] = useState(profile?.github_url || '');
  const [websiteUrl, setWebsiteUrl] = useState(profile?.website_url || '');
  const [linkedinUrl, setLinkedinUrl] = useState(profile?.linkedin_url || '');
  const [facebookUrl, setFacebookUrl] = useState(profile?.facebook_url || '');
  const [cvPath, setCvPath] = useState(profile?.cv_url || '');
  const [cvSignedUrl, setCvSignedUrl] = useState<string | null>(null);
  const [uploadingCv, setUploadingCv] = useState(false);
  const [loadingCv, setLoadingCv] = useState(false);
  const cvInputRef = useRef<HTMLInputElement>(null);
  const [location, setLocation] = useState(profile?.location || "");
  const [skills, setSkills] = useState<string[]>(profile?.skills || []);
  const [newSkill, setNewSkill] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state when profile loads initially (only once)
  const [hasSynced, setHasSynced] = useState(false);
  useEffect(() => {
    if (profile && !hasSynced) {
      setFullName(profile.full_name || "");
      setBio(profile.bio || "");
      setExperience(profile.experience || "");
      setGithubUrl(profile.github_url || '');
      setWebsiteUrl(profile.website_url || '');
      setLinkedinUrl(profile.linkedin_url || '');
      setFacebookUrl(profile.facebook_url || '');
      const savedCv = profile.cv_url || '';
      if (savedCv.includes('supabase.co/storage')) {
        setCvPath('');
      } else {
        setCvPath(savedCv);
      }
      setLocation(profile.location || "");
      setSkills(profile.skills || []);
      setHasSynced(true);
    }
  }, [profile, hasSynced]);

  if (isLoading) {
    return (
      <>
        <Atmosphere />
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-16 h-16 rounded-full border-4 border-border-subtle animate-spin" style={{ borderTopColor: 'var(--gold)' }} />
        </div>
      </>
    );
  }

  if (!user) {
    navigate("/auth");
    return null;
  }

  const handleSave = async () => {
    setSaving(true);
    console.log("Saving profile...", { fullName, bio, location, linkedinUrl, facebookUrl, cvPath });
    const payload = { 
      full_name: fullName,
      bio: bio || null,
      experience: experience || null,
      github_url: githubUrl || null,
      website_url: websiteUrl || null,
      linkedin_url: linkedinUrl || null,
      facebook_url: facebookUrl || null,
      cv_url: cvPath || null,
      location: location || null,
      skills: skills.length > 0 ? skills : [],
    };
    console.log("Payload:", payload);
    const { error } = await updateProfile(payload as any);
    console.log("Update result:", { error });
    if (error) {
      console.error("Profile save error:", error);
      toast.error("შეცდომა შენახვისას: " + error.message);
    } else {
      toast.success("პროფილი განახლდა");
    }
    setSaving(false);
  };

  const handleCvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCv(true);
    try {
      const ext = file.name.split('.').pop();
      const filePath = `${user!.id}/cv/${Date.now()}.${ext}`;
      // Upload to private bucket 'user-cvs'
      const { error: uploadError } = await supabase.storage.from('user-cvs').upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;
      // Store just the path, not a public URL
      setCvPath(filePath);
      await updateProfile({ cv_url: filePath } as any);
      toast.success('CV ატვირთულია');
    } catch {
      toast.error('CV ატვირთვა ვერ მოხერხდა');
    } finally {
      setUploadingCv(false);
    }
  };

  const handleViewCv = async () => {
    if (!cvPath) return;
    setLoadingCv(true);
    try {
      // Create signed URL valid for 1 hour
      const { data, error } = await supabase.storage.from('user-cvs').createSignedUrl(cvPath, 3600);
      if (error) throw error;
      setCvSignedUrl(data.signedUrl);
      // Open in new tab
      window.open(data.signedUrl, '_blank');
    } catch {
      toast.error('CV-ის ნახვა ვერ მოხერხდა');
    } finally {
      setLoadingCv(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
      await updateProfile({ avatar_url: publicUrl });
      toast.success("ავატარი განახლდა");
    } catch {
      toast.error("ავატარის ატვირთვა ვერ მოხერხდა");
    } finally {
      setUploading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "წაშლა") return;
    setDeleting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const response = await supabase.functions.invoke('delete-account', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (response.error) throw response.error;

      toast.success("ანგარიში სამუდამოდ წაიშალა");
      await signOut();
      navigate("/");
    } catch (error: any) {
      toast.error("წაშლა ვერ მოხერხდა: " + (error.message || "შეცდომა"));
    } finally {
      setDeleting(false);
    }
  };

  const addSkill = () => {
    const trimmed = newSkill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setNewSkill("");
    }
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter(s => s !== skill));
  };

  const memberSince = profile?.created_at 
    ? new Date(profile.created_at).toLocaleDateString('ka-GE', { year: 'numeric', month: 'long', day: 'numeric' })
    : '-';

  return (
    <>
      <Atmosphere />
      <Header />
      <ChatWidget />
      
      <main className="pt-32 pb-20 min-h-screen">
        <div className="container max-w-5xl mx-auto px-4">
          {/* Profile Header Card */}
          <div className="relative overflow-hidden rounded-3xl bg-bg-card border border-border-subtle p-5 sm:p-8 md:p-12 mb-8">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gold/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
            
            <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
              {/* Avatar */}
              <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl overflow-hidden border-4 border-gold/30 bg-bg-elevated shadow-2xl shadow-gold/20 transition-transform duration-300 group-hover:scale-105">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-16 h-16 text-text-muted" />
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-gold rounded-xl flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:scale-110">
                  {uploading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Camera className="w-5 h-5 text-white" />
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
              </div>

              {/* User Info */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                  <h1 className="text-3xl md:text-4xl font-display font-bold text-text-white">
                    {profile?.full_name || 'მომხმარებელი'}
                  </h1>
                  {isAdmin && (
                    <span className="px-3 py-1 bg-gold/20 border border-gold/30 rounded-full text-xs font-bold text-gold uppercase tracking-wider">
                      Admin
                    </span>
                  )}
                </div>
                <p className="text-text-secondary mb-4">{profile?.email || user.email}</p>
                
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                  <div className="flex items-center gap-2 px-4 py-2 bg-bg-elevated/80 border border-border-subtle rounded-xl">
                    <Calendar className="w-4 h-4 text-gold" />
                    <span className="text-sm text-text-secondary">{memberSince}</span>
                  </div>
                  {/* Temporarily disabled AI credits display */}
                  {/* <div className="flex items-center gap-2 px-4 py-2 bg-gold/10 border border-gold/20 rounded-xl">
                    <Coins className="w-4 h-4 text-gold" />
                    <span className="text-sm font-semibold text-gold">{credits?.credits || 0} კრედიტი</span>
                  </div> */}
                  <Link
                    to={`/user/${user.id}`}
                    className="flex items-center gap-2 px-4 py-2 bg-bg-elevated/80 border border-border-subtle rounded-xl hover:border-gold/30 transition-colors"
                  >
                    <Eye className="w-4 h-4 text-gold" />
                    <span className="text-sm text-text-secondary">საჯარო პროფილი</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { icon: BookOpen, label: 'შეძენილი წიგნები', value: purchases.length, color: 'text-emerald-400', bg: 'bg-emerald-500/15' },
              // Temporarily disabled AI credits stat
              // { icon: Coins, label: 'კრედიტები', value: credits?.credits || 0, color: 'text-gold', bg: 'bg-gold/15' },
              { icon: Shield, label: 'როლი', value: isAdmin ? 'ადმინი' : 'მომხმარებელი', color: 'text-purple-400', bg: 'bg-purple-500/15' },
              { icon: Calendar, label: 'დარეგისტრირების დრო', value: memberSince.split(' ')[0], color: 'text-blue-400', bg: 'bg-blue-500/15' },
            ].filter(Boolean).map((stat, i) => (
              <div key={i} className="group p-5 bg-bg-card border border-border-subtle rounded-2xl hover:border-gold/20 transition-all duration-300 hover:-translate-y-1">
                <div className={`w-11 h-11 rounded-xl ${stat.bg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div className="text-xl sm:text-2xl font-bold text-text-white mb-1 truncate">{stat.value}</div>
                <div className="text-[10px] sm:text-xs text-text-muted truncate">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Edit Profile Card */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Info */}
              <div className="bg-bg-card border border-border-subtle rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-border-subtle flex items-center gap-3">
                  <Settings className="w-5 h-5 text-gold" />
                  <h2 className="font-semibold text-text-white">ძირითადი ინფორმაცია</h2>
                </div>
                <div className="p-6 space-y-5">
                  <div>
                    <label className="flex items-center gap-2 text-sm text-text-secondary mb-2">
                      <Mail className="w-4 h-4" /> ელ-ფოსტა
                    </label>
                    <input type="email" value={profile?.email || user.email || ''} disabled className="w-full px-4 py-3 bg-bg-elevated border border-border-subtle rounded-xl text-text-muted cursor-not-allowed" />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm text-text-secondary mb-2">
                      <User className="w-4 h-4" /> სახელი
                    </label>
                    <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="შეიყვანეთ თქვენი სახელი" className="w-full px-4 py-3 bg-white border border-border-subtle rounded-xl text-black placeholder:text-gray-400 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all" />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm text-text-secondary mb-2">
                      <MapPin className="w-4 h-4" /> მდებარეობა
                    </label>
                    <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="მაგ: თბილისი, საქართველო" className="w-full px-4 py-3 bg-white border border-border-subtle rounded-xl text-black placeholder:text-gray-400 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all" />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm text-text-secondary mb-2">
                      <User className="w-4 h-4" /> ბიო
                    </label>
                    <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="მოკლედ საკუთარ თავზე..." rows={3} className="w-full px-4 py-3 bg-white border border-border-subtle rounded-xl text-black placeholder:text-gray-400 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all resize-none" />
                  </div>
                </div>
              </div>

              {/* Experience */}
              <div className="bg-bg-card border border-border-subtle rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-border-subtle flex items-center gap-3">
                  <Briefcase className="w-5 h-5 text-gold" />
                  <h2 className="font-semibold text-text-white">გამოცდილება</h2>
                </div>
                <div className="p-6">
                  <textarea value={experience} onChange={(e) => setExperience(e.target.value)} placeholder="აღწერეთ თქვენი სამუშაო გამოცდილება, პროექტები..." rows={5} className="w-full px-4 py-3 bg-white border border-border-subtle rounded-xl text-black placeholder:text-gray-400 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all resize-none" />
                </div>
              </div>

              {/* Skills */}
              <div className="bg-bg-card border border-border-subtle rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-border-subtle flex items-center gap-3">
                  <Code className="w-5 h-5 text-gold" />
                  <h2 className="font-semibold text-text-white">უნარები</h2>
                </div>
                <div className="p-6">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {skills.map((skill, i) => (
                      <span key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-gold/10 border border-gold/20 text-gold text-sm rounded-xl">
                        {skill}
                        <button onClick={() => removeSkill(skill)} className="hover:text-red-400 transition-colors">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input type="text" value={newSkill} onChange={(e) => setNewSkill(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())} placeholder="მაგ: React, Python..." className="flex-1 px-4 py-2.5 bg-white border border-border-subtle rounded-xl text-black placeholder:text-gray-400 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all text-sm" />
                    <button onClick={addSkill} className="px-4 py-2.5 bg-gold/10 border border-gold/20 text-gold rounded-xl hover:bg-gold/20 transition-colors">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Links */}
              <div className="bg-bg-card border border-border-subtle rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-border-subtle flex items-center gap-3">
                  <Globe className="w-5 h-5 text-gold" />
                  <h2 className="font-semibold text-text-white">ბმულები</h2>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm text-text-secondary mb-2">
                      <Github className="w-4 h-4" /> GitHub
                    </label>
                    <input type="url" value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} placeholder="https://github.com/username" className="w-full px-4 py-3 bg-white border border-border-subtle rounded-xl text-black placeholder:text-gray-400 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all" />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm text-text-secondary mb-2">
                      <Globe className="w-4 h-4" /> ვებსაიტი
                    </label>
                    <input type="url" value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} placeholder="https://yoursite.com" className="w-full px-4 py-3 bg-white border border-border-subtle rounded-xl text-black placeholder:text-gray-400 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all" />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm text-text-secondary mb-2">
                      <Linkedin className="w-4 h-4" /> LinkedIn
                    </label>
                    <input type="url" value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} placeholder="https://linkedin.com/in/username" className="w-full px-4 py-3 bg-white border border-border-subtle rounded-xl text-black placeholder:text-gray-400 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all" />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm text-text-secondary mb-2">
                      <Facebook className="w-4 h-4" /> Facebook
                    </label>
                    <input type="url" value={facebookUrl} onChange={(e) => setFacebookUrl(e.target.value)} placeholder="https://facebook.com/username" className="w-full px-4 py-3 bg-white border border-border-subtle rounded-xl text-black placeholder:text-gray-400 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all" />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm text-text-secondary mb-2">
                      <FileText className="w-4 h-4" /> CV / რეზიუმე
                    </label>
                    <div className="flex gap-3 items-center">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        ref={cvInputRef}
                        onChange={handleCvUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => cvInputRef.current?.click()}
                        disabled={uploadingCv}
                        className="flex items-center gap-2 px-4 py-2.5 bg-gold/10 border border-gold/20 text-gold rounded-xl hover:bg-gold/20 transition-colors text-sm disabled:opacity-50"
                      >
                        {uploadingCv ? <div className="w-4 h-4 border-2 border-gold/30 border-t-gold rounded-full animate-spin" /> : <FileText className="w-4 h-4" />}
                        {cvPath ? 'CV შეცვლა' : 'CV ატვირთვა'}
                      </button>
                      {cvPath && (
                        <button
                          onClick={handleViewCv}
                          disabled={loadingCv}
                          className="text-sm text-gold underline truncate max-w-xs hover:text-gold/80 disabled:opacity-50"
                        >
                          {loadingCv ? 'იტვირთება...' : 'ატვირთული CV ნახვა'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Save / Sign Out */}
              <div className="flex gap-3">
                <button onClick={handleSave} disabled={saving} className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gold text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-gold/30 transition-all duration-300 disabled:opacity-50">
                  {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save className="w-5 h-5" /> შენახვა</>}
                </button>
                <button onClick={handleSignOut} className="flex items-center justify-center gap-2 px-6 py-3 bg-red-500/10 border border-red-500/20 text-red-400 font-semibold rounded-xl hover:bg-red-500/20 transition-all duration-300">
                  <LogOut className="w-5 h-5" /> გასვლა
                </button>
              </div>

              {/* Warnings */}
              {warnings.length > 0 && (
                <div className="bg-bg-card border border-orange-500/30 rounded-2xl overflow-hidden">
                  <div className="px-6 py-4 border-b border-orange-500/20 flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-orange-400" />
                    <h2 className="font-semibold text-orange-400">ადმინის გაფრთხილებები ({warnings.length})</h2>
                  </div>
                  <div className="p-4 flex flex-col gap-3">
                    {warnings.map((w: { id: string; message: string; created_at: string }) => (
                      <div key={w.id} className="p-3 bg-orange-500/08 border border-orange-500/20 rounded-xl">
                        <p className="text-sm text-orange-200 leading-relaxed">{w.message}</p>
                        <p className="text-xs text-orange-400/60 mt-1">{new Date(w.created_at).toLocaleString('ka-GE')}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Delete Account */}
              <div className="bg-bg-card border border-red-500/20 rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-red-500/20 flex items-center gap-3">
                  <Trash2 className="w-5 h-5 text-red-400" />
                  <h2 className="font-semibold text-red-400">ანგარიშის წაშლა</h2>
                </div>
                <div className="p-6">
                  <p className="text-text-secondary text-sm mb-4">
                    ანგარიშის წაშლა სამუდამოა და შეუქცევადი. ყველა მონაცემი, შეძენილი წიგნები, კურსები და პროგრესი წაიშლება.
                  </p>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl hover:bg-red-500/20 transition-all text-sm font-medium"
                  >
                    <Trash2 className="w-4 h-4" />
                    ანგარიშის სამუდამოდ წაშლა
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-bg-card border border-border-subtle rounded-2xl overflow-hidden h-fit">
              <div className="px-6 py-4 border-b border-border-subtle flex items-center gap-3">
                <ChevronRight className="w-5 h-5 text-gold" />
                <h2 className="font-semibold text-text-white">სწრაფი ბმულები</h2>
              </div>
              <div className="p-3">
                {[
                  { icon: BookOpen, label: 'ჩემი წიგნები', href: '/my-books', desc: 'შეძენილი წიგნები' },
                  { icon: Receipt, label: 'გადახდის ისტორია', href: '/payment/history', desc: 'ყველა ტრანზაქცია' },
                  // Temporarily disabled AI credits
                  // { icon: CreditCard, label: 'კრედიტების შეძენა', href: '/credits', desc: 'AI კრედიტები' },
                  { icon: Eye, label: 'საჯარო პროფილი', href: `/user/${user.id}`, desc: 'ნახე როგორ ჩანს' },
                ].filter(Boolean).map((link, i) => (
                  <Link key={i} to={link.href} className="flex items-center gap-4 p-4 rounded-xl hover:bg-bg-elevated transition-all duration-300 group">
                    <div className="w-11 h-11 rounded-xl bg-gold/15 border border-gold/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <link.icon className="w-5 h-5 text-gold" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-text-white group-hover:text-gold transition-colors">{link.label}</div>
                      <div className="text-xs text-text-muted">{link.desc}</div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-text-muted group-hover:text-gold group-hover:translate-x-1 transition-all duration-300" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-bg-card border border-red-500/30 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-text-white">ანგარიშის წაშლა</h3>
                <p className="text-sm text-text-muted">ეს მოქმედება შეუქცევადია</p>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              {purchases.length > 0 && (
                <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <BookOpen className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-300">
                    თქვენ გაქვთ <strong>{purchases.length} შეძენილი წიგნი</strong>. წაშლის შემდეგ მათ ვეღარასდროს ვერ დაიბრუნებთ.
                  </p>
                </div>
              )}
              {coursePurchases.length > 0 && (
                <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <CreditCard className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-300">
                    თქვენ გაქვთ <strong>{coursePurchases.length} შეძენილი კურსი</strong>. წაშლის შემდეგ მათ ვეღარასდროს ვერ დაიბრუნებთ.
                  </p>
                </div>
              )}
              <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                <Trash2 className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-300">
                  ყველა მონაცემი, კრედიტები, პროგრესი და სერტიფიკატები სამუდამოდ წაიშლება.
                </p>
              </div>
            </div>

            <div className="mb-4">
              <label className="text-sm text-text-secondary mb-2 block">
                დასადასტურებლად ჩაწერეთ <strong className="text-red-400">წაშლა</strong>
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="წაშლა"
                className="w-full px-4 py-3 bg-bg-elevated border border-red-500/30 rounded-xl text-text-white placeholder:text-text-muted focus:outline-none focus:border-red-500 transition-all"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setShowDeleteModal(false); setDeleteConfirmText(""); }}
                className="flex-1 px-4 py-3 bg-bg-elevated border border-border-subtle text-text-secondary rounded-xl hover:bg-bg-card transition-all font-medium"
              >
                გაუქმება
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== "წაშლა" || deleting}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all font-medium disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {deleting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <><Trash2 className="w-4 h-4" /> სამუდამოდ წაშლა</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Profile;
