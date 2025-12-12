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
import type { BuyerMessage, TicketMessage, SenderInfo } from "../types/api";
import toast from "react-hot-toast";
import { useAuthStore } from "../stores/authStore";
import { apiService } from "../services/api";

export function BuyerMessageDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const [message, setMessage] = useState<BuyerMessage | null>(null);
  const [ticketMessages, setTicketMessages] = useState<TicketMessage[]>([]);
  const [senderInfo, setSenderInfo] = useState<SenderInfo | null>(null);
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
    const fetchMessage = async () => {
      if (!id) return;

      setLoading(true);
      try {
        let ticketSubject = "Ticket";
        
        // Try to fetch ticket info to get subject (search in first few pages)
        try {
          for (let page = 1; page <= 3; page++) {
            const ticketsResponse = await apiService.getTickets(page, 10);
            const ticket = ticketsResponse.data?.tickets?.find(t => t.ticketId === id);
            if (ticket) {
              ticketSubject = ticket.subject;
              break;
            }
            // If we've reached the last page, stop searching
            if (ticketsResponse.data?.pagination?.currentPage >= ticketsResponse.data?.pagination?.totalPages) {
              break;
            }
          }
        } catch (error) {
          console.warn("Could not fetch ticket subject:", error);
        }
        
        // Fetch ticket messages
        const response = await apiService.getTicketMessages(id);
        if (response.data && response.data.messages) {
          const messages = response.data.messages;
          setTicketMessages(messages);
          
          // Get sender info from the first message (usually the buyer)
          const firstMessage = messages[0];
          if (firstMessage?.senderInfo) {
            setSenderInfo(firstMessage.senderInfo);
            
            // Map to BuyerMessage format for compatibility with existing UI
            const buyerMessage: BuyerMessage = {
              id: firstMessage.ticketId,
              name: firstMessage.senderInfo.name || "Buyer",
              email: firstMessage.senderInfo.email || "",
              phoneNumber: firstMessage.senderInfo.phone || "",
              subject: ticketSubject,
              message: firstMessage.message || "",
              createdAt: firstMessage.createdAt,
              updatedAt: messages[messages.length - 1]?.createdAt || firstMessage.createdAt,
            };
            setMessage(buyerMessage);
            
            // Pre-fill reply form with buyer's subject
            setReplyForm((prev) => ({
              ...prev,
              subject: `Re: ${ticketSubject}`,
            }));
          }
        }
      } catch (error) {
        console.error("Failed to fetch buyer message:", error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to load message";
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchMessage();
  }, [id]);

  const handleCopyPhoneNumber = () => {
    const phoneNumber = senderInfo?.phone || message?.phoneNumber;
    if (phoneNumber) {
      navigator.clipboard.writeText(phoneNumber);
      toast.success("Phone number copied to clipboard");
    }
  };

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id || !replyForm.message.trim()) {
      toast.error("Please enter a message");
      return;
    }

    try {
      await apiService.replyToTicket(id, replyForm.message);
      toast.success("Reply sent successfully");
      setShowReplyModal(false);
      setReplyForm({ ...replyForm, message: "" });
      
      // Refresh ticket messages to show the new reply
      const response = await apiService.getTicketMessages(id);
      if (response.data && response.data.messages) {
        setTicketMessages(response.data.messages);
      }
    } catch (error) {
      console.error("Failed to send reply:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to send reply";
      toast.error(errorMessage);
    }
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
      <div className="space-y-6 overflow-x-hidden">
        <div className="flex items-center gap-4">
          <Link to="/dashboard/buyer-messages">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Buyer Messages
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Buyer Message Details</h1>
        </div>

        <div className="grid gap-6 md:grid-cols-3 w-full max-w-full overflow-x-hidden">
          <div className="md:col-span-2 min-w-0 max-w-full overflow-x-hidden">
            <Card className="w-full max-w-full overflow-x-hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Messages
                </CardTitle>
                <CardDescription>Subject: {message.subject}</CardDescription>
              </CardHeader>
              <CardContent className="overflow-x-hidden">
                <div className="space-y-4 w-full max-w-full overflow-x-hidden">
                  {ticketMessages.length > 0 ? (
                    ticketMessages.map((msg) => (
                      <div
                        key={msg.messageId}
                        className={`p-4 rounded-lg border w-full max-w-full overflow-x-hidden ${
                          msg.isOwnMessage
                            ? "bg-primary/5 border-primary/20 ml-8"
                            : "bg-muted/50 mr-8"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2 gap-2">
                          <div className="min-w-0 flex-1 overflow-x-hidden">
                            <p className="font-medium text-sm break-words">
                              {msg.isOwnMessage
                                ? "You"
                                : msg.senderInfo?.name || "Buyer"}
                            </p>
                            {msg.senderInfo?.email && (
                              <p className="text-xs text-muted-foreground break-words">
                                {msg.senderInfo.email}
                              </p>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">
                            {msg.timeAgo || new Date(msg.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <p className="whitespace-pre-wrap text-sm break-words max-w-full">{msg.message}</p>
                      </div>
                    ))
                  ) : (
                    <div className="prose max-w-none w-full overflow-x-hidden">
                      <p className="whitespace-pre-wrap break-words max-w-full">{message.message}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6 min-w-0 max-w-full overflow-x-hidden">
            <Card className="w-full max-w-full overflow-x-hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Buyer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 overflow-x-hidden">
                <div className="overflow-x-hidden">
                  <label className="text-sm font-medium text-muted-foreground">
                    Full Name
                  </label>
                  <p className="font-medium break-words">{senderInfo?.name || message.name || "Buyer"}</p>
                </div>
                <div className="overflow-x-hidden">
                  <label className="text-sm font-medium text-muted-foreground">
                    Email
                  </label>
                  <div className="flex items-center gap-2 min-w-0">
                    <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <a
                      href={`mailto:${senderInfo?.email || message.email}`}
                      className="text-primary hover:underline break-words min-w-0 flex-1 overflow-x-hidden"
                    >
                      {senderInfo?.email || message.email}
                    </a>
                  </div>
                </div>
                {(senderInfo?.phone || message.phoneNumber) && (
                  <div className="overflow-x-hidden">
                    <label className="text-sm font-medium text-muted-foreground">
                      Phone Number
                    </label>
                    <div className="flex items-center gap-2 min-w-0">
                      <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="font-medium break-words min-w-0 flex-1">{senderInfo?.phone || message.phoneNumber}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCopyPhoneNumber}
                        className="h-8 w-8 p-0 flex-shrink-0"
                        title="Copy phone number"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
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

