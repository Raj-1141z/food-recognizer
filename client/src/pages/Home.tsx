import { useState } from "react";
import { ImageUploader } from "@/components/ImageUploader";
import { ScanResultCard } from "@/components/ScanResultCard";
import { RecentScans } from "@/components/RecentScans";
import { useScanFood, type ScanResult } from "@/hooks/use-scan";
import { motion } from "framer-motion";
import { Sparkles, ScanLine } from "lucide-react";

export default function Home() {
  const [result, setResult] = useState<ScanResult | null>(null);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  
  const scanMutation = useScanFood();

  const handleImageSelected = async (base64: string) => {
    setCurrentImage(base64);
    // Clear previous result if new image uploaded
    if (result) setResult(null);
  };

  const handleIdentify = () => {
    if (!currentImage) return;
    scanMutation.mutate(currentImage, {
      onSuccess: (data) => {
        setResult(data);
      },
    });
  };

  const handleReset = () => {
    setResult(null);
    setCurrentImage(null);
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* Header */}
      <header className="pt-12 pb-8 px-4 text-center">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-wide uppercase mb-6"
        >
          <Sparkles className="w-3 h-3" />
          AI Powered Vision
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="text-5xl md:text-6xl font-black tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70"
        >
          Food Lens
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-lg text-muted-foreground max-w-lg mx-auto"
        >
          Upload a photo of any dish and our AI will instantly identify it for you.
        </motion.p>
      </header>

      {/* Main Interaction Area */}
      <main className="px-4 max-w-4xl mx-auto">
        {!result ? (
          <div className="flex flex-col items-center gap-8">
            <ImageUploader 
              onImageSelected={handleImageSelected} 
              isLoading={scanMutation.isPending}
            />

            {/* Action Button - Only show if image selected but not scanning yet */}
            {currentImage && !scanMutation.isPending && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={handleIdentify}
                className="
                  px-8 py-4 rounded-2xl font-bold text-lg
                  bg-primary text-primary-foreground 
                  shadow-xl shadow-primary/25
                  hover:shadow-2xl hover:shadow-primary/30 hover:-translate-y-1 hover:scale-105
                  active:scale-95 active:translate-y-0
                  transition-all duration-300 ease-out
                  flex items-center gap-3
                "
              >
                <ScanLine className="w-6 h-6" />
                Identify This Dish
              </motion.button>
            )}
            
            {/* Loading text helper if scanning */}
            {scanMutation.isPending && (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-muted-foreground animate-pulse"
              >
                Connecting to vision AI...
              </motion.p>
            )}
          </div>
        ) : (
          <ScanResultCard 
            foodName={result.foodName} 
            confidence={95} 
            onReset={handleReset} 
          />
        )}

        <RecentScans />
      </main>
    </div>
  );
}
