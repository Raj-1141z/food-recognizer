import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export type ScanResult = {
  foodName: string;
  analysis?: any;
};

export function useScanFood() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (base64Image: string) => {
      // Validate with Zod schema from shared routes
      const payload = { image: base64Image };
      const validated = api.scan.process.input.parse(payload);

      const res = await fetch(api.scan.process.path, {
        method: api.scan.process.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
      });

      if (!res.ok) {
        if (res.status === 400 || res.status === 500) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Failed to analyze image");
        }
        throw new Error("Failed to connect to server");
      }

      return api.scan.process.responses[200].parse(await res.json());
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [api.scan.list.path] });
      toast({
        title: "Food Identified!",
        description: `It looks like ${data.foodName}.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Scan Failed",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    },
  });
}

export function useRecentScans() {
  return useQuery({
    queryKey: [api.scan.list.path],
    queryFn: async () => {
      const res = await fetch(api.scan.list.path);
      if (!res.ok) throw new Error("Failed to fetch history");
      return api.scan.list.responses[200].parse(await res.json());
    },
  });
}
