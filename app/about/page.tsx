"use client";

import Link from "next/link";
import Header from "@/components/shared/header";
import Logo from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  Target,
  Users,
  Zap,
  Heart,
  Globe,
  ShieldCheck,
} from "lucide-react";

const TEAM = [
  {
    name: "Nguyễn Minh Khoa",
    role: "Co-founder & CEO",
    desc: "10+ năm kinh nghiệm trong AI & Computer Vision. Từng làm việc tại Google Brain và VinAI.",
    avatar: "/vietnamese_male.png",
  },
  {
    name: "Trần Thị Linh",
    role: "Co-founder & CPO",
    desc: "Chuyên gia thiết kế sản phẩm với nền tảng thời trang. Cựu giám đốc sáng tạo tại Canifa.",
    avatar: "/vietnamese_female.png",
  },
  {
    name: "Lê Hoàng Nam",
    role: "CTO",
    desc: "Full-stack AI engineer. Từng xây dựng hạ tầng ML cho các startup Series B tại Singapore.",
    avatar: "/vietnamese_male.png",
  },
];

const VALUES = [
  {
    Icon: Target,
    title: "Tập trung vào giá trị thực",
    desc: "Chúng tôi không chạy theo xu hướng. Mỗi tính năng được xây dựng để giải quyết vấn đề thực tế của các thương hiệu thời trang Việt Nam.",
  },
  {
    Icon: Zap,
    title: "Tốc độ & Hiệu suất",
    desc: "Thời gian là tiền bạc. Hệ thống của chúng tôi được tối ưu để tạo ảnh trong vài giây, không phải vài giờ.",
  },
  {
    Icon: Heart,
    title: "Thiết kế vì người dùng",
    desc: "Giao diện đơn giản đến mức ai cũng dùng được — không cần kiến thức kỹ thuật hay kinh nghiệm photoshop.",
  },
  {
    Icon: ShieldCheck,
    title: "Bảo mật & Tin cậy",
    desc: "Ảnh và dữ liệu của bạn luôn được bảo vệ. Chúng tôi không dùng ảnh của khách hàng để train AI.",
  },
  {
    Icon: Globe,
    title: "Made for Vietnam",
    desc: "Model AI được huấn luyện trên dữ liệu đặc thù châu Á — phom dáng, màu da, và phong cách thời trang Việt Nam.",
  },
  {
    Icon: Users,
    title: "Cộng đồng trước tiên",
    desc: "Chúng tôi lắng nghe từng feedback của khách hàng và cập nhật sản phẩm mỗi tuần dựa trên nhu cầu thực tế.",
  },
];

const STATS = [
  { num: "2023",    label: "Năm thành lập"        },
  { num: "500+",    label: "Thương hiệu tin dùng"  },
  { num: "1.2M+",   label: "Ảnh đã được tạo"       },
  { num: "< 10s",   label: "Thời gian tạo ảnh TB"  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0,  transition: { duration: 0.5 } },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden pt-24 pb-20 border-b border-border/40">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[500px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(var(--color-primary),0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(var(--color-primary),0.02)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none" />

        <motion.div
          className="relative z-10 max-w-4xl mx-auto px-6 text-center"
          initial="hidden" animate="show" variants={fadeUp}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs text-primary font-medium tracking-wider uppercase mb-6">
            <Sparkles className="size-3.5" /> Về GU.AI
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight text-foreground leading-[1.1]">
            Chúng tôi xây dựng <br />
            <span className="font-normal italic text-primary relative">
              tương lai của thời trang
              <span className="absolute bottom-1 left-0 w-full h-[5px] bg-primary/20 rounded-full blur-[1px]" />
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg font-light text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            GU.AI được thành lập với sứ mệnh dân chủ hóa nhiếp ảnh thời trang — giúp mọi thương hiệu, dù lớn hay nhỏ, đều có thể tạo ra hình ảnh chuyên nghiệp với chi phí hợp lý.
          </p>
        </motion.div>
      </section>

      {/* ── Stats ── */}
      <section className="py-14 border-b border-border/40 bg-secondary/10">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((s, i) => (
              <motion.div
                key={i}
                className="text-center"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <div className="font-serif text-3xl sm:text-4xl font-light text-foreground">{s.num}</div>
                <div className="text-xs font-light text-muted-foreground mt-2 tracking-wide">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Mission ── */}
      <section className="py-20 border-b border-border/40">
        <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">Sứ mệnh</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-light tracking-tight text-foreground mt-3 leading-snug">
              Trao sức mạnh studio AI <span className="italic text-primary">cho mọi thương hiệu</span>
            </h2>
            <p className="mt-5 text-sm font-light text-muted-foreground leading-relaxed">
              Trước đây, chỉ những thương hiệu lớn mới đủ tiền thuê model, studio và ekip chụp ảnh chuyên nghiệp. GU.AI thay đổi điều đó — bất kỳ shop thời trang nào cũng có thể tạo ra ảnh đẳng cấp quốc tế với vài cú click.
            </p>
            <p className="mt-4 text-sm font-light text-muted-foreground leading-relaxed">
              Chúng tôi tin rằng hình ảnh đẹp không phải đặc quyền của người có nhiều tiền — đó là quyền của mọi người sáng tạo có đam mê.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-2 gap-3"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {["/vietnamese_female.png", "/japanese_female.png", "/vietnamese_male.png", "/indian_female.png"].map((src, i) => (
              <div key={i} className={`aspect-[3/4] rounded-2xl overflow-hidden border border-border shadow-md ${i === 1 ? "mt-6" : ""} ${i === 3 ? "mt-6" : ""}`}>
                <img src={src} alt="" className="size-full object-cover" />
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Values ── */}
      <section className="py-20 border-b border-border/40 bg-secondary/10">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">Giá trị cốt lõi</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-light tracking-tight text-foreground mt-2">
              Những gì chúng tôi <span className="italic text-primary">tin tưởng</span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
            {VALUES.map((v, i) => (
              <motion.div
                key={i}
                className="rounded-2xl border border-border/60 bg-card/50 p-6 hover:border-primary/30 hover:bg-card transition-all duration-200"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07, duration: 0.4 }}
              >
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary mb-4">
                  <v.Icon className="size-4.5" />
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-2">{v.title}</h3>
                <p className="text-xs font-light text-muted-foreground leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Team ── */}
      <section className="py-20 border-b border-border/40">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">Đội ngũ sáng lập</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-light tracking-tight text-foreground mt-2">
              Con người đằng sau <span className="italic text-primary">GU.AI</span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-8">
            {TEAM.map((member, i) => (
              <motion.div
                key={i}
                className="text-center group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <div className="relative mx-auto w-28 h-36 rounded-2xl overflow-hidden border border-border shadow-md mb-4 group-hover:border-primary/40 transition-colors">
                  <img src={member.avatar} alt={member.name} className="size-full object-cover" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">{member.name}</h3>
                <p className="text-xs text-primary font-medium mt-0.5">{member.role}</p>
                <p className="text-xs font-light text-muted-foreground mt-2 leading-relaxed">{member.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 bg-gradient-to-b from-primary/5 to-transparent">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="font-serif text-3xl sm:text-4xl font-light text-foreground">
            Sẵn sàng trải nghiệm <span className="italic text-primary">GU.AI Studio</span>?
          </h2>
          <p className="mt-4 text-sm font-light text-muted-foreground">
            Tham gia miễn phí và tạo ảnh thời trang chuyên nghiệp đầu tiên của bạn ngay hôm nay.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link href="/register">
              <Button className="rounded-full bg-primary px-8 py-6 text-sm font-semibold hover:bg-primary/90 hover:scale-[1.02] transition-all">
                Dùng thử miễn phí <ArrowRight className="size-4 ml-1" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button variant="outline" className="rounded-full px-8 py-6 text-sm border-border hover:bg-secondary transition-all text-muted-foreground">
                Xem bảng giá
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="mt-auto border-t border-border/40 bg-background py-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <Logo />
          <p className="text-xs font-light text-muted-foreground">© 2026 GU.AI. Bảo lưu mọi quyền.</p>
          <div className="flex gap-6 text-xs font-light text-muted-foreground">
            <Link href="/privacy" className="hover:text-primary transition-colors">Chính sách bảo mật</Link>
            <Link href="/terms"   className="hover:text-primary transition-colors">Điều khoản dịch vụ</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
