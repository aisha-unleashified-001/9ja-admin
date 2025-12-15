import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Plus, Package, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { apiService } from '../services/api';
import type { ProductCategory } from '../types/api';

export function ProductCategories() {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<ProductCategory[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    perPage: 10,
    totalPages: 1,
    totalItems: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getProductCategories(page, 10);
      console.log('Product Categories API Response:', response);
      
      if (response.data && Array.isArray(response.data)) {
        setCategories(response.data);
        setFilteredCategories(response.data);
        setPagination(response.pagination || {
          currentPage: 1,
          perPage: 10,
          totalPages: 1,
          totalItems: response.data.length,
        });
      } else {
        console.error('Unexpected product categories response structure:', response);
        setCategories([]);
        setFilteredCategories([]);
        setPagination({
          currentPage: 1,
          perPage: 10,
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

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredCategories(categories);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = categories.filter((category) => {
      return (
        category.categoryName?.toLowerCase().includes(query) ||
        category.categoryId?.toLowerCase().includes(query)
      );
    });
    setFilteredCategories(filtered);
  }, [searchQuery, categories]);

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
          {categories.length > 0 && (
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search categories by name or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              {searchQuery && (
                <p className="text-sm text-muted-foreground mt-2">
                  Found {filteredCategories.length} result{filteredCategories.length !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          )}

          {filteredCategories.length === 0 && categories.length === 0 ? (
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
          ) : filteredCategories.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No categories match your search</p>
              <Button onClick={() => setSearchQuery('')} variant="outline">
                Clear Search
              </Button>
            </div>
          ) : (
            <div className="space-y-4 overflow-y-auto h-[60dvh]">
              {filteredCategories.map((category) => (
                <div
                  key={category.categoryId}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                      <Package className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-lg">{category.categoryName}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <div className="flex items-center gap-1">
                          {/* <Calendar className="h-3 w-3" /> */}
                          <span>Product count:</span> {category.associatedProducts || 0}
                        </div>
                        {/* {category.updatedAt !== category.createdAt && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Updated: {new Date(category.updatedAt).toLocaleDateString()}
                          </div>
                        )} */}
                      </div>
                      {/* <p className="text-xs text-muted-foreground mt-1">
                        ID: {category.categoryId}
                      </p> */}
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

          {/* Pagination - show info always, controls when multiple pages */}
          {!searchQuery && filteredCategories.length > 0 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                {pagination.totalPages > 1 ? (
                  <>Page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalItems} total)</>
                ) : (
                  <>Showing all {pagination.totalItems} categor{pagination.totalItems !== 1 ? 'ies' : 'y'}</>
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

          {/* Show info when searching */}
          {searchQuery && filteredCategories.length > 0 && (
            <div className="mt-6 pt-4 border-t text-center text-sm text-muted-foreground">
              Showing {filteredCategories.length} of {categories.length} categories on this page
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