"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, Layers, Zap, PenTool, Layout, CheckCircle, ChevronRight, UserCheck, ShieldAlert } from "lucide-react";
import Logo from "@/components/shared/logo";
import Header from "@/components/shared/header";
import { Button } from "@/components/ui/button";

export default function ServicesPage() {
  const [activeTab, setActiveTab] = useState<"model" | "backdrop" | "brand" | "copywriter">("model");

  const tabContents = {
    model: {
      title: "Người Mẫu Ảo AI Đa Dạng",
      subtitle: "Giải pháp thay thế người mẫu thật hoàn hảo",
      desc: "Hệ thống AI tiên tiến được huấn luyện riêng để tối ưu hóa nhân khẩu học Việt Nam. Cung cấp hàng chục tùy chọn mẫu nam, mẫu nữ, mẫu unisex với đa dạng độ tuổi, thể trạng, màu da và sắc thái biểu cảm.",
      bullets: [
        "Đồng bộ hóa phom dáng quần áo thật 99% không làm méo mó hoa văn.",
        "Đa dạng biểu cảm từ lạnh lùng high-fashion đến nụ cười thân thiện thương mại.",
        "Huấn luyện mẫu ảo độc quyền theo gương mặt thương hiệu riêng (Enterprise)."
      ],
      badge: "AI Virtual Model Generation",
      actionText: "Tạo mẫu ảo thử nghiệm"
    },
    backdrop: {
      title: "Bối Cảnh Thông Minh (Smart Scene)",
      subtitle: "Bất kể không gian và thời gian",
      desc: "Không cần thuê phim trường hay di chuyển ngoại cảnh. Tải ảnh lên và ghép sản phẩm vào hơn 30+ bối cảnh sống động có sẵn: quán cafe tối giản, góc phố cổ Hà Nội cổ kính, studio ánh sáng chuyên nghiệp, hay bãi biển ngập nắng.",
      bullets: [
        "Tự động tính toán đổ bóng 3D chân thực theo hướng nguồn sáng.",
        "Giữ nguyên phom dáng vải, độ bóng của da và các chi tiết khóa kéo, khuy áo.",
        "Cập nhật bối cảnh theo mùa (Giáng sinh, Tết Nguyên Đán, Hè rực rỡ)."
      ],
      badge: "Smart backdrop Integration",
      actionText: "Khám phá bối cảnh"
    },
    brand: {
      title: "Bộ Nhận Diện Thương Hiệu (Brand Kit)",
      subtitle: "Đồng bộ hóa hình ảnh trên mọi kênh",
      desc: "Thiết lập quy chuẩn thẩm mỹ cho toàn bộ chiến dịch. Brand Kit cho phép lưu cấu hình ánh sáng, logo đóng dấu bản quyền tự động, tông màu LUT riêng biệt và căn lề theo các chuẩn sàn thương mại điện tử phổ biến.",
      bullets: [
        "1-Click chuyển đổi ảnh sang tỷ lệ 1:1 (Shopee), 9:16 (TikTok), 4:5 (Facebook).",
        "Tự động đính logo mờ chống sao chép hình ảnh.",
        "Đồng bộ hóa màu sắc hiển thị đồng đều trên mọi thiết bị di động."
      ],
      badge: "Brand Identity Sync",
      actionText: "Thiết lập Brand Kit"
    },
    copywriter: {
      title: "Trình Tạo Mô Tả Sản Phẩm",
      subtitle: "Thu hút khách hàng bằng nội dung AI",
      desc: "Không chỉ tạo ảnh, GU.AI tích hợp sẵn trình viết nội dung thông minh. Dựa vào kiểu dáng quần áo được quét qua ảnh, AI tự động tạo tiêu đề chuẩn SEO, mô tả chất liệu, gợi ý mix-match phối đồ và hashtag bán hàng.",
      bullets: [
        "Hỗ trợ viết content theo nhiều văn phong: sang trọng, trẻ trung, hài hước.",
        "Tự động trích xuất thông tin form dáng từ ảnh để đưa vào bài viết.",
        "Tạo hàng loạt caption phục vụ đăng bài đa kênh Shopee/TikTok/FB chỉ trong 1 giây."
      ],
      badge: "AI Product Copywriter",
      actionText: "Tạo caption thử"
    }
  };

  const currentTab = tabContents[activeTab];

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-background">
      
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-16 text-center">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 size-96 rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
        <div className="mx-auto max-w-4xl px-6 relative z-10">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">STUDIO THỜI TRANG THẾ HỆ MỚI</span>
          <h1 className="font-serif text-4xl font-light tracking-tight text-foreground sm:text-5xl lg:text-6xl mt-3">
            Dịch vụ chụp ảnh <span className="font-normal italic text-primary">ảo hóa bằng AI</span>
          </h1>
          <p className="mt-4 text-base font-light text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Khám phá trọn bộ công cụ sáng tạo kỹ thuật số giúp tối giản hóa 95% công sức chuẩn bị logistics cho một buổi chụp photoshoot thực tế.
          </p>
        </div>
      </section>

      {/* Interactive Tabs Showcase */}
      <section className="pb-24 relative z-10">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          
          {/* Tab buttons group */}
          <div className="flex flex-wrap justify-center gap-2 max-w-2xl mx-auto mb-16 border border-border/60 bg-card/45 p-1.5 rounded-2xl backdrop-blur-sm shadow-sm">
            {[
              { id: "model", label: "Mẫu Ảo AI", icon: <UserCheck className="size-4" /> },
              { id: "backdrop", label: "Bối Cảnh", icon: <Layout className="size-4" /> },
              { id: "brand", label: "Brand Kit", icon: <Zap className="size-4" /> },
              { id: "copywriter", label: "AI Copywriter", icon: <PenTool className="size-4" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab contents details */}
          <div className="grid lg:grid-cols-2 gap-12 items-center bg-card/45 border border-border/60 rounded-3xl p-8 lg:p-12 backdrop-blur-md shadow-sm">
            
            {/* Visual preview mock (Left column) */}
            <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden border border-border bg-secondary/10 flex items-center justify-center">
              
              {/* Dynamic decorative backdrop inside mock display */}
              <div className="absolute inset-0 bg-radial-[circle_at_center] from-primary/10 via-transparent to-transparent opacity-60" />
              
              <div className="relative text-center p-8 space-y-4">
                
                {/* Visual rendering of features using code mockups and icons */}
                {activeTab === "model" && (
                  <div className="space-y-4">
                    <div className="flex justify-center gap-4">
                      <div className="size-16 rounded-full border border-primary/40 bg-primary/5 flex items-center justify-center text-primary font-serif font-bold text-lg animate-pulse">Tr</div>
                      <div className="size-16 rounded-full border border-border bg-card flex items-center justify-center text-muted-foreground font-serif font-bold text-lg shadow-sm">Ly</div>
                      <div className="size-16 rounded-full border border-border bg-card flex items-center justify-center text-muted-foreground font-serif font-bold text-lg shadow-sm">Vy</div>
                    </div>
                    <div className="text-[11px] font-mono text-primary uppercase tracking-widest font-semibold">Vietnamese Face Models</div>
                    <p className="text-xs font-light text-muted-foreground max-w-xs mx-auto">Chọn các gương mặt đại diện có nét đẹp Á Đông và thể trạng người Việt.</p>
                  </div>
                )}

                {activeTab === "backdrop" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2 max-w-xs mx-auto">
                      {["Cafe Studio", "Đường phố HN", "Biển Nha Trang", "Studio Trắng"].map((scene, sIdx) => (
                        <div key={sIdx} className="border border-border bg-card rounded-lg p-2 text-[10px] text-center text-muted-foreground hover:border-primary/40 hover:text-foreground transition-colors cursor-pointer shadow-sm">
                          🏞 {scene}
                        </div>
                      ))}
                    </div>
                    <div className="text-[11px] font-mono text-primary uppercase tracking-widest font-semibold">Smart Ambient Lighting</div>
                    <p className="text-xs font-light text-muted-foreground max-w-xs mx-auto">Ánh sáng tự động khớp với bối cảnh cafe, đường phố hoặc studio.</p>
                  </div>
                )}

                {activeTab === "brand" && (
                  <div className="space-y-4">
                    <div className="inline-flex flex-col gap-2 border border-border bg-card rounded-xl p-4 text-left max-w-xs mx-auto shadow-md">
                      <div className="flex justify-between items-center text-[10px] text-muted-foreground pb-2 border-b border-border font-mono">
                        <span>PRESET TỶ LỆ KHUNG HÌNH</span>
                        <span className="text-primary font-bold">ON</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="border border-primary bg-primary/5 rounded px-2 py-1 text-[9px] text-center text-primary font-semibold">Shopee (1:1)</div>
                        <div className="border border-border bg-secondary/30 rounded px-2 py-1 text-[9px] text-center text-muted-foreground">TikTok (9:16)</div>
                        <div className="border border-border bg-secondary/30 rounded px-2 py-1 text-[9px] text-center text-muted-foreground">FB (4:5)</div>
                      </div>
                      <div className="pt-2 text-[9px] font-light text-muted-foreground/60 flex items-center gap-1">
                        <CheckCircle className="size-3 text-primary" /> Auto-watermark: Enabled (Bottom Right)
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "copywriter" && (
                  <div className="space-y-3 text-left max-w-xs mx-auto border border-border bg-card p-4 rounded-xl shadow-md">
                    <div className="text-[10px] font-mono text-primary uppercase tracking-wider">AI Content Draft:</div>
                    <div className="font-serif text-sm text-foreground font-medium">Áo Thun Polo Premium Trơn Dáng Rộng</div>
                    <p className="text-[10px] font-light text-muted-foreground/80 leading-normal">
                      🌱 Form áo rộng rãi tôn dáng, chất vải cotton 100% thoáng mát tự nhiên. Thích hợp đi làm, dạo phố cuối tuần cùng bạn bè...
                    </p>
                    <div className="text-[9px] text-primary/70 font-mono">#polo #streetstyle #guai</div>
                  </div>
                )}

              </div>
            </div>

            {/* Description details (Right column) */}
            <div className="space-y-6">
              <span className="inline-block rounded-full bg-primary/10 border border-primary/30 px-3 py-1 text-[10px] text-primary uppercase font-mono tracking-wider font-semibold">
                {currentTab.badge}
              </span>
              
              <div className="space-y-2">
                <h3 className="text-2xl font-serif font-light text-foreground sm:text-3xl">
                  {currentTab.title}
                </h3>
                <h4 className="text-sm text-primary font-medium tracking-wide">
                  {currentTab.subtitle}
                </h4>
              </div>

              <p className="text-sm font-light text-muted-foreground leading-relaxed">
                {currentTab.desc}
              </p>

              <ul className="space-y-3.5">
                {currentTab.bullets.map((bullet, bIdx) => (
                  <li key={bIdx} className="flex items-start gap-2.5 text-xs font-light text-muted-foreground">
                    <CheckCircle className="size-4 shrink-0 text-primary mt-0.5" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-4">
                <Link href="/register">
                  <Button className="rounded-xl bg-primary px-6 py-5 text-xs font-semibold text-primary-foreground shadow-[0_0_15px_rgba(var(--color-primary),0.15)] hover:bg-primary/95 transition-all">
                    {currentTab.actionText}
                    <ChevronRight className="size-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Technical Reliability details */}
      <section className="py-20 border-t border-border/40 bg-secondary/15">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-serif text-3xl font-light text-foreground">
              Nền tảng công nghệ <span className="font-normal italic text-primary">vững chắc</span>
            </h2>
            <p className="mt-3 text-sm font-light text-muted-foreground">
              Giải quyết triệt để các rào cản kỹ thuật của việc ứng dụng AI vào thương mại.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Đồng bộ phom vải thật",
                desc: "Không giống như Midjourney hay Stable Diffusion thông thường làm biến đổi cấu trúc trang phục, GU.AI duy trì phom vải và hoa văn thật 99% để khách hàng của bạn không thấy sự khác biệt so với sản phẩm nhận về."
              },
              {
                title: "Xử lý hàng loạt BullMQ",
                desc: "Đăng tải 100+ ảnh sản phẩm. Hệ thống tự động chia nhỏ công việc, sắp xếp thứ tự và thực hiện liên tục dưới nền. Bạn có thể tắt máy đi uống cafe và quay lại nhận toàn bộ ảnh hoàn thiện."
              },
              {
                title: "API Keys Rotation tự động",
                desc: "Hệ thống server backend liên tục giám sát và tự động đảo ngược các API key AI (Replicate, Fal.ai) khi quá tải hạn ngạch, đảm bảo dịch vụ hoạt động xuyên suốt 24/7 không gián đoạn."
              }
            ].map((item, idx) => (
              <div key={idx} className="border border-border/60 bg-card rounded-2xl p-6 space-y-3 shadow-sm">
                <h4 className="text-sm font-semibold text-foreground">{item.title}</h4>
                <p className="text-xs font-light text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-border/40 bg-background py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mt-8 pt-8 flex flex-col md:flex-row items-center justify-between text-xs font-light text-muted-foreground gap-4">
            <span>© 2026 GU.AI. Bảo lưu mọi quyền.</span>
            <div className="flex gap-6">
              <Link href="/privacy" className="hover:text-primary transition-colors font-normal">Chính sách bảo mật</Link>
              <Link href="/terms" className="hover:text-primary transition-colors font-normal">Điều khoản dịch vụ</Link>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
