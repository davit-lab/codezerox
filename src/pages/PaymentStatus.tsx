import { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';

import { useQueryClient } from '@tanstack/react-query';
import Atmosphere from '@/components/layout/Atmosphere';
import Header from '@/components/layout/Header';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CheckCircle, XCircle, Loader2, Home, History, Receipt } from 'lucide-react';

const ITEM_TYPE_LABELS: Record<string, string> = {
  book: 'წიგნი',
  credit_package: 'კრედიტ პაკეტი',
  course: 'კურსი',
  video_course: 'ვიდეო კურსი',
  vacancy_package: 'ვაკანსიის პაკეტი',
  project_upload: 'პროექტის ატვირთვა',
  freelancer_subscription: 'ფრილანსერი გამოწერა',
  kids_activation: 'საბავშვო ანგარიში',
  mentoring: 'მენტორინგი',
  exam: 'სასერთიფიკაციო გამოცდა',
};


const PaymentStatus = () => {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const orderId = params.get('order_id') || params.get('txn');
  const statusParam = params.get('status');
  const [loading, setLoading] = useState(true);
  const [txn, setTxn] = useState<any>(null);

  useEffect(() => {
    if (!orderId) { setLoading(false); return; }
    let attempts = 0;
    const fetchTxn = async (): Promise<void> => {
      const { data } = await (supabase as any)
        .from('bank_transactions').select('*').eq('id', orderId).maybeSingle();
      if (data) setTxn(data);
      // keep polling for ~20s if still pending (callback may not have processed yet)
      if ((!data || data.status === 'pending' || data.status === 'processing') && attempts < 10) {
        attempts++;
        setTimeout(fetchTxn, 2000);
      } else {
        setLoading(false);
      }
    };
    fetchTxn();
  }, [orderId]);

  useEffect(() => {
    if (txn?.status === 'completed') toast.success('გადახდა წარმატებულია!', { icon: '✅' });
    else if (txn?.status === 'failed') toast.error('გადახდა ვერ მოხერხდა', { icon: '❌' });
  }, [txn?.status]);

  useEffect(() => {
    if (txn?.status === 'completed') {
      qc.invalidateQueries({ queryKey: ['site_credits_balance'] });
      qc.invalidateQueries({ queryKey: ['site_credits_history'] });
      qc.invalidateQueries({ queryKey: ['video-enrollment'] });
      qc.invalidateQueries({ queryKey: ['video-enrollments-all'] });
      // Auto-route video course purchases back to the course page
      const videoCourseItem = ((txn.items || []) as any[]).find((i) => i?.type === 'video_course' && i?.course_id);
      if (videoCourseItem) {
        setTimeout(() => navigate(`/video-courses/${videoCourseItem.course_id}`, { replace: true }), 2000);
      }
      // Auto-route exam purchases back to the exam page for immediate start
      const examItem = ((txn.items || []) as any[]).find((i) => i?.type === 'exam' && i?.exam_id);
      if (examItem) {
        (async () => {
          const { data } = await (supabase as any)
            .from('certification_exams').select('slug').eq('id', examItem.exam_id).maybeSingle();
          if (data?.slug) {
            setTimeout(() => navigate(`/exam/${data.slug}?paid=1`, { replace: true }), 1500);
          }
        })();
      }
    }
  }, [txn?.status, qc, navigate]);


  const success = txn?.status === 'completed' || statusParam === 'success';
  const failed = txn?.status === 'failed' || txn?.status === 'cancelled' || statusParam === 'failed';

  const items = (txn?.items || []) as any[];

  return (
    <>
      <Atmosphere />
      <Header />
      <main className="pt-28 pb-20 min-h-screen">
        <div className="max-w-xl mx-auto px-4">
          <div className="bg-card border border-border rounded-2xl p-8 sm:p-10 relative overflow-hidden">
            <div className={`absolute top-0 inset-x-0 h-1 ${success ? 'bg-emerald-500' : failed ? 'bg-red-500' : 'bg-amber-500'}`} />

            {loading ? (
              <div className="text-center py-10">
                <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                <h2 className="text-xl font-bold">გადახდა მუშავდება...</h2>
                <p className="text-sm text-muted-foreground mt-2">ვამოწმებთ ბანკის პასუხს</p>
              </div>
            ) : (
              <>
                <div className="text-center mb-6">
                  <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
                    success ? 'bg-emerald-500/10' : 'bg-destructive/10'
                  }`}>
                    {success ? <CheckCircle className="w-10 h-10 text-emerald-400" />
                      : <XCircle className="w-10 h-10 text-destructive" />}
                  </div>
                  <h2 className="text-2xl font-bold">
                    {success ? 'გადახდა წარმატებულია' : 'გადახდა ვერ მოხერხდა'}
                  </h2>
                  {txn && (
                    <p className="text-3xl font-bold mt-3">
                      {Number(txn.amount || 0).toFixed(2)} ₾
                    </p>
                  )}
                </div>

                {txn && (
                  <div className="space-y-2 mb-6">
                    <h3 className="text-xs uppercase tracking-wider text-muted-foreground inline-flex items-center gap-1.5">
                      <Receipt className="w-3.5 h-3.5" /> დეტალები
                    </h3>
                    <div className="bg-muted/20 rounded-xl p-4 space-y-2 text-sm">
                      {items.map((it, i) => (
                        <div key={i} className="flex justify-between">
                          <span className="text-muted-foreground">{ITEM_TYPE_LABELS[it.type] || it.type}</span>
                          <span className="font-medium">{it.title || it.name || it.book_id || '—'}</span>
                        </div>
                      ))}
                      {Number(txn.discount_amount || 0) > 0 && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">გამოყენებული ფასდაკლება/კრედიტი</span>
                          <span className="font-medium">-{Number(txn.discount_amount).toFixed(2)} ₾</span>
                        </div>
                      )}
                      <div className="flex justify-between pt-2 border-t border-border/50">
                        <span className="text-muted-foreground">ტრანზაქცია</span>
                        <span className="font-mono text-xs">{String(txn.id).slice(0, 8)}...{String(txn.id).slice(-4)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">თარიღი</span>
                        <span>{new Date(txn.created_at).toLocaleString('ka-GE')}</span>
                      </div>
                      {txn.bank_status && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">ბანკის სტატუსი</span>
                          <span className="font-medium">{txn.bank_status}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {!txn && !success && (
                  <p className="text-sm text-muted-foreground text-center mb-6">
                    ტრანზაქცია ვერ მოიძებნა. გთხოვთ შეამოწმეთ ანგარიში ან დაგვიკავშირდით.
                  </p>
                )}

                <div className="flex gap-3 justify-center flex-wrap">
                  <Link to="/" className="h-11 px-5 bg-primary text-primary-foreground rounded-xl font-semibold inline-flex items-center gap-2 hover:bg-primary/90">
                    <Home className="w-4 h-4" /> მთავარი
                  </Link>
                  <Link to="/payment/history" className="h-11 px-5 bg-muted/30 text-foreground rounded-xl font-medium inline-flex items-center gap-2 hover:bg-muted/50">
                    <History className="w-4 h-4" /> ისტორია
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </>
  );
};

export default PaymentStatus;
