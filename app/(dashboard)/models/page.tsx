"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Search, Lock, Wand2, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";
import GuaiLoader from "@/components/shared/guai-loader";
import { getAppModels, type AppModel } from "@/features/models/appModelService";
import { PLAN_VISUALS } from "@/features/credit/planMeta";

type GenderFilter = "all" | "male" | "female" | "unisex";

const GENDER_LABEL: Record<GenderFilter, string> = {
  all: "Tất cả",
  female: "Nữ",
  male: "Nam",
  unisex: "Unisex",
};

function useCols(): number {
  const [cols, setCols] = useState(4);
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      setCols(w >= 1280 ? 5 : w >= 1024 ? 4 : w >= 768 ? 3 : w >= 640 ? 2 : 1);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return cols;
}

function splitCols<T>(items: T[], n: number): T[][] {
  const cols: T[][] = Array.from({ length: n }, () => []);
  items.forEach((item, i) => cols[i % n].push(item));
  return cols;
}

const ModelCard = React.memo(function ModelCard({ model, onUse }: { model: AppModel; onUse: (m: AppModel) => void }) {
  const plan = PLAN_VISUALS[model.required_tier];
  return (
    <div
      onClick={() => model.unlocked && onUse(model)}
      className={cn(
        "group relative rounded-2xl overflow-hidden border bg-card transition-all duration-300",
        model.unlocked
          ? "cursor-pointer border-border hover:shadow-xl hover:-translate-y-0.5 hover:border-primary/40"
          : "cursor-default border-border/60 opacity-90"
      )}
    >
      <div className="relative aspect-[3/4] bg-secondary">
        <Image
          src={model.image_url}
          alt={model.name}
          fill
          sizes="(max-width: 768px) 50vw, 20vw"
          className={cn(
            "object-cover transition-transform duration-500",
            model.unlocked ? "group-hover:scale-[1.04]" : "blur-[2px] grayscale-[0.3]"
          )}
        />

        {/* Tier badge */}
        <span className={cn(
          "absolute top-2.5 left-2.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold shadow-sm",
          plan.badgeClass,
        )}>
          <span className={cn("size-1 rounded-full", plan.dotClass)} />
          {plan.label}
        </span>

        {/* Locked overlay */}
        {!model.unlocked && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/45">
            <div className="flex size-9 items-center justify-center rounded-full bg-white/15 backdrop-blur-md border border-white/20">
              <Lock className="size-4 text-white" />
            </div>
            <p className="text-[11px] font-medium text-white/90 text-center px-2">
              Cần nâng cấp lên {plan.label}
            </p>
          </div>
        )}

        {/* Hover CTA (unlocked) */}
        {model.unlocked && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-foreground text-[11px] font-semibold shadow-lg">
              <Wand2 className="size-3" />
              Dùng trong Studio
            </span>
          </div>
        )}
      </div>

      <div className="px-3 py-2.5">
        <p className="text-sm font-semibold text-foreground truncate">{model.name}</p>
      </div>
    </div>
  );
});

export default function ModelsPage() {
  const router = useRouter();
  const [models, setModels] = useState<AppModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [gender, setGender] = useState<GenderFilter>("all");
  const cols = useCols();

  useEffect(() => {
    getAppModels()
      .then(setModels)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let result = models;
    if (gender !== "all") result = result.filter((m) => m.gender === gender);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((m) =>
        m.name.toLowerCase().includes(q) || (m.tags ?? []).some((t) => t.toLowerCase().includes(q))
      );
    }
    return result;
  }, [models, gender, search]);

  const unlockedCount = models.filter((m) => m.unlocked).length;

  const handleUse = (model: AppModel) => {
    router.push(`/studio?tool=product-to-model&modelUrl=${encodeURIComponent(model.image_url)}`);
  };

  return (
    <div className="min-h-full p-6 lg:p-8 pb-20">
      {/* Header */}
      <div className="mb-7">
        <h1 className="font-serif text-3xl font-light text-foreground tracking-tight mb-1 flex items-center gap-2.5">
          <UserRound className="size-7 text-primary" />
          Người <span className="font-normal italic text-primary">mẫu</span>
        </h1>
        <p className="text-sm text-muted-foreground">
          Kho người mẫu có sẵn của GU.AI — dùng ngay trong Studio, không cần tự chụp hoặc tải lên.
          {!loading && ` Bạn đang mở khóa ${unlockedCount}/${models.length} người mẫu.`}
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-5 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm kiếm người mẫu..."
          className="w-full h-10 pl-9 pr-4 text-sm bg-secondary/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all placeholder:text-muted-foreground/60"
        />
      </div>

      {/* Gender filter */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-2 scrollbar-hide">
        {(["all", "female", "male", "unisex"] as GenderFilter[]).map((g) => {
          const active = gender === g;
          return (
            <button
              key={g}
              onClick={() => setGender(g)}
              className={cn(
                "whitespace-nowrap px-4 py-2 rounded-full border text-sm font-semibold transition-all",
                active
                  ? "bg-foreground text-background border-foreground shadow-md shadow-black/10"
                  : "bg-card text-muted-foreground border-border hover:bg-secondary hover:text-foreground",
              )}
            >
              {GENDER_LABEL[g]}
            </button>
          );
        })}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-32">
          <GuaiLoader size="lg" />
        </div>
      ) : filtered.length > 0 ? (
        <div className="flex gap-4 items-start pb-10">
          {splitCols(filtered, cols).map((col, ci) => (
            <div key={ci} className="flex-1 flex flex-col gap-4 min-w-0">
              {col.map((model) => (
                <ModelCard key={model.id} model={model} onUse={handleUse} />
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-32 text-muted-foreground">
          <Search className="size-12 mb-4 opacity-20" />
          <p className="text-sm font-medium mb-1">Không tìm thấy người mẫu</p>
          <p className="text-xs opacity-60">Thử tìm với từ khóa khác hoặc bộ lọc khác</p>
        </div>
      )}
    </div>
  );
}
