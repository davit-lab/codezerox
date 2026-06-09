import { useEffect, useState, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Atmosphere from "@/components/layout/Atmosphere";
import Header from "@/components/layout/Header";
import { useAuth } from "@/hooks/useAuth";
import { useCreatePurchase } from "@/hooks/usePurchases";
import { usePurchaseCredits } from "@/hooks/useCredits";
import { useCart } from "@/hooks/useCart";
import { useBankPayment } from "@/hooks/useBankPayment";
import { sendTransactionalEmail } from "@/lib/email";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  CheckCircle, Loader2, XCircle, BookOpen, ShoppingCart,
  Home, Sparkles, Library, Clock
} from "lucide-react";

interface PendingPurchase {
  bookIds: string[];
  bookTitles: string[];
  creditPackageId: string | null;
  creditPackageName: string | null;
  creditAmount: number;
  timestamp: number;
}

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isLoading: authLoading } = useAuth();
  const createPurchase = useCreatePurchase();
  const purchaseCredits = usePurchaseCredits();
  const { items, creditItems, clearCart } = useCart();
  const { checkStatus } = useBankPayment();
  const [processing, setProcessing] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [purchasedBookId, setPurchasedBookId] = useState<string | null>(null);
  const [purchasedCredits, setPurchasedCredits] = useState<number>(0);
  const [bankStatus, setBankStatus] = useState<string | null>(null);
  const [pollCount, setPollCount] = useState(0);
  const processedRef = useRef(false);

  const txnId = searchParams.get("txn");
  const provider = searchParams.get("provider");
  const isBankPayment = !!txnId && !!provider;

  // Bank transaction status polling
  useEffect(() => {
    if (!isBankPayment || !user || authLoading || processedRef.current) return;

    let pollInterval: ReturnType<typeof setInterval>;
    let attempts = 0;
    const maxAttempts = 20; // Poll for ~60 seconds

    const pollStatus = async () => {
      try {
        const result = await checkStatus(txnId);
        setBankStatus(result.status);

        if (result.status === "completed") {
          processedRef.current = true;
          clearInterval(pollInterval);
          clearCart();
          setSuccess(true);
          setProcessing(false);
          toast.success("გადახდა წარმატებულია!", {
            description: "შეძენა დასრულდა",
            duration: 8000,
            icon: "✅",
          });
        } else if (result.status === "failed") {
          processedRef.current = true;
          clearInterval(pollInterval);
          setError(result.error_message || "გადახდა ვერ მოხერხდა");
          setProcessing(false);
        } else if (result.status === "processing" || result.status === "pending") {
          attempts++;
          setPollCount(attempts);
          if (attempts >= maxAttempts) {
            // After max attempts, process from cart as fallback
            processedRef.current = true;
            clearInterval(pollInterval);
            await processFallbackPurchase();
          }
        }
      } catch (err) {
        attempts++;
        if (attempts >= maxAttempts) {
          processedRef.current = true;
          clearInterval(pollInterval);
          await processFallbackPurchase();
        }
      }
    };

    // Initial check
    pollStatus();
    // Poll every 3 seconds
    pollInterval = setInterval(pollStatus, 3000);

    return () => clearInterval(pollInterval);
  }, [isBankPayment, user, authLoading, txnId]);

  // Standard (non-bank) payment processing
  useEffect(() => {
    if (isBankPayment || authLoading || processedRef.current) return;

    const processPurchase = async () => {
      if (!user) {
        setError("გთხოვთ ჯერ შეხვიდეთ სისტემაში");
        setProcessing(false);
        return;
      }

      const pendingPurchaseStr = localStorage.getItem('pending_purchase');
      let pendingPurchase: PendingPurchase | null = null;
      
      if (pendingPurchaseStr) {
        try {
          pendingPurchase = JSON.parse(pendingPurchaseStr);
          if (pendingPurchase && Date.now() - pendingPurchase.timestamp > 3600000) {
            pendingPurchase = null;
            localStorage.removeItem('pending_purchase');
          }
        } catch {
          localStorage.removeItem('pending_purchase');
        }
      }

      const bookIdsToProcess = pendingPurchase?.bookIds || items.map(i => i.book.id);
      const creditPackageId = pendingPurchase?.creditPackageId || creditItems[0]?.package.id;
      const creditAmount = pendingPurchase?.creditAmount || creditItems[0]?.package.credits || 0;
      
      if (bookIdsToProcess.length === 0 && !creditPackageId) {
        setSuccess(true);
        setProcessing(false);
        return;
      }

      try {
        processedRef.current = true;
        for (const bookId of bookIdsToProcess) {
          try {
            await createPurchase.mutateAsync(bookId);
          } catch (err: any) {
            if (!err.message?.includes("duplicate")) throw err;
          }
        }
        
        if (creditPackageId) {
          await purchaseCredits.mutateAsync(creditPackageId);
          setPurchasedCredits(creditAmount);
        }
        
        if (bookIdsToProcess.length > 0) setPurchasedBookId(bookIdsToProcess[0]);
        
        localStorage.removeItem('pending_purchase');
        clearCart();
        setSuccess(true);
        
        const hasBooks = bookIdsToProcess.length > 0;
        const hasCredits = creditAmount > 0;
        let message = "გადახდა წარმატებულია!";
        let description = "";
        if (hasBooks && hasCredits) description = `წიგნი და ${creditAmount} კრედიტი დაემატა`;
        else if (hasBooks) description = "წიგნი ხელმისაწვდომია თქვენს ბიბლიოთეკაში";
        else if (hasCredits) description = `${creditAmount} კრედიტი დაემატა თქვენს ანგარიშზე`;
        
        toast.success(message, { description, duration: 8000, icon: "✅" });

        // Send purchase confirmation email
        if (user?.email) {
          const firstBookTitle = pendingPurchase?.bookTitles?.[0] || '';
          try {
            await sendTransactionalEmail({
              templateName: 'purchase-confirmation',
              recipientEmail: user.email,
              idempotencyKey: `purchase-confirm-${bookIdsToProcess[0] || creditPackageId || Date.now()}`,
              templateData: {
                bookTitle: firstBookTitle,
                creditsAmount: creditAmount,
              },
            });
          } catch (emailError) {
            console.error('Failed to send purchase confirmation email:', emailError);
          }
        }
      } catch (err: any) {
        if (err.message?.includes("duplicate")) {
          if (bookIdsToProcess.length > 0) setPurchasedBookId(bookIdsToProcess[0]);
          localStorage.removeItem('pending_purchase');
          clearCart();
          setSuccess(true);
        } else {
          setError("შეძენის დასრულება ვერ მოხერხდა. გთხოვთ დაგვიკავშირდეთ.");
        }
      } finally {
        setProcessing(false);
      }
    };

    processPurchase();
  }, [user, authLoading, items, creditItems, isBankPayment]);

  // Fallback: if bank callback hasn't processed yet, try processing from cart
  const processFallbackPurchase = async () => {
    try {
      const pendingPurchaseStr = localStorage.getItem('pending_purchase');
      let pendingPurchase: PendingPurchase | null = null;
      if (pendingPurchaseStr) {
        try { pendingPurchase = JSON.parse(pendingPurchaseStr); } catch {}
      }

      const bookIdsToProcess = pendingPurchase?.bookIds || items.map(i => i.book.id);
      const creditPackageId = pendingPurchase?.creditPackageId || creditItems[0]?.package.id;

      for (const bookId of bookIdsToProcess) {
        try { await createPurchase.mutateAsync(bookId); } catch {}
      }
      if (creditPackageId) {
        try { await purchaseCredits.mutateAsync(creditPackageId); } catch {}
      }

      localStorage.removeItem('pending_purchase');
      clearCart();
      setSuccess(true);
    } catch {
      setSuccess(true); // Show success anyway since bank may have processed
    } finally {
      setProcessing(false);
    }
  };

  // Loading state
  if (processing || authLoading) {
    return (
      <>
        <Atmosphere />
        <Header />
        <main className="pt-28 pb-20 min-h-screen">
          <div className="max-w-lg mx-auto px-4 text-center">
            <div className="bg-card border border-border rounded-2xl p-12 relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-1 bg-amber-500" />
              
              <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
              </div>
              
              <h2 className="text-2xl font-bold mb-2">
                {isBankPayment ? "ტრანზაქცია მოწმდება..." : "გადახდა მუშავდება..."}
              </h2>
              <p className="text-muted-foreground text-sm mb-4">
                გთხოვთ დაელოდოთ
              </p>
              
              {isBankPayment && bankStatus && (
                <div className="bg-muted/20 rounded-xl px-4 py-3 inline-flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    სტატუსი: <span className="font-medium text-foreground">
                      {bankStatus === "pending" ? "მოლოდინში" : 
                       bankStatus === "processing" ? "მუშავდება" : bankStatus}
                    </span>
                  </span>
                  {pollCount > 0 && (
                    <span className="text-[10px] text-muted-foreground/60">
                      ({pollCount}/20)
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      </>
    );
  }

  // Error state
  if (error) {
    return (
      <>
        <Atmosphere />
        <Header />
        <main className="pt-28 pb-20 min-h-screen">
          <div className="max-w-lg mx-auto px-4 text-center">
            <div className="bg-card border border-border rounded-2xl p-12 relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-1 bg-red-500" />
              
              <div className="w-20 h-20 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-10 h-10 text-destructive" />
              </div>
              
              <h2 className="text-2xl font-bold mb-2">შეცდომა</h2>
              <p className="text-muted-foreground text-sm mb-8">{error}</p>
              
              <div className="flex gap-3 justify-center flex-wrap">
                <Link to="/cart" className="flex items-center gap-2 h-12 px-6 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors">
                  <ShoppingCart className="w-4 h-4" /> კალათაში დაბრუნება
                </Link>
                <Link to="/" className="flex items-center gap-2 h-12 px-6 bg-muted/30 text-foreground rounded-xl font-medium hover:bg-muted/50 transition-colors">
                  <Home className="w-4 h-4" /> მთავარი
                </Link>
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }

  // Success state
  return (
    <>
      <Atmosphere />
      <Header />
      <main className="pt-28 pb-20 min-h-screen">
        <div className="max-w-lg mx-auto px-4 text-center">
          <div className="bg-card border border-border rounded-2xl p-12 relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-emerald-500" />
            
            <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-emerald-400" />
            </div>
            
            <h2 className="text-2xl font-bold mb-2">გადახდა წარმატებულია!</h2>
            <p className="text-muted-foreground text-sm mb-8">
              {purchasedBookId && purchasedCredits > 0 ? (
                `თქვენი წიგნი და ${purchasedCredits} კრედიტი ხელმისაწვდომია.`
              ) : purchasedCredits > 0 ? (
                `${purchasedCredits} კრედიტი დაემატა თქვენს ანგარიშზე.`
              ) : (
                'თქვენი შეძენა დასრულდა. წიგნები ხელმისაწვდომია "ჩემი წიგნები" განყოფილებაში.'
              )}
            </p>

            {isBankPayment && txnId && (
              <div className="bg-muted/20 rounded-lg px-4 py-2.5 mb-8 inline-block">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">ტრანზაქცია</span>
                <p className="text-xs font-mono text-foreground mt-0.5">{txnId.slice(0, 8)}...{txnId.slice(-4)}</p>
              </div>
            )}
            
            <div className="flex gap-3 justify-center flex-wrap">
              {purchasedBookId ? (
                <Link to={`/read/${purchasedBookId}`} className="flex items-center gap-2 h-12 px-6 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors">
                  <BookOpen className="w-4 h-4" /> წიგნის კითხვა
                </Link>
              ) : purchasedCredits > 0 ? (
                <Link to="/ai-tutor" className="flex items-center gap-2 h-12 px-6 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors">
                  <Sparkles className="w-4 h-4" /> AI ტუტორი
                </Link>
              ) : (
                <Link to="/my-books" className="flex items-center gap-2 h-12 px-6 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors">
                  <BookOpen className="w-4 h-4" /> ჩემი წიგნები
                </Link>
              )}
              <Link to="/books" className="flex items-center gap-2 h-12 px-6 bg-muted/30 text-foreground rounded-xl font-medium hover:bg-muted/50 transition-colors">
                <Library className="w-4 h-4" /> კატალოგი
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default PaymentSuccess;
