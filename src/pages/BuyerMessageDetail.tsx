import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
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
  Mail,
  User,
  MessageSquare,
  Calendar,
  Phone,
  Copy,
  Send,
  X,
} from "lucide-react";
import type { BuyerMessage } from "../types/api";
import toast from "react-hot-toast";
import { useAuthStore } from "../stores/authStore";

// Mock data - will be replaced with API call when endpoint is available
const mockBuyerMessages: BuyerMessage[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john.doe@example.com",
    phoneNumber: "+234 801 234 5678",
    subject: "Order Inquiry",
    message:
      "I would like to know the status of my recent order. When can I expect delivery?",
    createdAt: "2025-12-08T10:27:51Z",
    updatedAt: "2025-12-08T10:27:51Z",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    phoneNumber: "+234 802 345 6789",
    subject: "Product Question",
    message:
      "Do you have this product in different sizes? I need a larger size.",
    createdAt: "2025-12-07T14:15:30Z",
    updatedAt: "2025-12-07T14:15:30Z",
  },
  {
    id: "3",
    name: "Michael Johnson",
    email: "michael.j@example.com",
    phoneNumber: "+234 803 456 7890",
    subject: "Return Request",
    message: "I received a damaged item. How do I proceed with a return?",
    createdAt: "2025-12-06T09:45:12Z",
    updatedAt: "2025-12-06T09:45:12Z",
  },
  {
    id: "4",
    name: "Sarah Williams",
    email: "sarah.w@example.com",
    phoneNumber: "+234 804 567 8901",
    subject: "Payment Issue",
    message: "I was charged twice for my order. Can you help resolve this?",
    createdAt: "2025-12-05T16:20:45Z",
    updatedAt: "2025-12-05T16:20:45Z",
  },
  {
    id: "5",
    name: "David Brown",
    email: "david.brown@example.com",
    phoneNumber: "+234 805 678 9012",
    subject: "Delivery Question",
    message:
      "Can I change my delivery address? The order hasn't shipped yet.",
    createdAt: "2025-12-04T11:30:20Z",
    updatedAt: "2025-12-04T11:30:20Z",
  },
];

export function BuyerMessageDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const [message, setMessage] = useState<BuyerMessage | null>(null);
  const [loading, setLoading] = useState(true);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyForm, setReplyForm] = useState({
    name: "9jaCart",
    email: user?.email || "admin@9jacart.ng",
    subject: "",
    message: "",
  });

  useEffect(() => {
    // Update email when user changes
    if (user?.email) {
      setReplyForm((prev) => ({ ...prev, email: user.email }));
    }
  }, [user]);

  useEffect(() => {
    // Simulate API call - will be replaced with actual API call when endpoint is available
    const fetchMessage = async () => {
      if (!id) return;

      setLoading(true);
      try {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        const foundMessage = mockBuyerMessages.find((msg) => msg.id === id);
        if (foundMessage) {
          setMessage(foundMessage);
          // Pre-fill reply form with buyer's subject
          setReplyForm((prev) => ({
            ...prev,
            subject: `Re: ${foundMessage.subject}`,
          }));
        }
      } catch (error) {
        console.error("Failed to fetch buyer message:", error);
        toast.error("Failed to load message");
      } finally {
        setLoading(false);
      }
    };

    fetchMessage();
  }, [id]);

  const handleCopyPhoneNumber = () => {
    if (message?.phoneNumber) {
      navigator.clipboard.writeText(message.phoneNumber);
      toast.success("Phone number copied to clipboard");
    }
  };

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // TODO: Replace with actual API call when endpoint is available
    // try {
    //   await apiService.replyToBuyerMessage(id, replyForm);
    //   toast.success("Reply sent successfully");
    //   setShowReplyModal(false);
    //   setReplyForm({ ...replyForm, message: "" });
    // } catch (error) {
    //   toast.error("Failed to send reply");
    // }

    // Mock implementation
    toast.success("Reply sent successfully (mock)");
    setShowReplyModal(false);
    setReplyForm({ ...replyForm, message: "" });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/dashboard/buyer-messages">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Buyer Messages
            </Button>
          </Link>
        </div>
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="h-6 bg-muted rounded w-1/3"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
              <div className="h-20 bg-muted rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!message) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/dashboard/buyer-messages">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Buyer Messages
            </Button>
          </Link>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Message not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link to="/dashboard/buyer-messages">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Buyer Messages
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Buyer Message Details</h1>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Message
                </CardTitle>
                <CardDescription>Subject: {message.subject}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="whitespace-pre-wrap">{message.message}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Buyer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Full Name
                  </label>
                  <p className="font-medium">{message.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Email
                  </label>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={`mailto:${message.email}`}
                      className="text-primary hover:underline"
                    >
                      {message.email}
                    </a>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Phone Number
                  </label>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{message.phoneNumber}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopyPhoneNumber}
                      className="h-8 w-8 p-0"
                      title="Copy phone number"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
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
                  <label className="text-sm font-medium text-muted-foreground">
                    Submitted
                  </label>
                  <p className="font-medium">
                    {new Date(message.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Last Updated
                  </label>
                  <p className="font-medium">
                    {new Date(message.updatedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Button
              onClick={() => setShowReplyModal(true)}
              className="w-full"
              size="lg"
            >
              <Send className="h-4 w-4 mr-2" />
              Reply
            </Button>
          </div>
        </div>
      </div>

      {/* Reply Modal */}
      {showReplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-2xl rounded-lg shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold">Reply to Buyer</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowReplyModal(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <form onSubmit={handleReplySubmit} className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Name</label>
                <Input
                  type="text"
                  value={replyForm.name}
                  onChange={(e) =>
                    setReplyForm({ ...replyForm, name: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Email</label>
                <Input
                  type="email"
                  value={replyForm.email}
                  onChange={(e) =>
                    setReplyForm({ ...replyForm, email: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Subject</label>
                <Input
                  type="text"
                  value={replyForm.subject}
                  onChange={(e) =>
                    setReplyForm({ ...replyForm, subject: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Message</label>
                <textarea
                  className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={replyForm.message}
                  onChange={(e) =>
                    setReplyForm({ ...replyForm, message: e.target.value })
                  }
                  required
                  placeholder="Type your reply message here..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowReplyModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  <Send className="h-4 w-4 mr-2" />
                  Send Reply
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

