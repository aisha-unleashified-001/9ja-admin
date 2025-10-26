import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
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
  XCircle
} from 'lucide-react';
import { apiService } from '../services/api';
import type { VendorSignup } from '../types/api';

export function VendorSignupDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [signup, setSignup] = useState<VendorSignup | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toggling, setToggling] = useState(false);

  const fetchSignup = async () => {
    if (!id) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getVendorSignup(id);
      console.log('Vendor Signup Detail Response:', response);
      
      if (response.data) {
        setSignup(response.data);
      } else {
        setError('Vendor signup not found');
      }
    } catch (error) {
      console.error('Failed to fetch vendor signup:', error);
      setError(error instanceof Error ? error.message : 'Failed to load vendor signup');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSignup();
  }, [id]);

  const handleToggleStatus = async () => {
    if (!signup || !id) return;
    
    setToggling(true);
    try {
      await apiService.toggleVendorStatus(id);
      // Refresh the data to get updated status
      await fetchSignup();
    } catch (error) {
      console.error('Failed to toggle vendor status:', error);
      setError('Failed to update vendor status. Please try again.');
    } finally {
      setToggling(false);
    }
  };

  const getStatusInfo = (isActive: string) => {
    return isActive === '1' ? {
      label: 'Active',
      icon: CheckCircle,
      className: 'text-green-600 bg-green-50 border-green-200',
      actionLabel: 'Deactivate Vendor'
    } : {
      label: 'Inactive',
      icon: XCircle,
      className: 'text-red-600 bg-red-50 border-red-200',
      actionLabel: 'Activate Vendor'
    };
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate('/dashboard/vendor-signups')}>
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
          <Button variant="outline" size="sm" onClick={() => navigate('/dashboard/vendor-signups')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Vendor Signup Details</h1>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-destructive mb-4">{error || 'Vendor signup not found'}</p>
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate('/dashboard/vendor-signups')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Vendor Signup Details</h1>
        </div>
        
        <Button 
          onClick={handleToggleStatus}
          disabled={toggling}
          variant={signup.isActive === '1' ? 'destructive' : 'default'}
        >
          {toggling ? 'Updating...' : statusInfo.actionLabel}
        </Button>
      </div>

      {/* Status Card */}
      <Card className={`border-2 ${statusInfo.className}`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <StatusIcon className="h-5 w-5" />
            <span className="font-medium">Status: {statusInfo.label}</span>
          </div>
        </CardContent>
      </Card>

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
              <label className="text-sm font-medium text-muted-foreground">Full Name</label>
              <p className="text-sm">{signup.fullName}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Email Address</label>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm">{signup.emailAddress}</p>
              </div>
            </div>
            {signup.phoneNumber && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Phone Number</label>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm">{signup.phoneNumber}</p>
                </div>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-muted-foreground">Vendor ID</label>
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
                <label className="text-sm font-medium text-muted-foreground">Business Name</label>
                <p className="text-sm">{signup.businessName}</p>
              </div>
            )}
            {signup.storeName && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Store Name</label>
                <p className="text-sm">{signup.storeName}</p>
              </div>
            )}
            {signup.businessCategory && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Business Category</label>
                <p className="text-sm">{signup.businessCategory}</p>
              </div>
            )}
            {signup.businessRegNumber && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Registration Number</label>
                <p className="text-sm">{signup.businessRegNumber}</p>
              </div>
            )}
            {signup.taxIdNumber && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Tax ID Number</label>
                <p className="text-sm">{signup.taxIdNumber}</p>
              </div>
            )}
            {signup.businessAddress && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Business Address</label>
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
                <label className="text-sm font-medium text-muted-foreground">ID Document</label>
                {signup.idDocument ? (
                  <div className="mt-1">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => window.open(signup.idDocument!, '_blank')}
                      className="w-full justify-start"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View ID Document
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground mt-1">Not provided</p>
                )}
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Business Registration Certificate</label>
                {signup.businessRegCertificate ? (
                  <div className="mt-1">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => window.open(signup.businessRegCertificate!, '_blank')}
                      className="w-full justify-start"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Registration Certificate
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground mt-1">Not provided</p>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Created At</label>
                <p className="text-sm">{new Date(signup.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                <p className="text-sm">{new Date(signup.updatedAt).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}