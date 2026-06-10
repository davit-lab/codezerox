import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export type BankProvider = "bog" | "tbc" | "flitt";

const PROVIDER_LABELS: Record<BankProvider, string> = {
  bog: "საქართველოს ბანკი",
  tbc: "თიბისი ბანკი",
  flitt: "Flitt (ბარათით გადახდა)",
};

const PROVIDER_ICONS: Record<BankProvider, string> = {
  bog: "🏦",
  tbc: "🏦",
  flitt: "💳",
};

export function useBankPayment() {
  const [activeProviders, setActiveProviders] = useState<BankProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("bank-payment", {
        body: { action: "get_providers" },
      });
      if (!error && data?.providers) {
        setActiveProviders(data.providers);
      }
    } catch (e) {
      console.error("Failed to fetch providers:", e);
    } finally {
      setLoading(false);
    }
  };

  const initiatePayment = async (
    provider: BankProvider,
    items: Array<{ name: string; price: number; type: string; book_id?: string; package_id?: string; credits?: number; course_id?: string; pricing_key?: string }>,
    discount?: number,
    siteCreditsUsed?: number,
    paymentType?: string,
  ) => {
    setProcessing(true);
    try {
      const fnName = provider === "flitt" ? "flitt-payment" : "bank-payment";
      const payload = provider === "flitt"
        ? { action: "initiate", items, discount, site_credits_used: siteCreditsUsed, payment_type: paymentType }
        : { action: "initiate", provider, items, discount, site_credits_used: siteCreditsUsed };

      const { data, error } = await supabase.functions.invoke(fnName, { body: payload });

      if (error) throw new Error(error.message);
      if (!data?.success) throw new Error(data?.error || "გადახდის ინიციალიზაცია ვერ მოხერხდა");

      if (data.payment_url) {
        window.location.href = data.payment_url;
      }

      return data;
    } catch (e: any) {
      throw e;
    } finally {
      setProcessing(false);
    }
  };

  const checkStatus = async (transactionId: string) => {
    const { data, error } = await supabase.functions.invoke("bank-payment", {
      body: { action: "check_status", transaction_id: transactionId },
    });
    if (error) throw new Error(error.message);
    return data;
  };

  return {
    activeProviders,
    loading,
    processing,
    initiatePayment,
    checkStatus,
    PROVIDER_LABELS,
    PROVIDER_ICONS,
    hasBankProviders: activeProviders.length > 0,
  };
}
