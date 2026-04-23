import { useState, useEffect } from "react";
import { apiService } from "../services/api";
import type { AnalyticsData } from "../types/api";

interface UseVendorAnalyticsResult {
  analyticsData: AnalyticsData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useVendorAnalytics(vendorId: string): UseVendorAnalyticsResult {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!vendorId) return;

    let cancelled = false;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await apiService.getVendorAnalytics(vendorId);
        if (!cancelled) {
          setAnalyticsData(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to fetch analytics data"
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [vendorId, tick]);

  const refetch = () => setTick((t) => t + 1);

  return { analyticsData, isLoading, error, refetch };
}
