import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useBankPayment } from "@/hooks/useBankPayment";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onClose: () => void;
  courseId: string;
  courseTitle: string;
  packageId: string;
  packageName: string;
  amountGel: number;
  onSuccess?: () => void;
}

export const MentoringPaymentDialog = ({
  open, onClose, courseId, courseTitle, packageId, packageName, amountGel, onSuccess,
}: Props) => {
  const { user } = useAuth();
  const { initiatePayment, processing } = useBankPayment();
  const [busy, setBusy] = useState(false);

  const handlePay = async () => {
    if (!user) {
      toast.error("გაიარე ავტორიზაცია");
      return;
    }

    setBusy(true);
    try {
      // Create pending registration
      const { data: reg, error: regErr } = await supabase
        .from("mentoring_registrations" as any)
        .insert({
          user_id: user.id,
          course_id: courseId,
          package_id: packageId,
          amount_gel: amountGel,
          status: "pending",
          payment_provider: "flitt",
        })
        .select()
        .maybeSingle();
      if (regErr) throw regErr;

      // Redirect to Flitt
      await initiatePayment("flitt", [{
        name: `${courseTitle} — ${packageName}`,
        price: amountGel,
        type: "mentoring",
        package_id: (reg as any)?.id,
      }]);
      onSuccess?.();
    } catch (e: any) {
      toast.error("გადახდის შეცდომა", { description: e?.message ?? "სცადე ხელახლა" });
    } finally {
      setBusy(false);
    }
  };

  const isProcessing = busy || processing;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && !isProcessing && onClose()}>
      <DialogContent style={{ maxWidth: "440px", background: "var(--bg-card)", border: "1px solid var(--border-subtle)" }}>
        <DialogHeader>
          <DialogTitle style={{ color: "var(--text-primary)", fontSize: "1.1rem", fontWeight: 600 }}>
            გადახდა — {packageName}
          </DialogTitle>
          <DialogDescription style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
            {courseTitle} • <strong style={{ color: "var(--text-primary)" }}>{amountGel} ₾</strong>
          </DialogDescription>
        </DialogHeader>

        <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "8px" }}>
          <div style={{
            padding: "12px 14px", background: "var(--bg-elevated)",
            border: "1px solid var(--border-subtle)", borderRadius: "8px",
            fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: 1.5,
          }}>
            გადახდა ხდება Flitt-ის დაცული გადახდის გვერდზე. გადახდის ღილაკზე დაჭერის შემდეგ გადამისამართდებით.
          </div>

          <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              style={{
                flex: 1, padding: "12px",
                background: "transparent", color: "var(--text-secondary)",
                border: "1px solid var(--border-subtle)", borderRadius: "8px",
                cursor: isProcessing ? "not-allowed" : "pointer", fontWeight: 500, fontSize: "0.9rem",
              }}
            >
              გაუქმება
            </button>
            <button
              type="button"
              onClick={handlePay}
              disabled={isProcessing}
              style={{
                flex: 2, padding: "12px",
                background: "var(--text-primary)", color: "var(--bg-card)",
                border: "1px solid var(--text-primary)", borderRadius: "8px",
                cursor: isProcessing ? "not-allowed" : "pointer",
                fontWeight: 600, fontSize: "0.9rem",
                opacity: isProcessing ? 0.7 : 1,
              }}
            >
              {isProcessing ? "მიმდინარეობს..." : `გადახდა ${amountGel} ₾`}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
