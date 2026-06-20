const fs = require('fs');
let code = fs.readFileSync('app/(dashboard)/library/page.tsx', 'utf8');

// 1. Add imports
code = code.replace(
  'import { cn } from "@/lib/utils";',
  'import { cn } from "@/lib/utils";\nimport { useRouter } from "next/navigation";'
);
code = code.replace(
  'AlignLeft, Check, LayoutGrid,',
  'AlignLeft, Check, LayoutGrid, X,'
);

// 2. Update LibraryCard props
code = code.replace(
  'function LibraryCard({ item }: { item: Item }) {',
  'function LibraryCard({ item, selected, onToggle }: { item: Item; selected?: boolean; onToggle?: () => void }) {'
);

// 3. Update LibraryCard root div
code = code.replace(
  '    <div className="group rounded-2xl overflow-hidden border border-border bg-card hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-black/20 transition-all duration-300 hover:-translate-y-0.5">',
  `    <div 
      onClick={onToggle}
      className={cn(
        "group cursor-pointer rounded-2xl overflow-hidden border bg-card hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 relative",
        selected ? "border-primary shadow-md shadow-primary/20 ring-2 ring-primary/20" : "border-border hover:shadow-black/5 dark:hover:shadow-black/20"
      )}
    >
      {/* Selection Checkbox */}
      {onToggle && (
        <div className={cn(
          "absolute top-3 left-3 z-10 size-6 rounded-full border-2 flex items-center justify-center transition-all shadow-sm",
          selected 
            ? "bg-primary border-primary text-primary-foreground" 
            : "bg-black/20 border-white/60 text-transparent opacity-0 group-hover:opacity-100 backdrop-blur-md"
        )}>
          <Check className="size-3.5" strokeWidth={3} />
        </div>
      )}`
);

// 4. Prevent Link and Copy from toggling
code = code.replace(
  'href={href}',
  'href={href}\n                  onClick={(e) => e.stopPropagation()}'
);
code = code.replace(
  'onClick={() => copy(item.title)}',
  'onClick={(e) => { e.stopPropagation(); copy(item.title); }}'
);
code = code.replace(
  'onClick={() => copy(item.promptText ?? "")}',
  'onClick={(e) => { e.stopPropagation(); copy(item.promptText ?? ""); }}'
);

// 5. Update LibraryPage state and logic
code = code.replace(
  '  const [loading, setLoading]     = useState(true);\n  const cols                      = useCols();',
  `  const router                    = useRouter();
  const [loading, setLoading]     = useState(true);
  const [selectedItems, setSelectedItems] = useState<Item[]>([]);
  const cols                      = useCols();

  const toggleSelect = (item: Item) => {
    setSelectedItems(prev => {
      if (prev.find(i => i.id === item.id)) {
        return prev.filter(i => i.id !== item.id);
      }
      return [...prev.filter(i => i.cat !== item.cat), item];
    });
  };

  const handleSendToStudio = () => {
    if (selectedItems.length === 0) return;

    let tool = "try-on";
    const params = new URLSearchParams();

    const pose = selectedItems.find(i => i.cat === "pose" || i.cat === "reference");
    const model = selectedItems.find(i => i.cat === "model");
    const bg = selectedItems.find(i => i.cat === "background");
    const prompt = selectedItems.find(i => i.cat === "prompt");

    if (pose || model) {
      tool = "product-to-model";
      if (pose) params.set("poseUrl", pose.image || "");
      if (model) params.set("modelUrl", model.image || "");
    }
    
    if (bg) {
      if (!pose) tool = "edit";
      params.set("bgUrl", bg.image || "");
      if (model && !pose) params.set("modelUrl", model.image || "");
    }

    if (prompt) {
      if (!pose && !model && !bg) tool = "create-model";
      params.set("promptText", prompt.promptText || "");
    }

    router.push(\`/studio?tool=\${tool}&\${params.toString()}\`);
  };`
);

// 6. Pass props to LibraryCard
code = code.replace(
  '<LibraryCard key={item.id} item={item} />',
  `<LibraryCard 
                  key={item.id} 
                  item={item}
                  selected={!!selectedItems.find(i => i.id === item.id)}
                  onToggle={() => toggleSelect(item)}
                />`
);

// 7. Add Floating Action Bar
code = code.replace(
  '        <div className="flex flex-col items-center justify-center py-32 text-muted-foreground">\r\n          <Search className="size-12 mb-4 opacity-20" />\r\n          <p className="text-sm font-medium mb-1">Không tìm thấy kết quả</p>\r\n          <p className="text-xs opacity-60">Thử tìm với từ khóa khác hoặc chọn danh mục khác</p>\r\n        </div>\r\n      )}',
  `        <div className="flex flex-col items-center justify-center py-32 text-muted-foreground">
          <Search className="size-12 mb-4 opacity-20" />
          <p className="text-sm font-medium mb-1">Không tìm thấy kết quả</p>
          <p className="text-xs opacity-60">Thử tìm với từ khóa khác hoặc chọn danh mục khác</p>
        </div>
      )}

      {/* ── Selection Cart (Floating Bottom Bar) ── */}
      {selectedItems.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 bg-background/90 backdrop-blur-xl border shadow-2xl p-3 pr-4 rounded-full animate-in slide-in-from-bottom-10 fade-in duration-300">
          <div className="flex items-center gap-2 pl-2 border-r pr-4">
            <div className="flex -space-x-3">
              {selectedItems.map((item, idx) => (
                <div key={item.id} className="relative size-10 rounded-full overflow-hidden border-2 border-background bg-secondary z-[idx]">
                  {item.image ? (
                    <img src={item.image} alt="" className="size-full object-cover" />
                  ) : (
                    <div className="size-full flex items-center justify-center bg-violet-100 text-violet-600 dark:bg-violet-900 dark:text-violet-400">
                      <AlignLeft className="size-4" />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex flex-col ml-2">
              <span className="text-[11px] text-muted-foreground font-medium leading-none mb-1">Đã chọn</span>
              <span className="text-sm font-semibold leading-none">{selectedItems.length} mục</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setSelectedItems([])}
              className="px-3 py-2 text-xs font-semibold text-muted-foreground hover:bg-secondary rounded-xl transition-colors flex items-center gap-1"
            >
              <X className="size-3" />
              Bỏ qua
            </button>
            <button 
              onClick={handleSendToStudio}
              className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold rounded-xl transition-all shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5"
            >
              <Wand2 className="size-4" />
              Gửi vào Studio
            </button>
          </div>
        </div>
      )}`
);
code = code.replace(
  '        <div className="flex flex-col items-center justify-center py-32 text-muted-foreground">\n          <Search className="size-12 mb-4 opacity-20" />\n          <p className="text-sm font-medium mb-1">Không tìm thấy kết quả</p>\n          <p className="text-xs opacity-60">Thử tìm với từ khóa khác hoặc chọn danh mục khác</p>\n        </div>\n      )}',
  `        <div className="flex flex-col items-center justify-center py-32 text-muted-foreground">
          <Search className="size-12 mb-4 opacity-20" />
          <p className="text-sm font-medium mb-1">Không tìm thấy kết quả</p>
          <p className="text-xs opacity-60">Thử tìm với từ khóa khác hoặc chọn danh mục khác</p>
        </div>
      )}

      {/* ── Selection Cart (Floating Bottom Bar) ── */}
      {selectedItems.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 bg-background/90 backdrop-blur-xl border shadow-2xl p-3 pr-4 rounded-full animate-in slide-in-from-bottom-10 fade-in duration-300">
          <div className="flex items-center gap-2 pl-2 border-r pr-4">
            <div className="flex -space-x-3">
              {selectedItems.map((item, idx) => (
                <div key={item.id} className="relative size-10 rounded-full overflow-hidden border-2 border-background bg-secondary z-[idx]">
                  {item.image ? (
                    <img src={item.image} alt="" className="size-full object-cover" />
                  ) : (
                    <div className="size-full flex items-center justify-center bg-violet-100 text-violet-600 dark:bg-violet-900 dark:text-violet-400">
                      <AlignLeft className="size-4" />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex flex-col ml-2">
              <span className="text-[11px] text-muted-foreground font-medium leading-none mb-1">Đã chọn</span>
              <span className="text-sm font-semibold leading-none">{selectedItems.length} mục</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setSelectedItems([])}
              className="px-3 py-2 text-xs font-semibold text-muted-foreground hover:bg-secondary rounded-xl transition-colors flex items-center gap-1"
            >
              <X className="size-3" />
              Bỏ qua
            </button>
            <button 
              onClick={handleSendToStudio}
              className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold rounded-xl transition-all shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5"
            >
              <Wand2 className="size-4" />
              Gửi vào Studio
            </button>
          </div>
        </div>
      )}`
);

fs.writeFileSync('app/(dashboard)/library/page.tsx', code);
console.log('Fixed');
