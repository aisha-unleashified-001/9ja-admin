import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Eye, ChevronLeft, ChevronRight, Download } from "lucide-react";
import { apiService } from "../services/api";
import type { Contact } from "../types/api";
import { contactsToCSV, downloadCSV } from "../utils/csvExport";

export function Contacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    perPage: 5,
    totalPages: 1,
    totalItems: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const fetchContacts = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getContacts(page, 5);
      console.log("API Response:", response); // Debug log

      // Based on your API response: response.data is array, response.pagination is object
      if (response.data && Array.isArray(response.data)) {
        setContacts(response.data);
        setPagination(response.pagination);
      } else {
        console.error("Unexpected response structure:", response);
        setContacts([]);
        setPagination({
          currentPage: 1,
          perPage: 5,
          totalPages: 1,
          totalItems: 0,
        });
      }
    } catch (error) {
      console.error("Failed to fetch contacts:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load contacts"
      );
      setContacts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handlePageChange = (page: number) => {
    fetchContacts(page);
  };

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const response = await apiService.getAllContacts();
      if (response.data && Array.isArray(response.data)) {
        const csvContent = contactsToCSV(response.data);
        const timestamp = new Date().toISOString().split("T")[0];
        downloadCSV(csvContent, `contacts-${timestamp}.csv`);
      }
    } catch (error) {
      console.error("Failed to export contacts:", error);
      setError("Failed to export contacts. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Contacts</h1>
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-muted rounded"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Contacts</h1>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={() => fetchContacts()} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Contacts</h1>
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            {pagination.totalItems} total contacts
          </div>
          <Button
            onClick={handleExportCSV}
            disabled={exporting || contacts.length === 0}
            variant="outline"
          >
            <Download className="h-4 w-4 mr-2" />
            {exporting ? "Exporting..." : "Export CSV"}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Contact Submissions</CardTitle>
          <CardDescription>
            Messages and inquiries from your website visitors
          </CardDescription>
        </CardHeader>
        <CardContent>
          {contacts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No contacts found</p>
              <Button onClick={() => fetchContacts()} variant="outline">
                Refresh
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {contacts.map((contact) => (
                <div
                  key={contact.id}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-4">
                      <div>
                        <h3 className="font-medium">{contact.fullName}</h3>
                        <p className="text-sm text-muted-foreground">
                          {contact.email}
                        </p>
                      </div>
                      <div className="hidden md:block">
                        <p className="text-sm font-medium">{contact.subject}</p>
                        <p className="text-sm text-muted-foreground truncate max-w-md">
                          {contact.message}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                      <p className="text-sm text-muted-foreground">
                        {new Date(contact.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(contact.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                    <Link to={`/dashboard/contacts/${contact.id}`}>
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
          {contacts.length > 0 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                {pagination.totalPages > 1 ? (
                  <>Page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalItems} total)</>
                ) : (
                  <>Showing all {pagination.totalItems} contact{pagination.totalItems !== 1 ? 's' : ''}</>
                )}
              </div>
              {pagination.totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.totalPages}
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
