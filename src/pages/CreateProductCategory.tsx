import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ArrowLeft, Package } from 'lucide-react';
import { apiService } from '../services/api';

export function CreateProductCategory() {
  const navigate = useNavigate();
  const [categoryName, setCategoryName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!categoryName.trim()) {
      setError('Category name is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await apiService.createProductCategory({
        categoryName: categoryName.trim()
      });
      
      // Navigate back to product categories list
      navigate('/dashboard/product-categories', { 
        replace: true 
      });
    } catch (error) {
      console.error('Failed to create product category:', error);
      setError(error instanceof Error ? error.message : 'Failed to create category');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/dashboard/product-categories');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={handleCancel}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">Create Product Category</h1>
      </div>

      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              New Product Category
            </CardTitle>
            <CardDescription>
              Add a new category that vendors can use to classify their products
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="categoryName" className="block text-sm font-medium mb-2">
                  Category Name <span className="text-destructive">*</span>
                </label>
                <Input
                  id="categoryName"
                  type="text"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="Enter product category name (e.g., Men's Wear, Electronics, Home & Garden)"
                  required
                  maxLength={100}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Choose a clear, descriptive name for the product category
                </p>
              </div>

              {error && (
                <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <div className="flex items-center gap-3">
                <Button type="submit" disabled={loading || !categoryName.trim()}>
                  {loading ? 'Creating...' : 'Create Category'}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Guidelines Card */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Product Category Guidelines</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm">
              <h4 className="font-medium mb-2">Best Practices:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Use specific, searchable category names</li>
                <li>• Consider how customers will browse products</li>
                <li>• Avoid overly broad or narrow categories</li>
                <li>• Use consistent naming conventions</li>
                <li>• Think about product filtering and organization</li>
              </ul>
            </div>
            <div className="text-sm">
              <h4 className="font-medium mb-2">Examples:</h4>
              <div className="flex flex-wrap gap-2">
                {[
                  "Men's Wear", 
                  "Women's Fashion", 
                  "Electronics & Gadgets", 
                  "Home & Kitchen", 
                  "Sports & Fitness",
                  "Books & Media",
                  "Health & Beauty",
                  "Toys & Games"
                ].map((example) => (
                  <span key={example} className="px-2 py-1 bg-muted rounded-md text-xs">
                    {example}
                  </span>
                ))}
              </div>
            </div>
            <div className="text-sm">
              <h4 className="font-medium mb-2">Usage:</h4>
              <p className="text-muted-foreground">
                Product categories help vendors organize their inventory and help customers 
                find products more easily through browsing and filtering.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}