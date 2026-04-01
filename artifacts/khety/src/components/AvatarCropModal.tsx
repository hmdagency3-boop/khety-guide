import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, ZoomIn, ZoomOut } from "lucide-react";

interface Props {
  imageSrc: string;
  onCancel: () => void;
  onCrop: (blob: Blob) => void;
}

async function getCroppedBlob(imageSrc: string, pixelCrop: Area): Promise<Blob> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = imageSrc;
  });

  const canvas = document.createElement("canvas");
  const size = Math.min(pixelCrop.width, pixelCrop.height, 512);
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    size,
    size,
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error("فشل إنشاء الصورة")), "image/jpeg", 0.9);
  });
}

export default function AvatarCropModal({ imageSrc, onCancel, onCrop }: Props) {
  const [crop, setCrop]     = useState({ x: 0, y: 0 });
  const [zoom, setZoom]     = useState(1);
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);
  const [loading, setLoading] = useState(false);

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedArea(pixels);
  }, []);

  async function handleConfirm() {
    if (!croppedArea) return;
    setLoading(true);
    try {
      const blob = await getCroppedBlob(imageSrc, croppedArea);
      onCrop(blob);
    } catch {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 shrink-0">
          <button onClick={onCancel} className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
            <X className="w-4 h-4 text-white" />
          </button>
          <p className="text-sm font-bold text-white">اقتصاص الصورة</p>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="w-9 h-9 rounded-full bg-violet-600 flex items-center justify-center hover:bg-violet-500 transition-colors disabled:opacity-50"
          >
            {loading
              ? <div className="w-4 h-4 border-2 border-white/60 border-t-transparent rounded-full animate-spin" />
              : <Check className="w-4 h-4 text-white" />}
          </button>
        </div>

        {/* Crop area */}
        <div className="relative flex-1">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            style={{
              containerStyle: { background: "transparent" },
              cropAreaStyle: { borderColor: "#8b5cf6", boxShadow: "0 0 0 9999px rgba(0,0,0,0.6)" },
            }}
          />
        </div>

        {/* Zoom slider */}
        <div className="flex items-center gap-3 px-8 py-5 shrink-0">
          <button onClick={() => setZoom(z => Math.max(1, z - 0.2))} className="text-white/60 hover:text-white transition-colors">
            <ZoomOut className="w-5 h-5" />
          </button>
          <input
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            onChange={e => setZoom(Number(e.target.value))}
            className="flex-1 accent-violet-500 h-1 rounded-full"
          />
          <button onClick={() => setZoom(z => Math.min(3, z + 0.2))} className="text-white/60 hover:text-white transition-colors">
            <ZoomIn className="w-5 h-5" />
          </button>
        </div>

        <p className="text-center text-[11px] text-white/40 pb-5 shrink-0">اسحب لضبط الموضع • اسحب الشريط للتكبير</p>
      </motion.div>
    </AnimatePresence>
  );
}
