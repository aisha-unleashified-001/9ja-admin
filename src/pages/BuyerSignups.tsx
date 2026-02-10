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
import { Input } from "../components/ui/Input";
import {
  Eye,
  ChevronLeft,
  ChevronRight,
  Download,
  User,
  Phone,
  Mail,
  Search,
  Filter,
} from "lucide-react";
import { apiService } from "../services/api";
import type { BuyerSignup } from "../types/api";
import { downloadCSV } from "../utils/csvExport";

type StatusFilterKey = "active" | "inactive";
type StatusFilters = Record<StatusFilterKey, boolean>;

export function BuyerSignups() {
  const [signups, setSignups] = useState<BuyerSignup[]>([]);
  const [filteredSignups, setFilteredSignups] = useState<BuyerSignup[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilters, setStatusFilters] = useState<StatusFilters>({
    active: false,
    inactive: false,
  });
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 5;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const fetchSignups = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getAllBuyerSignups();
      console.log("Buyer Signups API Response:", response);

      if (response.data && Array.isArray(response.data)) {
        setSignups(response.data);
        setFilteredSignups(response.data);
        setCurrentPage(1);
      } else {
        console.error(
          "Unexpected buyer signups response structure:",
          response
        );
        setSignups([]);
        setFilteredSignups([]);
        setCurrentPage(1);
      }
    } catch (error) {
      console.error("Failed to fetch buyer signups:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load buyer signups"
      );
      setSignups([]);
      setFilteredSignups([]);
      setCurrentPage(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSignups();
  }, []);

  useEffect(() => {
    const query = searchQuery.trim().toLowerCase();
    const hasStatusFilters = Object.values(statusFilters).some(Boolean);

    let filtered = signups.filter((signup) => {
      if (!query) {
        return true;
      }

      return (
        signup.fullName?.toLowerCase().includes(query) ||
        signup.emailAddress?.toLowerCase().includes(query) ||
        signup.phoneNumber?.toLowerCase().includes(query) ||
        signup.buyerId?.toLowerCase().includes(query)
      );
    });

    if (hasStatusFilters) {
      filtered = filtered.filter((signup) => {
        const matchesActive = statusFilters.active && signup.isActive === "1";
        const matchesInactive = statusFilters.inactive && signup.isActive === "0";

        return matchesActive || matchesInactive;
      });
    }

    setFilteredSignups(filtered);
    setCurrentPage(1);
  }, [searchQuery, signups, statusFilters]);

  const toggleStatusFilter = (key: StatusFilterKey) => {
    setStatusFilters((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const clearStatusFilters = () => {
    setStatusFilters({
      active: false,
      inactive: false,
    });
  };

  const activeFilterCount = Object.values(statusFilters).filter(Boolean).length;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const buyerSignupsToCSV = (signups: BuyerSignup[]): string => {
    const headers = [
      "Buyer ID",
      "Full Name",
      "Email Address",
      "Phone Number",
      "Address",
      "Status",
      "Created At",
      "Updated At",
    ];

    const rows = signups.map((signup) => [
      signup.buyerId,
      signup.fullName,
      signup.emailAddress,
      signup.phoneNumber || "",
      signup.address || "",
      signup.isActive === "1" ? "Active" : "Inactive",
      new Date(signup.createdAt).toLocaleString(),
      new Date(signup.updatedAt).toLocaleString(),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    return csvContent;
  };

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const response = await apiService.getAllBuyerSignups();
      if (response.data && Array.isArray(response.data)) {
        const csvContent = buyerSignupsToCSV(response.data);
        const timestamp = new Date().toISOString().split("T")[0];
        downloadCSV(csvContent, `buyer-signups-${timestamp}.csv`);
      }
    } catch (error) {
      console.error("Failed to export buyer signups:", error);
      setError("Failed to export buyer signups. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  const getStatusBadge = (isActive: string) => {
    return isActive === "1" ? (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Active
      </span>
    ) : (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
        Inactive
      </span>
    );
  };

  const totalItems = filteredSignups.length;
  const totalPages = Math.ceil(totalItems / perPage) || 1;
  const paginatedSignups = filteredSignups.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Buyer Sign ups</h1>
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 bg-muted rounded"></div>
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
        <h1 className="text-3xl font-bold">Buyer Sign ups</h1>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={() => fetchSignups()} variant="outline">
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
        <h1 className="text-3xl font-bold">Buyer Sign ups</h1>
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            {signups.length} buyer registrations
          </div>
          <Button
            onClick={handleExportCSV}
            disabled={exporting || signups.length === 0}
            variant="outline"
          >
            <Download className="h-4 w-4 mr-2" />
            {exporting ? "Exporting..." : "Export CSV"}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Buyer Registrations</CardTitle>
          <CardDescription>
            All buyer accounts registered on the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by name, email, phone, or buyer ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="relative">
              <Button
                type="button"
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => setShowFilterPanel((prev) => !prev)}
              >
                <Filter className="h-4 w-4" />
                Filters
                {activeFilterCount === 0 && <div className="rounded-full bg-primary/10 px-2.5 py-0.5"></div>}
                {activeFilterCount > 0 && (
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    {activeFilterCount}
                  </span>
                )}
              </Button>

              {showFilterPanel && (
                <div className="absolute right-0 z-10 mt-2 w-64 rounded-lg border bg-background p-4 shadow-lg">
                  <div className="mb-3 text-sm font-medium">
                    Filter by status
                  </div>
                  <div className="space-y-3 text-sm">
                    <label className="flex cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        checked={statusFilters.active}
                        onChange={() => toggleStatusFilter("active")}
                      />
                      Active
                    </label>
                    <label className="flex cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        checked={statusFilters.inactive}
                        onChange={() => toggleStatusFilter("inactive")}
                      />
                      Inactive
                    </label>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearStatusFilters}
                      disabled={activeFilterCount === 0}
                    >
                      Clear
                    </Button>
                    <Button size="sm" onClick={() => setShowFilterPanel(false)}>
                      Done
                    </Button>
                  </div>
                </div>
              )}
            </div>
            <p className="text-sm text-muted-foreground md:text-right">
              {filteredSignups?.length} Buyer
              {filteredSignups?.length !== 1 ? "s" : ""}
            </p>
          </div>

          {totalItems === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                {searchQuery
                  ? "No buyers match your search"
                  : "No buyer signups found"}
              </p>
              {searchQuery ? (
                <Button onClick={() => setSearchQuery("")} variant="outline">
                  Clear Search
                </Button>
              ) : (
                <Button onClick={() => fetchSignups()} variant="outline">
                  Refresh
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {paginatedSignups.map((signup) => (
                <div
                  key={signup.buyerId}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <h3 className="font-medium">{signup.fullName}</h3>
                          {getStatusBadge(signup.isActive)}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {signup.emailAddress}
                          </div>
                          {signup.phoneNumber && (
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {signup.phoneNumber}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="hidden md:block text-right">
                        <p className="text-sm text-muted-foreground">
                          Registered on
                        </p>
                        <p className="text-sm font-medium">
                          {new Date(signup.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(signup.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="ml-4">
                    <Link to={`/dashboard/buyer-signups/${signup.buyerId}`}>
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

          {/* Pagination - show info always, controls when multiple pages */}
          {totalItems > perPage && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages} ({totalItems} total buyer
                {totalItems !== 1 ? "s" : ""})
              </div>
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
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {totalItems <= perPage && totalItems > 0 && (
            <div className="mt-6 pt-4 border-t text-center text-sm text-muted-foreground">
              Showing all {totalItems} buyer{totalItems !== 1 ? "s" : ""}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
