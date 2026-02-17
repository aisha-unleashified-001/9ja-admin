import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { apiService } from "../services/api";
import type { BuyerSignup } from "../types/api";

function getBuyerDisplayName(signup: BuyerSignup): string {
  const full = (signup.fullName ?? signup.full_name ?? "").trim();
  if (full) return full;
  const first = (signup.firstName ?? "").trim();
  const last = (signup.lastName ?? "").trim();
  const firstLast = [first, last].filter(Boolean).join(" ").trim();
  if (firstLast) return firstLast;
  return signup.emailAddress || "—";
}

export function BuyerSignupDetail() {
  const { id: buyerId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [signup, setSignup] = useState<BuyerSignup | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toggling, setToggling] = useState(false);

  const fetchSignup = async () => {
    if (!buyerId) return;

    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getBuyerSignup(buyerId);
      console.log("Buyer Signup Detail Response:", response);

      if (response.data) {
        setSignup(response.data);
      } else {
        setError("Buyer signup not found");
      }
    } catch (error) {
      console.error("Failed to fetch buyer signup:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load buyer signup"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSignup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buyerId]);

  const handleToggleStatus = async () => {
    if (!signup || !buyerId) return;

    setToggling(true);
    try {
      await apiService.toggleBuyerStatus(buyerId);
      await fetchSignup();
    } catch (error) {
      console.error("Failed to toggle buyer status:", error);
      setError("Failed to update buyer status. Please try again.");
    } finally {
      setToggling(false);
    }
  };

  const getStatusInfo = (isActive: string) => {
    return isActive === "1"
      ? {
          label: "Active",
          icon: CheckCircle,
          className: "text-green-600 bg-green-50 border-green-200",
          actionLabel: "Deactivate Buyer",
        }
      : {
          label: "Inactive",
          icon: XCircle,
          className: "bg-red-100 text-red-800 border-red-200",
          actionLabel: "Activate Buyer",
        };
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/dashboard/buyer-signups")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Buyer Signup Details</h1>
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

  if (error || !signup) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/dashboard/buyer-signups")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Buyer Signup Details</h1>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-destructive mb-4">
              {error || "Buyer signup not found"}
            </p>
            <Button onClick={fetchSignup} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusInfo = getStatusInfo(signup.isActive);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/dashboard/buyer-signups")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Buyer Signup Details</h1>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleToggleStatus}
            disabled={toggling}
            variant={signup.isActive === "1" ? "outline" : "default"}
          >
            {toggling ? "Updating..." : statusInfo.actionLabel}
          </Button>
        </div>
      </div>

      {/* Status Card */}
      <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
        <Card className={`border-2 ${statusInfo.className}`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <StatusIcon className={`h-5 w-5 ${signup.isActive === "1" ? "text-green-600" : "text-red-800"}`} />
              <span className="font-medium">Status: {statusInfo.label}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Full Name
              </label>
              <p className="text-sm">
                {getBuyerDisplayName(signup)}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Email Address
              </label>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm">{signup.emailAddress}</p>
              </div>
            </div>
            {signup.phoneNumber && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Phone Number
                </label>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm">{signup.phoneNumber}</p>
                </div>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Buyer ID
              </label>
              <p className="text-sm font-mono">{signup.buyerId}</p>
            </div>
            {signup.address && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Address
                </label>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <p className="text-sm">{signup.address}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Timestamps */}
        <Card>
          <CardHeader>
            <CardTitle>Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Registered on
                </label>
                <p className="text-sm">
                  {new Date(signup.createdAt).toLocaleString()}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Last Updated
                </label>
                <p className="text-sm">
                  {new Date(signup.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
