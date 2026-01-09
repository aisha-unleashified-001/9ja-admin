import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { 
  ArrowLeft, 
  Building, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Package, 
  Globe,
  Calendar,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { apiService } from '../services/api';
import type { WaitlistEntry } from '../types/api';

export function WaitlistDetail() {
  const { id } = useParams<{ id: string }>();
  const [entry, setEntry] = useState<WaitlistEntry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEntry = async () => {
      if (!id) return;
      
      try {
        const response = await apiService.getWaitlistEntry(id);
        setEntry(response.data);
      } catch (error) {
        console.error('Failed to fetch waitlist entry:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEntry();
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/dashboard/waitlist">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Waitlist
            </Button>
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="h-6 bg-muted rounded w-1/2"></div>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/dashboard/waitlist">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Waitlist
            </Button>
          </Link>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Waitlist entry not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getBusinessName = () => entry.business_name || entry.businessName || 'N/A';
  const getFullName = () => entry.full_name || entry.fullName || 'N/A';
  const getBusinessType = () => entry.business_type || entry.businessType || 'N/A';
  const getStateOfOperation = () => entry.state_of_operation || entry.stateOfOperation || 'N/A';
  const getPhoneNumber = () => entry.phone_number || entry.phoneNumber || 'N/A';
  const getEmailAddress = () => entry.email_address || entry.emailAddress || 'N/A';
  const getProductCategories = () => {
    const categories = entry.product_categories || entry.productCategories || '[]';
    try {
      return JSON.parse(categories);
    } catch {
      return [];
    }
  };
  const getSpecialHandling = () => entry.special_handling || entry.specialHandling || '0';
  const getProductOrigin = () => entry.product_origin || entry.productOrigin || 'N/A';
  const getOnlinePresence = () => entry.online_presence || entry.onlinePresence || '0';
  const getOnlinePlatforms = () => entry.online_platforms || entry.onlinePlatforms || 'None';
  const getReceiveNotification = () => entry.receive_notification || entry.receiveNotification || '0';
  const getCreatedAt = () => entry.created_at || entry.createdAt || '';
  const getUpdatedAt = () => entry.updated_at || entry.updatedAt || '';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/dashboard/waitlist">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Waitlist
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Vendor Application</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Business Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Business Name</label>
              <p className="font-medium">{getBusinessName()}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Business Type</label>
              <p className="font-medium">{getBusinessType()}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">State of Operation</label>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <p className="font-medium">{getStateOfOperation()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Full Name</label>
              <p className="font-medium">{getFullName()}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a 
                  href={`mailto:${getEmailAddress()}`}
                  className="text-primary hover:underline font-medium"
                >
                  {getEmailAddress()}
                </a>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Phone Number</label>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <a 
                  href={`tel:${getPhoneNumber()}`}
                  className="text-primary hover:underline font-medium"
                >
                  {getPhoneNumber()}
                </a>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Applied</label>
              <p className="font-medium">
                {new Date(getCreatedAt()).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
              <p className="font-medium">
                {new Date(getUpdatedAt()).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Product Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Product Categories</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {getProductCategories().map((category: string, index: number) => (
                  <span 
                    key={index}
                    className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm"
                  >
                    {category}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Product Origin</label>
              <p className="font-medium">{getProductOrigin()}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Special Handling Required</label>
              <div className="flex items-center gap-2">
                {getSpecialHandling() === '1' ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <p className="font-medium">{getSpecialHandling() === '1' ? 'Yes' : 'No'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Online Presence
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Has Online Presence</label>
              <div className="flex items-center gap-2">
                {getOnlinePresence() === '1' ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <p className="font-medium">{getOnlinePresence() === '1' ? 'Yes' : 'No'}</p>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Online Platforms</label>
              <p className="font-medium">{getOnlinePlatforms()}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Receive Notifications</label>
              <div className="flex items-center gap-2">
                {getReceiveNotification() === '1' ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <p className="font-medium">{getReceiveNotification() === '1' ? 'Yes' : 'No'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {entry.message && (
          <Card className="md:col-span-3">
            <CardHeader>
              <CardTitle>Additional Message</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{entry.message}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}