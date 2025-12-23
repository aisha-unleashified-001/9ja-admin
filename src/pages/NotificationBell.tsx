import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Bell, Users, Store, ShieldAlert } from "lucide-react";
import { useNotifications } from "../hooks/useNotifications";
import type { CategoryCount } from "@/types/api";

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { unreadCount, categoryCounts, loading, markAsRead } =
    useNotifications();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCategoryClick = (type: CategoryCount["type"]) => {
    setIsOpen(false);
    // Trigger mark as read logic for this category
    // This runs in background while user navigates
    markAsRead(type);
  };

  const getIcon = (type: CategoryCount["type"]) => {
    switch (type) {
      case "vendor":
        return <Store className="h-4 w-4 text-blue-600" />;
      case "buyer":
        return <Users className="h-4 w-4 text-green-600" />;
      case "admin":
        return <ShieldAlert className="h-4 w-4 text-orange-600" />;
      default:
        return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  const getBgColor = (type: CategoryCount["type"]) => {
    switch (type) {
      case "vendor":
        return "bg-blue-100";
      case "buyer":
        return "bg-green-100";
      case "admin":
        return "bg-orange-100";
      default:
        return "bg-gray-100";
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-[#1E4700] focus:ring-offset-2"
        aria-label="Notifications"
      >
        <Bell className="h-6 w-6 text-gray-600" />

        {/* Red Ping Dot (Unread Badge) */}
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border-2 border-white"></span>
          </span>
        )}
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 origin-top-right rounded-xl bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50 animate-in fade-in zoom-in-95 duration-200">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-sm font-semibold text-gray-900">
              Notifications
            </h3>
            {unreadCount > 0 ? (
              <span className="text-xs font-medium text-[#1E4700] bg-green-50 px-2 py-0.5 rounded-full">
                {unreadCount} Unread
              </span>
            ) : (
              <span className="text-xs text-gray-400">All caught up</span>
            )}
          </div>

          <div className="p-2 space-y-1">
            {loading ? (
              <div className="p-4 text-center text-sm text-gray-500">
                Checking...
              </div>
            ) : categoryCounts.length > 0 ? (
              categoryCounts.map((item, idx) => (
                <Link
                  key={idx}
                  to={item.route}
                  onClick={() => handleCategoryClick(item.type)}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-full ${getBgColor(item.type)}`}
                    >
                      {getIcon(item.type)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                        {item.label}
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.count} unread message{item.count !== 1 && "s"}
                      </p>
                    </div>
                  </div>

                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#1E4700] text-[10px] font-medium text-white">
                    {item.count}
                  </span>
                </Link>
              ))
            ) : (
              <div className="p-8 text-center">
                <Bell className="h-8 w-8 text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No unread messages</p>
              </div>
            )}
          </div>

          {categoryCounts.length > 0 && (
            <div className="p-2 border-t border-gray-100 bg-gray-50/50 rounded-b-xl">
              <p className="text-[10px] text-center text-gray-400">
                Click a category to view details
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
