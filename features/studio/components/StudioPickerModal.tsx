"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { X, Upload, Lock, ArrowUpRight, ChevronLeft, FolderHeart } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/apiFetch";
import GuaiLoader from "@/components/shared/guai-loader";
import { Skeleton } from "@/components/ui/skeleton";
import { getAppModels, type AppModel } from "@/features/models/appModelService";
import { PLAN_VISUALS } from "@/features/credit/planMeta";
import { getImagesPaginated, type DBAsset } from "@/features/archive/imageService";
import { getCollections, getCollectionItemsPaginated, type Collection } from "@/features/archive/collectionService";

type TabKey = "primary" | "gallery" | "collections";
type Mode = "model" | "library";
type LoadMoreFn = (() => void) | null;

interface Props {
  mode: Mode;
  defaultTab?: TabKey;
  onClose: () => void;
  onSelect: (url: string) => void;
  onUpload?: () => void;
}

const PAGE_SIZE = 24;

const LIB_CAT_LABEL: Record<string, string> = {
  pose: "Dáng ảnh",
  background: "Background",
  prompt: "Prompt",
  example: "Ví dụ",
};

const cardCls = "group relative rounded-xl overflow-hidden border border-border bg-card hover:border-primary/50 hover:shadow-lg hover:-translate-y-1 transition-all aspect-[3/4]";
const imgCls = "object-cover transition-transform duration-500 group-hover:scale-105 bg-secondary/50";
const gridCls = "grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3";

function GridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className={gridCls}>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="aspect-[3/4] rounded-xl" />
      ))}
    </div>
  );
}

export function StudioPickerModal({ mode, defaultTab = "gallery", onClose, onSelect, onUpload }: Props) {
  const [tab, setTab] = useState<TabKey>(defaultTab);

  // Tab đang active (nếu có lazy-load) đăng ký hàm loadMore của nó vào đây — scroll
  // container ở cấp modal này gọi nó khi cuộn gần đáy, tránh phải lồng thêm 1 lớp
  // overflow-y-auto bên trong từng tab (lồng nhiều lớp dễ bị kẹt không scroll được).
  const loadMoreRef = useRef<LoadMoreFn>(null);
  const registerLoadMore = useCallback((fn: LoadMoreFn) => { loadMoreRef.current = fn; }, []);

  const scrollRef = useRef<HTMLDivElement>(null);
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el || !loadMoreRef.current) return;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 200) loadMoreRef.current();
  }, []);

  // Đổi tab → reset đăng ký loadMore cũ (tab mới sẽ tự đăng ký lại nếu cần) và cuộn lên đầu.
  const switchTab = (next: TabKey) => {
    loadMoreRef.current = null;
    setTab(next);
    scrollRef.current?.scrollTo({ top: 0 });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-4xl h-[80vh] bg-background border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border gap-2 shrink-0">
          <div className="flex items-center gap-1 bg-secondary/60 rounded-xl p-1 overflow-x-auto">
            <TabBtn active={tab === "primary"} onClick={() => switchTab("primary")}>
              {mode === "model" ? "Người mẫu" : "Thư viện"}
            </TabBtn>
            <TabBtn active={tab === "gallery"} onClick={() => switchTab("gallery")}>Gallery của tôi</TabBtn>
            <TabBtn active={tab === "collections"} onClick={() => switchTab("collections")}>Bộ sưu tập</TabBtn>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {mode === "model" && tab === "primary" && (
              <Link href="/models" target="_blank" className="text-xs text-primary hover:underline inline-flex items-center gap-0.5">
                Xem đầy đủ <ArrowUpRight className="size-3" />
              </Link>
            )}
            {onUpload && (
              <button
                onClick={onUpload}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-secondary text-foreground hover:bg-secondary/80 rounded-xl transition-colors"
              >
                <Upload className="size-4" />
                Tải ảnh lên
              </button>
            )}
            <button onClick={onClose} className="p-2 rounded-full hover:bg-secondary transition-colors">
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* Content — đây là DUY NHẤT 1 lớp scroll cho cả modal */}
        <div ref={scrollRef} onScroll={handleScroll} className="flex-1 min-h-0 overflow-y-auto p-4">
          {tab === "primary" && (mode === "model" ? <ModelTab onSelect={onSelect} /> : <LibraryTab onSelect={onSelect} />)}
          {tab === "gallery" && <GalleryTab onSelect={onSelect} registerLoadMore={registerLoadMore} />}
          {tab === "collections" && <CollectionsTab onSelect={onSelect} registerLoadMore={registerLoadMore} />}
        </div>
      </div>
    </div>
  );
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap",
        active ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}

// ── Tab: Người mẫu (app_models, tier-gated) ─────────────────────────────────────
function ModelTab({ onSelect }: { onSelect: (url: string) => void }) {
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

  if (loading) return <GridSkeleton />;
  if (models.length === 0) return <CenterState>Chưa có người mẫu nào trong kho.</CenterState>;

  return (
    <div className={gridCls}>
      {models.map((model) => {
        const plan = PLAN_VISUALS[model.required_tier];
        return (
          <div
            key={model.id}
            onClick={() => handlePick(model)}
            className={cn(cardCls, "cursor-pointer", !model.unlocked && "opacity-90")}
          >
            <Image
              src={model.image_url}
              alt={model.name}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              loading="lazy"
              className={cn(imgCls, !model.unlocked && "blur-[2px] grayscale-[0.3]")}
            />
            <span className={cn("absolute top-2 left-2 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold", plan.badgeClass)}>
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
  );
}

// ── Tab: Thư viện (library_items, không tính category model) ───────────────────
function LibraryTab({ onSelect }: { onSelect: (url: string) => void }) {
  const [items, setItems] = useState<{ id: string; cat: string; title: string; image?: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get("/api/library")
      .then((res) => {
        if (res.data.success) {
          setItems(
            (res.data.data as any[])
              .filter((d) => d.category !== "model" && d.image_url)
              .map((d) => ({ id: d.id, cat: d.category, title: d.title, image: d.image_url }))
          );
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <GridSkeleton />;
  if (items.length === 0) return <CenterState>Không có dữ liệu trong thư viện.</CenterState>;

  return (
    <div className={gridCls}>
      {items.map((item) => (
        <div key={item.id} onClick={() => item.image && onSelect(item.image)} className={cn(cardCls, "cursor-pointer")}>
          <Image src={item.image!} alt={item.title} fill sizes="(max-width: 768px) 50vw, 25vw" loading="lazy" className={imgCls} />
          <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-black/50 text-white">
            {LIB_CAT_LABEL[item.cat] ?? item.cat}
          </span>
          <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
            <p className="text-xs font-medium text-white truncate drop-shadow-md">{item.title}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Hook chung cho các tab có lazy-load: tự fetch trang đầu, đăng ký loadMore lên modal cha.
 * fetchingRef chặn đồng bộ (không qua state/render) để loadMore gọi liên tiếp (cuộn nhanh,
 * hoặc React StrictMode double-invoke effect ở dev) không bắn 2 request cùng offset → trùng key.
 * genRef bỏ kết quả của request "mồ côi" nếu deps đổi (đổi bộ sưu tập) trong lúc đang chờ fetch cũ.
 */
function usePaginatedList<T extends { id: string }>(
  fetchPage: (offset: number) => Promise<{ items: T[]; hasMore: boolean }>,
  registerLoadMore: (fn: LoadMoreFn) => void,
  deps: React.DependencyList,
) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const offsetRef = useRef(0);
  const hasMoreRef = useRef(true);
  const fetchingRef = useRef(false);
  const genRef = useRef(0);
  const fetchPageRef = useRef(fetchPage);
  fetchPageRef.current = fetchPage;

  const loadMore = useCallback(() => {
    if (fetchingRef.current || !hasMoreRef.current) return;
    fetchingRef.current = true;
    setLoading(true);
    const gen = genRef.current;
    fetchPageRef.current(offsetRef.current)
      .then((res) => {
        if (gen !== genRef.current) return; // deps đã đổi trong lúc chờ — bỏ kết quả cũ
        setItems((prev) => {
          const seen = new Set(prev.map((p) => p.id));
          return [...prev, ...res.items.filter((i) => !seen.has(i.id))];
        });
        hasMoreRef.current = res.hasMore;
        offsetRef.current += res.items.length;
      })
      .catch(() => toast.error("Không tải được dữ liệu"))
      .finally(() => {
        fetchingRef.current = false;
        if (gen === genRef.current) setLoading(false);
      });
  }, []);

  // Reset + tải trang đầu mỗi khi deps đổi (vd. đổi sang bộ sưu tập khác)
  useEffect(() => {
    genRef.current += 1;
    offsetRef.current = 0;
    hasMoreRef.current = true;
    fetchingRef.current = false;
    setItems([]);
    setLoading(true);
    loadMore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    registerLoadMore(loadMore);
    return () => registerLoadMore(null);
  }, [loadMore, registerLoadMore]);

  return { items, loading, hasMore: hasMoreRef.current };
}

// ── Tab: Gallery của tôi (assets của user, lazy-load) ───────────────────────────
function GalleryTab({ onSelect, registerLoadMore }: { onSelect: (url: string) => void; registerLoadMore: (fn: LoadMoreFn) => void }) {
  const { items, loading } = usePaginatedList<DBAsset>(
    (offset) => getImagesPaginated(PAGE_SIZE, offset, { type: "image" }),
    registerLoadMore,
    [],
  );

  if (items.length === 0 && loading) return <GridSkeleton />;
  if (items.length === 0) return <CenterState>Gallery của bạn đang trống.</CenterState>;

  return (
    <>
      <div className={gridCls}>
        {items.map((img) => (
          <button key={img.id} onClick={() => onSelect(img.url)} className={cardCls}>
            <Image src={img.url} alt="" fill sizes="(max-width: 768px) 50vw, 25vw" className={imgCls} />
          </button>
        ))}
      </div>
      {loading && <div className="flex justify-center py-6"><GuaiLoader size="sm" /></div>}
    </>
  );
}

// ── Tab: Bộ sưu tập (danh sách folder → chọn 1 → ảnh trong đó, lazy-load) ───────
function CollectionsTab({ onSelect, registerLoadMore }: { onSelect: (url: string) => void; registerLoadMore: (fn: LoadMoreFn) => void }) {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    getCollections()
      .then(setCollections)
      .catch(() => toast.error("Không tải được bộ sưu tập"))
      .finally(() => setLoading(false));
  }, []);

  if (activeId) {
    const collection = collections.find((c) => c.id === activeId);
    return (
      <CollectionDetail
        collection={collection}
        onBack={() => setActiveId(null)}
        onSelect={onSelect}
        registerLoadMore={registerLoadMore}
      />
    );
  }

  if (loading) return <GridSkeleton />;
  if (collections.length === 0) return <CenterState>Bạn chưa có bộ sưu tập nào.</CenterState>;

  return (
    <div className={gridCls}>
      {collections.map((col) => (
        <button key={col.id} onClick={() => setActiveId(col.id)} className={cardCls}>
          {col.cover_asset?.url ? (
            <Image src={col.cover_asset.url} alt={col.name} fill sizes="(max-width: 768px) 50vw, 25vw" className={imgCls} />
          ) : (
            <div className="size-full flex items-center justify-center bg-secondary/50">
              <FolderHeart className="size-8 text-muted-foreground/40" />
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
            <p className="text-xs font-medium text-white truncate drop-shadow-md">{col.name}</p>
          </div>
        </button>
      ))}
    </div>
  );
}

function CollectionDetail({
  collection, onBack, onSelect, registerLoadMore,
}: {
  collection?: Collection;
  onBack: () => void;
  onSelect: (url: string) => void;
  registerLoadMore: (fn: LoadMoreFn) => void;
}) {
  const collectionId = collection?.id ?? null;
  const { items, loading } = usePaginatedList<DBAsset>(
    (offset) => collectionId ? getCollectionItemsPaginated(collectionId, PAGE_SIZE, offset) : Promise.resolve({ items: [], hasMore: false }),
    registerLoadMore,
    [collectionId],
  );

  return (
    <div>
      <button onClick={onBack} className="cursor-pointer flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground mb-3">
        <ChevronLeft className="size-4" /> {collection?.name ?? "Bộ sưu tập"}
      </button>
      {items.length === 0 && loading ? (
        <GridSkeleton />
      ) : items.length === 0 ? (
        <CenterState>Bộ sưu tập này chưa có ảnh nào.</CenterState>
      ) : (
        <>
          <div className={gridCls}>
            {items.map((img) => (
              <button key={img.id} onClick={() => onSelect(img.url)} className={cardCls}>
                <Image src={img.url} alt="" fill sizes="(max-width: 768px) 50vw, 25vw" className={imgCls} />
              </button>
            ))}
          </div>
          {loading && <div className="flex justify-center py-6"><GuaiLoader size="sm" /></div>}
        </>
      )}
    </div>
  );
}

function CenterState({ children }: { children: React.ReactNode }) {
  const isText = typeof children === "string";
  return (
    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
      {isText ? <p className="text-sm">{children}</p> : children}
    </div>
  );
}
