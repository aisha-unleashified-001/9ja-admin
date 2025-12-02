import { useState, useCallback } from "react";
import { apiService } from "@/services/api";
import type { Order, OrdersMetrics, OrdersQuery, Pagination } from "@/types/api";

const INITIAL_QUERY: OrdersQuery = {
  page: 1,
  perPage: 10,
  status: "",
  startDate: "",
  endDate: "",
  customerName: "",
  orderNo: "",
  paymentMethod: "",
  sortBy: "recent",
};

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [metrics, setMetrics] = useState<OrdersMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQueryState] = useState<OrdersQuery>(INITIAL_QUERY);

  const fetchOrders = useCallback(async (currentQuery: OrdersQuery) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiService.getOrders(currentQuery);
      if (response.error) {
        throw new Error(response.message);
      }
      setOrders(response.data);
      setPagination(response.pagination);
      if (response.pagination?.metrics) {
        setMetrics(response.pagination.metrics);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);
      console.error("Failed to fetch orders:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchMetrics = useCallback(async () => {
    // This function can be used to specifically refresh metrics
    // without re-fetching the entire orders list.
    try {
      const response = await apiService.getOrdersSummary();
      if (response.error) {
        throw new Error(response.message);
      }
      if (response.data) {
        setMetrics(response.data);
      }
    } catch (err) {
      console.error("Failed to fetch order metrics:", err);
      // Optionally set an error state for metrics
    }
  }, []);

  const setQuery = useCallback(
    (newQuery: Partial<OrdersQuery>) => {
      setQueryState((prev) => ({ ...prev, ...newQuery }));
    },
    [setQueryState]
  );

  return {
    orders,
    pagination,
    metrics,
    isLoading,
    error,
    query,
    fetchOrders,
    fetchMetrics,
    setQuery,
  };
}
