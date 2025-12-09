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
import type { VendorMessage } from "../types/api";

// Mock data - will be replaced with API call when endpoint is available
const mockVendorMessages: VendorMessage[] = [
  {
    id: "1",
    name: "Adeola Ogunleye",
    storeName: "Fresh Farm Produce",
    email: "adeola@freshfarm.com",
    phoneNumber: "+234 801 111 2222",
    subject: "Account Verification Issue",
    message: "I'm having trouble verifying my vendor account. The documents I uploaded seem to be stuck in review.",
    createdAt: "2025-12-08T11:30:00Z",
    updatedAt: "2025-12-08T11:30:00Z",
  },
  {
    id: "2",
    name: "Chukwuemeka Nwosu",
    storeName: "Nwosu Electronics",
    email: "chukwu@nwosuelectronics.com",
    phoneNumber: "+234 802 222 3333",
    subject: "Payment Disbursement",
    message: "When will my earnings from last month be disbursed? I haven't received payment yet.",
    createdAt: "2025-12-07T15:45:30Z",
    updatedAt: "2025-12-07T15:45:30Z",
  },
  {
    id: "3",
    name: "Fatima Ibrahim",
    storeName: "Ibrahim Fashion House",
    email: "fatima@ibrahimfashion.com",
    phoneNumber: "+234 803 333 4444",
    subject: "Product Listing Question",
    message: "How do I add multiple product images? I can only see one image upload option.",
    createdAt: "2025-12-06T10:20:15Z",
    updatedAt: "2025-12-06T10:20:15Z",
  },
  {
    id: "4",
    name: "Tunde Adebayo",
    storeName: "Adebayo Home Essentials",
    email: "tunde@adebayohome.com",
    phoneNumber: "+234 804 444 5555",
    subject: "Commission Rate Inquiry",
    message: "What is the current commission rate for my category? I want to understand the fee structure better.",
    createdAt: "2025-12-05T14:10:45Z",
    updatedAt: "2025-12-05T14:10:45Z",
  },
  {
    id: "5",
    name: "Grace Okonkwo",
    storeName: "Okonkwo Beauty Supplies",
    email: "grace@okonkwobeauty.com",
    phoneNumber: "+234 805 555 6666",
    subject: "Order Cancellation",
    message: "A customer cancelled an order after I already prepared it. What's the policy on this?",
    createdAt: "2025-12-04T09:15:20Z",
    updatedAt: "2025-12-04T09:15:20Z",
  },
];

export function VendorMessages() {
  const [vendorMessages] = useState<VendorMessage[]>(mockVendorMessages);
  const pagination = {
    currentPage: 1,
    perPage: 5,
    totalPages: Math.ceil(mockVendorMessages.length / 5),
    totalItems: mockVendorMessages.length,
  };
  const [currentPage, setCurrentPage] = useState(1);

  // Calculate paginated messages
  const startIndex = (currentPage - 1) * pagination.perPage;
  const endIndex = startIndex + pagination.perPage;
  const paginatedMessages = vendorMessages.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // TODO: Replace with actual API call when endpoint is available
  // const fetchVendorMessages = async (page = 1) => {
  //   setLoading(true);
  //   setError(null);
  //   try {
  //     const response = await apiService.getVendorMessages(page, 5);
  //     if (response.data && Array.isArray(response.data)) {
  //       setVendorMessages(response.data);
  //       setPagination(response.pagination);
  //     }
  //   } catch (error) {
  //     console.error("Failed to fetch vendor messages:", error);
  //     setError(error instanceof Error ? error.message : "Failed to load vendor messages");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

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
                          {message.storeName}
                        </p>
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
                    <Link to={`/dashboard/vendor-messages/${message.id}`}>
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
          {vendorMessages.length > 0 && (
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


