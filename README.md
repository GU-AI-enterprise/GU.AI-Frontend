🎨 GU.AI - Frontend

Modern Web Dashboard for AI Fashion Model Generation

GU.AI Frontend là web application cho phép người dùng tạo người mẫu ảo, generate ảnh sản phẩm thời trang, quản lý brand kit, và theo dõi lịch sử.

## 🎯 Our Goal

Giao diện đẹp, dễ dùng, thân thiện với nhà bán lẻ nhỏ & vừa không chuyên về công nghệ.

- Tạo ảnh sản phẩm chỉ với 3 click
- Xem trước kết quả real-time
- Quản lý nhiều thương hiệu (brand kit)
- Xuất ảnh chuẩn từng sàn thương mại điện tử
- Team collaboration (nhiều người cùng làm việc)

## 🚀 Key Features

### Core Features

- AI Model Generation: Giao diện kéo thả, upload sản phẩm, chọn người mẫu ảo, background, style.
- Batch Processing: Upload nhiều ảnh cùng lúc, xem tiến trình real-time, queue position.
- Brand Kit Manager: Lưu style, màu sắc, fonts, ánh sáng cho từng thương hiệu.
- Image History: Grid view, filter theo ngày, search, download, xem chi tiết.
- Version Comparison: So sánh 2 phiên bản ảnh cạnh nhau để chọn ảnh đẹp nhất.

### E-commerce Support

- Platform Presets: 1 click chọn chuẩn Shopee (1:1), TikTok (9:16), Facebook (4:5).
- Auto Resize: Tự động resize và crop theo platform yêu cầu.
- Caption Generator: Gợi ý mô tả sản phẩm và caption bán hàng bằng AI.
- Thumbnail Generator: Tạo ảnh bìa thu hút từ ảnh đã tạo.

### User Experience

- Dashboard: Thống kê credits còn lại, số ảnh đã tạo trong tháng, trending styles.
- Real-time Queue Status: Xem vị trí của mình trong hàng đợi batch.
- Drag & Drop Upload: Kéo thả ảnh sản phẩm vào để generate.
- Keyboard Shortcuts: Phím tắt tăng tốc workflow (Cmd+G để generate, Cmd+H để history).
- Dark/Light Mode: Giao diện tối/sáng theo sở thích.

### Team Collaboration (Future)

- Shared Projects: Nhiều người cùng làm việc trên một project.
- Role Management: Phân quyền Admin, Editor, Viewer.
- Comment & Review: Góp ý trực tiếp trên từng ảnh.

## 🛠 Tech Stack

Category | Technology
--- | ---
Framework | Next.js 15 (App Router)
Language | TypeScript
UI Library | React 19
Styling | Tailwind CSS 4
Components | shadcn/ui (Radix UI)
State Management | Zustand
Server State | TanStack Query v5
Form Handling | React Hook Form + Zod
Auth Client | NextAuth.js (Auth.js v5)
HTTP Client | Ky
Animations | Framer Motion
Charts | Recharts
Icons | Lucide React
Toast | Sonner
Upload | Uppy / react-dropzone
Deployment | Vercel

## 📂 Folder Structure

text
guai-frontend/
│
├── app/
│   ├── (auth)/                 # Authentication routes (no sidebar)
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   ├── forgot-password/
│   │   │   └── page.tsx
│   │   └── layout.tsx          # Auth layout (centered card)
│   │
│   ├── (dashboard)/            # Main app routes (with sidebar)
│   │   ├── dashboard/
│   │   │   ├── page.tsx
│   │   │   ├── loading.tsx
│   │   │   └── _components/
│   │   │       ├── StatsCards.tsx
│   │   │       ├── RecentImages.tsx
│   │   │       ├── CreditUsageChart.tsx
│   │   │       └── QuickActions.tsx
│   │   │
│   │   ├── generate/
│   │   │   ├── page.tsx
│   │   │   ├── loading.tsx
│   │   │   └── _components/
│   │   │       ├── ImageUploader.tsx      # Drag & drop upload
│   │   │       ├── ModelSelector.tsx      # Chọn người mẫu ảo
│   │   │       ├── BackgroundSelector.tsx # Chọn bối cảnh (cafe, street, studio)
│   │   │       ├── StylePresets.tsx       # Minimal, Luxury, Dynamic
│   │   │       ├── AdvancedOptions.tsx    # Góc chụp, ánh sáng
│   │   │       └── ResultViewer.tsx       # Xem và download
│   │   │
│   │   ├── batch/
│   │   │   ├── page.tsx
│   │   │   └── _components/
│   │   │       ├── BulkUploader.tsx       # Upload nhiều file
│   │   │       ├── BatchProgress.tsx      # Queue position, progress bar
│   │   │       └── BatchResults.tsx       # Results grid
│   │   │
│   │   ├── history/
│   │   │   ├── page.tsx
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx               # Image detail page
│   │   │   └── _components/
│   │   │       ├── ImageGrid.tsx          # Masonry grid
│   │   │       ├── FilterBar.tsx          # Filter by date, status
│   │   │       ├── SearchBar.tsx
│   │   │       └── ImageDetailModal.tsx   # Modal preview
│   │   │
│   │   ├── brand/
│   │   │   ├── page.tsx
│   │   │   └── _components/
│   │   │       ├── ColorPicker.tsx        # Chọn màu thương hiệu
│   │   │       ├── LogoUploader.tsx
│   │   │       ├── FontSelector.tsx
│   │   │       ├── StylePresetBuilder.tsx # Tạo preset riêng
│   │   │       └── PreviewCard.tsx        # Preview style lên ảnh mẫu
│   │   │
│   │   ├── settings/
│   │   │   ├── page.tsx                   # Settings overview
│   │   │   ├── profile/
│   │   │   │   └── page.tsx
│   │   │   ├── subscription/
│   │   │   │   └── page.tsx               # Plans & billing
│   │   │   ├── team/
│   │   │   │   └── page.tsx               # Invite members (future)
│   │   │   └── api-keys/
│   │   │       └── page.tsx               # For enterprise users
│   │   │
│   │   └── layout.tsx                     # Dashboard layout (sidebar + header)
│   │
│   ├── landing/                # Marketing pages
│   │   ├── page.tsx            # Landing page
│   │   ├── pricing/
│   │   │   └── page.tsx
│   │   └── features/
│   │       └── page.tsx
│   │
│   ├── api/                    # Next.js API routes (proxy to backend)
│   │   └── proxy/...
│   │
│   ├── layout.tsx              # Root layout
│   └── globals.css             # Tailwind imports
│
├── components/
│   ├── ui/                     # shadcn/ui components (button, card, dialog...)
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   └── shared/
│       ├── LoadingSpinner.tsx
│       ├── ErrorBoundary.tsx
│       └── Toast.tsx
│
├── hooks/
│   ├── useAuth.ts              # Auth state
│   ├── useImageGeneration.ts   # Generate mutation
│   ├── useCredits.ts           # Credit balance
│   └── useDebounce.ts
│
├── lib/
│   ├── api-client.ts           # Axios/Ky instance
│   ├── utils.ts
│   └── constants.ts
│
├── stores/
│   ├── authStore.ts            # Zustand - auth state
│   ├── brandStore.ts           # Zustand - brand kit state
│   └── uiStore.ts              # Zustand - sidebar, theme
│
├── types/
│   ├── user.ts
│   ├── image.ts
│   ├── brand.ts
│   └── api.ts
│
├── public/
│   ├── images/
│   └── fonts/
│
├── package.json
├── tailwind.config.ts
├── next.config.ts
├── tsconfig.json
└── README.md

## 🚀 Setup & Run

### Prerequisites

- Node.js 20+
- npm hoặc pnpm

### Development

```bash
# 1. Clone repository
git clone https://github.com/gu-ai/guai-frontend.git
cd guai-frontend

# 2. Install dependencies
npm install

# 3. Run development server
npm run dev

# 4. Open http://localhost:3000
```

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

## 📦 Deployment

Vercel (Recommended):

```bash
npm i -g vercel
vercel
```

Hoặc connect GitHub repo với Vercel, auto-deploy mỗi khi push.

## 💡 Pro Tip

Keyboard Shortcuts:

- Ctrl/Cmd + G - Mở generate page
- Ctrl/Cmd + H - Mở history
- Ctrl/Cmd + K - Mở command palette
- Ctrl/Cmd + B - Toggle sidebar

Drag & Drop: Có thể kéo thả ảnh từ bất kỳ đâu (desktop, folder, trình duyệt khác) vào vùng upload.

Happy building with GU.AI! 🇻🇳👕

