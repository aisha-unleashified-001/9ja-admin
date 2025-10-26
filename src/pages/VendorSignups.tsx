import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Eye, ChevronLeft, ChevronRight, Download, Building, User, Phone, Mail } from 'lucide-react';
import { apiService } from '../services/api';
import type { VendorSignup } from '../types/api';
import { vendorSignupsToCSV, downloadCSV } from '../utils/csvExport';

export function VendorSignups() {
  const [signups, setSignups] = useState<VendorSignup[]>([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    perPage: 20,
    totalPages: 1,
    totalItems: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const fetchSignups = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getVendorSignups(page, 20);
      console.log('Vendor Signups API Response:', response);
      
      if (response.data && Array.isArray(response.data)) {
        setSignups(response.data);
        // Handle pagination - API might return null for pagination
        setPagination(response.pagination || {
          currentPage: 1,
          perPage: 20,
          totalPages: 1,
          totalItems: response.data.length,
        });
      } else {
        console.error('Unexpected vendor signups response structure:', response);
        setSignups([]);
        setPagination({
          currentPage: 1,
          perPage: 20,
          totalPages: 1,
          totalItems: 0,
        });
      }
    } catch (error) {
      console.error('Failed to fetch vendor signups:', error);
      setError(error instanceof Error ? error.message : 'Failed to load vendor signups');
      setSignups([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSignups();
  }, []);

  const handlePageChange = (page: number) => {
    fetchSignups(page);
  };

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const response = await apiService.getAllVendorSignups();
      if (response.data && Array.isArray(response.data)) {
        const csvContent = vendorSignupsToCSV(response.data);
        const timestamp = new Date().toISOString().split('T')[0];
        downloadCSV(csvContent, `vendor-signups-${timestamp}.csv`);
      }
    } catch (error) {
      console.error('Failed to export vendor signups:', error);
      setError('Failed to export vendor signups. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const getStatusBadge = (isActive: string) => {
    return isActive === '1' ? (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Active
      </span>
    ) : (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
        Inactive
      </span>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Vendor Signups</h1>
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
        <h1 className="text-3xl font-bold">Vendor Signups</h1>
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
        <h1 className="text-3xl font-bold">Vendor Signups</h1>
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            {pagination.totalItems} vendor applications
          </div>
          <Button 
            onClick={handleExportCSV} 
            disabled={exporting || signups.length === 0}
            variant="outline"
          >
            <Download className="h-4 w-4 mr-2" />
            {exporting ? 'Exporting...' : 'Export CSV'}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Vendor Applications</CardTitle>
          <CardDescription>
            New vendor registrations awaiting approval
          </CardDescription>
        </CardHeader>
        <CardContent>
          {signups.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No vendor signups found</p>
              <Button onClick={() => fetchSignups()} variant="outline">
                Refresh
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {signups.map((signup) => (
                <div
                  key={signup.id}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
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
                          {signup.businessName && (
                            <div className="flex items-center gap-1">
                              <Building className="h-3 w-3" />
                              {signup.businessName}
                            </div>
                          )}
                          {signup.storeName && (
                            <div className="flex items-center gap-1">
                              <Building className="h-3 w-3" />
                              Store: {signup.storeName}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="hidden md:block text-right">
                        <p className="text-sm text-muted-foreground">
                          Applied on
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
                    <Link to={`/dashboard/vendor-signups/${signup.id}`}>
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
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-muted-foreground">
                Page {pagination.currentPage} of {pagination.totalPages}
              </div>
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
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}