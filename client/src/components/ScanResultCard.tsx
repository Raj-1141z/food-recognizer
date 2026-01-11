import { motion } from "framer-motion";
import { Utensils, Info } from "lucide-react";

interface ScanResultCardProps {
  foodName: string;
  confidence?: number;
  onReset: () => void;
}

export function ScanResultCard({ foodName, onReset }: ScanResultCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto mt-8"
    >
      <div className="bg-white rounded-3xl p-8 shadow-xl shadow-primary/5 border border-primary/10 relative overflow-hidden">
        {/* Background decorative blob */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center mb-6 shadow-lg shadow-primary/25">
            <Utensils className="w-8 h-8 text-white" />
          </div>
          
          <h2 className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">
            Identification Complete
          </h2>
          
          <h1 className="text-4xl font-bold text-foreground mb-4 font-display text-balance">
            {foodName}
          </h1>
          
          <p className="text-muted-foreground mb-8 text-balance">
            Our AI vision model has analyzed your image and identified this dish with high confidence.
          </p>

          <button
            onClick={onReset}
            className="w-full py-4 rounded-xl font-semibold bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors duration-200"
          >
            Scan Another Dish
          </button>
        </div>
      </div>
    </motion.div>
  );
}
