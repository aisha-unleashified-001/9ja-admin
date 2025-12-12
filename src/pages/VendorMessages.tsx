import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Eye, ChevronLeft, ChevronRight } from "lucide-react";
import type { VendorMessage } from "../types/api";
import { apiService } from "../services/api";
import toast from "react-hot-toast";

export function VendorMessages() {
  const [vendorMessages, setVendorMessages] = useState<VendorMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    perPage: 10,
    totalPages: 1,
    totalItems: 0,
  });

  const fetchVendorMessages = async (page = 1, search = "") => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getTickets(page, 10, search || undefined);
      console.log("API Response:", response);
      
      if (response.data && response.data.tickets && Array.isArray(response.data.tickets)) {
        console.log("Tickets found:", response.data.tickets.length);
        
        // Fetch sender info for each ticket to check userType
        // We'll filter based on senderInfo.type or ticket.userType
        const messagesWithSenderInfo = await Promise.all(
          response.data.tickets.map(async (ticket) => {
            try {
              // First check if ticket has userType field - if it exists, use it directly
              if (ticket.userType !== undefined) {
                if (ticket.userType !== "VENDOR") {
                  return null; // Skip non-vendor tickets
                }
              }
              
              // Fetch ticket messages to get sender info
              const messagesResponse = await apiService.getTicketMessages(ticket.ticketId);
              
              // Get the first message (usually the original message from the vendor)
              const firstMessage = messagesResponse.data?.messages?.[0];
              const senderInfo = firstMessage?.senderInfo;
              
              // If userType was not on ticket, check senderInfo to determine if it's a vendor
              if (ticket.userType === undefined) {
                const isVendor = 
                  firstMessage?.senderType === "VENDOR" ||
                  senderInfo?.type === "VENDOR";
                
                if (!isVendor) {
                  return null; // Skip non-vendor messages
                }
              }
              
              // Get the first message text for preview
              const firstMessageText = firstMessage?.message || ticket.subject;
              
              return {
                id: ticket.ticketId,
                name: senderInfo?.name || "Vendor",
                storeName: senderInfo?.business_name || ticket.category || "N/A",
                email: senderInfo?.email || "",
                phoneNumber: senderInfo?.phone || "",
                subject: ticket.subject,
                message: firstMessageText,
                createdAt: ticket.createdAt,
                updatedAt: ticket.updatedAt,
              };
            } catch (error) {
              console.error(`Failed to fetch sender info for ticket ${ticket.ticketId}:`, error);
              // Return ticket without sender info if fetch fails
              return {
                id: ticket.ticketId,
                name: "Vendor",
                storeName: ticket.category || "N/A",
                email: "",
                phoneNumber: "",
                subject: ticket.subject,
                message: ticket.subject,
                createdAt: ticket.createdAt,
                updatedAt: ticket.updatedAt,
              };
            }
          })
        );
        
        // Filter out null values (tickets that didn't pass validation)
        const validMessages = messagesWithSenderInfo.filter((msg) => msg !== null) as VendorMessage[];
        
        console.log("Mapped messages with sender info:", validMessages);
        setVendorMessages(validMessages);
        if (response.data.pagination) {
          setPagination(response.data.pagination);
        }
      } else {
        console.warn("Unexpected response structure:", response);
        setVendorMessages([]);
      }
    } catch (error) {
      console.error("Failed to fetch vendor messages:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to load vendor messages";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendorMessages(currentPage, searchQuery);
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchVendorMessages(1, searchQuery);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Vendor Messages</h1>
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            {pagination.totalItems} total messages
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Vendor Message Submissions</CardTitle>
          <CardDescription>
            Messages and inquiries from vendors on the platform
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-hidden">
          {/* Search Form */}
          <form onSubmit={handleSearch} className="mb-4">
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button type="submit" variant="outline">
                Search
              </Button>
            </div>
          </form>

          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">Loading messages...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-destructive mb-4">{error}</p>
              <Button
                variant="outline"
                onClick={() => fetchVendorMessages(currentPage, searchQuery)}
              >
                Retry
              </Button>
            </div>
          ) : vendorMessages.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No messages found</p>
            </div>
          ) : (
            <div className="space-y-4 w-full">
              {vendorMessages.map((message) => (
                <div
                  key={message.id}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors w-full max-w-full overflow-hidden"
                >
                  <div className="flex-1 min-w-0 max-w-full overflow-hidden pr-4">
                    <div className="flex items-center gap-4 w-full max-w-full">
                      <div className="min-w-0 flex-shrink-0 max-w-[200px]">
                        <h3 className="font-medium truncate max-w-full">
                          {message.name || "Vendor"}
                        </h3>
                        {message.storeName && (
                          <p className="text-sm text-muted-foreground truncate max-w-full">
                            {message.storeName}
                          </p>
                        )}
                        {message.email && (
                          <p className="text-sm text-muted-foreground truncate max-w-full">
                            {message.email}
                          </p>
                        )}
                      </div>
                      <div className="hidden md:block min-w-0 flex-1 max-w-full overflow-hidden">
                        <p className="text-sm font-medium truncate max-w-full">{message.subject}</p>
                        {message.message && (
                          <p className="text-sm text-muted-foreground truncate max-w-full">
                            {message.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="text-right hidden sm:block">
                      <p className="text-sm text-muted-foreground whitespace-nowrap">
                        {new Date(message.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-muted-foreground whitespace-nowrap">
                        {new Date(message.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                    <Link to={`/dashboard/vendor-messages/${message.id}`} className="flex-shrink-0">
                      <Button variant="outline" size="sm" className="flex-shrink-0">
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && vendorMessages.length > 0 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                {pagination.totalPages > 1 ? (
                  <>
                    Page {currentPage} of {pagination.totalPages} (
                    {pagination.totalItems} total)
                  </>
                ) : (
                  <>
                    Showing all {pagination.totalItems} message
                    {pagination.totalItems !== 1 ? "s" : ""}
                  </>
                )}
              </div>
              {pagination.totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1 || loading}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === pagination.totalPages || loading}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


