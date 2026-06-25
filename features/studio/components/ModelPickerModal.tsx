"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { X, Upload, Lock, ArrowUpRight } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { getAppModels, type AppModel } from "@/features/models/appModelService";
import { PLAN_VISUALS } from "@/features/credit/planMeta";
import GuaiLoader from "@/components/shared/guai-loader";

interface Props {
  onClose: () => void;
  onSelect: (url: string) => void;
  onUpload: () => void;
}

export function ModelPickerModal({ onClose, onSelect, onUpload }: Props) {
  const [models, setModels] = useState<AppModel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAppModels()
      .then(setModels)
      .catch(() => toast.error("Không tải được danh sách người mẫu"))
      .finally(() => setLoading(false));
  }, []);

  const handlePick = (model: AppModel) => {
    if (!model.unlocked) {
      toast.error(`Cần nâng cấp lên ${PLAN_VISUALS[model.required_tier].label} để dùng người mẫu này`);
      return;
    }
    onSelect(model.image_url);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-background border border-border rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div>
            <h2 className="text-lg font-semibold">Chọn người mẫu có sẵn</h2>
            <Link href="/models" target="_blank" className="text-xs text-primary hover:underline inline-flex items-center gap-0.5">
              Xem đầy đủ ở trang Người mẫu <ArrowUpRight className="size-3" />
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onUpload}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-secondary text-foreground hover:bg-secondary/80 rounded-xl transition-colors"
            >
              <Upload className="size-4" />
              Tải ảnh lên
            </button>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-secondary transition-colors">
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <GuaiLoader />
            </div>
          ) : models.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {models.map((model) => {
                const plan = PLAN_VISUALS[model.required_tier];
                return (
                  <div
                    key={model.id}
                    onClick={() => handlePick(model)}
                    className={cn(
                      "group relative rounded-xl overflow-hidden border border-border bg-card transition-all aspect-[3/4]",
                      model.unlocked
                        ? "cursor-pointer hover:border-primary/50 hover:shadow-lg hover:-translate-y-1"
                        : "cursor-pointer opacity-90"
                    )}
                  >
                    <Image
                      src={model.image_url}
                      alt={model.name}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      loading="lazy"
                      className={cn(
                        "object-cover transition-transform duration-500 bg-secondary/50",
                        model.unlocked ? "group-hover:scale-105" : "blur-[2px] grayscale-[0.3]"
                      )}
                    />
                    <span className={cn(
                      "absolute top-2 left-2 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold",
                      plan.badgeClass,
                    )}>
                      {plan.label}
                    </span>
                    {!model.unlocked && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <Lock className="size-4 text-white" />
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
                      <p className="text-xs font-medium text-white truncate drop-shadow-md">{model.name}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <p className="text-sm">Chưa có người mẫu nào trong kho.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
