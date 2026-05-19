import React from "react";
import Logo from "@/components/shared/logo";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Visual Showcase Panel (Hidden on mobile) */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden border-r border-border/40 bg-gradient-to-tr from-primary/5 via-secondary/35 to-background p-12 lg:flex xl:w-[60%]">
        
        {/* Subtle grid background pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(var(--color-primary),0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(var(--color-primary),0.03)_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        
        {/* Ambient glows */}
        <div className="absolute -top-40 -left-40 size-96 rounded-full bg-primary/10 blur-[100px] pointer-events-none" />
        <div className="absolute right-0 bottom-0 size-80 rounded-full bg-rose-500/5 blur-[120px] pointer-events-none" />
        
        {/* Header */}
        <div className="relative z-10">
          <Logo />
        </div>

        {/* Hero concept content */}
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs text-primary font-medium tracking-wide">
            ✨ AI Fashion Model Studio v1.0
          </div>
          <h1 className="mt-6 font-serif text-4xl font-light leading-tight tracking-tight text-foreground md:text-5xl">
            Tái định nghĩa <br />
            <span className="font-normal italic text-primary">Hình ảnh sản phẩm</span> thời trang
          </h1>
          <p className="mt-4 text-base font-light text-muted-foreground leading-relaxed">
            Tạo ảnh người mẫu ảo chất lượng studio chỉ trong 3 bước. Tiết kiệm 90% chi phí sản xuất, tối ưu hóa tỷ lệ chuyển đổi cho sản phẩm của bạn.
          </p>

          {/* Interactive visual mockup */}
          <div className="mt-8 relative rounded-2xl border border-border bg-card/60 p-4 backdrop-blur-xl shadow-xl">
            <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="size-2.5 rounded-full bg-rose-500" />
                <span className="size-2.5 rounded-full bg-amber-500" />
                <span className="size-2.5 rounded-full bg-emerald-500" />
              </div>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-mono">Virtual Photoshoot Grid</span>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Bản gốc sản phẩm", desc: "Ảnh chụp treo", glow: false },
                { label: "AI Đang xử lý...", desc: "Tự động tách vải & pose", glow: true },
                { label: "Kết quả hoàn thiện", desc: "Người mẫu ảo Shopee/TikTok", glow: false }
              ].map((item, idx) => (
                <div 
                  key={idx} 
                  className={`relative aspect-[3/4] rounded-lg overflow-hidden border p-3 flex flex-col justify-between transition-all duration-500 ${
                    item.glow 
                      ? "border-primary bg-primary/5 shadow-[0_0_15px_rgba(var(--color-primary),0.05)] animate-pulse" 
                      : "border-border bg-background/50"
                  }`}
                >
                  <span className="text-[10px] font-mono text-muted-foreground/40">0{idx + 1}</span>
                  <div>
                    <h4 className="text-[11px] font-semibold text-foreground">{item.label}</h4>
                    <p className="text-[9px] text-muted-foreground mt-0.5">{item.desc}</p>
                  </div>
                  {item.glow && (
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/10 via-transparent to-transparent pointer-events-none" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 flex items-center justify-between text-xs text-muted-foreground/60 font-light">
          <span>© 2026 GU.AI. All rights reserved.</span>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-primary transition-colors">Điều khoản</Link>
            <Link href="/support" className="hover:text-primary transition-colors">Trợ giúp</Link>
          </div>
        </div>
      </div>

      {/* Auth Form Container */}
      <div className="relative flex w-full flex-col justify-center px-6 py-12 md:px-12 lg:w-1/2 xl:w-[40%] bg-background">
        {/* Mobile Logo Header */}
        <div className="absolute top-8 left-8 lg:hidden">
          <Logo />
        </div>
        
        {/* Floating gradient orb in auth section */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-96 rounded-full bg-primary/10 blur-[120px] pointer-events-none" />

        <div className="mx-auto w-full max-w-sm relative z-10">
          {children}
        </div>
      </div>
    </div>
  );
}
