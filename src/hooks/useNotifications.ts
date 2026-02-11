import { useState, useEffect, useCallback } from "react";
import { apiService } from "@/services/api";
import type {
  CategoryCount,
  NotificationCounts,
  NotificationItem,
  TicketsResponse,
} from "@/types/api";

export function useNotifications() {
  const [counts, setCounts] = useState<NotificationCounts>({
    vendors: 0,
    buyers: 0,
    admin: 0,
    pendingSignups: 0,
  });
  const [categoryCounts, setCategoryCounts] = useState<CategoryCount[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPendingSignups = useCallback(async () => {
    try {
      const response = await apiService.getAllVendorSignups();
      if (response && response.data && Array.isArray(response.data)) {
        // Count vendors with pending approval status
        // First check isPending attribute if it exists, otherwise fall back to isApproved !== "1"
        const pendingCount = response.data.filter((signup) => {
          // Check isPending attribute if it exists
          if (signup.isPending !== undefined && signup.isPending !== null) {
            const isPending = signup.isPending;
            return (
              isPending === true ||
              isPending === "1" ||
              isPending === "true" ||
              String(isPending).toLowerCase() === "true"
            );
          }
          // Fallback: check if not approved (isApproved !== "1")
          return signup.isApproved !== "1";
        }).length;
        console.log("Pending vendor signups count:", pendingCount);
        return pendingCount;
      }
      console.warn("Vendor signups response structure unexpected:", response);
      return 0;
    } catch (error) {
      console.error("Failed to fetch pending vendor signups:", error);
      return 0;
    }
  }, []);

  // Compute unread vendor/buyer ticket counts directly from the tickets API
  const fetchTicketUnreadCounts = useCallback(async () => {
    try {
      let page = 1;
      const perPage = 50;
      let totalPages = 1;
      let vendorUnread = 0;
      let buyerUnread = 0;

      // Paginate through all tickets to ensure counts are accurate
      while (page <= totalPages) {
        const response = await apiService.getTickets(page, perPage);
        const ticketsData = response.data as unknown as TicketsResponse | undefined;

        if (!ticketsData || !Array.isArray(ticketsData.tickets)) {
          break;
        }

        totalPages = ticketsData.pagination?.totalPages || 1;

        ticketsData.tickets.forEach((ticket) => {
          const unread = ticket.unreadCount || 0;
          if (!unread) return;

          if (ticket.userType === "VENDOR") {
            vendorUnread += unread;
          } else if (ticket.userType === "BUYER") {
            buyerUnread += unread;
          }
        });

        page += 1;
      }

      return { vendorUnread, buyerUnread };
    } catch (error) {
      console.error("Failed to fetch ticket unread counts:", error);
      return { vendorUnread: 0, buyerUnread: 0 };
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      // Fetch notifications, pending signups, and ticket unread counts in parallel
      const [notificationsResponse, pendingSignupsCount, ticketCounts] =
        await Promise.all([
          apiService.getNotifications().catch((err) => {
            console.error("Failed to fetch notifications:", err);
            return null;
          }),
          fetchPendingSignups(),
          fetchTicketUnreadCounts(),
        ]);

      let adminCount = 0;

      if (notificationsResponse && notificationsResponse.data) {
        const data = notificationsResponse.data;
        const noteList = data.notifications || [];
        setNotifications(noteList);

        // Prefer explicit admin unread count if backend provides it,
        // otherwise derive from unread notifications.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const explicitCounts = data as any;
        adminCount = explicitCounts.adminUnreadMessages ?? 0;

        if (!adminCount && Array.isArray(noteList) && noteList.length > 0) {
          adminCount = noteList.filter((n) => n.isRead === "0").length;
        }
      }

      const newCounts: NotificationCounts = {
        vendors: ticketCounts.vendorUnread,
        buyers: ticketCounts.buyerUnread,
        admin: adminCount,
        pendingSignups: pendingSignupsCount,
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
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  }, [fetchPendingSignups, fetchTicketUnreadCounts]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Mark notifications as read for a given category.
  // This only affects the notifications API; ticket read state is managed server-side.
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
