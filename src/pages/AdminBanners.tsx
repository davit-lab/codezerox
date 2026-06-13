import { useState, useRef } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { useAuth } from "@/hooks/useAuth";
import { useHeroBanners, useUpdateHeroBanner } from "@/hooks/useHeroBanners";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload, Trash2, ImageIcon, Eye, Loader2 } from "lucide-react";

const AdminBanners = () => {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const { data: banners = [], isLoading } = useHeroBanners();
  const updateBanner = useUpdateHeroBanner();
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeUploadId, setActiveUploadId] = useState<string | null>(null);

  if (authLoading || isLoading) {
    return (
      <AdminLayout title="ბანერების მართვა" titleIcon="image">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  if (!isAdmin) return null;

  const handleUpload = async (bannerId: string, file: File) => {
    setUploadingId(bannerId);
    try {
      const ext = file.name.split(".").pop();
      const path = `banners/${bannerId}-${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
      await updateBanner.mutateAsync({ id: bannerId, image_url: publicUrl });
      toast.success("ბანერი განახლდა!");
    } catch (err: any) {
      toast.error("ატვირთვა ვერ მოხერხდა: " + (err.message || ""));
    } finally {
      setUploadingId(null);
    }
  };

  const handleRemove = async (bannerId: string) => {
    try {
      await updateBanner.mutateAsync({ id: bannerId, image_url: null });
      toast.success("ბანერი წაიშალა!");
    } catch {
      toast.error("წაშლა ვერ მოხერხდა");
    }
  };

  const triggerFileInput = (bannerId: string) => {
    setActiveUploadId(bannerId);
    fileInputRef.current?.click();
  };

  const onFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activeUploadId) {
      handleUpload(activeUploadId, file);
    }
    e.target.value = "";
    setActiveUploadId(null);
  };

  return (
    <AdminLayout title="ბანერების მართვა" titleIcon="image">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onFileSelected}
      />

      {/* Preview Modal */}
      {previewUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setPreviewUrl(null)}
        >
          <img
            src={previewUrl}
            alt="Preview"
            className="max-w-full max-h-[85vh] rounded-2xl border border-border/30 shadow-2xl object-contain"
          />
        </div>
      )}

      <div className="grid gap-5">
        {banners.map((banner) => (
          <div
            key={banner.id}
            className="bg-card/80 backdrop-blur-sm border border-border/30 rounded-2xl overflow-hidden"
          >
            {/* Banner Preview */}
            <div className="relative h-40 sm:h-52 bg-muted/30 overflow-hidden">
              {banner.image_url ? (
                <img
                  src={banner.image_url}
                  alt={banner.page_label}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-muted-foreground">
                  <ImageIcon className="w-12 h-12 opacity-30" />
                  <span className="text-sm">ფოტო არ არის დაყენებული</span>
                </div>
              )}
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/40" />
              {/* Page label */}
              <div className="absolute bottom-3 left-4 text-white font-bold text-lg drop-shadow-lg">
                {banner.page_label}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 p-4">
              <span className="text-sm text-muted-foreground flex-1">
                გვერდი: <strong className="text-foreground">{banner.page_label}</strong>
                <span className="ml-2 text-xs opacity-60">({banner.page_key})</span>
              </span>

              <div className="flex items-center gap-2">
                {banner.image_url && (
                  <button
                    onClick={() => setPreviewUrl(banner.image_url)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-muted/50 border border-border/30 rounded-xl text-xs font-medium hover:bg-muted/70 transition-all"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    პრევიუ
                  </button>
                )}

                <button
                  onClick={() => triggerFileInput(banner.id)}
                  disabled={uploadingId === banner.id}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-primary/10 border border-primary/20 text-primary rounded-xl text-xs font-medium hover:bg-primary/20 transition-all disabled:opacity-50"
                >
                  {uploadingId === banner.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Upload className="w-3.5 h-3.5" />
                  )}
                  {banner.image_url ? "შეცვლა" : "ატვირთვა"}
                </button>

                {banner.image_url && (
                  <button
                    onClick={() => handleRemove(banner.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs font-medium hover:bg-red-500/20 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    წაშლა
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
};

export default AdminBanners;
