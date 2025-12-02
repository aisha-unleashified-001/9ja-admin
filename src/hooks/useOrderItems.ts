import { useState, useEffect } from "react";
import { apiService } from "@/services/api";
import type { OrderItem } from "@/types/api";

export function useOrderItems(orderId: string | undefined) {
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      setOrderItems([]);
      return;
    }

    const fetchItems = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await apiService.getOrderItems(orderId);
        if (response.error) {
          throw new Error(response.message);
        }
        setOrderItems(response.data.items || []);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An unknown error occurred";
        setError(errorMessage);
        console.error(`Failed to fetch items for order ${orderId}:`, err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchItems();
  }, [orderId]);

  return { orderItems, isLoading, error };
}
