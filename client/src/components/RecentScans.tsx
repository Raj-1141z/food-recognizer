import { useRecentScans } from "@/hooks/use-scan";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import { format } from "date-fns";

export function RecentScans() {
  const { data: scans, isLoading } = useRecentScans();

  if (isLoading) return <div className="h-20 w-full animate-pulse bg-muted rounded-xl mt-8" />;
  if (!scans || scans.length === 0) return null;

  return (
    <div className="w-full max-w-2xl mx-auto mt-16 px-4">
      <div className="flex items-center gap-2 mb-6 text-muted-foreground">
        <Clock className="w-4 h-4" />
        <span className="text-sm font-medium uppercase tracking-wider">Recent Discoveries</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {scans.slice(0, 4).map((scan, i) => (
          <motion.div
            key={scan.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-4 rounded-2xl border border-border/50 hover:border-primary/20 hover:shadow-md transition-all duration-300 flex items-center gap-4 group"
          >
            <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
              🍽️
            </div>
            <div>
              <h4 className="font-semibold text-foreground">{scan.foodName}</h4>
              <p className="text-xs text-muted-foreground">
                {scan.createdAt ? format(new Date(scan.createdAt), 'MMM d, h:mm a') : 'Just now'}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
