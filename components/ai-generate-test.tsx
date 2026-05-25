"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wand2, Loader2, Download, AlertTriangle, X, ImageIcon } from "lucide-react";
import { supabase } from "@/lib/supabase";

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
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) {
        setError("Chưa đăng nhập.");
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
        setError(json.error || "Generate thất bại.");
        setIsLoading(false);
        return;
      }

      setResult(json.data);
    } catch (err: any) {
      setError(err.message || "Lỗi kết nối server.");
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
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Wand2 className="size-4 text-primary" />
            Test Generate (Nano Banana)
          </h3>
          <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
            10 credits
          </span>
        </div>

        {/* Prompt Input */}
        <div>
          <label className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-1.5 block">
            Prompt
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Mô tả ảnh bạn muốn tạo... (vd: A stylish fashion model wearing a red dress, studio lighting)"
            className="w-full h-20 rounded-xl bg-secondary/40 border border-border px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all placeholder:text-muted-foreground/50"
          />
        </div>

        {/* Options */}
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-1.5 block">
              Aspect Ratio
            </label>
            <div className="flex gap-1.5 flex-wrap">
              {ASPECT_RATIOS.map((ar) => (
                <button
                  key={ar.value}
                  onClick={() => setAspectRatio(ar.value)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                    aspectRatio === ar.value
                      ? "bg-foreground text-background"
                      : "bg-secondary/40 text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  {ar.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-1.5 block">
              Resolution
            </label>
            <div className="flex gap-1.5">
              {IMAGE_SIZES.map((sz) => (
                <button
                  key={sz.value}
                  onClick={() => setImageSize(sz.value)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                    imageSize === sz.value
                      ? "bg-foreground text-background"
                      : "bg-secondary/40 text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  {sz.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={isLoading || !prompt.trim()}
          className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            isLoading || !prompt.trim()
              ? "bg-muted text-muted-foreground cursor-not-allowed"
              : "bg-foreground text-background hover:bg-foreground/90 shadow-lg"
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Đang generate...
            </>
          ) : (
            <>
              <Wand2 className="size-4" />
              Generate ảnh
            </>
          )}
        </button>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs"
            >
              <AlertTriangle className="size-4 shrink-0" />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Result */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-3"
            >
              <div className="relative rounded-xl overflow-hidden border border-border bg-card">
                <img
                  src={result.imageUrl}
                  alt="Generated"
                  className="w-full aspect-square object-cover"
                />
                <button
                  onClick={handleDownload}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/50 text-white hover:bg-black/70 transition-colors"
                >
                  <Download className="size-4" />
                </button>
              </div>

              <div className="flex items-center justify-between text-[10px] text-muted-foreground px-1">
                <span>Model: {result.modelUsed}</span>
                <span>Key #{result.keyIndex}</span>
                <span>{result.creditsUsed} credits</span>
              </div>

              {result.textResponse && (
                <p className="text-xs text-muted-foreground bg-secondary/30 rounded-lg p-3">
                  {result.textResponse}
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
