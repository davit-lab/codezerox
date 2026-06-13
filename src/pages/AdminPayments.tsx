import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "@/components/layout/AdminLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PaymentSetting {
  id: string;
  provider: string;
  setting_key: string;
  setting_value: string;
  is_active: boolean;
}

const PROVIDER_LABELS: Record<string, string> = {
  bog: "საქართველოს ბანკი (BOG iPay)",
  tbc: "თიბისი ბანკი (TBC E-Commerce)",
  flitt: "Flitt (ბარათით გადახდა)",
};

const KEY_LABELS: Record<string, string> = {
  client_id: "Client ID",
  secret_key: "Secret Key (გადახდის გასაღები)",
  credit_secret_key: "კრედიტული გადახდის გასაღები",
  merchant_id: "Merchant ID (მერჩანტის ნომერი)",
  terminal_id: "Terminal ID",
  api_key: "API Key",
  callback_url: "Callback URL",
};

const KEY_DESCRIPTIONS: Record<string, string> = {
  client_id: "ბანკის მიერ მოწოდებული კლიენტის იდენტიფიკატორი",
  secret_key: "საიდუმლო გასაღები ტრანზაქციის ხელმოწერისთვის",
  credit_secret_key: "Flitt-ის კრედიტული (განვადებით) გადახდის გასაღები",
  merchant_id: "მერჩანტის უნიკალური იდენტიფიკატორი",
  terminal_id: "ტერმინალის იდენტიფიკატორი",
  api_key: "API გასაღები ინტეგრაციისთვის",
  callback_url: "გადახდის შედეგის დაბრუნების URL (Flitt-ისთვის ეს ავტომატურად მუშაობს)",
};

const AdminPayments = () => {
  const navigate = useNavigate();
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const [settings, setSettings] = useState<PaymentSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [showSecrets, setShowSecrets] = useState<Set<string>>(new Set());
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [activeProviders, setActiveProviders] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (isAdmin) fetchSettings();
  }, [isAdmin]);

  const fetchSettings = async () => {
    let { data, error } = await supabase
      .from('payment_settings')
      .select('*')
      .order('provider')
      .order('setting_key');

    if (error) {
      toast.error("პარამეტრების ჩატვირთვა ვერ მოხერხდა");
      return;
    }

    const rows = data || [];
    const hasFlitt = rows.some((s: PaymentSetting) => s.provider === 'flitt');
    if (!hasFlitt) {
      const { data: inserted } = await supabase
        .from('payment_settings')
        .insert([
          { provider: 'flitt', setting_key: 'merchant_id', setting_value: '', is_active: false },
          { provider: 'flitt', setting_key: 'secret_key', setting_value: '', is_active: false },
          { provider: 'flitt', setting_key: 'credit_secret_key', setting_value: '', is_active: false },
          { provider: 'flitt', setting_key: 'callback_url', setting_value: '', is_active: false },
        ])
        .select('*');
      if (inserted) {
        rows.push(...inserted);
        rows.sort((a, b) => a.provider.localeCompare(b.provider) || a.setting_key.localeCompare(b.setting_key));
      }
    }

    setSettings(rows);
    const values: Record<string, string> = {};
    const active: Record<string, boolean> = {};
    rows.forEach((s: PaymentSetting) => {
      values[s.id] = s.setting_value;
      if (!active.hasOwnProperty(s.provider)) active[s.provider] = s.is_active;
      if (s.is_active) active[s.provider] = true;
    });
    setEditValues(values);
    setActiveProviders(active);
    setLoading(false);
  };

  const handleSave = async (provider: string) => {
    setSaving(provider);
    const providerSettings = settings.filter(s => s.provider === provider);
    const isActive = activeProviders[provider] || false;

    try {
      for (const s of providerSettings) {
        const { error } = await supabase
          .from('payment_settings')
          .update({
            setting_value: editValues[s.id] || '',
            is_active: isActive,
            updated_at: new Date().toISOString(),
          })
          .eq('id', s.id);
        
        if (error) throw error;
      }
      toast.success(`${PROVIDER_LABELS[provider]} - პარამეტრები შენახულია`);
      fetchSettings();
    } catch {
      toast.error("შენახვა ვერ მოხერხდა");
    } finally {
      setSaving(null);
    }
  };

  const toggleSecret = (id: string) => {
    setShowSecrets(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const isSecretField = (key: string) => ['secret_key', 'api_key', 'credit_secret_key'].includes(key);

  if (authLoading) {
    return (
      <AdminLayout>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
          <span className="material-symbols-rounded spinning" style={{ fontSize: '48px', color: 'var(--gold)' }}>progress_activity</span>
        </div>
      </AdminLayout>
    );
  }

  if (!user || !isAdmin) {
    navigate("/");
    return null;
  }

  const providers = [...new Set(settings.map(s => s.provider))];

  return (
    <AdminLayout title="გადახდის მეთოდები" titleIcon="account_balance">
              {loading ? (
                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                  <span className="material-symbols-rounded spinning" style={{ fontSize: '40px', color: 'var(--gold)' }}>progress_activity</span>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {providers.map(provider => {
                    const providerSettings = settings.filter(s => s.provider === provider);
                    const isActive = activeProviders[provider] || false;
                    const isSaving = saving === provider;
                    const hasValues = providerSettings.some(s => editValues[s.id]?.trim());

                    return (
                      <div key={provider} style={{
                        background: 'var(--bg-elevated)',
                        border: `1px solid ${isActive ? 'rgba(212,168,83,0.3)' : 'var(--border-subtle)'}`,
                        borderRadius: '16px',
                        overflow: 'hidden',
                        transition: 'border-color 0.3s',
                      }}>
                        {/* Provider Header */}
                        <div style={{
                          padding: '20px 24px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          borderBottom: '1px solid var(--border-subtle)',
                          background: isActive ? 'rgba(212,168,83,0.04)' : 'transparent',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span className="material-symbols-rounded" style={{
                              fontSize: '24px',
                              color: isActive ? 'var(--gold)' : 'var(--text-muted)',
                            }}>
                              {provider === 'bog' ? 'account_balance' : provider === 'flitt' ? 'credit_card' : 'credit_card'}
                            </span>
                            <div>
                              <h3 style={{ color: 'var(--text-white)', fontSize: '1.05rem', fontWeight: 600, margin: 0 }}>
                                {PROVIDER_LABELS[provider] || provider}
                              </h3>
                              <span style={{
                                fontSize: '0.78rem',
                                padding: '2px 10px',
                                borderRadius: '20px',
                                background: isActive ? 'rgba(76,175,80,0.15)' : 'rgba(255,255,255,0.05)',
                                color: isActive ? '#66bb6a' : 'var(--text-muted)',
                                fontWeight: 500,
                              }}>
                                {isActive ? '● აქტიური' : '○ არააქტიური'}
                              </span>
                            </div>
                          </div>

                          {/* Active Toggle */}
                          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                              {isActive ? 'ჩართული' : 'გამორთული'}
                            </span>
                            <div style={{ position: 'relative' }}>
                              <input
                                type="checkbox"
                                checked={isActive}
                                onChange={(e) => setActiveProviders(prev => ({ ...prev, [provider]: e.target.checked }))}
                                style={{ display: 'none' }}
                              />
                              <div
                                onClick={() => setActiveProviders(prev => ({ ...prev, [provider]: !prev[provider] }))}
                                style={{
                                  width: '44px',
                                  height: '24px',
                                  borderRadius: '12px',
                                  background: isActive ? 'var(--gold)' : 'var(--border-subtle)',
                                  transition: 'background 0.3s',
                                  position: 'relative',
                                  cursor: 'pointer',
                                }}
                              >
                                <div style={{
                                  width: '18px',
                                  height: '18px',
                                  borderRadius: '50%',
                                  background: 'white',
                                  position: 'absolute',
                                  top: '3px',
                                  left: isActive ? '23px' : '3px',
                                  transition: 'left 0.3s',
                                  boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                                }} />
                              </div>
                            </div>
                          </label>
                        </div>

                        {/* Settings Fields */}
                        <div style={{ padding: '24px' }}>
                          <div style={{ display: 'grid', gap: '18px' }}>
                            {providerSettings.map(setting => (
                              <div key={setting.id}>
                                <label style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  marginBottom: '6px',
                                  fontSize: '0.88rem',
                                  fontWeight: 500,
                                  color: 'var(--text-white)',
                                }}>
                                  <span className="material-symbols-rounded" style={{ fontSize: '16px', color: 'var(--gold)' }}>
                                    {isSecretField(setting.setting_key) ? 'key' : 'tag'}
                                  </span>
                                  {KEY_LABELS[setting.setting_key] || setting.setting_key}
                                </label>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', margin: '0 0 8px 0' }}>
                                  {KEY_DESCRIPTIONS[setting.setting_key] || ''}
                                </p>
                                <div style={{ position: 'relative' }}>
                                  <input
                                    type={isSecretField(setting.setting_key) && !showSecrets.has(setting.id) ? 'password' : 'text'}
                                    value={editValues[setting.id] || ''}
                                    onChange={(e) => setEditValues(prev => ({ ...prev, [setting.id]: e.target.value }))}
                                    placeholder={`შეიტანეთ ${KEY_LABELS[setting.setting_key] || setting.setting_key}`}
                                    style={{
                                      width: '100%',
                                      padding: '10px 14px',
                                      paddingRight: isSecretField(setting.setting_key) ? '44px' : '14px',
                                      borderRadius: '10px',
                                      border: '1px solid var(--border-subtle)',
                                      background: 'var(--bg-card)',
                                      color: 'var(--text-white)',
                                      fontSize: '0.9rem',
                                      outline: 'none',
                                      transition: 'border-color 0.2s',
                                      fontFamily: isSecretField(setting.setting_key) ? 'monospace' : 'inherit',
                                    }}
                                    onFocus={(e) => (e.target.style.borderColor = 'var(--gold)')}
                                    onBlur={(e) => (e.target.style.borderColor = 'var(--border-subtle)')}
                                  />
                                  {isSecretField(setting.setting_key) && (
                                    <button
                                      onClick={() => toggleSecret(setting.id)}
                                      style={{
                                        position: 'absolute',
                                        right: '8px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        padding: '4px',
                                        color: 'var(--text-muted)',
                                      }}
                                    >
                                      <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>
                                        {showSecrets.has(setting.id) ? 'visibility_off' : 'visibility'}
                                      </span>
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Save Button */}
                          <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                              onClick={() => handleSave(provider)}
                              disabled={isSaving}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '10px 24px',
                                borderRadius: '10px',
                                border: 'none',
                                background: 'var(--gold)',
                                color: 'var(--bg-primary)',
                                fontSize: '0.9rem',
                                fontWeight: 600,
                                cursor: isSaving ? 'not-allowed' : 'pointer',
                                opacity: isSaving ? 0.7 : 1,
                                transition: 'opacity 0.2s',
                              }}
                            >
                              {isSaving ? (
                                <span className="material-symbols-rounded spinning" style={{ fontSize: '18px' }}>progress_activity</span>
                              ) : (
                                <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>save</span>
                              )}
                              {isSaving ? 'ინახება...' : 'შენახვა'}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
    </AdminLayout>
  );
};

export default AdminPayments;
