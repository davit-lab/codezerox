import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import AdminLayout from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { ka } from "date-fns/locale";
import { Activity, Eye, LogIn, BookOpen, Code, GraduationCap, Users, Search, Monitor, Smartphone, Tablet, Trash2, ShoppingCart, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const ACTION_LABELS: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  login: { label: "შესვლა", color: "bg-green-500/20 text-green-400 border-green-500/30", icon: <LogIn className="w-3.5 h-3.5" /> },
  page_view: { label: "გვერდის ნახვა", color: "bg-blue-500/20 text-blue-400 border-blue-500/30", icon: <Eye className="w-3.5 h-3.5" /> },
  reading_book: { label: "წიგნის კითხვა", color: "bg-purple-500/20 text-purple-400 border-purple-500/30", icon: <BookOpen className="w-3.5 h-3.5" /> },
  viewing_book: { label: "წიგნის ნახვა", color: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30", icon: <Eye className="w-3.5 h-3.5" /> },
  viewing_course: { label: "კურსის ნახვა", color: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30", icon: <GraduationCap className="w-3.5 h-3.5" /> },
  using_ai_tutor: { label: "AI ტუტორი", color: "bg-amber-500/20 text-amber-400 border-amber-500/30", icon: <Activity className="w-3.5 h-3.5" /> },
  using_playground: { label: "კოდის ედიტორი", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30", icon: <Code className="w-3.5 h-3.5" /> },
  taking_exam: { label: "გამოცდა", color: "bg-red-500/20 text-red-400 border-red-500/30", icon: <GraduationCap className="w-3.5 h-3.5" /> },
  add_to_cart: { label: "კალათაში დამატება", color: "bg-orange-500/20 text-orange-400 border-orange-500/30", icon: <ShoppingCart className="w-3.5 h-3.5" /> },
};

const PAGE_LABELS: Record<string, string> = {
  "/": "მთავარი",
  "/books": "წიგნები",
  "/courses": "კურსები",
  "/community": "საზოგადოება",
  "/hub": "ჰაბი",
  "/playground": "კოდის ედიტორი",
  "/ai-tutor": "AI ტუტორი",
  "/profile": "პროფილი",
  "/my-books": "ჩემი წიგნები",
  "/cart": "კალათა",
  "/credits": "კრედიტები",
  "/leaderboard": "ლიდერბორდი",
  "/certifications": "სერტიფიკაციები",
  "/blog": "ბლოგი",
  "/vacancies": "ვაკანსიები",
  "/freelancers": "ფრილანსერები",
};

const AdminActivity = () => {
  const { isAdmin } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [notifDialogOpen, setNotifDialogOpen] = useState(false);
  const [notifUserId, setNotifUserId] = useState("");
  const [notifTitle, setNotifTitle] = useState("");
  const [notifMessage, setNotifMessage] = useState("");
  const queryClient = useQueryClient();

  // Delete all activities
  const deleteAllMutation = useMutation({
    mutationFn: async () => {
      const { error } = await (supabase.from('activity_log' as any) as any).delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-activity'] });
      toast.success('ყველა აქტივობა წაიშალა');
    },
  });

  // Delete old activities (7+ days)
  const deleteOldMutation = useMutation({
    mutationFn: async () => {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const { error } = await (supabase.from('activity_log' as any) as any).delete().lt('created_at', weekAgo);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-activity'] });
      toast.success('ძველი აქტივობები წაიშალა (7+ დღის)');
    },
  });

  // Send notification to user
  const sendNotifMutation = useMutation({
    mutationFn: async ({ userId, title, message }: { userId: string; title: string; message: string }) => {
      const { error } = await supabase
        .from('user_notifications')
        .insert({
          user_id: userId,
          title,
          message,
          type: 'admin_message',
        });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('შეტყობინება გაიგზავნა!');
      setNotifDialogOpen(false);
      setNotifTitle('');
      setNotifMessage('');
      setNotifUserId('');
    },
    onError: () => toast.error('შეცდომა გაგზავნისას'),
  });

  const { data: activities, isLoading } = useQuery({
    queryKey: ["admin-activity", actionFilter],
    queryFn: async () => {
      let query = (supabase.from('activity_log' as any) as any)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);

      if (actionFilter !== "all") {
        query = query.eq('action_type', actionFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as any[];
    },
    enabled: isAdmin,
    refetchInterval: 15000, // Auto-refresh every 15s
  });

  // Fetch profiles for user names
  const userIds = [...new Set((activities || []).map((a: any) => a.user_id))];
  const { data: profiles } = useQuery({
    queryKey: ["admin-activity-profiles", userIds],
    queryFn: async () => {
      if (userIds.length === 0) return [];
      const { data } = await supabase
        .from("profiles")
        .select("user_id, full_name, email, avatar_url")
        .in("user_id", userIds);
      return data || [];
    },
    enabled: isAdmin && userIds.length > 0,
  });

  const profileMap = new Map((profiles || []).map(p => [p.user_id, p]));

  // Stats
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayActivities = (activities || []).filter((a: any) => new Date(a.created_at) >= today);
  const todayLogins = todayActivities.filter((a: any) => a.action_type === 'login');
  const todayReading = todayActivities.filter((a: any) => a.action_type === 'reading_book');
  const uniqueUsersToday = new Set(todayActivities.map((a: any) => a.user_id)).size;

  // Filter by search
  const filtered = (activities || []).filter((a: any) => {
    if (!searchQuery) return true;
    const profile = profileMap.get(a.user_id);
    const name = profile?.full_name || '';
    const email = profile?.email || '';
    return name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           email.toLowerCase().includes(searchQuery.toLowerCase()) ||
           (a.page_path || '').toLowerCase().includes(searchQuery.toLowerCase());
  });

  const getPageLabel = (path: string) => {
    if (PAGE_LABELS[path]) return PAGE_LABELS[path];
    if (path?.startsWith('/read/')) return 'წიგნის კითხვა';
    if (path?.startsWith('/books/')) return 'წიგნის გვერდი';
    if (path?.startsWith('/course/')) return 'კურსის გვერდი';
    if (path?.startsWith('/exam/')) return 'გამოცდა';
    if (path?.startsWith('/blog/')) return 'ბლოგ პოსტი';
    return path || '-';
  };

  return (
    <AdminLayout title="აქტივობის მონიტორინგი" titleIcon="monitoring">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-green-500/10">
              <Users className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">აქტიური დღეს</p>
              <p className="text-2xl font-bold">{uniqueUsersToday}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10">
              <LogIn className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">შესვლები დღეს</p>
              <p className="text-2xl font-bold">{todayLogins.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10">
              <BookOpen className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">კითხვა დღეს</p>
              <p className="text-2xl font-bold">{todayReading.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10">
              <Activity className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">სულ აქტივობა დღეს</p>
              <p className="text-2xl font-bold">{todayActivities.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-card/50 backdrop-blur border-border/50 mb-6">
        <CardContent className="p-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="მოძებნე სახელით, ემაილით..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="ფილტრი" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ყველა აქტივობა</SelectItem>
              <SelectItem value="login">შესვლები</SelectItem>
              <SelectItem value="page_view">გვერდების ნახვა</SelectItem>
              <SelectItem value="reading_book">წიგნის კითხვა</SelectItem>
              <SelectItem value="viewing_book">წიგნის ნახვა</SelectItem>
              <SelectItem value="viewing_course">კურსის ნახვა</SelectItem>
              <SelectItem value="using_ai_tutor">AI ტუტორი</SelectItem>
              <SelectItem value="using_playground">კოდის ედიტორი</SelectItem>
              <SelectItem value="taking_exam">გამოცდა</SelectItem>
              <SelectItem value="add_to_cart">კალათაში დამატება</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => deleteOldMutation.mutate()}
            disabled={deleteOldMutation.isPending}
            className="gap-1.5"
          >
            <Trash2 className="w-4 h-4" />
            ძველების წაშლა (7+ დღე)
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              if (confirm('ნამდვილად გსურთ ყველა აქტივობის წაშლა?')) {
                deleteAllMutation.mutate();
              }
            }}
            disabled={deleteAllMutation.isPending}
            className="gap-1.5"
          >
            <Trash2 className="w-4 h-4" />
            ყველას წაშლა
          </Button>
        </CardContent>
      </Card>

      {/* Activity Table */}
      <Card className="bg-card/50 backdrop-blur border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="w-5 h-5" />
            რეალურ-დროში აქტივობა
            <span className="ml-2 text-xs text-muted-foreground font-normal">
              (ავტო-განახლება 15 წმ)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">იტვირთება...</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">აქტივობა არ მოიძებნა</div>
          ) : (
            <Table>
              <TableHeader>
                 <TableRow>
                  <TableHead>მომხმარებელი</TableHead>
                  <TableHead>აქტივობა</TableHead>
                  <TableHead>დეტალები</TableHead>
                  <TableHead>მოწყობილობა</TableHead>
                  <TableHead>დრო</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((activity: any) => {
                  const profile = profileMap.get(activity.user_id);
                  const actionInfo = ACTION_LABELS[activity.action_type] || {
                    label: activity.action_type,
                    color: "bg-muted text-muted-foreground",
                    icon: <Activity className="w-3.5 h-3.5" />,
                  };

                  return (
                    <TableRow key={activity.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                            {profile?.avatar_url ? (
                              <img src={profile.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                            ) : (
                              <span className="text-xs font-medium">
                                {(profile?.full_name || profile?.email || '?')[0]?.toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium leading-tight">
                              {profile?.full_name || 'უცნობი'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {profile?.email || ''}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`${actionInfo.color} gap-1`}>
                          {actionInfo.icon}
                          {actionInfo.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          {activity.action_type === 'add_to_cart' && activity.details?.book_title ? (
                            <span>{activity.details.book_title} — {activity.details.price}₾{activity.details.is_gift ? ' (საჩუქარი)' : ''}</span>
                          ) : (
                            <span>{getPageLabel(activity.page_path)}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          {activity.details?.device === 'Mobile' ? (
                            <Smartphone className="w-3.5 h-3.5" />
                          ) : activity.details?.device === 'Tablet' ? (
                            <Tablet className="w-3.5 h-3.5" />
                          ) : (
                            <Monitor className="w-3.5 h-3.5" />
                          )}
                          <span className="whitespace-nowrap">
                            {activity.details?.os || '?'} · {activity.details?.browser || '?'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground whitespace-nowrap">
                          {format(new Date(activity.created_at), "dd MMM, HH:mm:ss", { locale: ka })}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          title="შეტყობინების გაგზავნა"
                          onClick={() => {
                            setNotifUserId(activity.user_id);
                            setNotifDialogOpen(true);
                          }}
                        >
                          <Send className="w-3.5 h-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Send Notification Dialog */}
      <Dialog open={notifDialogOpen} onOpenChange={setNotifDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>შეტყობინების გაგზავნა</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">მიმღები:</p>
              <p className="text-sm font-medium">
                {profileMap.get(notifUserId)?.full_name || profileMap.get(notifUserId)?.email || notifUserId}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium">სათაური</label>
              <Input
                value={notifTitle}
                onChange={e => setNotifTitle(e.target.value)}
                placeholder="მაგ: სპეციალური შეთავაზება!"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">შეტყობინება</label>
              <Textarea
                value={notifMessage}
                onChange={e => setNotifMessage(e.target.value)}
                placeholder="მაგ: გამოიყენე პრომოკოდი SALE20 და მიიღე 20% ფასდაკლება!"
                className="mt-1"
                rows={3}
              />
            </div>
            <Button
              className="w-full gap-2"
              disabled={!notifTitle || !notifMessage || sendNotifMutation.isPending}
              onClick={() => sendNotifMutation.mutate({ userId: notifUserId, title: notifTitle, message: notifMessage })}
            >
              <Send className="w-4 h-4" />
              გაგზავნა
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminActivity;
