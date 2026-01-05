import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import { Users, MessageSquare, BoxIcon, MessageCircleMore, AlertCircle } from "lucide-react";
import { apiService } from "../services/api";
import type { Contact, OverviewStats, WaitlistEntry } from "../types/api";
import { NotificationBell } from "./NotificationBell";
import { useNotifications } from "../hooks/useNotifications";

export function Overview() {
  const [stats, setStats] = useState({
    totalContacts: 0,
    totalWaitlist: 0,
    recentContacts: [] as Contact[],
    recentWaitlist: [] as WaitlistEntry[],
  });
  const [statCard, setStatCard] = useState<OverviewStats>({
    totalVendors: 0,
    completedOrders: 0,
    adminMessagesCount: 0,
    vendorMessagesCount: 0,
  });

  const [loading, setLoading] = useState(true);
  const { counts } = useNotifications();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [contactsRes, waitlistRes] = await Promise.all([
          apiService.getContacts(1, 5),
          apiService.getWaitlist(1, 5),
        ]);
        const cardResponse = await apiService.getOverviewStats();

        setStats({
          totalContacts: contactsRes.pagination.totalItems,
          totalWaitlist: waitlistRes.pagination.totalItems,
          recentContacts: contactsRes.data,
          recentWaitlist: waitlistRes.data,
        });
        setStatCard(cardResponse.data || {
          totalVendors: 0,
          completedOrders: 0,
          adminMessagesCount: 0,
          vendorMessagesCount: 0,
        });
      } catch (error) {
        console.error("Failed to fetch overview data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Overview</h1>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Overview</h1>

        {/* Notification Bell Component */}
        <NotificationBell />
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Vendor count
                </p>
                <p className="text-2xl font-bold">{statCard.totalVendors}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Completed order
                </p>
                <p className="text-2xl font-bold">{statCard.completedOrders}</p>
              </div>
              <BoxIcon className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Message count
                </p>
                <p className="text-2xl font-bold">{statCard.adminMessagesCount}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Contact message count
                </p>
                <p className="text-2xl font-bold">
                  {/* {new Date().toLocaleDateString("en-US", { month: "short" })} */}
                  {statCard.buyerMessagesCount}
                </p>
              </div>
              <MessageCircleMore className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Signups Banner */}
      {counts.pendingSignups > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <p className="text-sm font-medium text-red-800">
                You have {counts.pendingSignups} pending user sign-up{counts.pendingSignups !== 1 ? "s" : ""} to approve.
              </p>
              <Link
                to="/dashboard/vendor-signups?filter=pending"
                className="ml-auto text-sm font-medium text-red-700 hover:text-red-900 underline"
              >
                Review now
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Contacts</CardTitle>
            <CardDescription>Latest contact form submissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentContacts.map((contact) => (
                <div
                  key={contact.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div>
                    <p className="font-medium">{contact.fullName}</p>
                    <p className="text-sm text-muted-foreground">
                      {contact.subject}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      {new Date(contact.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
              <Link
                to="/dashboard/contacts"
                className="block text-center text-sm text-primary hover:underline mt-4"
              >
                View all contacts
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Waitlist</CardTitle>
            <CardDescription>Latest vendor applications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentWaitlist.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div>
                    <p className="font-medium">
                      {entry.business_name || entry.businessName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {entry.full_name || entry.fullName}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      {new Date(
                        entry.created_at || entry.createdAt || ""
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
              <Link
                to="/dashboard/waitlist"
                className="block text-center text-sm text-primary hover:underline mt-4"
              >
                View all waitlist entries
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
