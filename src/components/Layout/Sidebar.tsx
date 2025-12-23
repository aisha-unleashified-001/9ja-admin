import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  UserPlus,
  Tag,
  Package,
  Box,
  LogOut,
  Menu,
  X,
  Mail,
  Store,
  Percent,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "../ui/Button";
import { useAuthStore } from "../../stores/authStore";
import { useNotifications } from "../../hooks/useNotifications";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const navigation = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  {
    name: "Vendors SignUp",
    href: "/dashboard/vendor-signups",
    icon: UserPlus,
    key: "waitlist",
  },
  {
    name: "Business Categories",
    href: "/dashboard/business-categories",
    icon: Tag,
  },
  {
    name: "Product Categories",
    href: "/dashboard/product-categories",
    icon: Package,
  },
  { name: "Orders", href: "/dashboard/orders", icon: Box },
  {
    name: "Buyer Messages",
    href: "/dashboard/buyer-messages",
    icon: Mail,
    key: "buyers",
  },
  {
    name: "Vendor Messages",
    href: "/dashboard/vendor-messages",
    icon: Store,
    key: "vendors",
  },
  {
    name: "Commission Change",
    href: "/dashboard/commission-change",
    icon: Percent,
  },
  { name: "Waitlist", href: "/dashboard/waitlist", icon: Users },
  { name: "Contacts", href: "/dashboard/contacts", icon: MessageSquare },
];

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuthStore();

  // Use notification hook to get counts
  const { counts } = useNotifications();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const getUnreadCount = (key?: string) => {
    if (!key) return 0;
    if (key === "vendors") return counts.vendors;
    if (key === "buyers") return counts.buyers;
    return 0;
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-sidebar-border">
          <h1 className="text-xl font-bold text-sidebar-foreground">
            9jacart Admin
          </h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="lg:hidden"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigation.map((item) => {
            const isActive =
              location.pathname === item.href ||
              (item.href !== "/dashboard" &&
                location.pathname.startsWith(item.href));

            const unreadCount = getUnreadCount(item.key);

            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
                onClick={() => window.innerWidth < 1024 && onToggle()}
              >
                <div className="flex items-center">
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </div>

                {unreadCount > 0 && (
                  <span className="flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          {user && (
            <div className="mb-4 px-3 py-2 text-sm">
              <p className="font-medium text-sidebar-foreground truncate">
                {user.name}
              </p>
              <p className="text-xs text-sidebar-foreground/70 truncate">
                {user.email}
              </p>
            </div>
          )}
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Logout
          </Button>
        </div>
      </div>

      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggle}
        className="fixed top-4 left-4 z-40 lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </Button>
    </>
  );
}

// import { Link, useLocation, useNavigate } from "react-router-dom";
// import {
//   LayoutDashboard,
//   Users,
//   MessageSquare,
//   UserPlus,
//   Tag,
//   Package,
//   Box,
//   LogOut,
//   Menu,
//   X,
//   Mail,
//   Store,
//   Percent,
// } from "lucide-react";
// import { cn } from "../../lib/utils";
// import { Button } from "../ui/Button";
// import { useAuthStore } from "../../stores/authStore";

// interface SidebarProps {
//   isOpen: boolean;
//   onToggle: () => void;
// }

// const navigation = [
//   { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
//   {
//     name: "Vendors SignUp",
//     href: "/dashboard/vendor-signups",
//     icon: UserPlus,
//   },
//   {
//     name: "Business Categories",
//     href: "/dashboard/business-categories",
//     icon: Tag,
//   },
//   {
//     name: "Product Categories",
//     href: "/dashboard/product-categories",
//     icon: Package,
//   },
//   { name: "Orders", href: "/dashboard/orders", icon: Box },
//   { name: "Buyer Messages", href: "/dashboard/buyer-messages", icon: Mail },
//   { name: "Vendor Messages", href: "/dashboard/vendor-messages", icon: Store },
//   {
//     name: "Commission Change",
//     href: "/dashboard/commission-change",
//     icon: Percent,
//   },
//   { name: "Waitlist", href: "/dashboard/waitlist", icon: Users },
//   { name: "Contacts", href: "/dashboard/contacts", icon: MessageSquare },
// ];

// export function Sidebar({ isOpen, onToggle }: SidebarProps) {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const { logout, user } = useAuthStore();

//   const handleLogout = () => {
//     logout();
//     navigate("/login", { replace: true });
//   };

//   return (
//     <>
//       {/* Mobile backdrop */}
//       {isOpen && (
//         <div
//           className="fixed inset-0 bg-black/30 bg-opacity-50 z-40 lg:hidden"
//           onClick={onToggle}
//         />
//       )}

//       {/* Sidebar */}
//       <div
//         className={cn(
//           "fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
//           isOpen ? "translate-x-0" : "-translate-x-full"
//         )}
//       >
//         <div className="flex items-center justify-between h-16 px-6 border-b border-sidebar-border">
//           <h1 className="text-xl font-bold text-sidebar-foreground">
//             9jacart Admin
//           </h1>
//           <Button
//             variant="ghost"
//             size="icon"
//             onClick={onToggle}
//             className="lg:hidden"
//           >
//             <X className="h-5 w-5" />
//           </Button>
//         </div>

//         <nav className="flex-1 px-4 py-6 space-y-2">
//           {navigation.map((item) => {
//             const isActive =
//               location.pathname === item.href ||
//               (item.href !== "/dashboard" &&
//                 location.pathname.startsWith(item.href));

//             return (
//               <Link
//                 key={item.name}
//                 to={item.href}
//                 className={cn(
//                   "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
//                   isActive
//                     ? "bg-sidebar-accent text-sidebar-accent-foreground"
//                     : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
//                 )}
//                 onClick={() => window.innerWidth < 1024 && onToggle()}
//               >
//                 <item.icon className="mr-3 h-5 w-5" />
//                 {item.name}
//               </Link>
//             );
//           })}
//         </nav>

//         <div className="p-4 border-t border-sidebar-border">
//           {user && (
//             <div className="mb-4 px-3 py-2 text-sm">
//               <p className="font-medium text-sidebar-foreground truncate">
//                 {user.name}
//               </p>
//               <p className="text-xs text-sidebar-foreground/70 truncate">
//                 {user.email}
//               </p>
//             </div>
//           )}
//           <Button
//             variant="ghost"
//             onClick={handleLogout}
//             className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
//           >
//             <LogOut className="mr-3 h-5 w-5" />
//             Logout
//           </Button>
//         </div>
//       </div>

//       {/* Mobile menu button */}
//       <Button
//         variant="ghost"
//         size="icon"
//         onClick={onToggle}
//         className="fixed top-4 left-4 z-40 lg:hidden"
//       >
//         <Menu className="h-5 w-5" />
//       </Button>
//     </>
//   );
// }
