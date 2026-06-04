import type { ToolGuideData } from "@/components/shared/tool-guide-modal";

export const TOOL_GUIDES: Record<string, ToolGuideData> = {
  try_on: {
    title: "Virtual Try-On v1.6",
    description: "Thử trang phục lên ảnh người mẫu thực. Nhanh, ổn định, tối ưu cho e-commerce. Hỗ trợ áo, quần, đồ liền thân.",
    inputs: [
      { label: "Ảnh người mẫu", required: true, tip: "Người đứng thẳng, nhìn về phía trước, hiển thị rõ phần thân cần thay đồ. Ảnh chân dung hoặc toàn thân đều được." },
      { label: "Ảnh trang phục", required: true, tip: "Ảnh sản phẩm rõ nét, nền đơn giản, phẳng hoặc trên mannequin. Không nên có người đang mặc." },
    ],
    tips: [
      "Dùng ảnh độ phân giải tối thiểu 512×512px",
      "Tránh ảnh người mẫu bị che khuất hoặc cử chỉ phức tạp",
      "Trang phục nên chụp phẳng hoặc trên hanger/mannequin",
      "Chọn đúng category (tops/bottoms) để tăng độ chính xác",
    ],
    credit: "1 credit/ảnh",
    time: "5–17 giây",
  },

  try_on_max: {
    title: "Try-On Max",
    description: "Try-on chất lượng cao, studio-grade, hỗ trợ độ phân giải đến 4K. Phù hợp cho catalog, portfolio, và ảnh marketing.",
    inputs: [
      { label: "Ảnh người mẫu", required: true, tip: "Người đứng thẳng, ánh sáng tốt, rõ chi tiết quần áo đang mặc." },
      { label: "Ảnh trang phục / sản phẩm", required: true, tip: "Ảnh sản phẩm rõ nét, không có người mặc. Chất lượng cao hơn cho kết quả tốt hơn." },
    ],
    tips: [
      "Dùng resolution 2k hoặc 4k cho ảnh catalog chuyên nghiệp",
      "Mode 'quality' cho kết quả thực tế nhất nhưng chậm hơn",
      "Trang phục rõ chi tiết (đường may, texture) sẽ cho kết quả đẹp hơn",
    ],
    credit: "2–5 credits/ảnh (tuỳ resolution và mode)",
    time: "20–60 giây",
  },

  product_to_model: {
    title: "Product to Model",
    description: "Biến ảnh sản phẩm thành người mẫu đang mặc sản phẩm đó. Không cần ảnh người mẫu. Hỗ trợ trang phục, giày, túi xách, phụ kiện.",
    inputs: [
      { label: "Ảnh sản phẩm", required: true, tip: "Ảnh rõ nét của sản phẩm muốn đặt lên người. Nền trắng hoặc đơn màu cho kết quả tốt nhất." },
      { label: "Ảnh gợi ý pose/bối cảnh", required: false, tip: "Ảnh tham chiếu để hướng dẫn pose, môi trường, ánh sáng của người mẫu sinh ra." },
      { label: "Ảnh mặt tham chiếu", required: false, tip: "Ảnh mặt/headshot để AI sinh người mẫu trông giống người đó. Thêm +3 credits/ảnh." },
      { label: "Ảnh nền tham chiếu", required: false, tip: "Ảnh nền hoặc bối cảnh mong muốn. Nếu có người trong ảnh, người đó sẽ bị bỏ qua." },
    ],
    tips: [
      "Prompt ví dụ: \"professional office setting\", \"outdoor lifestyle\"",
      "Prompt ví dụ: \"man with tattoos, casual pose\"",
      "Dùng aspect_ratio 3:4 hoặc 4:5 cho ảnh mạng xã hội",
      "Kết hợp image_prompt + background_reference để kiểm soát bối cảnh",
      "face_reference_mode=match_reference giữ khuôn mặt giống nhất",
    ],
    credit: "1–5 credits/ảnh (+3 nếu dùng Face Reference)",
    time: "20–120 giây",
  },

  model_swap: {
    title: "Model Swap",
    description: "Đổi danh tính người mẫu trong ảnh thời trang nhưng giữ nguyên quần áo, pose, styling và bối cảnh.",
    inputs: [
      { label: "Ảnh thời trang gốc", required: true, tip: "Ảnh người mẫu mặc trang phục, đứng trong bối cảnh bất kỳ. AI sẽ thay người mẫu mới vào." },
    ],
    tips: [
      "Prompt mô tả người mẫu mới: \"Asian woman, 25 years old, short hair\"",
      "Càng mô tả chi tiết, kết quả càng chính xác",
      "Quần áo và bố cục sẽ được giữ nguyên hoàn toàn",
    ],
    credit: "1–5 credits/ảnh (tuỳ resolution và mode)",
    time: "20–60 giây",
  },

  face_swap: {
    title: "Face to Model",
    description: "Biến ảnh mặt/headshot thành avatar upper-body sẵn sàng dùng cho try-on. Giữ nguyên facial identity.",
    inputs: [
      { label: "Ảnh mặt / headshot", required: true, tip: "Selfie hoặc ảnh chân dung rõ mặt, ánh sáng tốt. Có thể dùng ảnh ID hoặc avatar." },
    ],
    tips: [
      "Prompt: \"athletic build\", \"professional look\", \"casual pose\"",
      "Output là ảnh upper-body phù hợp để dùng với Try-On",
      "Aspect ratio 2:3 hoặc 3:4 cho ảnh thời trang",
    ],
    credit: "1–5 credits/ảnh (tuỳ resolution và mode)",
    time: "20–60 giây",
  },

  edit: {
    title: "Edit Image",
    description: "Chỉnh sửa ảnh theo mô tả ngôn ngữ tự nhiên. Giữ nguyên identity và product fidelity.",
    inputs: [
      { label: "Ảnh gốc cần chỉnh sửa", required: true, tip: "Ảnh output từ các tool khác hoặc ảnh thời trang bất kỳ." },
    ],
    tips: [
      "\"turn model slightly to the left\"",
      "\"add a black leather crossbody bag\"",
      "\"change background to white studio\"",
      "\"adjust lighting to be more dramatic\"",
      "Mô tả càng cụ thể, kết quả càng chính xác",
    ],
    credit: "1–5 credits/ảnh (tuỳ resolution và mode)",
    time: "20–60 giây",
  },

  create_model: {
    title: "Create Model",
    description: "Tạo ảnh người mẫu thời trang từ mô tả văn bản. Không cần ảnh đầu vào.",
    inputs: [
      { label: "Prompt mô tả", required: true, tip: "Mô tả đầy đủ người mẫu và bối cảnh bằng tiếng Anh." },
    ],
    tips: [
      "\"Full body shot, woman wearing a white linen shirt and khaki trousers, outdoor café setting\"",
      "\"Asian male model, mid-20s, wearing streetwear, urban background\"",
      "Mô tả rõ: dân tộc, giới tính, trang phục, bối cảnh, ánh sáng",
      "Thêm style reference ảnh để kiểm soát pose/composition",
    ],
    credit: "1–5 credits/ảnh (tuỳ resolution và mode)",
    time: "20–60 giây",
  },

  image_to_video: {
    title: "Image to Video",
    description: "Biến ảnh tĩnh thành video ngắn 5–10 giây với chuyển động tự nhiên phù hợp thời trang.",
    inputs: [
      { label: "Ảnh nguồn", required: true, tip: "Ảnh thời trang rõ nét. Kết quả tốt nhất với ảnh người mẫu chụp phong cách lifestyle." },
    ],
    tips: [
      "Để trống prompt để AI tự chọn chuyển động phù hợp",
      "Prompt: \"slight breeze moving fabric, natural walk\"",
      "720p đủ cho mạng xã hội, 1080p cho quảng cáo chuyên nghiệp",
      "5 giây phù hợp cho story, 10 giây cho feed/quảng cáo",
    ],
    credit: "6–12 credits/video (tuỳ duration và resolution)",
    time: "30–120 giây",
  },

  upscale: {
    title: "Image Upscale",
    description: "Tăng độ phân giải ảnh bằng AI, giữ nguyên chi tiết và texture.",
    inputs: [
      { label: "Ảnh cần upscale", required: true, tip: "Ảnh output từ các tool khác hoặc ảnh sản phẩm cần tăng chất lượng." },
    ],
    tips: [
      "Hiệu quả nhất với ảnh 512px trở lên",
      "Phù hợp để tăng ảnh 1k lên 4k sau khi generate",
    ],
    credit: "8 credits/ảnh",
    time: "10–30 giây",
  },
};
