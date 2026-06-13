import { useRef, useCallback, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/layout/Header";
import Container from "@/components/layout/Container";
import SEOHead from "@/components/SEOHead";
import CertificateTemplate from "@/components/certificate/CertificateTemplate";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Loader2 } from "lucide-react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

const CertificateView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const certRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const { data: cert, isLoading } = useQuery({
    queryKey: ['certificate-detail', id],
    queryFn: async () => {
      if (!id) throw new Error('No ID');
      const { data, error } = await supabase
        .from('certificates')
        .select('*, certification_exams(*), exam_attempts(*)')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: profile } = useQuery({
    queryKey: ['certificate-profile', cert?.user_id],
    queryFn: async () => {
      if (!cert?.user_id) return null;
      const { data } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('user_id', cert.user_id)
        .single();
      return data;
    },
    enabled: !!cert?.user_id,
  });

  const handleDownloadPDF = useCallback(async () => {
    if (!certRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(certRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width / 2, canvas.height / 2],
      });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
      pdf.save(`certificate-${cert?.certificate_number || 'download'}.pdf`);
    } catch (e) {
      console.error('PDF generation failed', e);
    } finally {
      setDownloading(false);
    }
  }, [cert]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-16 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
      </div>
    );
  }

  if (!cert || !cert.certification_exams) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-24 pb-16">
          <Container>
            <div className="text-center py-12 text-muted-foreground">
              სერტიფიკატი ვერ მოიძებნა
            </div>
          </Container>
        </main>
      </div>
    );
  }

  const exam = cert.certification_exams as any;
  const attempt = cert.exam_attempts as any;
  const recipientName = profile?.full_name || profile?.email || 'Unknown';

  return (
    <div className="min-h-screen bg-background">
      <SEOHead title={`სერტიფიკატი — ${exam.name}`} description="CodeZero Academy Certificate" />
      <Header />
      <main className="pt-24 pb-16">
        <Container>
          {/* Controls - hidden on print */}
          <div className="flex items-center justify-between mb-8 print:hidden">
            <Button variant="ghost" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4 mr-2" /> უკან
            </Button>
            <Button onClick={handleDownloadPDF} disabled={downloading}>
              {downloading ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> მზადდება...</>
              ) : (
                <><Download className="h-4 w-4 mr-2" /> PDF ჩამოტვირთვა</>
              )}
            </Button>
          </div>

          {/* Certificate */}
          <div className="flex justify-center">
            <CertificateTemplate
              ref={certRef}
              recipientName={recipientName}
              examName={exam.name}
              examDescription={exam.description}
              certificateNumber={cert.certificate_number}
              issuedDate={cert.issued_at}
              score={attempt?.score ?? 0}
              totalQuestions={attempt?.total_questions ?? exam.total_questions}
              passThreshold={exam.pass_threshold}
            />
          </div>
        </Container>
      </main>
    </div>
  );
};

export default CertificateView;
