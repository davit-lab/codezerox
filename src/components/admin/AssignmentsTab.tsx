import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { FileText, CheckCircle, XCircle, Clock, Loader2, Eye } from 'lucide-react';
import { useAllSubmissions, useReviewAssignment } from '@/hooks/useAssignments';
import { useToast } from '@/hooks/use-toast';

interface Props {
  profileMap: Record<string, { full_name: string | null; email: string }>;
}

const AssignmentsTab = ({ profileMap }: Props) => {
  const { data: submissions = [], isLoading } = useAllSubmissions();
  const reviewAssignment = useReviewAssignment();
  const { toast } = useToast();

  const [viewingSubmission, setViewingSubmission] = useState<any>(null);
  const [feedback, setFeedback] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

  const filtered = submissions.filter((s: any) => filter === 'all' || s.status === filter);

  const handleReview = async (status: 'approved' | 'rejected') => {
    if (!viewingSubmission) return;
    try {
      await reviewAssignment.mutateAsync({
        submissionId: viewingSubmission.id,
        status,
        feedback,
        userId: viewingSubmission.user_id,
        examName: viewingSubmission.certification_exams?.name || '',
      });
      toast({
        title: 'წარმატება',
        description: status === 'approved' ? 'დავალება დადასტურდა' : 'დავალება უარყოფილია',
      });
      setViewingSubmission(null);
      setFeedback('');
    } catch (err: any) {
      toast({ title: 'შეცდომა', description: err.message, variant: 'destructive' });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <div className="flex gap-2 mb-4">
        {(['pending', 'approved', 'rejected', 'all'] as const).map(f => (
          <Button
            key={f}
            variant={filter === f ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(f)}
          >
            {f === 'pending' && <Clock className="h-3 w-3 mr-1" />}
            {f === 'approved' && <CheckCircle className="h-3 w-3 mr-1" />}
            {f === 'rejected' && <XCircle className="h-3 w-3 mr-1" />}
            {f === 'pending' ? 'მოლოდინში' : f === 'approved' ? 'დადასტურებული' : f === 'rejected' ? 'უარყოფილი' : 'ყველა'}
            {f === 'pending' && (
              <span className="ml-1 bg-primary-foreground/20 text-[10px] px-1.5 py-0.5 rounded-full">
                {submissions.filter((s: any) => s.status === 'pending').length}
              </span>
            )}
          </Button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((sub: any) => {
          const profile = profileMap[sub.user_id];
          return (
            <Card key={sub.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-sm">{sub.certification_exams?.name || '—'}</h3>
                      {sub.status === 'pending' && <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />მოლოდინში</Badge>}
                      {sub.status === 'approved' && <Badge className="bg-green-500/20 text-green-500 border-green-500/30"><CheckCircle className="h-3 w-3 mr-1" />დადასტურებული</Badge>}
                      {sub.status === 'rejected' && <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />უარყოფილი</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {profile?.full_name || '—'} • {profile?.email || sub.user_id.slice(0, 8)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(sub.created_at).toLocaleDateString('ka-GE', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setViewingSubmission(sub);
                      setFeedback(sub.admin_feedback || '');
                    }}
                  >
                    <Eye className="h-3.5 w-3.5 mr-1" />
                    ნახვა
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {filtered.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              {filter === 'pending' ? 'მოლოდინში მყოფი დავალებები არ არის' : 'დავალებები არ მოიძებნა'}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Review Dialog */}
      <Dialog open={!!viewingSubmission} onOpenChange={(open) => { if (!open) { setViewingSubmission(null); setFeedback(''); } }}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              დავალების განხილვა
            </DialogTitle>
          </DialogHeader>
          {viewingSubmission && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{profileMap[viewingSubmission.user_id]?.full_name || '—'}</p>
                  <p className="text-xs text-muted-foreground">{profileMap[viewingSubmission.user_id]?.email}</p>
                </div>
                <Badge variant="outline">{viewingSubmission.certification_exams?.name}</Badge>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">დავალების პასუხი</Label>
                <div className="mt-1 p-4 rounded-lg border bg-muted/30 text-sm whitespace-pre-wrap max-h-80 overflow-y-auto">
                  {viewingSubmission.content}
                </div>
              </div>

              <div>
                <Label>კომენტარი (არასავალდებულო)</Label>
                <Textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={3}
                  placeholder="დატოვეთ კომენტარი მომხმარებელისთვის..."
                />
              </div>
            </div>
          )}
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => { setViewingSubmission(null); setFeedback(''); }}>
              დახურვა
            </Button>
            {viewingSubmission?.status !== 'approved' && (
              <Button
                className="bg-green-600 hover:bg-green-700"
                disabled={reviewAssignment.isPending}
                onClick={() => handleReview('approved')}
              >
                {reviewAssignment.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                დადასტურება
              </Button>
            )}
            {viewingSubmission?.status !== 'rejected' && (
              <Button
                variant="destructive"
                disabled={reviewAssignment.isPending}
                onClick={() => handleReview('rejected')}
              >
                {reviewAssignment.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <XCircle className="h-4 w-4 mr-2" />}
                უარყოფა
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AssignmentsTab;
