import React, { useState, useEffect, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { Loader2, Download, X, Type, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';

interface EcommerceExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
}

const getCroppedImg = async (imageSrc: string, pixelCrop: any, width: number, height: number): Promise<Blob> => {
  const image = new Image();
  image.crossOrigin = "anonymous";
  image.src = imageSrc;
  await new Promise(resolve => { image.onload = resolve; });

  // Nếu user chưa từng mở tab này (Cropper chưa mount nên onCropComplete chưa fire),
  // pixelCrop vẫn null — tự tính 1 crop căn giữa full ảnh theo đúng aspect, giống mặc định của Cropper.
  if (!pixelCrop) {
    const targetAspect = width / height;
    const imgW = image.naturalWidth;
    const imgH = image.naturalHeight;
    const cropW = imgW / imgH > targetAspect ? imgH * targetAspect : imgW;
    const cropH = imgW / imgH > targetAspect ? imgH : imgW / targetAspect;
    pixelCrop = { x: (imgW - cropW) / 2, y: (imgH - cropH) / 2, width: cropW, height: cropH };
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) throw new Error('No 2d context');

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    width,
    height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(file => {
      if (file) resolve(file);
      else reject(new Error('Canvas is empty'));
    }, 'image/jpeg', 0.95);
  });
};

export const EcommerceExportModal: React.FC<EcommerceExportModalProps> = ({ isOpen, onClose, imageUrl }) => {
  const [loading, setLoading] = useState(true);
  const [seoData, setSeoData] = useState({ title: '', description: '', hashtags: '' });
  const [activeTab, setActiveTab] = useState<'1:1' | '9:16' | '4:5'>('1:1');
  
  const [crops, setCrops] = useState({
    '1:1': { crop: { x: 0, y: 0 }, zoom: 1, croppedAreaPixels: null },
    '9:16': { crop: { x: 0, y: 0 }, zoom: 1, croppedAreaPixels: null },
    '4:5': { crop: { x: 0, y: 0 }, zoom: 1, croppedAreaPixels: null }
  });

  const onCropChange = (crop: any) => {
    setCrops(prev => ({ ...prev, [activeTab]: { ...prev[activeTab], crop } }));
  };
  const onZoomChange = (zoom: any) => {
    setCrops(prev => ({ ...prev, [activeTab]: { ...prev[activeTab], zoom } }));
  };
  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCrops(prev => ({ ...prev, [activeTab]: { ...prev[activeTab], croppedAreaPixels } }));
  }, [activeTab]);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/ecommerce/generate-seo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageUrl })
    })
      .then(r => r.json())
      .then(res => {
        if (res.success && res.data) {
          setSeoData({
            title: res.data.title || '',
            description: res.data.description || '',
            hashtags: res.data.hashtags || ''
          });
        }
      })
      .catch(err => toast.error("Không thể tự động viết SEO: " + err.message))
      .finally(() => setLoading(false));
  }, [isOpen, imageUrl]);

  const handleExport = async () => {
    const t = toast.loading("Đang nén file ZIP...");
    try {
      const zip = new JSZip();
      
      const blobs = await Promise.all([
        getCroppedImg(imageUrl, crops['1:1'].croppedAreaPixels, 1080, 1080),
        getCroppedImg(imageUrl, crops['9:16'].croppedAreaPixels, 1080, 1920),
        getCroppedImg(imageUrl, crops['4:5'].croppedAreaPixels, 1080, 1350)
      ]);

      zip.file('shopee_lazada_1x1.jpg', blobs[0]);
      zip.file('tiktok_reels_9x16.jpg', blobs[1]);
      zip.file('instagram_fb_4x5.jpg', blobs[2]);
      
      const text = `[TIÊU ĐỀ]\n${seoData.title}\n\n[MÔ TẢ]\n${seoData.description}\n\n[HASHTAGS]\n${seoData.hashtags}`;
      zip.file('seo_content.txt', new Blob([text], { type: 'text/plain;charset=utf-8' }));

      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `ecommerce_ready_${Date.now()}.zip`);
      toast.success("Xuất file hoàn tất!", { id: t });
      onClose();
    } catch (err: any) {
      toast.error("Lỗi xuất file: " + err.message, { id: t });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-background rounded-3xl w-full max-w-5xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <ShoppingCart className="size-5 text-emerald-500" />
            Trình xuất sàn Thương mại điện tử
          </h2>
          <button onClick={onClose} className="p-2 bg-secondary rounded-full hover:bg-secondary/70">
            <X className="size-4" />
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center p-20 h-[500px]">
            <Loader2 className="size-10 animate-spin text-emerald-500 mb-4" />
            <p className="text-muted-foreground animate-pulse font-medium">AI đang phân tích ảnh và viết mô tả sản phẩm...</p>
          </div>
        ) : (
          <div className="flex flex-1 overflow-hidden flex-col md:flex-row h-[600px]">
            
            {/* Left: Cropper */}
            <div className="w-full md:w-1/2 p-5 flex flex-col border-r border-border bg-muted/10 h-full">
              <div className="flex items-center gap-2 mb-4 bg-secondary p-1 rounded-xl w-fit">
                {(['1:1', '9:16', '4:5'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${activeTab === tab ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    {tab === '1:1' ? 'Shopee (1:1)' : tab === '9:16' ? 'TikTok (9:16)' : 'Insta (4:5)'}
                  </button>
                ))}
              </div>
              <div className="relative flex-1 bg-black/5 rounded-2xl overflow-hidden min-h-[300px]">
                <Cropper
                  image={imageUrl}
                  crop={crops[activeTab].crop}
                  zoom={crops[activeTab].zoom}
                  aspect={activeTab === '1:1' ? 1 : activeTab === '9:16' ? 9/16 : 4/5}
                  onCropChange={onCropChange}
                  onCropComplete={onCropComplete}
                  onZoomChange={onZoomChange}
                />
              </div>
              
              <div className="mt-5 flex flex-col gap-2">
                <div className="flex items-center gap-3 px-2">
                  <span className="text-xs font-medium text-muted-foreground w-16 text-right">Thu nhỏ</span>
                  <input
                    type="range"
                    value={crops[activeTab].zoom}
                    min={1}
                    max={3}
                    step={0.1}
                    onChange={(e) => onZoomChange(Number(e.target.value))}
                    className="flex-1 h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-emerald-500 hover:accent-emerald-400"
                  />
                  <span className="text-xs font-medium text-muted-foreground w-16">Phóng to</span>
                </div>
                <p className="text-xs text-muted-foreground text-center mt-1">Kéo thả ảnh để căn chỉnh trọng tâm sản phẩm</p>
              </div>
            </div>

            {/* Right: SEO Edit */}
            <div className="w-full md:w-1/2 p-5 overflow-y-auto">
              <h3 className="font-medium flex items-center gap-2 mb-4 text-primary">
                <Type className="size-4" /> Nội dung chuẩn SEO (AI tạo)
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">Tiêu đề sản phẩm</label>
                  <input
                    value={seoData.title}
                    onChange={e => setSeoData(p => ({ ...p, title: e.target.value }))}
                    className="w-full bg-secondary/50 border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">Mô tả sản phẩm</label>
                  <textarea
                    value={seoData.description}
                    onChange={e => setSeoData(p => ({ ...p, description: e.target.value }))}
                    rows={12}
                    className="w-full bg-secondary/50 border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">Hashtags</label>
                  <input
                    value={seoData.hashtags}
                    onChange={e => setSeoData(p => ({ ...p, hashtags: e.target.value }))}
                    className="w-full bg-secondary/50 border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 border-t border-border flex justify-end gap-3 bg-muted/10">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-medium bg-secondary hover:bg-secondary/80 transition-colors">
            Hủy
          </button>
          <button 
            onClick={handleExport} 
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50 transition-colors shadow-sm"
          >
            <Download className="size-4" />
            Tải ZIP & Hoàn tất
          </button>
        </div>

      </div>
    </div>
  );
};
