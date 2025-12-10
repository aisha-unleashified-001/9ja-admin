import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Percent } from "lucide-react";
import { apiService } from "../services/api";
import toast from "react-hot-toast";

export function CommissionChange() {
  const [commission, setCommission] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch current commission percentage on mount
  useEffect(() => {
    const fetchCurrentCommission = async () => {
      setFetching(true);
      try {
        const response = await apiService.getCommission();
        if (response.data) {
          setCommission(response.data.commission.toString());
        }
      } catch (err) {
        console.error("Failed to fetch commission:", err);
        // Don't show error toast on initial load if endpoint doesn't exist yet
        // toast.error("Failed to load current commission percentage");
      } finally {
        setFetching(false);
      }
    };

    fetchCurrentCommission();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate input
    const commissionValue = parseFloat(commission);
    if (isNaN(commissionValue) || commissionValue < 0 || commissionValue > 100) {
      setError("Please enter a valid commission percentage between 0 and 100");
      return;
    }

    setLoading(true);
    try {
      const response = await apiService.updateCommission({
        commission: commissionValue,
      });
      toast.success(
        response.data?.message ||
          `Commission percentage updated to ${commissionValue}%`
      );
      setError(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to update commission percentage";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Commission Change</h1>
      </div>

      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Percent className="h-5 w-5" />
              Update Commission Percentage
            </CardTitle>
            <CardDescription>
              Update the commission percentage (%) that 9jaCart charges from vendors
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="commission"
                  className="block text-sm font-medium mb-2"
                >
                  Commission Percentage (%){" "}
                  <span className="text-destructive">*</span>
                </label>
                <Input
                  id="commission"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={commission}
                  onChange={(e) => setCommission(e.target.value)}
                  placeholder="Enter commission percentage (e.g., 10.5)"
                  required
                  disabled={fetching || loading}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Enter a value between 0 and 100 (e.g., 10 for 10%, 12.5 for 12.5%)
                </p>
              </div>

              {error && (
                <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <div className="flex items-center gap-3">
                <Button
                  type="submit"
                  disabled={loading || fetching || !commission}
                >
                  {loading ? "Updating..." : "Update Commission"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

