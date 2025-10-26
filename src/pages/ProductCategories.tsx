import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Plus, Package, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { apiService } from '../services/api';
import type { ProductCategory } from '../types/api';

export function ProductCategories() {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    perPage: 20,
    totalPages: 1,
    totalItems: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getProductCategories(page, 20);
      console.log('Product Categories API Response:', response);
      
      if (response.data && Array.isArray(response.data)) {
        setCategories(response.data);
        setPagination(response.pagination || {
          currentPage: 1,
          perPage: 20,
          totalPages: 1,
          totalItems: response.data.length,
        });
      } else {
        console.error('Unexpected product categories response structure:', response);
        setCategories([]);
        setPagination({
          currentPage: 1,
          perPage: 20,
          totalPages: 1,
          totalItems: 0,
        });
      }
    } catch (error) {
      console.error('Failed to fetch product categories:', error);
      setError(error instanceof Error ? error.message : 'Failed to load product categories');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handlePageChange = (page: number) => {
    fetchCategories(page);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Product Categories</h1>
          <Button disabled>
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </div>
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
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Product Categories</h1>
          <Link to="/dashboard/product-categories/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </Link>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={() => fetchCategories()} variant="outline">
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
        <h1 className="text-3xl font-bold">Product Categories</h1>
        <Link to="/dashboard/product-categories/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Category Management</CardTitle>
          <CardDescription>
            Manage product categories for vendor product listings
          </CardDescription>
        </CardHeader>
        <CardContent>
          {categories.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No product categories found</p>
              <Link to="/dashboard/product-categories/create">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Category
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {categories.map((category) => (
                <div
                  key={category.categoryId}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100">
                      <Package className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-lg">{category.categoryName}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Created: {new Date(category.createdAt).toLocaleDateString()}
                        </div>
                        {category.updatedAt !== category.createdAt && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Updated: {new Date(category.updatedAt).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        ID: {category.categoryId}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Link to={`/dashboard/product-categories/${category.categoryId}`}>
                      <Button variant="outline" size="sm">
                        View Details
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
                Page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalItems} total)
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

      {/* Summary Stats */}
      {categories.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Product Categories</p>
                <p className="text-2xl font-bold">{pagination.totalItems}</p>
              </div>
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}