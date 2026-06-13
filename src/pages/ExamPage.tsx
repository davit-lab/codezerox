import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

import { Header } from "@/components/layout";
import Container from "@/components/layout/Container";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Award, Clock, AlertTriangle, CheckCircle, XCircle, ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { useCertificationExams, useStartExam, useSubmitExam, useExamAttempts, type ExamQuestion, type CertificationExam } from "@/hooks/useCertification";
import AssignmentSection from "@/components/exam/AssignmentSection";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useBankPayment, type BankProvider } from "@/hooks/useBankPayment";
import { usePrice } from "@/hooks/usePricing";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";


type ExamState = "info" | "loading" | "active" | "submitting" | "results";

const ExamPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: exams } = useCertificationExams();
  const examPrice = usePrice("certification_exam", 10);
  const { activeProviders, initiatePayment, processing, PROVIDER_LABELS, PROVIDER_ICONS, hasBankProviders } = useBankPayment();
  const startExam = useStartExam();
  const submitExam = useSubmitExam();

  const exam = exams?.find(e => e.slug === slug);
  const { data: attempts } = useExamAttempts(exam?.id);
  const [showPayDialog, setShowPayDialog] = useState(false);


  const [state, setState] = useState<ExamState>("info");
  const [attemptId, setAttemptId] = useState<string>("");
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [results, setResults] = useState<{
    score: number; totalQuestions: number; passThreshold: number; passed: boolean;
    certificateNumber: string | null; certificateId: string | null;
    correctAnswers?: Record<string, string>;
  } | null>(null);

  // Timer
  useEffect(() => {
    if (state !== "active" || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [state, timeLeft]);

  // Auto-start if user has unconsumed paid purchase (e.g. after returning from bank)
  const [searchParams] = useSearchParams();
  const autoStartedRef = useRef(false);
  useEffect(() => {
    if (!exam || !user || autoStartedRef.current) return;
    if (state !== "info") return;
    const shouldCheck = searchParams.get("paid") === "1";
    (async () => {
      const { data } = await supabase
        .from("exam_purchases" as any)
        .select("id")
        .eq("user_id", user.id)
        .eq("exam_id", exam.id)
        .is("consumed_at", null)
        .limit(1);
      if (data && data.length > 0) {
        autoStartedRef.current = true;
        if (shouldCheck) {
          toast({ title: "გადახდა დადასტურდა", description: "გამოცდა იწყება..." });
        }
        handleStart();
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exam, user, state]);


  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleStart = async () => {
    if (!exam) return;
    setState("loading");
    try {
      const result = await startExam.mutateAsync(exam.id);
      setAttemptId(result.attemptId);
      setQuestions(result.questions);
      setTimeLeft(result.timeLimit * 60);
      setAnswers({});
      setCurrentQ(0);
      setState("active");
    } catch (err: any) {
      const msg = err?.message || "";
      if (msg.includes("გადახდა") || msg.includes("needs_payment")) {
        setShowPayDialog(true);
      } else {
        toast({ title: "შეცდომა", description: msg, variant: "destructive" });
      }
      setState("info");
    }
  };

  const handlePay = async (provider: BankProvider) => {
    if (!exam) return;
    try {
      await initiatePayment(provider, [
        { name: exam.name, price: examPrice, type: "exam", exam_id: exam.id } as any,
      ]);
    } catch (err: any) {
      toast({ title: "შეცდომა", description: err?.message || "გადახდის დაწყება ვერ მოხერხდა", variant: "destructive" });
    }
  };


  const handleSubmit = useCallback(async () => {
    if (state === "submitting") return;
    setState("submitting");
    try {
      const result = await submitExam.mutateAsync({ attemptId, answers });
      setResults(result);
      setState("results");
    } catch (err: any) {
      toast({ title: "შეცდომა", description: err.message, variant: "destructive" });
      setState("active");
    }
  }, [attemptId, answers, state]);

  if (!user) {
    navigate("/auth");
    return null;
  }

  if (!exam) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-16">
          <Container>
            <div className="text-center py-12 text-muted-foreground">გამოცდა ვერ მოიძებნა</div>
          </Container>
        </main>
      </div>
    );
  }

  const answeredCount = Object.keys(answers).length;
  const progressPct = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title={`${exam.name} | გამოცდა`} description={exam.description || ""} />
      <Header />
      <main className="pt-24 pb-16">
        <Container>
          {/* INFO STATE */}
          {state === "info" && (
            <div className="max-w-2xl mx-auto">
              <Button variant="ghost" onClick={() => navigate("/certifications")} className="mb-6">
                <ArrowLeft className="h-4 w-4 mr-2" /> უკან
              </Button>
              <Card>
                <CardContent className="p-8">
                  <div className="text-center mb-8">
                    <Award className="h-16 w-16 text-primary mx-auto mb-4" />
                    <h1 className="text-3xl font-bold mb-2">{exam.name}</h1>
                    <p className="text-muted-foreground">{exam.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="p-4 rounded-lg bg-muted/50 text-center">
                      <p className="text-2xl font-bold">{exam.total_questions}</p>
                      <p className="text-sm text-muted-foreground">კითხვა</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50 text-center">
                      <p className="text-2xl font-bold">{exam.pass_threshold}</p>
                      <p className="text-sm text-muted-foreground">წარმატების ზღვარი</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50 text-center">
                      <p className="text-2xl font-bold">{exam.time_limit_minutes} წთ</p>
                      <p className="text-sm text-muted-foreground">დროის ლიმიტი</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50 text-center">
                      <p className="text-2xl font-bold">{examPrice}₾</p>
                      <p className="text-sm text-muted-foreground">გადასახადი</p>
                    </div>
                  </div>

                  {/* Previous attempts */}
                  {attempts && attempts.length > 0 && (
                    <div className="mb-6">
                      <h3 className="font-semibold mb-3">წინა მცდელობები</h3>
                      <div className="space-y-2">
                        {attempts.slice(0, 5).map(a => (
                          <div key={a.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                            <span className="text-sm">{new Date(a.started_at).toLocaleDateString('ka-GE')}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">{a.score}/{a.total_questions}</span>
                              {a.passed ? (
                                <Badge className="bg-green-500 text-white">ჩაბარებული</Badge>
                              ) : (
                                <Badge variant="destructive">ვერ ჩააბარა</Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Alert className="mb-6">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      გამოცდის გასავლელად საჭიროა ერთჯერადი გადახდა — <strong>{examPrice}₾</strong>. ერთი მცდელობა ერთ გადახდას შეესაბამება.
                    </AlertDescription>
                  </Alert>

                  <Button
                    size="lg"
                    className="w-full"
                    onClick={() => setShowPayDialog(true)}
                    disabled={!hasBankProviders}
                  >
                    გადახდა და დაწყება — {examPrice}₾
                  </Button>
                  {!hasBankProviders && (
                    <p className="text-center text-xs text-destructive mt-2">გადახდის სისტემა გამორთულია</p>
                  )}

                </CardContent>
              </Card>

              {/* Show assignment if already passed */}
              {exam.final_assignment && attempts?.some(a => a.passed) && (
                <AssignmentSection
                  examId={exam.id}
                  assignmentText={exam.final_assignment}
                  hasPassed={true}
                  passedAt={attempts?.find(a => a.passed)?.completed_at || undefined}
                />
              )}
            </div>
          )}

          {/* LOADING STATE */}
          {state === "loading" && (
            <div className="flex flex-col items-center justify-center py-24">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-lg text-muted-foreground">გამოცდა იტვირთება...</p>
            </div>
          )}

          {/* ACTIVE EXAM */}
          {state === "active" && questions.length > 0 && (
            <div className="max-w-3xl mx-auto">
              {/* Top bar */}
              <div className="sticky top-20 z-10 bg-background/95 backdrop-blur-sm border-b pb-4 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-bold text-lg">{exam.name}</h2>
                  <div className={`flex items-center gap-2 font-mono text-lg font-bold ${timeLeft < 300 ? 'text-destructive' : 'text-primary'}`}>
                    <Clock className="h-5 w-5" />
                    {formatTime(timeLeft)}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Progress value={progressPct} className="flex-1" />
                  <span className="text-sm text-muted-foreground whitespace-nowrap">
                    {answeredCount}/{questions.length}
                  </span>
                </div>
              </div>

              {/* Question */}
              <Card className="mb-6">
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <Badge variant="outline" className="text-base px-3 py-1">
                      {currentQ + 1}/{questions.length}
                    </Badge>
                    <Badge variant="secondary">{questions[currentQ].difficulty}</Badge>
                  </div>

                  <h3 className="text-xl font-semibold mb-6 leading-relaxed">
                    {questions[currentQ].question_text}
                  </h3>

                  <RadioGroup
                    value={answers[questions[currentQ].id] || ""}
                    onValueChange={(val) =>
                      setAnswers(prev => ({ ...prev, [questions[currentQ].id]: val }))
                    }
                    className="space-y-3"
                  >
                    {(['a', 'b', 'c', 'd'] as const).map(opt => (
                      <div key={opt} className={`flex items-center space-x-3 p-4 rounded-lg border transition-colors cursor-pointer ${
                        answers[questions[currentQ].id] === opt
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/30 hover:bg-muted/30'
                      }`}>
                        <RadioGroupItem value={opt} id={`opt-${opt}`} />
                        <Label htmlFor={`opt-${opt}`} className="flex-1 cursor-pointer text-base">
                          {questions[currentQ][`option_${opt}` as keyof ExamQuestion] as string}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </CardContent>
              </Card>

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={() => setCurrentQ(prev => Math.max(0, prev - 1))}
                  disabled={currentQ === 0}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" /> წინა
                </Button>

                <div className="flex gap-2">
                  {currentQ < questions.length - 1 ? (
                    <Button onClick={() => setCurrentQ(prev => prev + 1)}>
                      შემდეგი <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSubmit}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      გამოცდის დასრულება
                    </Button>
                  )}
                </div>
              </div>

              {/* Question navigator */}
              <div className="mt-8 p-4 border rounded-lg">
                <p className="text-sm font-medium mb-3">კითხვები:</p>
                <div className="flex flex-wrap gap-2">
                  {questions.map((q, i) => (
                    <button
                      key={q.id}
                      onClick={() => setCurrentQ(i)}
                      className={`w-9 h-9 rounded-md text-sm font-medium transition-colors ${
                        i === currentQ
                          ? 'bg-primary text-primary-foreground'
                          : answers[q.id]
                            ? 'bg-primary/15 text-primary border border-primary/30'
                            : 'bg-muted hover:bg-muted/80'
                      }`}

                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SUBMITTING */}
          {state === "submitting" && (
            <div className="flex flex-col items-center justify-center py-24">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-lg text-muted-foreground">გამოცდა მოწმდება...</p>
            </div>
          )}

          {/* RESULTS */}
          {state === "results" && results && (
            <div className="max-w-2xl mx-auto">
              <Card>
                <CardContent className="p-8 text-center">
                  {results.passed ? (
                    <>
                      <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6" />
                      <h2 className="text-3xl font-bold mb-2 text-green-500">გილოცავ!</h2>
                      <p className="text-lg text-muted-foreground mb-6">
                        წარმატებით ჩააბარე გამოცდა!
                      </p>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-20 w-20 text-destructive mx-auto mb-6" />
                      <h2 className="text-3xl font-bold mb-2">სამწუხაროდ...</h2>
                      <p className="text-lg text-muted-foreground mb-6">
                        ვერ ჩააბარე გამოცდა. სცადე ხელახლა!
                      </p>
                    </>
                  )}

                  <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="p-4 rounded-lg bg-muted/50">
                      <p className="text-3xl font-bold">{results.score}</p>
                      <p className="text-sm text-muted-foreground">სწორი პასუხი</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50">
                      <p className="text-3xl font-bold">{results.totalQuestions}</p>
                      <p className="text-sm text-muted-foreground">სულ კითხვა</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50">
                      <p className="text-3xl font-bold">{results.passThreshold}</p>
                      <p className="text-sm text-muted-foreground">საჭირო</p>
                    </div>
                  </div>

                  <Progress
                    value={(results.score / results.totalQuestions) * 100}
                    className="mb-2 h-3"
                  />
                  <p className="text-sm text-muted-foreground mb-8">
                    {Math.round((results.score / results.totalQuestions) * 100)}%
                  </p>

                  {results.certificateNumber && (
                    <div className="p-4 rounded-lg border border-green-500/30 bg-green-500/5 mb-6">
                      <Award className="h-8 w-8 text-green-500 mx-auto mb-2" />
                      <p className="font-semibold">სერტიფიკატის ნომერი</p>
                      <p className="text-lg font-mono text-green-500 mb-3">{results.certificateNumber}</p>
                      {results.certificateId && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/certificate/${results.certificateId}`)}
                          className="border-green-500/30 text-green-500 hover:bg-green-500/10"
                        >
                          <Award className="h-4 w-4 mr-2" />
                          სერტიფიკატის ნახვა
                        </Button>
                      )}
                    </div>
                  )}

                  {/* Question review navigator */}
                  {results.correctAnswers && questions.length > 0 && (
                    <div className="mt-6 p-4 rounded-lg border bg-muted/20 text-left">
                      <p className="text-sm font-medium mb-3">კითხვების მიმოხილვა:</p>
                      <div className="flex flex-wrap gap-2">
                        {questions.map((q, i) => {
                          const userAnswer = answers[q.id];
                          const correctAnswer = results.correctAnswers![q.id];
                          const isCorrect = userAnswer === correctAnswer;
                          const isUnanswered = !userAnswer;
                          return (
                            <div
                              key={q.id}
                              title={isUnanswered ? 'უპასუხო' : isCorrect ? 'სწორი' : 'არასწორი'}
                              className={`w-9 h-9 rounded-md text-sm font-medium flex items-center justify-center transition-colors ${
                                isUnanswered
                                  ? 'bg-muted text-muted-foreground'
                                  : isCorrect
                                    ? 'bg-green-500/20 text-green-500 border border-green-500/40'
                                    : 'bg-red-500/20 text-red-500 border border-red-500/40'
                              }`}
                            >
                              {i + 1}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 justify-center mt-6">
                    <Button variant="outline" onClick={() => navigate("/certifications")}>
                      სერტიფიკატებზე დაბრუნება
                    </Button>
                    {!results.passed && (
                      <Button onClick={() => setState("info")}>
                        ხელახლა ცდა
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Final Assignment */}
              {results.passed && exam.final_assignment && (
                <AssignmentSection
                  examId={exam.id}
                  assignmentText={exam.final_assignment}
                  hasPassed={results.passed}
                  passedAt={results.passed ? new Date().toISOString() : undefined}
                />
              )}
            </div>
          )}
        </Container>
      </main>

      {/* Payment provider dialog */}
      <Dialog open={showPayDialog} onOpenChange={setShowPayDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>აირჩიე გადახდის მეთოდი — {examPrice}₾</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 mt-2">
            {activeProviders.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">
                გადახდის სისტემა გამორთულია. სცადე მოგვიანებით.
              </p>
            )}
            {activeProviders.map(p => (
              <Button
                key={p}
                variant="outline"
                className="w-full justify-start h-14 text-base"
                disabled={processing}
                onClick={() => handlePay(p)}
              >
                <span className="text-2xl mr-3">{PROVIDER_ICONS[p]}</span>
                {PROVIDER_LABELS[p]}
              </Button>
            ))}
            <p className="text-xs text-muted-foreground text-center pt-3">
              გადახდის შემდეგ ავტომატურად დაიწყება გამოცდა.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};


export default ExamPage;
