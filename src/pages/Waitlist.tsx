import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Eye, ChevronLeft, ChevronRight, Building, MapPin, Download } from 'lucide-react';
import { apiService } from '../services/api';
import type { WaitlistEntry } from '../types/api';
import { waitlistToCSV, downloadCSV } from '../utils/csvExport';

export function Waitlist() {
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    perPage: 5,
    totalPages: 1,
    totalItems: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const fetchWaitlist = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getWaitlist(page, 5);
      console.log('Waitlist API Response:', response); // Debug log
      
      // Based on API response: response.data is array, response.pagination is object
      if (response.data && Array.isArray(response.data)) {
        setWaitlist(response.data);
        setPagination(response.pagination);
      } else {
        console.error('Unexpected waitlist response structure:', response);
        setWaitlist([]);
        setPagination({
          currentPage: 1,
          perPage: 5,
          totalPages: 1,
          totalItems: 0,
        });
      }
    } catch (error) {
      console.error('Failed to fetch waitlist:', error);
      setError(error instanceof Error ? error.message : 'Failed to load waitlist');
      setWaitlist([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWaitlist();
  }, []);

  const handlePageChange = (page: number) => {
    fetchWaitlist(page);
  };

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const response = await apiService.getAllWaitlist();
      if (response.data && Array.isArray(response.data)) {
        const csvContent = waitlistToCSV(response.data);
        const timestamp = new Date().toISOString().split('T')[0];
        downloadCSV(csvContent, `waitlist-${timestamp}.csv`);
      }
    } catch (error) {
      console.error('Failed to export waitlist:', error);
      setError('Failed to export waitlist. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const getBusinessName = (entry: WaitlistEntry) => 
    entry.business_name || entry.businessName || 'N/A';
  
  const getFullName = (entry: WaitlistEntry) => 
    entry.full_name || entry.fullName || 'N/A';
  
  const getBusinessType = (entry: WaitlistEntry) => 
    entry.business_type || entry.businessType || 'N/A';
  
  const getStateOfOperation = (entry: WaitlistEntry) => 
    entry.state_of_operation || entry.stateOfOperation || 'N/A';
  
  const getCreatedAt = (entry: WaitlistEntry) => 
    entry.created_at || entry.createdAt || '';

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Waitlist</h1>
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
        <h1 className="text-3xl font-bold">Waitlist</h1>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={() => fetchWaitlist()} variant="outline">
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
        <h1 className="text-3xl font-bold">Waitlist</h1>
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            {pagination.totalItems} vendor applications
          </div>
          <Button 
            onClick={handleExportCSV} 
            disabled={exporting || waitlist.length === 0}
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
            Businesses waiting to join the 9jacart platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          {waitlist.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No waitlist entries found</p>
              <Button onClick={() => fetchWaitlist()} variant="outline">
                Refresh
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {waitlist.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <h3 className="font-medium">{getBusinessName(entry)}</h3>
                        <span className="text-xs bg-muted px-2 py-1 rounded">
                          {getBusinessType(entry)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        {getFullName(entry)}
                      </p>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {getStateOfOperation(entry)}
                      </div>
                    </div>
                    <div className="hidden md:block text-right">
                      <p className="text-sm text-muted-foreground">
                        Applied on
                      </p>
                      <p className="text-sm font-medium">
                        {new Date(getCreatedAt(entry)).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="ml-4">
                  <Link to={`/dashboard/waitlist/${entry.id}`}>
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