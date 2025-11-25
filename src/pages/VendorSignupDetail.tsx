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
import { Input } from "../components/ui/Input";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Building,
  MapPin,
  FileText,
  ExternalLink,
  CheckCircle,
  XCircle,
  Ban,
  UserCheck,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import { apiService } from "../services/api";
import type { VendorSignup } from "../types/api";

export function VendorSignupDetail() {
  const { id: vendorId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [signup, setSignup] = useState<VendorSignup | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toggling, setToggling] = useState(false);
  const [approving, setApproving] = useState(false);
  const [suspending, setSuspending] = useState(false);
  const [unsuspending, setUnsuspending] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [showUnsuspendModal, setShowUnsuspendModal] = useState(false);
  const [suspensionReason, setSuspensionReason] = useState("");
  const [requiredActions, setRequiredActions] = useState("");
  const [reinstatementReason, setReinstatementReason] = useState("");
  const [reinstatementNotes, setReinstatementNotes] = useState("");
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);

  const fetchSignup = async () => {
    if (!vendorId) return;

    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getVendorSignup(vendorId);
      // console.log("Vendor Signup Detail Response:", response);

      if (response.data) {
        setSignup(response.data);
      } else {
        setError("Vendor signup not found");
      }
    } catch (error) {
      console.error("Failed to fetch vendor signup:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load vendor signup"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSignup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vendorId]);

  const handleToggleStatus = async () => {
    if (!signup || !vendorId) return;

    setToggling(true);
    try {
      await apiService.toggleVendorStatus(vendorId);
      await fetchSignup();
    } catch (error) {
      console.error("Failed to toggle vendor status:", error);
      setError("Failed to update vendor status. Please try again.");
    } finally {
      setToggling(false);
    }
  };

  const handleApprove = async () => {
    if (!signup || !vendorId) return;

    setApproving(true);
    try {
      await apiService.approveVendor(vendorId);
      await fetchSignup();
    } catch (error) {
      console.error("Failed to approve vendor:", error);
      setError("Failed to approve vendor. Please try again.");
    } finally {
      setApproving(false);
    }
  };

  const handleSuspend = async () => {
    if (!signup || !vendorId || !suspensionReason.trim()) return;

    setSuspending(true);
    try {
      const actionsArray = requiredActions
        .split("\n")
        .map((action) => action.trim())
        .filter((action) => action.length > 0);

      await apiService.suspendVendor(vendorId, {
        suspensionReason: suspensionReason.trim(),
        requiredActions:
          actionsArray.length > 0
            ? actionsArray
            : ["Contact support for more information"],
      });

      setShowSuspendModal(false);
      setSuspensionReason("");
      setRequiredActions("");
      await fetchSignup();
    } catch (error) {
      console.error("Failed to suspend vendor:", error);
      setError("Failed to suspend vendor. Please try again.");
    } finally {
      setSuspending(false);
    }
  };

  const handleUnsuspend = async () => {
    if (!signup || !vendorId || !reinstatementReason.trim()) return;

    setUnsuspending(true);
    try {
      await apiService.reinstateVendor(vendorId, {
        reinstatementReason: reinstatementReason.trim(),
        notes: reinstatementNotes.trim() || undefined,
      });

      setShowUnsuspendModal(false);
      setReinstatementReason("");
      setReinstatementNotes("");
      await fetchSignup();
    } catch (error) {
      console.error("Failed to unsuspend vendor:", error);
      setError("Failed to unsuspend vendor. Please try again.");
    } finally {
      setUnsuspending(false);
    }
  };

  const getStatusInfo = (isActive: string) => {
    return isActive === "1"
      ? {
          label: "Active",
          icon: CheckCircle,
          className: "text-green-600 bg-green-50 border-green-200",
          actionLabel: "Deactivate Vendor",
        }
      : {
          label: "Inactive",
          icon: XCircle,
          className: "text-red-600 bg-red-50 border-red-200",
          actionLabel: "Activate Vendor",
        };
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/dashboard/vendor-signups")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Vendor Signup Details</h1>
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
            onClick={() => navigate("/dashboard/vendor-signups")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Vendor Signup Details</h1>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-destructive mb-4">
              {error || "Vendor signup not found"}
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
            onClick={() => navigate("/dashboard/vendor-signups")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Vendor Signup Details</h1>
        </div>

        <div className="flex items-center gap-2">
          {signup.isApproved === "0" && signup.isSuspended === "0" && (
            <Button
              onClick={handleApprove}
              disabled={approving}
              variant="default"
            >
              <UserCheck className="h-4 w-4 mr-2" />
              {approving ? "Approving..." : "Approve Vendor"}
            </Button>
          )}

          {signup.isSuspended === "0" && (
            <Button
              onClick={() => setShowSuspendModal(true)}
              disabled={suspending}
              variant="destructive"
            >
              <Ban className="h-4 w-4 mr-2" />
              Suspend Vendor
            </Button>
          )}

          {signup.isSuspended === "1" && (
            <Button
              onClick={() => setShowUnsuspendModal(true)}
              disabled={unsuspending}
              variant="default"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Unsuspend
            </Button>
          )}

          <Button
            onClick={handleToggleStatus}
            disabled={toggling}
            variant={signup.isActive === "1" ? "outline" : "default"}
          >
            {toggling ? "Updating..." : statusInfo.actionLabel}
          </Button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className={`border-2 ${statusInfo.className}`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <StatusIcon className="h-5 w-5" />
              <span className="font-medium">Status: {statusInfo.label}</span>
            </div>
          </CardContent>
        </Card>

        <Card
          className={`border-2 ${
            signup.isApproved === "1"
              ? "text-green-600 bg-green-50 border-green-200"
              : "text-yellow-600 bg-yellow-50 border-yellow-200"
          }`}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              {signup.isApproved === "1" ? (
                <>
                  <UserCheck className="h-5 w-5" />
                  <span className="font-medium">Approved</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="h-5 w-5" />
                  <span className="font-medium">Pending Approval</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card
          className={`border-2 ${
            signup.isSuspended === "1"
              ? "text-red-600 bg-red-50 border-red-200"
              : "text-gray-600 bg-gray-50 border-gray-200"
          }`}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              {signup.isSuspended === "1" ? (
                <>
                  <Ban className="h-5 w-5" />
                  <span className="font-medium">Suspended</span>
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">Not Suspended</span>
                </>
              )}
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
              <p className="text-sm">{signup.fullName}</p>
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
                Vendor ID
              </label>
              <p className="text-sm font-mono">{signup.vendorId}</p>
            </div>
          </CardContent>
        </Card>

        {/* Business Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Business Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {signup.businessName && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Business Name
                </label>
                <p className="text-sm">{signup.businessName}</p>
              </div>
            )}
            {signup.storeName && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Store Name
                </label>
                <p className="text-sm">{signup.storeName}</p>
              </div>
            )}
            {signup.businessCategory && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Business Category
                </label>
                <p className="text-sm">{signup.businessCategory}</p>
              </div>
            )}
            {signup.businessRegNumber && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Registration Number
                </label>
                <p className="text-sm">{signup.businessRegNumber}</p>
              </div>
            )}
            {signup.taxIdNumber && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Tax ID Number
                </label>
                <p className="text-sm">{signup.taxIdNumber}</p>
              </div>
            )}
            {signup.businessAddress && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Business Address
                </label>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <p className="text-sm">{signup.businessAddress}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Documents */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Documents
            </CardTitle>
            <CardDescription>
              Uploaded business documents and identification
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  ID Document
                </label>
                {signup.idDocument ? (
                  <div className="mt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setDocumentUrl(signup.idDocument!);
                        setShowDocumentModal(true);
                      }}
                      className="w-full justify-start"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View ID Document
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground mt-1">
                    Not provided
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Business Registration Certificate
                </label>
                {signup.businessRegCertificate ? (
                  <div className="mt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setDocumentUrl(signup.businessRegCertificate!);
                        setShowDocumentModal(true);
                      }}
                      className="w-full justify-start"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Registration Certificate
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground mt-1">
                    Not provided
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timestamps */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Created At
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
              {signup.approvedAt && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Approved At
                  </label>
                  <p className="text-sm">
                    {new Date(signup.approvedAt).toLocaleString()}
                  </p>
                </div>
              )}
              {signup.suspendedAt && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Suspended At
                  </label>
                  <p className="text-sm">
                    {new Date(signup.suspendedAt).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {showDocumentModal && documentUrl && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-3xl h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Document Viewer</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDocumentModal(false)}
              >
                Close
              </Button>
            </div>

            <div className="flex-1 overflow-hidden">
              {/* If it's an image */}
              {(documentUrl.endsWith(".jpg") ||
                documentUrl.endsWith(".jpeg") ||
                documentUrl.endsWith(".png")) && (
                <img
                  src={documentUrl}
                  alt="Document"
                  className="w-full h-full object-contain bg-black"
                />
              )}

              {/* Otherwise assume PDF */}
              {documentUrl.endsWith(".pdf") && (
                <iframe
                  src={documentUrl}
                  className="w-full h-full"
                  title="Document Viewer"
                />
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Suspend Modal */}
      {showSuspendModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ban className="h-5 w-5 text-destructive" />
                Suspend Vendor
              </CardTitle>
              <CardDescription>
                Provide a reason for suspension and required actions for the
                vendor
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Suspension Reason <span className="text-destructive">*</span>
                </label>
                <Input
                  value={suspensionReason}
                  onChange={(e) => setSuspensionReason(e.target.value)}
                  placeholder="e.g., Multiple customer complaints about product quality"
                  className="w-full"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Required Actions (one per line)
                </label>
                <textarea
                  value={requiredActions}
                  onChange={(e) => setRequiredActions(e.target.value)}
                  placeholder="Submit updated quality assurance documentation&#10;Provide written explanation of corrective measures"
                  className="w-full min-h-[100px] px-3 py-2 text-sm rounded-md border border-input bg-background"
                  rows={4}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Enter each required action on a new line
                </p>
              </div>

              <div className="flex items-center gap-2 pt-4">
                <Button
                  onClick={handleSuspend}
                  disabled={suspending || !suspensionReason.trim()}
                  variant="destructive"
                  className="flex-1"
                >
                  {suspending ? "Suspending..." : "Suspend Vendor"}
                </Button>
                <Button
                  onClick={() => {
                    setShowSuspendModal(false);
                    setSuspensionReason("");
                    setRequiredActions("");
                  }}
                  disabled={suspending}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Unsuspend Modal */}
      {showUnsuspendModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RotateCcw className="h-5 w-5 text-green-600" />
                Unsuspend Vendor
              </CardTitle>
              <CardDescription>
                Provide a reason for reinstating the vendor account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Reinstatement Reason{" "}
                  <span className="text-destructive">*</span>
                </label>
                <Input
                  value={reinstatementReason}
                  onChange={(e) => setReinstatementReason(e.target.value)}
                  placeholder="e.g., Quality assurance documentation satisfied"
                  className="w-full"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Notes (Optional)
                </label>
                <textarea
                  value={reinstatementNotes}
                  onChange={(e) => setReinstatementNotes(e.target.value)}
                  placeholder="Additional notes about the reinstatement"
                  className="w-full min-h-[100px] px-3 py-2 text-sm rounded-md border border-input bg-background"
                  rows={4}
                />
              </div>

              <div className="flex items-center gap-2 pt-4">
                <Button
                  onClick={handleUnsuspend}
                  disabled={unsuspending || !reinstatementReason.trim()}
                  variant="default"
                  className="flex-1"
                >
                  {unsuspending ? "Unsuspending..." : "Unsuspend Vendor"}
                </Button>
                <Button
                  onClick={() => {
                    setShowUnsuspendModal(false);
                    setReinstatementReason("");
                    setReinstatementNotes("");
                  }}
                  disabled={unsuspending}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
