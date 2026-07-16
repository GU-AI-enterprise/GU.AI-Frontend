import Link from "next/link";
import type { Metadata } from "next";
import Header from "@/components/shared/header";

export const metadata: Metadata = {
  title: "Chính sách bảo mật | GU.AI",
  description: "Chính sách bảo mật và xử lý dữ liệu cá nhân của GU.AI.",
};

const LAST_UPDATED = "16/07/2026";

// Trang tĩnh thuần nội dung — cấu trúc section đánh số để dễ trích dẫn khi hỗ trợ khách hàng.
const sections: { title: string; body: React.ReactNode }[] = [
  {
    title: "1. Phạm vi chính sách",
    body: (
      <>
        <p>
          Chính sách bảo mật này mô tả cách GU.AI thu thập, sử dụng, lưu trữ và bảo vệ dữ liệu cá nhân của
          bạn khi sử dụng website, AI Studio và các dịch vụ liên quan (gọi chung là &ldquo;Dịch vụ&rdquo;).
          Chính sách này là một phần không tách rời của{" "}
          <Link href="/terms" className="text-primary underline">Điều khoản sử dụng</Link>.
        </p>
      </>
    ),
  },
  {
    title: "2. Dữ liệu chúng tôi thu thập",
    body: (
      <>
        <ul>
          <li>
            <strong>Thông tin tài khoản:</strong> email, tên hiển thị, ảnh đại diện. Nếu bạn đăng nhập
            bằng Google, chúng tôi nhận email, tên và avatar từ tài khoản Google của bạn.
          </li>
          <li>
            <strong>Nội dung bạn tải lên:</strong> ảnh sản phẩm, ảnh người mẫu, ảnh khuôn mặt, ảnh tham
            chiếu và các tệp bạn chủ động đưa vào Dịch vụ để tạo/chỉnh sửa.
          </li>
          <li>
            <strong>Nội dung được tạo ra:</strong> ảnh/video kết quả, lịch sử tác vụ AI (loại công cụ,
            tham số, thời gian, credits sử dụng).
          </li>
          <li>
            <strong>Dữ liệu giao dịch:</strong> lịch sử mua gói/nạp credits, mã giao dịch, số tiền, trạng
            thái thanh toán. <strong>Chúng tôi không lưu số thẻ hoặc thông tin tài khoản ngân hàng</strong> —
            việc thanh toán được xử lý trực tiếp bởi cổng thanh toán PayOS.
          </li>
          <li>
            <strong>Tin nhắn hỗ trợ:</strong> nội dung chat (văn bản, hình ảnh) giữa bạn và đội ngũ hỗ trợ.
          </li>
          <li>
            <strong>Dữ liệu kỹ thuật:</strong> thông tin phiên đăng nhập (token), nhật ký hệ thống phục vụ
            vận hành, chống gian lận và giới hạn tần suất truy cập.
          </li>
        </ul>
      </>
    ),
  },
  {
    title: "3. Mục đích sử dụng dữ liệu",
    body: (
      <>
        <ul>
          <li>Cung cấp các tính năng của Dịch vụ: xử lý ảnh/video bằng AI, quản lý thư viện ảnh, album, lịch sử;</li>
          <li>Quản lý tài khoản, credits, gói dịch vụ và thanh toán;</li>
          <li>Gửi thông báo trong ứng dụng (trạng thái tác vụ AI, giao dịch) và email giao dịch (xác nhận thanh toán, thông báo quan trọng);</li>
          <li>Hỗ trợ khách hàng qua kênh chat;</li>
          <li>Bảo đảm an toàn hệ thống: phát hiện gian lận, lạm dụng, vi phạm điều khoản;</li>
          <li>Thống kê nội bộ (tổng hợp, không định danh) để cải thiện Dịch vụ.</li>
        </ul>
        <p>
          <strong>Chúng tôi không bán dữ liệu cá nhân của bạn</strong> và không sử dụng ảnh của bạn cho
          mục đích quảng cáo mà không có sự đồng ý riêng.
        </p>
      </>
    ),
  },
  {
    title: "4. Chia sẻ dữ liệu với bên thứ ba",
    body: (
      <>
        <p>Dữ liệu chỉ được chia sẻ trong phạm vi cần thiết để vận hành Dịch vụ:</p>
        <ul>
          <li>
            <strong>Nhà cung cấp mô hình AI</strong> (engine xử lý ảnh/video, mô hình ngôn ngữ): ảnh và
            tham số bạn gửi được truyền tới các dịch vụ này để thực hiện tác vụ bạn yêu cầu, theo điều
            khoản bảo mật của từng nhà cung cấp;
          </li>
          <li>
            <strong>Hạ tầng lưu trữ và xác thực</strong> (cơ sở dữ liệu, lưu trữ tệp, đăng nhập): dữ liệu
            tài khoản và ảnh được lưu trên hạ tầng đám mây bảo mật;
          </li>
          <li>
            <strong>Cổng thanh toán</strong> (PayOS): thông tin cần thiết để tạo và xác nhận giao dịch;
          </li>
          <li>
            <strong>Dịch vụ gửi email:</strong> địa chỉ email và nội dung email giao dịch;
          </li>
          <li>
            <strong>Cơ quan nhà nước có thẩm quyền:</strong> khi có yêu cầu hợp lệ theo quy định pháp luật.
          </li>
        </ul>
      </>
    ),
  },
  {
    title: "5. Lưu trữ & thời hạn dữ liệu",
    body: (
      <>
        <ul>
          <li>Ảnh tải lên và ảnh kết quả được lưu trong không gian riêng của tài khoản bạn, chỉ bạn (và đội ngũ vận hành khi cần hỗ trợ kỹ thuật) truy cập được;</li>
          <li>
            Ảnh bạn xóa sẽ chuyển vào <strong>Thùng rác và bị xóa vĩnh viễn sau 30 ngày</strong>; bạn có
            thể khôi phục trong thời gian này hoặc chủ động xóa vĩnh viễn ngay;
          </li>
          <li>Lịch sử tác vụ AI và giao dịch được lưu trong suốt thời gian tài khoản còn hoạt động để phục vụ đối soát;</li>
          <li>Khi bạn xóa tài khoản, dữ liệu cá nhân và nội dung của bạn sẽ bị xóa khỏi hệ thống, trừ dữ liệu giao dịch phải lưu theo nghĩa vụ kế toán/pháp lý.</li>
        </ul>
      </>
    ),
  },
  {
    title: "6. Quyền của bạn",
    body: (
      <>
        <ul>
          <li><strong>Truy cập & chỉnh sửa:</strong> xem và cập nhật tên, ảnh đại diện, mật khẩu trong trang Hồ sơ;</li>
          <li><strong>Xóa nội dung:</strong> xóa từng ảnh, dọn thùng rác, xóa album bất kỳ lúc nào;</li>
          <li>
            <strong>Xóa tài khoản:</strong> tự thực hiện trong phần cài đặt Hồ sơ — thao tác này xóa tài
            khoản khỏi cả hệ thống xác thực và cơ sở dữ liệu;
          </li>
          <li><strong>Khiếu nại:</strong> liên hệ kênh hỗ trợ nếu bạn cho rằng dữ liệu của mình bị xử lý sai mục đích.</li>
        </ul>
        <p>
          Nếu bạn phát hiện hình ảnh của mình bị người dùng khác sử dụng trái phép trên Dịch vụ, hãy liên
          hệ chúng tôi qua kênh hỗ trợ kèm bằng chứng — chúng tôi sẽ xem xét gỡ bỏ nội dung vi phạm theo
          mục 6 của <Link href="/terms" className="text-primary underline">Điều khoản sử dụng</Link>.
        </p>
      </>
    ),
  },
  {
    title: "7. Bảo mật",
    body: (
      <>
        <ul>
          <li>Kết nối giữa trình duyệt và máy chủ được mã hóa (HTTPS);</li>
          <li>Xác thực bằng token có thời hạn; phiên đăng nhập được làm mới an toàn;</li>
          <li>Phân quyền nội bộ theo vai trò — nhân viên hỗ trợ chỉ truy cập dữ liệu trong phạm vi cần thiết để xử lý yêu cầu của bạn;</li>
          <li>Webhook thanh toán được xác minh chữ ký để chống giả mạo giao dịch.</li>
        </ul>
        <p>
          Không có hệ thống nào an toàn tuyệt đối. Nếu xảy ra sự cố rò rỉ dữ liệu ảnh hưởng đến bạn, chúng
          tôi sẽ thông báo theo quy định pháp luật hiện hành.
        </p>
      </>
    ),
  },
  {
    title: "8. Cookie & lưu trữ cục bộ",
    body: (
      <>
        <p>
          Dịch vụ sử dụng cookie và bộ nhớ cục bộ của trình duyệt cho các mục đích thiết yếu: duy trì
          phiên đăng nhập, ghi nhớ tùy chọn giao diện (giao diện sáng/tối, kích thước panel). Chúng tôi
          không dùng cookie quảng cáo của bên thứ ba.
        </p>
      </>
    ),
  },
  {
    title: "9. Trẻ vị thành niên",
    body: (
      <>
        <p>
          Dịch vụ dành cho người từ 18 tuổi trở lên. Chúng tôi không chủ đích thu thập dữ liệu của trẻ vị
          thành niên; nếu phát hiện tài khoản do trẻ vị thành niên tạo mà không có sự giám sát hợp pháp,
          chúng tôi có quyền khóa tài khoản và xóa dữ liệu liên quan.
        </p>
      </>
    ),
  },
  {
    title: "10. Thay đổi chính sách & liên hệ",
    body: (
      <>
        <p>
          Chính sách này có thể được cập nhật theo thời gian; thay đổi quan trọng sẽ được thông báo trên
          website hoặc qua thông báo trong ứng dụng. Ngày cập nhật mới nhất luôn hiển thị ở đầu trang.
        </p>
        <p>
          Mọi câu hỏi về quyền riêng tư, vui lòng liên hệ qua kênh chat hỗ trợ trong ứng dụng hoặc email
          hỗ trợ của GU.AI.
        </p>
      </>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <div className="flex-1 flex flex-col min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden pt-16 pb-10 text-center">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 size-96 rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
        <div className="mx-auto max-w-3xl px-6 relative z-10">
          <h1 className="font-serif text-4xl font-light tracking-tight text-foreground sm:text-5xl">
            Chính sách <span className="font-normal italic text-primary">bảo mật</span>
          </h1>
          <p className="mt-4 text-sm font-light text-muted-foreground">
            Cập nhật lần cuối: {LAST_UPDATED}
          </p>
        </div>
      </section>

      {/* Nội dung */}
      <section className="pb-24">
        <div className="mx-auto max-w-3xl px-6 lg:px-8 space-y-6">
          {sections.map((s) => (
            <div key={s.title} className="rounded-2xl border border-border bg-card/45 p-6 shadow-sm">
              <h2 className="text-base font-semibold text-foreground mb-3">{s.title}</h2>
              <div className="space-y-3 text-sm font-light text-muted-foreground leading-relaxed [&_ul]:list-disc [&_ul]:ml-5 [&_ul]:space-y-1.5 [&_strong]:font-semibold [&_strong]:text-foreground">
                {s.body}
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="mt-auto border-t border-border/40 bg-background py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between text-xs font-light text-muted-foreground gap-4">
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
