import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { ArrowLeft, Tag, Calendar, Clock, Edit2, Save, X } from "lucide-react";
import { apiService } from "../services/api";
import type { BusinessCategory } from "../types/api";

export function BusinessCategoryDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [category, setCategory] = useState<BusinessCategory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchCategory = async () => {
    if (!id) return;

    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getBusinessCategory(id);
      console.log("Business Category Detail Response:", response);

      if (response.data) {
        setCategory(response.data);
      } else {
        setError("Business category not found");
      }
    } catch (error) {
      console.error("Failed to fetch business category:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to load business category"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategory();
  }, [id]);

  const handleBack = () => {
    navigate("/dashboard/business-categories");
  };

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

  const handleDelete = async () => {
    if (!id) return;
    // const confirmDelete = window.confirm(
    //   "Are you sure you want to delete this category?"
    // );
    // if (!confirmDelete) return;

    try {
      const response = await apiService.deleteBusinessCategory(id);
      // navigate("/dashboard/business-categories");
      toast.success(response.message);
    } catch (error) {
      console.error("Failed to delete category:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete category"
      );
      setError(
        error instanceof Error ? error.message : "Failed to delete category"
      );
    }
  };

  const handleSave = async () => {
    if (!id || !editedName.trim()) return;

    setSaving(true);
    try {
      await apiService.updateBusinessCategory(id, {
        categoryName: editedName.trim(),
      });
      setIsEditing(false);
      fetchCategory();
    } catch (error) {
      console.error("Failed to update category:", error);
      setError(
        error instanceof Error ? error.message : "Failed to update category"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Category Details</h1>
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
          <h1 className="text-3xl font-bold">Category Details</h1>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-destructive mb-4">
              {error || "Business category not found"}
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
        <h1 className="text-3xl font-bold">Category Details</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Category Info */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                    <Tag className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl">{category.categoryName}</h2>
                    <p className="text-sm text-muted-foreground font-normal">
                      Business Category ID: {category.id}
                    </p>
                  </div>
                </div>
                {!isEditing && (
                  <div className="flex flex-col md:flex-row items-center gap-1 ml-2 md:gap-3">
                    <Button variant="outline" size="sm" onClick={handleEdit}>
                      <Edit2 className="h-4 w-4 mr-2" />
                      Edit
                    </Button>

                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleDelete}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
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
                      <p className="text-sm mt-1 font-mono">
                        {category.associatedBusinesses}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <h3 className="font-medium mb-3">Usage Information</h3>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    This category is available for vendors to select during
                    registration. Vendors can choose this category to classify
                    their business type.
                  </p>
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
                <span className="text-sm font-medium">Business</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Available for
                </span>
                <span className="text-sm font-medium">Vendor Registration</span>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
              <CardDescription>Manage this business category</CardDescription>
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
        </div>
      </div>
    </div>
  );
}
