import Image from "next/image";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen overflow-hidden flex bg-background">

      {/* ── Left: Banner image ───────────────────────────────────────────── */}
      <div className="relative hidden lg:flex lg:w-[52%] xl:w-[56%] flex-shrink-0">
        <Image
          src="/images/login_banner2.png"
          alt="GU.AI Fashion Studio"
          fill
          className="object-cover"
          priority
        />

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-black/20" />

        {/* Logo — white via CSS filter */}
        <div className="absolute top-8 left-8 z-10">
          <img src="/icons/logo_title.png" alt="GU.AI" className="h-8 w-auto object-contain [filter:brightness(0)_invert(1)] opacity-90" />
        </div>

        {/* Bottom brand text */}
        <div className="absolute bottom-10 left-8 right-8 z-10">
          <h1 className="font-serif text-4xl font-light leading-snug text-white">
            Tái định nghĩa<br />
            <span className="italic font-normal">hình ảnh thời trang</span>
          </h1>
          <p className="mt-3 text-sm font-light text-white/65 leading-relaxed max-w-xs">
            Tạo ảnh người mẫu ảo chất lượng studio chỉ trong 3 bước.<br />
            Tiết kiệm 90% chi phí sản xuất ảnh.
          </p>

          {/* Decorative dots */}
          <div className="mt-6 flex gap-2">
            <span className="h-1 w-6 rounded-full bg-white/90" />
            <span className="h-1 w-2 rounded-full bg-white/40" />
            <span className="h-1 w-2 rounded-full bg-white/40" />
          </div>
        </div>
      </div>

      {/* ── Right: Form panel ────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-y-auto">

        {/* Top bar */}
        <div className="flex items-center justify-between px-8 pt-7 pb-4 flex-shrink-0">
          {/* Mobile logo */}
          <div className="lg:hidden">
            <img src="/icons/logo_title.png" alt="GU.AI" className="h-8 w-auto object-contain" />
          </div>
          {/* Spacer on desktop */}
          <div className="hidden lg:block" />

          {/* Auth switch link rendered by each page via slot — placeholder */}
          <div id="auth-switch" />
        </div>

        {/* Centered form */}
        <div className="flex flex-1 items-center justify-center px-6 py-2">
          <div className="w-full max-w-[360px]">
            {children}
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 pb-6 flex-shrink-0 flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground/40">© 2026 GU.AI</span>
          <div className="flex gap-4">
            <Link href="/privacy" className="text-[11px] text-muted-foreground/40 hover:text-muted-foreground transition-colors">Điều khoản</Link>
            <Link href="/support" className="text-[11px] text-muted-foreground/40 hover:text-muted-foreground transition-colors">Trợ giúp</Link>
          </div>
        </div>
      </div>

    </div>
  );
}
