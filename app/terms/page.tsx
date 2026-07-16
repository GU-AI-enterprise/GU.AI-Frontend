import Link from "next/link";
import type { Metadata } from "next";
import Header from "@/components/shared/header";

export const metadata: Metadata = {
  title: "Điều khoản sử dụng | GU.AI",
  description: "Điều khoản sử dụng dịch vụ tạo ảnh & video thời trang bằng AI của GU.AI.",
};

const LAST_UPDATED = "16/07/2026";

// Trang tĩnh thuần nội dung — cấu trúc section đánh số để dễ trích dẫn khi hỗ trợ khách hàng.
const sections: { title: string; body: React.ReactNode }[] = [
  {
    title: "1. Chấp nhận điều khoản",
    body: (
      <>
        <p>
          Bằng việc tạo tài khoản, truy cập hoặc sử dụng GU.AI (bao gồm website, AI Studio và các dịch vụ
          liên quan — gọi chung là &ldquo;Dịch vụ&rdquo;), bạn xác nhận đã đọc, hiểu và đồng ý bị ràng buộc
          bởi toàn bộ Điều khoản sử dụng này. Nếu bạn không đồng ý với bất kỳ điều khoản nào, vui lòng
          ngừng sử dụng Dịch vụ.
        </p>
        <p>
          Bạn phải đủ 18 tuổi (hoặc đủ tuổi thành niên theo pháp luật nơi bạn cư trú) để sử dụng Dịch vụ.
        </p>
      </>
    ),
  },
  {
    title: "2. Mô tả dịch vụ",
    body: (
      <>
        <p>
          GU.AI cung cấp các công cụ tạo và chỉnh sửa ảnh/video thời trang bằng trí tuệ nhân tạo, bao gồm
          nhưng không giới hạn: thử trang phục ảo (Virtual Try-On), tạo người mẫu AI từ ảnh sản phẩm hoặc
          mô tả văn bản, thay người mẫu, tạo avatar từ ảnh chân dung, chỉnh sửa ảnh theo mô tả, đổi tỉ lệ
          khung hình, xóa nền, chuyển ảnh thành video ngắn, trợ lý AI, thư viện mẫu và công cụ xuất ảnh
          phục vụ thương mại điện tử.
        </p>
        <p>
          Dịch vụ sử dụng các nhà cung cấp hạ tầng và mô hình AI bên thứ ba (ví dụ: engine xử lý ảnh AI,
          mô hình ngôn ngữ, cổng thanh toán, hạ tầng lưu trữ). Chất lượng và tính khả dụng của kết quả có
          thể phụ thuộc một phần vào các bên thứ ba này.
        </p>
      </>
    ),
  },
  {
    title: "3. Tài khoản",
    body: (
      <>
        <p>
          Bạn chịu trách nhiệm bảo mật thông tin đăng nhập và mọi hoạt động diễn ra dưới tài khoản của
          mình. Thông báo ngay cho chúng tôi qua kênh hỗ trợ nếu phát hiện truy cập trái phép.
        </p>
        <p>
          Chúng tôi có quyền tạm khóa hoặc chấm dứt tài khoản vi phạm Điều khoản này, có hành vi gian lận,
          lạm dụng hệ thống hoặc gây hại cho người dùng khác.
        </p>
      </>
    ),
  },
  {
    title: "4. Credits, gói dịch vụ & thanh toán",
    body: (
      <>
        <ul>
          <li>
            Dịch vụ hoạt động theo cơ chế credits: mỗi lần tạo ảnh/video, hệ thống trừ credits theo công
            cụ và tùy chọn sử dụng (độ phân giải, số lượng ảnh...). Mức trừ được hiển thị trước khi chạy.
          </li>
          <li>
            Các gói dịch vụ (Free, Basic, Pro) có hiệu lực trong chu kỳ 30 ngày kể từ khi mua/gia hạn.
            Mỗi gói mở khóa quyền lợi khác nhau (số lượng người mẫu AI, Trợ lý AI Studio, mức giảm giá
            top-up) như mô tả tại trang <Link href="/pricing" className="text-primary underline">Bảng giá</Link>.
          </li>
          <li>
            <strong>Credits nhận từ gói chỉ có hiệu lực trong chu kỳ 30 ngày của gói — credits chưa dùng
            hết sẽ không được chuyển tiếp qua chu kỳ tiếp theo.</strong>
          </li>
          <li>
            Thanh toán được xử lý qua cổng thanh toán bên thứ ba (PayOS). Credits được cộng ngay sau khi
            giao dịch thành công.
          </li>
          <li>
            Credits đã sử dụng cho các lượt tạo ảnh/video (kể cả khi bạn không hài lòng với kết quả do
            đặc tính ngẫu nhiên của AI) không được hoàn lại, trừ trường hợp lỗi hệ thống được chúng tôi
            xác nhận. Với job thất bại do lỗi hệ thống, credits được hoàn tự động.
          </li>
        </ul>
      </>
    ),
  },
  {
    title: "5. Nội dung bạn tải lên",
    body: (
      <>
        <p>
          Bạn giữ toàn bộ quyền sở hữu đối với ảnh và nội dung bạn tải lên. Khi sử dụng Dịch vụ, bạn cấp
          cho GU.AI quyền lưu trữ, xử lý và truyền tải nội dung đó tới các nhà cung cấp AI bên thứ ba{" "}
          <em>chỉ trong phạm vi cần thiết</em> để thực hiện tính năng bạn yêu cầu.
        </p>
        <p>Khi tải lên bất kỳ hình ảnh nào, bạn cam kết và bảo đảm rằng:</p>
        <ul>
          <li>Bạn sở hữu hoặc có đầy đủ quyền hợp pháp để sử dụng hình ảnh đó;</li>
          <li>
            Nếu hình ảnh chứa khuôn mặt hoặc hình dáng của người khác, bạn <strong>đã có sự đồng ý rõ
            ràng</strong> của người đó (hoặc người giám hộ hợp pháp nếu là trẻ vị thành niên) cho việc sử
            dụng hình ảnh trong Dịch vụ;
          </li>
          <li>Nội dung không vi phạm quyền sở hữu trí tuệ, quyền riêng tư, quyền hình ảnh của bất kỳ bên thứ ba nào.</li>
        </ul>
      </>
    ),
  },
  {
    title: "6. Trách nhiệm về hình ảnh khuôn mặt của người khác",
    body: (
      <>
        <p>
          Một số công cụ của GU.AI (ví dụ: Face to Model, ghép mặt tham chiếu khi tạo/đổi người mẫu) cho
          phép sử dụng ảnh khuôn mặt làm dữ liệu đầu vào. Bạn <strong>chỉ được phép</strong> sử dụng ảnh
          khuôn mặt của chính mình, hoặc của người đã đồng ý rõ ràng cho việc này.
        </p>
        <p>
          <strong>
            GU.AI không chịu trách nhiệm đối với mọi thiệt hại, khiếu nại, tranh chấp hoặc hậu quả pháp lý
            phát sinh từ việc người dùng tự ý sử dụng hình ảnh khuôn mặt, chân dung hoặc hình dáng của
            người khác mà không có sự đồng ý của họ.
          </strong>{" "}
          Toàn bộ trách nhiệm pháp lý trong trường hợp này thuộc về người dùng đã tải lên và sử dụng hình
          ảnh đó. Bạn đồng ý bồi hoàn và giữ cho GU.AI vô hại trước mọi khiếu nại của bên thứ ba liên quan
          đến nội dung bạn tải lên.
        </p>
        <p>
          Chúng tôi có quyền (nhưng không có nghĩa vụ) gỡ bỏ nội dung, khóa tính năng hoặc chấm dứt tài
          khoản khi nhận được khiếu nại hợp lệ về việc sử dụng hình ảnh trái phép.
        </p>
      </>
    ),
  },
  {
    title: "7. Hành vi bị cấm",
    body: (
      <>
        <p>Bạn không được sử dụng Dịch vụ để tạo, lưu trữ hoặc phát tán:</p>
        <ul>
          <li>Nội dung khiêu dâm, khỏa thân; đặc biệt nghiêm cấm tuyệt đối mọi nội dung liên quan đến trẻ vị thành niên;</li>
          <li>
            Nội dung giả mạo người thật (deepfake) nhằm bôi nhọ, lừa đảo, quấy rối, tống tiền, thao túng
            dư luận hoặc bất kỳ mục đích gây hại nào;
          </li>
          <li>Nội dung vi phạm pháp luật Việt Nam hoặc pháp luật nơi bạn sử dụng Dịch vụ;</li>
          <li>Nội dung xâm phạm nhãn hiệu, bản quyền, bí mật kinh doanh của bên khác.</li>
        </ul>
        <p>
          Ngoài ra, bạn không được: can thiệp, dò quét, phá hoại hệ thống; sử dụng bot/script tự động để
          lạm dụng tài nguyên; bán lại hoặc chia sẻ tài khoản; tìm cách vượt qua các giới hạn kỹ thuật
          (rate limit, giới hạn gói) của Dịch vụ.
        </p>
      </>
    ),
  },
  {
    title: "8. Nội dung do AI tạo ra",
    body: (
      <>
        <p>
          Trong phạm vi pháp luật cho phép và tùy thuộc điều khoản của các nhà cung cấp mô hình AI, bạn
          được quyền sử dụng ảnh/video do bạn tạo ra trên GU.AI cho mục đích cá nhân và thương mại (ví dụ:
          đăng bán hàng, quảng cáo, catalog).
        </p>
        <ul>
          <li>
            Kết quả AI có tính ngẫu nhiên và có thể chứa sai lệch (chi tiết trang phục, tay, chữ...). Bạn
            có trách nhiệm kiểm tra kết quả trước khi sử dụng, đặc biệt khi dùng cho mục đích thương mại.
          </li>
          <li>
            Ảnh người mẫu do AI tạo ra không đại diện cho người thật; mọi sự trùng hợp với người thật là
            ngẫu nhiên. Nếu bạn dùng ảnh AI theo cách khiến người xem tin rằng đó là người thật cụ thể,
            bạn tự chịu trách nhiệm về việc đó.
          </li>
          <li>
            Bạn không được tuyên bố kết quả AI là ảnh chụp thật khi việc đó có thể gây hiểu lầm mang tính
            lừa dối cho người tiêu dùng theo quy định về quảng cáo.
          </li>
        </ul>
      </>
    ),
  },
  {
    title: "9. Quyền riêng tư & dữ liệu",
    body: (
      <>
        <p>
          Việc thu thập và xử lý dữ liệu cá nhân được mô tả trong{" "}
          <Link href="/privacy" className="text-primary underline">Chính sách bảo mật</Link>. Tóm tắt:
          ảnh bạn tải lên và ảnh kết quả được lưu trong không gian riêng của tài khoản; ảnh trong thùng
          rác bị xóa vĩnh viễn sau 30 ngày; bạn có thể xóa ảnh hoặc toàn bộ tài khoản bất kỳ lúc nào trong
          phần cài đặt hồ sơ.
        </p>
      </>
    ),
  },
  {
    title: "10. Giới hạn trách nhiệm",
    body: (
      <>
        <p>
          Dịch vụ được cung cấp trên cơ sở &ldquo;nguyên trạng&rdquo; (as-is). Trong phạm vi tối đa pháp
          luật cho phép, GU.AI không bảo đảm Dịch vụ không bị gián đoạn, không có lỗi, hoặc kết quả AI đáp
          ứng mọi kỳ vọng của bạn.
        </p>
        <p>
          GU.AI không chịu trách nhiệm cho các thiệt hại gián tiếp, ngẫu nhiên hoặc hệ quả (mất doanh thu,
          mất dữ liệu, tổn hại uy tín...) phát sinh từ việc sử dụng Dịch vụ. Tổng trách nhiệm của GU.AI
          đối với bạn trong mọi trường hợp không vượt quá tổng số tiền bạn đã thanh toán cho Dịch vụ trong
          03 tháng gần nhất trước khi phát sinh khiếu nại.
        </p>
      </>
    ),
  },
  {
    title: "11. Thay đổi dịch vụ & điều khoản",
    body: (
      <>
        <p>
          Chúng tôi có thể cập nhật tính năng, bảng giá, quyền lợi gói và Điều khoản này theo thời gian.
          Thay đổi quan trọng sẽ được thông báo trên website hoặc qua thông báo trong ứng dụng. Việc bạn
          tiếp tục sử dụng Dịch vụ sau khi thay đổi có hiệu lực đồng nghĩa với việc chấp nhận điều khoản mới.
        </p>
      </>
    ),
  },
  {
    title: "12. Luật áp dụng & liên hệ",
    body: (
      <>
        <p>
          Điều khoản này được điều chỉnh bởi pháp luật Việt Nam. Mọi tranh chấp trước hết được giải quyết
          thông qua thương lượng; nếu không thành, tranh chấp sẽ được đưa ra tòa án có thẩm quyền tại Việt Nam.
        </p>
        <p>
          Mọi câu hỏi về Điều khoản sử dụng, vui lòng liên hệ qua kênh chat hỗ trợ trong ứng dụng hoặc
          email hỗ trợ của GU.AI.
        </p>
      </>
    ),
  },
];

export default function TermsPage() {
  return (
    <div className="flex-1 flex flex-col min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden pt-16 pb-10 text-center">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 size-96 rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
        <div className="mx-auto max-w-3xl px-6 relative z-10">
          <h1 className="font-serif text-4xl font-light tracking-tight text-foreground sm:text-5xl">
            Điều khoản <span className="font-normal italic text-primary">sử dụng</span>
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
