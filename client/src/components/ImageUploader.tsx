import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, ImageIcon, ScanLine } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface ImageUploaderProps {
  onImageSelected: (base64: string) => void;
  isLoading?: boolean;
}

export function ImageUploader({ onImageSelected, isLoading }: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = reader.result as string;
          setPreview(base64);
          onImageSelected(base64);
        };
        reader.readAsDataURL(file);
      }
    },
    [onImageSelected]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxFiles: 1,
    disabled: isLoading,
  });

  const clearImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    onImageSelected("");
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <AnimatePresence mode="wait">
        {!preview ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            key="upload-zone"
            {...getRootProps()}
            className={cn(
              "relative cursor-pointer group rounded-3xl border-2 border-dashed transition-all duration-300 ease-out h-80 flex flex-col items-center justify-center p-8 text-center bg-white/50 hover:bg-white/80 backdrop-blur-sm",
              isDragActive
                ? "border-primary bg-primary/5 scale-[1.02]"
                : "border-border hover:border-primary/50",
              isLoading && "opacity-50 cursor-not-allowed pointer-events-none"
            )}
          >
            <input {...getInputProps()} />
            <div className="w-20 h-20 rounded-full bg-secondary/50 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary/10 transition-all duration-300">
              <Upload className="w-10 h-10 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-foreground/80">
              Upload Food Photo
            </h3>
            <p className="text-sm text-muted-foreground max-w-[200px]">
              Drag & drop or click to select an image to identify
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -10 }}
            key="preview-zone"
            className="relative rounded-3xl overflow-hidden shadow-2xl shadow-primary/10 group aspect-square bg-black/5"
          >
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {!isLoading && (
              <button
                onClick={clearImage}
                className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-md transition-all duration-200 hover:scale-110 shadow-lg"
              >
                <X className="w-5 h-5" />
              </button>
            )}

            {isLoading && (
              <div className="absolute inset-0 bg-white/20 backdrop-blur-md flex flex-col items-center justify-center text-white">
                <div className="relative">
                  <div className="w-20 h-20 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                  <ScanLine className="absolute inset-0 m-auto w-8 h-8 text-white animate-pulse" />
                </div>
                <p className="mt-6 text-lg font-medium text-white drop-shadow-md">
                  Analyzing...
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
