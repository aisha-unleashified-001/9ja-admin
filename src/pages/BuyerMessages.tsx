import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Eye, ChevronLeft, ChevronRight } from "lucide-react";
import type { BuyerMessage } from "../types/api";

// Mock data - will be replaced with API call when endpoint is available
const mockBuyerMessages: BuyerMessage[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john.doe@example.com",
    phoneNumber: "+234 801 234 5678",
    subject: "Order Inquiry",
    message: "I would like to know the status of my recent order. When can I expect delivery?",
    createdAt: "2025-12-08T10:27:51Z",
    updatedAt: "2025-12-08T10:27:51Z",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    phoneNumber: "+234 802 345 6789",
    subject: "Product Question",
    message: "Do you have this product in different sizes? I need a larger size.",
    createdAt: "2025-12-07T14:15:30Z",
    updatedAt: "2025-12-07T14:15:30Z",
  },
  {
    id: "3",
    name: "Michael Johnson",
    email: "michael.j@example.com",
    phoneNumber: "+234 803 456 7890",
    subject: "Return Request",
    message: "I received a damaged item. How do I proceed with a return?",
    createdAt: "2025-12-06T09:45:12Z",
    updatedAt: "2025-12-06T09:45:12Z",
  },
  {
    id: "4",
    name: "Sarah Williams",
    email: "sarah.w@example.com",
    phoneNumber: "+234 804 567 8901",
    subject: "Payment Issue",
    message: "I was charged twice for my order. Can you help resolve this?",
    createdAt: "2025-12-05T16:20:45Z",
    updatedAt: "2025-12-05T16:20:45Z",
  },
  {
    id: "5",
    name: "David Brown",
    email: "david.brown@example.com",
    phoneNumber: "+234 805 678 9012",
    subject: "Delivery Question",
    message: "Can I change my delivery address? The order hasn't shipped yet.",
    createdAt: "2025-12-04T11:30:20Z",
    updatedAt: "2025-12-04T11:30:20Z",
  },
];

export function BuyerMessages() {
  const [buyerMessages] = useState<BuyerMessage[]>(mockBuyerMessages);
  const pagination = {
    currentPage: 1,
    perPage: 5,
    totalPages: Math.ceil(mockBuyerMessages.length / 5),
    totalItems: mockBuyerMessages.length,
  };
  const [currentPage, setCurrentPage] = useState(1);

  // Calculate paginated messages
  const startIndex = (currentPage - 1) * pagination.perPage;
  const endIndex = startIndex + pagination.perPage;
  const paginatedMessages = buyerMessages.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // TODO: Replace with actual API call when endpoint is available
  // const fetchBuyerMessages = async (page = 1) => {
  //   setLoading(true);
  //   setError(null);
  //   try {
  //     const response = await apiService.getBuyerMessages(page, 5);
  //     if (response.data && Array.isArray(response.data)) {
  //       setBuyerMessages(response.data);
  //       setPagination(response.pagination);
  //     }
  //   } catch (error) {
  //     console.error("Failed to fetch buyer messages:", error);
  //     setError(error instanceof Error ? error.message : "Failed to load buyer messages");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Buyer Messages</h1>
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            {pagination.totalItems} total messages
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Buyer Message Submissions</CardTitle>
          <CardDescription>
            Messages and inquiries from buyers on the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          {paginatedMessages.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No messages found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {paginatedMessages.map((message) => (
                <div
                  key={message.id}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-4">
                      <div>
                        <h3 className="font-medium">{message.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {message.email}
                        </p>
                      </div>
                      <div className="hidden md:block">
                        <p className="text-sm font-medium">{message.subject}</p>
                        <p className="text-sm text-muted-foreground truncate max-w-md">
                          {message.message}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                      <p className="text-sm text-muted-foreground">
                        {new Date(message.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(message.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                    <Link to={`/dashboard/buyer-messages/${message.id}`}>
                      <Button variant="outline" size="sm">
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
          {buyerMessages.length > 0 && (
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
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === pagination.totalPages}
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


