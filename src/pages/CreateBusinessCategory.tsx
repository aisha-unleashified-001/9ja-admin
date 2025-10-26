import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ArrowLeft, Tag } from 'lucide-react';
import { apiService } from '../services/api';

export function CreateBusinessCategory() {
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
      await apiService.createBusinessCategory({
        categoryName: categoryName.trim()
      });
      
      // Navigate back to categories list
      navigate('/dashboard/business-categories', { 
        replace: true 
      });
    } catch (error) {
      console.error('Failed to create business category:', error);
      setError(error instanceof Error ? error.message : 'Failed to create category');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/dashboard/business-categories');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={handleCancel}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">Create Business Category</h1>
      </div>

      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              New Business Category
            </CardTitle>
            <CardDescription>
              Add a new category that vendors can select during registration
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
                  placeholder="Enter category name (e.g., Fashion, Food, Electronics)"
                  required
                  maxLength={100}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Choose a clear, descriptive name for the business category
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
            <CardTitle className="text-lg">Category Guidelines</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm">
              <h4 className="font-medium mb-2">Best Practices:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Use clear, industry-standard category names</li>
                <li>• Keep names concise but descriptive</li>
                <li>• Avoid duplicate or very similar categories</li>
                <li>• Consider how vendors will search and filter</li>
              </ul>
            </div>
            <div className="text-sm">
              <h4 className="font-medium mb-2">Examples:</h4>
              <div className="flex flex-wrap gap-2">
                {['Fashion & Apparel', 'Food & Beverages', 'Electronics', 'Health & Beauty', 'Home & Garden'].map((example) => (
                  <span key={example} className="px-2 py-1 bg-muted rounded-md text-xs">
                    {example}
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}