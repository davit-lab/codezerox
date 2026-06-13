import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AdminLayout from "@/components/layout/AdminLayout";
import Header from "@/components/layout/Header";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Award, Users, TrendingUp, CheckCircle, Plus, Loader2, Search, Pencil, Trash2, GripVertical, Save, X, ChevronDown, ChevronUp, FileText, XCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAllSubmissions, useReviewAssignment } from "@/hooks/useAssignments";
import AssignmentsTab from "@/components/admin/AssignmentsTab";

const AdminExams = () => {
  const navigate = useNavigate();
  const { isAdmin, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [showPassDialog, setShowPassDialog] = useState(false);
  const [selectedExamId, setSelectedExamId] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");

  // Edit exam state
  const [editingExam, setEditingExam] = useState<any>(null);
  const [editForm, setEditForm] = useState({ name: "", description: "", category: "", subcategory: "", total_questions: 50, pass_threshold: 40, price_gel: 10, time_limit_minutes: 60, is_active: true, final_assignment: "" });
  
  // Questions state
  const [editingQuestions, setEditingQuestions] = useState(false);
  const [questionsExamId, setQuestionsExamId] = useState("");
  const [questionsExamName, setQuestionsExamName] = useState("");
  const [editingQuestion, setEditingQuestion] = useState<any>(null);
  const [questionForm, setQuestionForm] = useState({ question_text: "", option_a: "", option_b: "", option_c: "", option_d: "", correct_option: "A", difficulty: "medium", explanation: "", sort_order: 0 });

  // Create exam state
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createForm, setCreateForm] = useState({ name: "", slug: "", description: "", category: "", subcategory: "", total_questions: 50, pass_threshold: 40, price_gel: 10, time_limit_minutes: 60, final_assignment: "" });

  const { data: attempts = [] } = useQuery({
    queryKey: ["admin-exam-attempts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("exam_attempts")
        .select("*, certification_exams(name, slug)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ["admin-profiles-for-exams"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("user_id, full_name, email");
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  const { data: exams = [] } = useQuery({
    queryKey: ["admin-all-exams"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("certification_exams")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  const { data: questions = [], isLoading: questionsLoading } = useQuery({
    queryKey: ["admin-exam-questions", questionsExamId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("exam_questions")
        .select("*")
        .eq("exam_id", questionsExamId)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!questionsExamId && isAdmin,
  });

  const profileMap = useMemo(() => {
    const map: Record<string, { full_name: string | null; email: string }> = {};
    profiles.forEach((p) => { map[p.user_id] = p; });
    return map;
  }, [profiles]);

  const filteredUsers = useMemo(() => {
    if (!userSearch.trim()) return [];
    const q = userSearch.toLowerCase();
    return profiles.filter(p =>
      (p.full_name?.toLowerCase().includes(q)) ||
      p.email.toLowerCase().includes(q)
    ).slice(0, 10);
  }, [profiles, userSearch]);

  const stats = useMemo(() => {
    const total = attempts.length;
    const passed = attempts.filter((a: any) => a.passed).length;
    const uniqueUsers = new Set(attempts.map((a: any) => a.user_id)).size;
    return { total, passed, failed: total - passed, uniqueUsers, passRate: total > 0 ? Math.round((passed / total) * 100) : 0 };
  }, [attempts]);

  const passExamMutation = useMutation({
    mutationFn: async ({ userId, examId }: { userId: string; examId: string }) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const resp = await fetch(
        `https://${projectId}.supabase.co/functions/v1/admin-pass-exam`,
        { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` }, body: JSON.stringify({ userId, examId }) }
      );
      const result = await resp.json();
      if (!resp.ok) throw new Error(result.error || "Failed");
      return result;
    },
    onSuccess: (data) => {
      toast({ title: "წარმატება", description: data.certificateNumber ? `სერტიფიკატი გაიცა: ${data.certificateNumber}` : "გამოცდა ჩაბარებულია" });
      queryClient.invalidateQueries({ queryKey: ["admin-exam-attempts"] });
      setShowPassDialog(false);
      setSelectedExamId("");
      setSelectedUserId("");
      setUserSearch("");
    },
    onError: (err: any) => { toast({ title: "შეცდომა", description: err.message, variant: "destructive" }); },
  });

  // Update exam mutation
  const updateExamMutation = useMutation({
    mutationFn: async (form: typeof editForm & { id: string }) => {
      const { id, ...rest } = form;
      const { error } = await supabase.from("certification_exams").update(rest).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "წარმატება", description: "გამოცდა განახლდა" });
      queryClient.invalidateQueries({ queryKey: ["admin-all-exams"] });
      setEditingExam(null);
    },
    onError: (err: any) => { toast({ title: "შეცდომა", description: err.message, variant: "destructive" }); },
  });

  // Create exam mutation
  const createExamMutation = useMutation({
    mutationFn: async (form: typeof createForm) => {
      const { error } = await supabase.from("certification_exams").insert(form);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "წარმატება", description: "გამოცდა შეიქმნა" });
      queryClient.invalidateQueries({ queryKey: ["admin-all-exams"] });
      setShowCreateDialog(false);
      setCreateForm({ name: "", slug: "", description: "", category: "", subcategory: "", total_questions: 50, pass_threshold: 40, price_gel: 10, time_limit_minutes: 60, final_assignment: "" });
    },
    onError: (err: any) => { toast({ title: "შეცდომა", description: err.message, variant: "destructive" }); },
  });

  // Save question mutation
  const saveQuestionMutation = useMutation({
    mutationFn: async (form: any) => {
      if (form.id) {
        const { id, ...rest } = form;
        const { error } = await supabase.from("exam_questions").update(rest).eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("exam_questions").insert({ ...form, exam_id: questionsExamId });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast({ title: "წარმატება", description: "კითხვა შენახულია" });
      queryClient.invalidateQueries({ queryKey: ["admin-exam-questions", questionsExamId] });
      setEditingQuestion(null);
    },
    onError: (err: any) => { toast({ title: "შეცდომა", description: err.message, variant: "destructive" }); },
  });

  // Delete question mutation
  const deleteQuestionMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("exam_questions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "წარმატება", description: "კითხვა წაიშალა" });
      queryClient.invalidateQueries({ queryKey: ["admin-exam-questions", questionsExamId] });
    },
    onError: (err: any) => { toast({ title: "შეცდომა", description: err.message, variant: "destructive" }); },
  });

  const openEditExam = (exam: any) => {
    setEditForm({
      name: exam.name,
      description: exam.description || "",
      category: exam.category,
      subcategory: exam.subcategory || "",
      total_questions: exam.total_questions,
      pass_threshold: exam.pass_threshold,
      price_gel: exam.price_gel,
      time_limit_minutes: exam.time_limit_minutes,
      is_active: exam.is_active,
      final_assignment: exam.final_assignment || "",
    });
    setEditingExam(exam);
  };

  const openQuestions = (exam: any) => {
    setQuestionsExamId(exam.id);
    setQuestionsExamName(exam.name);
    setEditingQuestions(true);
  };

  const openNewQuestion = () => {
    setQuestionForm({ question_text: "", option_a: "", option_b: "", option_c: "", option_d: "", correct_option: "A", difficulty: "medium", explanation: "", sort_order: questions.length + 1 });
    setEditingQuestion({ isNew: true });
  };

  const openEditQuestion = (q: any) => {
    setQuestionForm({
      question_text: q.question_text,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c,
      option_d: q.option_d,
      correct_option: q.correct_option,
      difficulty: q.difficulty,
      explanation: q.explanation || "",
      sort_order: q.sort_order,
    });
    setEditingQuestion(q);
  };

  if (isLoading) return null;
  if (!isAdmin) { navigate("/"); return null; }

  // Questions management view
  if (editingQuestions) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-16">
          <div className="max-w-5xl mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <div>
                <Button variant="ghost" size="sm" onClick={() => { setEditingQuestions(false); setQuestionsExamId(""); }} className="mb-2">
                  ← უკან
                </Button>
                <h1 className="text-2xl font-bold">{questionsExamName} — კითხვები</h1>
                <p className="text-sm text-muted-foreground mt-1">სულ: {questions.length} კითხვა</p>
              </div>
              <Button onClick={openNewQuestion}>
                <Plus className="h-4 w-4 mr-2" /> ახალი კითხვა
              </Button>
            </div>

            {questionsLoading ? (
              <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
            ) : questions.length === 0 ? (
              <Card><CardContent className="py-12 text-center text-muted-foreground">კითხვები ჯერ არ არის დამატებული</CardContent></Card>
            ) : (
              <div className="space-y-3">
                {questions.map((q: any, idx: number) => (
                  <Card key={q.id} className="group">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <span className="text-sm font-mono text-muted-foreground mt-1 w-8 shrink-0">#{idx + 1}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm mb-2">{q.question_text}</p>
                          <div className="grid grid-cols-2 gap-1.5 text-xs">
                            {["A", "B", "C", "D"].map(opt => (
                              <div key={opt} className={`px-2 py-1 rounded ${q.correct_option === opt ? "bg-green-500/20 text-green-400 font-semibold" : "bg-muted/50 text-muted-foreground"}`}>
                                {opt}) {q[`option_${opt.toLowerCase()}`]}
                              </div>
                            ))}
                          </div>
                          <div className="flex gap-2 mt-2">
                            <Badge variant="outline" className="text-[10px]">{q.difficulty}</Badge>
                            {q.explanation && <Badge variant="secondary" className="text-[10px]">ახსნა ✓</Badge>}
                          </div>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditQuestion(q)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => { if (confirm("წაშალო ეს კითხვა?")) deleteQuestionMutation.mutate(q.id); }}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>

        {/* Edit/Create Question Dialog */}
        <Dialog open={!!editingQuestion} onOpenChange={(open) => { if (!open) setEditingQuestion(null); }}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingQuestion?.isNew ? "ახალი კითხვა" : "კითხვის რედაქტირება"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>კითხვის ტექსტი</Label>
                <Textarea value={questionForm.question_text} onChange={e => setQuestionForm(f => ({ ...f, question_text: e.target.value }))} rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>A) პასუხი</Label>
                  <Input value={questionForm.option_a} onChange={e => setQuestionForm(f => ({ ...f, option_a: e.target.value }))} />
                </div>
                <div>
                  <Label>B) პასუხი</Label>
                  <Input value={questionForm.option_b} onChange={e => setQuestionForm(f => ({ ...f, option_b: e.target.value }))} />
                </div>
                <div>
                  <Label>C) პასუხი</Label>
                  <Input value={questionForm.option_c} onChange={e => setQuestionForm(f => ({ ...f, option_c: e.target.value }))} />
                </div>
                <div>
                  <Label>D) პასუხი</Label>
                  <Input value={questionForm.option_d} onChange={e => setQuestionForm(f => ({ ...f, option_d: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label>სწორი პასუხი</Label>
                  <Select value={questionForm.correct_option} onValueChange={v => setQuestionForm(f => ({ ...f, correct_option: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["A", "B", "C", "D"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>სირთულე</Label>
                  <Select value={questionForm.difficulty} onValueChange={v => setQuestionForm(f => ({ ...f, difficulty: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">მარტივი</SelectItem>
                      <SelectItem value="medium">საშუალო</SelectItem>
                      <SelectItem value="hard">რთული</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>რიგითობა</Label>
                  <Input type="number" value={questionForm.sort_order} onChange={e => setQuestionForm(f => ({ ...f, sort_order: parseInt(e.target.value) || 0 }))} />
                </div>
              </div>
              <div>
                <Label>ახსნა (არასავალდებულო)</Label>
                <Textarea value={questionForm.explanation} onChange={e => setQuestionForm(f => ({ ...f, explanation: e.target.value }))} rows={2} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingQuestion(null)}>გაუქმება</Button>
              <Button
                disabled={!questionForm.question_text || !questionForm.option_a || !questionForm.option_b || !questionForm.option_c || !questionForm.option_d || saveQuestionMutation.isPending}
                onClick={() => {
                  const payload = editingQuestion?.isNew
                    ? { ...questionForm }
                    : { ...questionForm, id: editingQuestion.id };
                  saveQuestionMutation.mutate(payload);
                }}
              >
                {saveQuestionMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                შენახვა
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <AdminLayout title="სასერტიფიკატო გამოცდები" titleIcon="workspace_premium">
            <Tabs defaultValue="exams" className="w-full">
               <div className="flex items-center justify-end mb-6">
                <TabsList>
                  <TabsTrigger value="exams">გამოცდები</TabsTrigger>
                  <TabsTrigger value="assignments">დავალებები</TabsTrigger>
                  <TabsTrigger value="attempts">მცდელობები</TabsTrigger>
                </TabsList>
              </div>

              {/* Exams Tab */}
              <TabsContent value="exams">
                <div className="flex justify-end mb-4 gap-2">
                  <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" /> ახალი გამოცდა
                  </Button>
                </div>

                <div className="space-y-3">
                  {exams.map((exam: any) => (
                    <Card key={exam.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-sm">{exam.name}</h3>
                              <Badge variant={exam.is_active ? "default" : "secondary"} className="text-[10px]">
                                {exam.is_active ? "აქტიური" : "არააქტიური"}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-1">{exam.description || "აღწერა არ აქვს"}</p>
                            <div className="flex gap-3 mt-2 text-[11px] text-muted-foreground">
                              <span>კატეგორია: {exam.category}</span>
                              <span>კითხვები: {exam.total_questions}</span>
                              <span>ზღვარი: {exam.pass_threshold}</span>
                              <span>ფასი: {exam.price_gel}₾</span>
                              <span>დრო: {exam.time_limit_minutes} წთ</span>
                            </div>
                          </div>
                          <div className="flex gap-1.5 shrink-0">
                            <Button variant="outline" size="sm" onClick={() => openQuestions(exam)}>
                              კითხვები
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditExam(exam)}>
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {exams.length === 0 && (
                    <Card><CardContent className="py-12 text-center text-muted-foreground">გამოცდები ჯერ არ არის შექმნილი</CardContent></Card>
                  )}
                </div>
              </TabsContent>

              {/* Attempts Tab */}
              <TabsContent value="attempts">
                <div className="flex justify-end mb-4">
                  <Button onClick={() => setShowPassDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" /> ჩააბარებინე გამოცდა
                  </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <Card><CardContent className="p-4 text-center"><Users className="h-5 w-5 mx-auto mb-1 text-primary" /><p className="text-xl font-bold">{stats.uniqueUsers}</p><p className="text-[10px] text-muted-foreground">უნიკალური</p></CardContent></Card>
                  <Card><CardContent className="p-4 text-center"><Award className="h-5 w-5 mx-auto mb-1 text-primary" /><p className="text-xl font-bold">{stats.total}</p><p className="text-[10px] text-muted-foreground">სულ მცდელობა</p></CardContent></Card>
                  <Card><CardContent className="p-4 text-center"><CheckCircle className="h-5 w-5 mx-auto mb-1 text-green-500" /><p className="text-xl font-bold">{stats.passed}</p><p className="text-[10px] text-muted-foreground">ჩაბარებული</p></CardContent></Card>
                  <Card><CardContent className="p-4 text-center"><TrendingUp className="h-5 w-5 mx-auto mb-1 text-blue-500" /><p className="text-xl font-bold">{stats.passRate}%</p><p className="text-[10px] text-muted-foreground">ჩაბარების %</p></CardContent></Card>
                </div>

                <Card>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>მომხმარებელი</TableHead>
                            <TableHead>გამოცდა</TableHead>
                            <TableHead>შედეგი</TableHead>
                            <TableHead>სტატუსი</TableHead>
                            <TableHead>თარიღი</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {attempts.map((a: any) => {
                            const profile = profileMap[a.user_id];
                            return (
                              <TableRow key={a.id}>
                                <TableCell>
                                  <div>
                                    <p className="font-medium text-sm">{profile?.full_name || "—"}</p>
                                    <p className="text-xs text-muted-foreground">{profile?.email || a.user_id.slice(0, 8)}</p>
                                  </div>
                                </TableCell>
                                <TableCell className="text-sm">{a.certification_exams?.name || "—"}</TableCell>
                                <TableCell><span className="font-mono text-sm font-medium">{a.score}/{a.total_questions}</span></TableCell>
                                <TableCell>
                                  {a.passed ? (
                                    <Badge className="bg-green-500/20 text-green-500 border-green-500/30">ჩაბარებული</Badge>
                                  ) : a.completed_at ? (
                                    <Badge variant="destructive">ვერ ჩააბარა</Badge>
                                  ) : (
                                    <Badge variant="secondary">მიმდინარე</Badge>
                                  )}
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                  {new Date(a.started_at).toLocaleDateString("ka-GE", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                          {attempts.length === 0 && (
                            <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">ჯერ არავის უცდია გამოცდის გავლა</TableCell></TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Assignments Tab */}
              <TabsContent value="assignments">
                <AssignmentsTab profileMap={profileMap} />
              </TabsContent>
            </Tabs>

      {/* Edit Exam Dialog */}
      <Dialog open={!!editingExam} onOpenChange={(open) => { if (!open) setEditingExam(null); }}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>გამოცდის რედაქტირება</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>სახელი</Label>
              <Input value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <Label>აღწერა (სერტიფიკატზეც გამოჩნდება)</Label>
              <Textarea value={editForm.description} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} rows={4} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>კატეგორია</Label><Input value={editForm.category} onChange={e => setEditForm(f => ({ ...f, category: e.target.value }))} /></div>
              <div><Label>ქვეკატეგორია</Label><Input value={editForm.subcategory} onChange={e => setEditForm(f => ({ ...f, subcategory: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>კითხვების რაოდენობა</Label><Input type="number" value={editForm.total_questions} onChange={e => setEditForm(f => ({ ...f, total_questions: parseInt(e.target.value) || 0 }))} /></div>
              <div><Label>ჩაბარების ზღვარი</Label><Input type="number" value={editForm.pass_threshold} onChange={e => setEditForm(f => ({ ...f, pass_threshold: parseInt(e.target.value) || 0 }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>ფასი (₾)</Label><Input type="number" value={editForm.price_gel} onChange={e => setEditForm(f => ({ ...f, price_gel: parseFloat(e.target.value) || 0 }))} /></div>
              <div><Label>დროის ლიმიტი (წუთი)</Label><Input type="number" value={editForm.time_limit_minutes} onChange={e => setEditForm(f => ({ ...f, time_limit_minutes: parseInt(e.target.value) || 0 }))} /></div>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="is_active" checked={editForm.is_active} onChange={e => setEditForm(f => ({ ...f, is_active: e.target.checked }))} className="rounded" />
              <Label htmlFor="is_active">აქტიური</Label>
            </div>
            <div>
              <Label>ფინალური დავალება (არასავალდებულო)</Label>
              <Textarea value={editForm.final_assignment} onChange={e => setEditForm(f => ({ ...f, final_assignment: e.target.value }))} rows={4} placeholder="დავალების პირობა, რომელიც მომხმარებელმა უნდა შეასრულოს გამოცდის ჩაბარების შემდეგ..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingExam(null)}>გაუქმება</Button>
            <Button disabled={updateExamMutation.isPending} onClick={() => updateExamMutation.mutate({ ...editForm, id: editingExam.id })}>
              {updateExamMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              შენახვა
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Exam Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>ახალი გამოცდის შექმნა</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div><Label>სახელი</Label><Input value={createForm.name} onChange={e => setCreateForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div><Label>Slug (URL-ისთვის)</Label><Input value={createForm.slug} onChange={e => setCreateForm(f => ({ ...f, slug: e.target.value }))} placeholder="magalitad: javascript-basics" /></div>
            <div><Label>აღწერა</Label><Textarea value={createForm.description} onChange={e => setCreateForm(f => ({ ...f, description: e.target.value }))} rows={3} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>კატეგორია</Label><Input value={createForm.category} onChange={e => setCreateForm(f => ({ ...f, category: e.target.value }))} /></div>
              <div><Label>ქვეკატეგორია</Label><Input value={createForm.subcategory} onChange={e => setCreateForm(f => ({ ...f, subcategory: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>კითხვების რაოდენობა</Label><Input type="number" value={createForm.total_questions} onChange={e => setCreateForm(f => ({ ...f, total_questions: parseInt(e.target.value) || 0 }))} /></div>
              <div><Label>ჩაბარების ზღვარი</Label><Input type="number" value={createForm.pass_threshold} onChange={e => setCreateForm(f => ({ ...f, pass_threshold: parseInt(e.target.value) || 0 }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>ფასი (₾)</Label><Input type="number" value={createForm.price_gel} onChange={e => setCreateForm(f => ({ ...f, price_gel: parseFloat(e.target.value) || 0 }))} /></div>
              <div><Label>დროის ლიმიტი (წუთი)</Label><Input type="number" value={createForm.time_limit_minutes} onChange={e => setCreateForm(f => ({ ...f, time_limit_minutes: parseInt(e.target.value) || 0 }))} /></div>
            </div>
            <div><Label>ფინალური დავალება (არასავალდებულო)</Label><Textarea value={createForm.final_assignment} onChange={e => setCreateForm(f => ({ ...f, final_assignment: e.target.value }))} rows={3} placeholder="დავალების პირობა..." /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>გაუქმება</Button>
            <Button disabled={!createForm.name || !createForm.slug || !createForm.category || createExamMutation.isPending} onClick={() => createExamMutation.mutate(createForm)}>
              {createExamMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
              შექმნა
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Pass Exam Dialog */}
      <Dialog open={showPassDialog} onOpenChange={setShowPassDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>გამოცდის ჩაბარებინება</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>გამოცდა</Label>
              <Select value={selectedExamId} onValueChange={setSelectedExamId}>
                <SelectTrigger><SelectValue placeholder="აირჩიე გამოცდა" /></SelectTrigger>
                <SelectContent>{exams.map((e: any) => (<SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>))}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>მომხმარებელი</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="მოძებნე სახელით ან ემაილით..." value={userSearch} onChange={(e) => { setUserSearch(e.target.value); setSelectedUserId(""); }} className="pl-9" />
              </div>
              {filteredUsers.length > 0 && !selectedUserId && (
                <div className="mt-2 border rounded-lg max-h-48 overflow-y-auto">
                  {filteredUsers.map(p => (
                    <button key={p.user_id} onClick={() => { setSelectedUserId(p.user_id); setUserSearch(p.full_name || p.email); }} className="w-full text-left px-3 py-2 hover:bg-muted/50 transition-colors border-b last:border-b-0">
                      <p className="text-sm font-medium">{p.full_name || "—"}</p>
                      <p className="text-xs text-muted-foreground">{p.email}</p>
                    </button>
                  ))}
                </div>
              )}
              {selectedUserId && <p className="text-xs text-green-500 mt-1">✓ მომხმარებელი არჩეულია</p>}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPassDialog(false)}>გაუქმება</Button>
            <Button onClick={() => passExamMutation.mutate({ userId: selectedUserId, examId: selectedExamId })} disabled={!selectedUserId || !selectedExamId || passExamMutation.isPending}>
              {passExamMutation.isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> მიმდინარეობს...</> : <><Award className="h-4 w-4 mr-2" /> ჩააბარებინე</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminExams;
