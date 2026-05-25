"use client";

import React, { useState } from "react";
import { Wand2, Loader2, Download } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface GenerateResult {
  imageUrl: string;
  assetId: string;
  jobId: string;
  creditsUsed: number;
  modelUsed: string;
  keyIndex: number;
  textResponse?: string;
}

const ASPECT_RATIOS = [
  { label: "1:1", value: "1:1" },
  { label: "16:9", value: "16:9" },
  { label: "9:16", value: "9:16" },
  { label: "4:3", value: "4:3" },
  { label: "3:4", value: "3:4" },
];

const IMAGE_SIZES = [
  { label: "1K", value: "1K" },
  { label: "2K", value: "2K" },
  { label: "4K", value: "4K" },
];

export default function AiGenerateTest() {
  const [prompt, setPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [imageSize, setImageSize] = useState("1K");
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [result, setResult] = useState<GenerateResult | null>(null);

  const openConfirm = () => {
    if (!prompt.trim()) return;
    setShowConfirm(true);
  };

  const confirmGenerate = async () => {
    setShowConfirm(false);
    setIsLoading(true);
    setResult(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) {
        toast.error("Chưa đăng nhập.");
        setIsLoading(false);
        return;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${apiUrl}/api/ai/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ prompt, aspectRatio, imageSize }),
      });

      const json = await res.json();
      if (!json.success) {
        toast.error(json.error || "Generate thất bại.");
        setIsLoading(false);
        return;
      }

      setResult(json.data);
      toast.success(`Generate thành công! -${json.data.creditsUsed} credits`);
    } catch (err: any) {
      toast.error(err.message || "Lỗi kết nối server.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!result?.imageUrl) return;
    const link = document.createElement("a");
    link.href = result.imageUrl;
    link.download = `generated_${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="w-full">
      <div className="border border-border/60 rounded-2xl p-3 space-y-2">
        {/* Prompt input */}
        <input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Optional: Blonde hair, studio photoshoot"
          className="w-full h-9 rounded-xl bg-transparent border-0 px-0 text-sm focus:outline-none focus:ring-0 transition-all placeholder:text-muted-foreground/50"
          onKeyDown={(e) => e.key === "Enter" && openConfirm()}
        />

        {/* Bottom row: Options + Run */}
        <div className="flex items-center justify-between gap-2">
          {/* Left: Aspect ratio pills */}
          <div className="flex items-center gap-1">
            {ASPECT_RATIOS.map((ar) => (
              <button
                key={ar.value}
                onClick={() => setAspectRatio(ar.value)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all ${
                  aspectRatio === ar.value
                    ? "bg-foreground text-background border-foreground"
                    : "bg-transparent text-muted-foreground border-border hover:text-foreground hover:border-muted-foreground/30"
                }`}
              >
                {ar.label}
              </button>
            ))}
          </div>

          {/* Right: Resolution + Run */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {IMAGE_SIZES.map((sz) => (
                <button
                  key={sz.value}
                  onClick={() => setImageSize(sz.value)}
                  className={`px-2 py-1 rounded-lg text-[11px] font-medium border transition-all ${
                    imageSize === sz.value
                      ? "bg-foreground text-background border-foreground"
                      : "bg-transparent text-muted-foreground border-border hover:text-foreground hover:border-muted-foreground/30"
                  }`}
                >
                  {sz.label}
                </button>
              ))}
            </div>
            <button
              onClick={openConfirm}
              disabled={isLoading || !prompt.trim()}
              className={`flex items-center gap-1.5 px-4 h-8 rounded-lg text-xs font-semibold transition-all ${
                isLoading || !prompt.trim()
                  ? "bg-muted text-muted-foreground cursor-not-allowed"
                  : "bg-foreground text-background hover:bg-foreground/90"
              }`}
            >
              {isLoading ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Wand2 className="size-3.5" />
              )}
              Generate
            </button>
          </div>
        </div>

        {/* Confirmation Modal */}
        <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Xác nhận tạo ảnh</DialogTitle>
              <DialogDescription>
                Tạo ảnh với prompt này sẽ tiêu tốn{" "}
                <span className="font-semibold text-foreground">10 credits</span>. Bạn có muốn tiếp tục?
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium hover:bg-secondary transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={confirmGenerate}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-foreground text-background hover:bg-foreground/90 transition-colors"
              >
                Tiếp tục
              </button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Result */}
        {result && (
          <div className="flex items-center gap-2 pt-1">
            <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-border bg-card shrink-0">
              <img src={result.imageUrl} alt="" className="w-full h-full object-cover" />
              <button
                onClick={handleDownload}
                className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity"
              >
                <Download className="size-3 text-white" />
              </button>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-muted-foreground truncate">
                {result.modelUsed} · Key #{result.keyIndex} · {result.creditsUsed} credits
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
