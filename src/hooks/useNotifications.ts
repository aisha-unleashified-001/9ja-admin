import { useState, useEffect, useCallback } from "react";
import { apiService } from "@/services/api";
import type {
  CategoryCount,
  NotificationCounts,
  NotificationItem,
} from "@/types/api";

export function useNotifications() {
  const [counts, setCounts] = useState<NotificationCounts>({
    vendors: 0,
    buyers: 0,
    admin: 0,
  });
  const [categoryCounts, setCategoryCounts] = useState<CategoryCount[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await apiService.getNotifications();

      if (response && response.data) {
        const data = response.data;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const explicitCounts = data as any;
        const noteList = data.notifications || [];
        setNotifications(noteList);

        let vendorCount = explicitCounts.vendorUnreadMesagesCount || 0;
        let buyerCount = explicitCounts.buyerUnreadMessagesCount || 0;
        let adminCount = explicitCounts.adminUnreadMessages || 0;

        // Fallback calculation if explicit counts are missing
        if (vendorCount === 0 && buyerCount === 0 && noteList.length > 0) {
          // Reset counters for calculation
          vendorCount = 0;
          buyerCount = 0;
          adminCount = 0;

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          noteList.forEach((n: any) => {
            if (n.isRead === "0") {
              const text = (n.title + n.message).toLowerCase();
              if (text.includes("vendor")) vendorCount++;
              else if (text.includes("buyer") || text.includes("order"))
                buyerCount++;
              else adminCount++;
            }
          });
        }

        const newCounts = {
          vendors: vendorCount,
          buyers: buyerCount,
          admin: adminCount,
        };

        setCounts(newCounts);

        const categories: CategoryCount[] = [
          {
            label: "Vendor Messages",
            count: newCounts.vendors,
            route: "/dashboard/vendor-messages",
            type: "vendor",
          },
          {
            label: "Buyer Messages",
            count: newCounts.buyers,
            route: "/dashboard/buyer-messages",
            type: "buyer",
          },
          {
            label: "System Messages",
            count: newCounts.admin,
            route: "/dashboard/messages",
            type: "admin",
          },
        ];

        const filteredCategories = categories.filter((c) => c.count > 0);
        setCategoryCounts(filteredCategories);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // NEW: Mark as Read Function
  const markAsRead = useCallback(
    async (type: "vendor" | "buyer" | "admin") => {
      const unreadItems = notifications.filter((n) => {
        if (n.isRead !== "0") return false;
        const text = (n.title + n.message).toLowerCase();
        if (type === "vendor") return text.includes("vendor");
        if (type === "buyer")
          return text.includes("buyer") || text.includes("order");
        return true;
      });

      try {
        await Promise.all(
          unreadItems.map((item) =>
            apiService.markNotificationAsRead(item.notificationId)
          )
        );

        fetchNotifications();
      } catch (error) {
        console.error("Failed to mark notifications as read:", error);
      }
    },
    [notifications, fetchNotifications]
  );

  const totalUnread = Object.values(counts).reduce(
    (sum, count) => sum + count,
    0
  );

  return {
    counts,
    unreadCount: totalUnread,
    categoryCounts,
    loading,
    refresh: fetchNotifications,
    markAsRead,
  };
}
