import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import {
  ArrowLeft,
  Package,
  Calendar,
  Clock,
  Save,
  X,
  Edit2,
} from "lucide-react";
import { apiService } from "../services/api";
import type { ProductCategory } from "../types/api";
import toast from "react-hot-toast";
import { Input } from "@/components/ui/Input";

export function ProductCategoryDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [category, setCategory] = useState<ProductCategory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [saving, setSaving] = useState(false);

  // const [showEditDrawer, setShowEditDrawer] = useState(false);

  const fetchCategory = async () => {
    if (!id) return;

    setLoading(true);
    setError(null);
    try {
      // Since we don't have a single product category endpoint, we'll fetch all and find the one we need
      const response = await apiService.getAllProductCategories();
      console.log("Product Categories Response:", response);

      if (response.data && Array.isArray(response.data)) {
        const foundCategory = response.data.find(
          (cat) => cat.categoryId === id
        );
        if (foundCategory) {
          setCategory(foundCategory);
        } else {
          setError("Product category not found");
        }
      } else {
        setError("Failed to load product category");
      }
    } catch (error) {
      console.error("Failed to fetch product category:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to load product category"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategory();
  }, [id]);

  const handleEdit = () => {
    if (category) {
      setEditedName(category.categoryName);
      setIsEditing(true);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedName("");
  };

  const handleSave = async () => {
    if (!editedName.trim() || !id) return;

    setSaving(true);
    try {
      await apiService.updateProductCategory(id, {
        categoryName: editedName.trim(),
      });

      toast.success("Category updated successfully!");
      setIsEditing(false);
      fetchCategory(); // refresh page just like the business category
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update category"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!category?.categoryId) return;

    try {
      const response = await apiService.deleteProductCategory(
        category.categoryId
      );

      toast.success(response.message);

      // Redirect back to list, same as business category
      // navigate("/dashboard/product-categories");
    } catch (error) {
      console.error("Failed to delete product category:", error);

      toast.error(
        error instanceof Error ? error.message : "Failed to delete category"
      );
    }
  };

  const handleBack = () => {
    navigate("/dashboard/product-categories");
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Product Category Details</h1>
        </div>
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="h-8 bg-muted rounded w-1/3"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
              <div className="h-4 bg-muted rounded w-2/3"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Product Category Details</h1>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-destructive mb-4">
              {error || "Product category not found"}
            </p>
            <Button onClick={fetchCategory} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString(),
      full: date.toLocaleString(),
    };
  };

  const createdDate = formatDate(category.createdAt);
  const updatedDate = formatDate(category.updatedAt);
  const isUpdated = category.createdAt !== category.updatedAt;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">Product Category Details</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Category Info */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl">{category.categoryName}</h2>
                  <p className="text-sm text-muted-foreground font-normal">
                    Product Category ID: {category.categoryId}
                  </p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* <div>
                <h3 className="font-medium mb-3">Category Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Category Name
                    </label>
                    <p className="text-sm mt-1">{category.categoryName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Category Count
                    </label>
                    <p className="text-sm mt-1 font-mono">
                      {category.associatedProducts}
                    </p>
                  </div>
                </div>
              </div> */}
              <div>
                <h3 className="font-medium mb-3">Category Information</h3>

                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Category Name
                      </label>
                      <Input
                        type="text"
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        placeholder="Enter category name"
                        className="mt-1"
                      />
                    </div>

                    {/* <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Description
                      </label>
                      <Input
                        type="text"
                        value={editedDescription}
                        onChange={(e) => setEditedDescription(e.target.value)}
                        placeholder="Enter category description"
                        className="mt-1"
                      />
                    </div> */}

                    <div className="flex gap-2">
                      <Button
                        onClick={handleSave}
                        disabled={saving || !editedName.trim()}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {saving ? "Saving..." : "Save Changes"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleCancelEdit}
                        disabled={saving}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Category Name
                      </label>
                      <p className="text-sm mt-1">{category.categoryName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Category Count
                      </label>
                      <p className="text-sm mt-1">
                        {category.associatedProducts || "—"}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <h3 className="font-medium mb-3">Usage Information</h3>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    This product category is available for vendors to classify
                    their products. It helps organize the marketplace and makes
                    it easier for customers to find specific types of products
                    through browsing and filtering.
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-3">Category Features</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <h4 className="text-sm font-medium text-green-800">
                      For Vendors
                    </h4>
                    <p className="text-xs text-green-700 mt-1">
                      Organize product inventory and improve discoverability
                    </p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="text-sm font-medium text-blue-800">
                      For Customers
                    </h4>
                    <p className="text-xs text-blue-700 mt-1">
                      Browse and filter products by category
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Timeline & Stats */}
        <div className="space-y-6">
          {/* Timeline Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Created</span>
                </div>
                <p className="text-sm text-muted-foreground ml-6">
                  {createdDate.full}
                </p>
              </div>

              {isUpdated && (
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Last Updated</span>
                  </div>
                  <p className="text-sm text-muted-foreground ml-6">
                    {updatedDate.full}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <span className="text-sm font-medium text-green-600">
                  Active
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Category Type
                </span>
                <span className="text-sm font-medium">Product</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Available for
                </span>
                <span className="text-sm font-medium">
                  Product Classification
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
              <CardDescription>Manage this product category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {!isEditing && (
                  <>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handleEdit}
                    >
                      <Edit2 className="h-4 w-4 mr-2" />
                      Edit Category
                    </Button>

                    <Button
                      variant="destructive"
                      className="w-full"
                      onClick={handleDelete}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Delete Category
                    </Button>
                  </>
                )}

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleBack}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Categories
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
              <CardDescription>Manage this product category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={async () => {
                    // const confirmed = window.confirm(
                    //   "Are you sure you want to delete this category? This cannot be undone."
                    // );
                    // if (!confirmed) return;

                    try {
                      const response = await apiService.deleteProductCategory(
                        category.categoryId
                      );
                      toast.success(response.message);
                    } catch (err) {
                      console.error(err);
                      // alert("Failed to delete category");
                      toast.error(
                        err instanceof Error
                          ? err.message
                          : "Failed to delete category"
                      );
                    }
                  }}
                >
                  Delete Category
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleBack}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Categories
                </Button>
              </div>
            </CardContent>
          </Card> */}
        </div>
      </div>
    </div>
  );
}
