import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, Send, CheckCircle, XCircle, Clock, Loader2, RotateCcw } from 'lucide-react';
import { useMySubmission, useSubmitAssignment } from '@/hooks/useAssignments';
import { useToast } from '@/hooks/use-toast';

interface Props {
  examId: string;
  assignmentText: string;
  hasPassed: boolean;
  passedAt?: string;
}

const DEADLINE_DAYS = 3;

const AssignmentSection = ({ examId, assignmentText, hasPassed, passedAt }: Props) => {
  const { data: submission, isLoading } = useMySubmission(examId);
  const submitAssignment = useSubmitAssignment();
  const { toast } = useToast();
  const [content, setContent] = useState('');
  const [editing, setEditing] = useState(false);

  if (isLoading) {
    return (
      <Card className="mt-6">
        <CardContent className="p-6 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  // Only show if user has passed the quiz part
  if (!hasPassed) return null;

  // Calculate deadline
  const deadlineDate = passedAt ? new Date(new Date(passedAt).getTime() + DEADLINE_DAYS * 24 * 60 * 60 * 1000) : null;
  const isExpired = deadlineDate ? new Date() > deadlineDate : false;
  const timeRemaining = deadlineDate ? Math.max(0, deadlineDate.getTime() - Date.now()) : 0;
  const hoursLeft = Math.floor(timeRemaining / (1000 * 60 * 60));
  const minutesLeft = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast({ title: 'შეცდომა', description: 'დავალების ტექსტი ცარიელია', variant: 'destructive' });
      return;
    }
    try {
      await submitAssignment.mutateAsync({ examId, content: content.trim() });
      toast({ title: 'წარმატება', description: 'დავალება გაიგზავნა შესამოწმებლად!' });
      setEditing(false);
      setContent('');
    } catch (err: any) {
      toast({ title: 'შეცდომა', description: err.message, variant: 'destructive' });
    }
  };

  // Already submitted
  if (submission && !editing) {
    return (
      <Card className="mt-6">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-lg">ფინალური დავალება</h3>
            {submission.status === 'pending' && (
              <Badge variant="secondary" className="ml-auto">
                <Clock className="h-3 w-3 mr-1" /> განხილვაში
              </Badge>
            )}
            {submission.status === 'approved' && (
              <Badge className="ml-auto bg-green-500 text-white">
                <CheckCircle className="h-3 w-3 mr-1" /> დადასტურებული
              </Badge>
            )}
            {submission.status === 'rejected' && (
              <Badge variant="destructive" className="ml-auto">
                <XCircle className="h-3 w-3 mr-1" /> უარყოფილი
              </Badge>
            )}
          </div>

          <div className="p-4 rounded-lg bg-muted/30 border text-sm whitespace-pre-wrap mb-4">
            {submission.content}
          </div>

          {submission.admin_feedback && (
            <Alert className={submission.status === 'approved' ? 'border-green-500/30' : 'border-destructive/30'}>
              <AlertDescription>
                <p className="font-medium text-xs mb-1">ადმინის კომენტარი:</p>
                <p className="text-sm">{submission.admin_feedback}</p>
              </AlertDescription>
            </Alert>
          )}

          {submission.status === 'rejected' && !isExpired && (
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setContent(submission.content);
                setEditing(true);
              }}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              ხელახლა გაგზავნა
            </Button>
          )}

          {submission.status === 'rejected' && isExpired && (
            <Alert className="mt-4 border-destructive/30">
              <AlertDescription className="text-sm text-destructive">
                ⏰ დავალების გაგზავნის ვადა ამოიწურა (3 დღე).
              </AlertDescription>
            </Alert>
          )}

          {submission.status === 'pending' && (
            <p className="text-xs text-muted-foreground mt-3">
              თქვენი დავალება განიხილება ადმინისტრატორის მიერ. შეტყობინებას მიიღებთ შედეგის შესახებ.
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  // Expired - no submission yet
  if (isExpired && !submission) {
    return (
      <Card className="mt-6">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-lg">ფინალური დავალება</h3>
            <Badge variant="destructive" className="ml-auto">ვადა ამოიწურა</Badge>
          </div>
          <Alert className="border-destructive/30">
            <AlertDescription className="text-sm text-destructive">
              ⏰ დავალების გაგზავნის 3-დღიანი ვადა ამოიწურა. გამოცდის ხელახლა ჩაბარება შეგიძლიათ ახალი ვადის მისაღებად.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Submission form
  return (
    <Card className="mt-6">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-lg">ფინალური დავალება</h3>
          {deadlineDate && (
            <Badge variant="outline" className="ml-auto text-xs">
              <Clock className="h-3 w-3 mr-1" />
              დარჩენილია: {hoursLeft > 0 ? `${hoursLeft} სთ ${minutesLeft} წთ` : `${minutesLeft} წთ`}
            </Badge>
          )}
        </div>

        {deadlineDate && (
          <Alert className="mb-4 border-primary/20">
            <AlertDescription className="text-xs text-muted-foreground">
              ⏰ დავალების გაგზავნის ვადა: <strong>{deadlineDate.toLocaleDateString('ka-GE')} {deadlineDate.toLocaleTimeString('ka-GE', { hour: '2-digit', minute: '2-digit' })}</strong> (3 დღე ჩაბარებიდან)
            </AlertDescription>
          </Alert>
        )}

        <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 mb-4">
          <p className="text-sm font-medium mb-1">დავალების პირობა:</p>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{assignmentText}</p>
        </div>

        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="დაწერეთ თქვენი პასუხი ან ჩასვით ბმული აქ..."
          rows={8}
          className="mb-4"
        />

        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            დავალება გაიგზავნება ადმინისტრატორთან შესამოწმებლად
          </p>
          <Button
            onClick={handleSubmit}
            disabled={submitAssignment.isPending || !content.trim()}
          >
            {submitAssignment.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            გაგზავნა
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AssignmentSection;
