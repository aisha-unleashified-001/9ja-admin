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
import { Plus, Tag, Search } from "lucide-react";
import { apiService } from "../services/api";
import type { BusinessCategory } from "../types/api";

export function BusinessCategories() {
  const [categories, setCategories] = useState<BusinessCategory[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<
    BusinessCategory[]
  >([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getBusinessCategories();

      if (response.data && Array.isArray(response.data)) {
        setCategories(response.data);
        setFilteredCategories(response.data);
      } else {
        console.error(
          "Unexpected business categories response structure:",
          response
        );
        setCategories([]);
        setFilteredCategories([]);
      }
    } catch (error) {
      console.error("Failed to fetch business categories:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to load business categories"
      );
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
        category.id?.toLowerCase().includes(query)
      );
    });
    setFilteredCategories(filtered);
  }, [searchQuery, categories]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Business Categories</h1>
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
          <h1 className="text-3xl font-bold">Business Categories</h1>
          <Link to="/dashboard/business-categories/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </Link>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={fetchCategories} variant="outline">
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
        <h1 className="text-3xl font-bold">Business Categories</h1>
        <Link to="/dashboard/business-categories/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Category Management</CardTitle>
          <CardDescription>
            Manage business categories for vendor registration
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
                  Found {filteredCategories.length} result
                  {filteredCategories.length !== 1 ? "s" : ""}
                </p>
              )}
            </div>
          )}

          {filteredCategories.length === 0 && categories.length === 0 ? (
            <div className="text-center py-8">
              <Tag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                No business categories found
              </p>
              <Link to="/dashboard/business-categories/create">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Category
                </Button>
              </Link>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                No categories match your search
              </p>
              <Button onClick={() => setSearchQuery("")} variant="outline">
                Clear Search
              </Button>
            </div>
          ) : (
            <div className="space-y-4 overflow-y-auto h-[60dvh]">
              {filteredCategories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                      <Tag className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-lg">
                        {category.categoryName}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <div className="flex items-center gap-1">
                          {/* <Calendar className="h-3 w-3" /> */}
                          <span> Business Count:</span>
                          {category.associatedBusinesses || 0}
                        </div>
                        {/* {category.updatedAt !== category.createdAt && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Updated: {new Date(category.updatedAt).toLocaleDateString()}
                          </div>
                        )} */}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link to={`/dashboard/business-categories/${category.id}`}>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
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
                <p className="text-sm text-muted-foreground">
                  {searchQuery ? "Filtered Categories" : "Total Categories"}
                </p>
                <p className="text-2xl font-bold">
                  {searchQuery
                    ? `${filteredCategories.length} / ${categories.length}`
                    : categories.length}
                </p>
              </div>
              <Tag className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
