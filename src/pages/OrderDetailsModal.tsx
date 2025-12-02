/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo } from "react";
import { X, Check } from "lucide-react";
import { useOrderItems } from "@/hooks/useOrderItems";

interface OrderDetailsModalProps {
  order: any;
  onClose: () => void;
}

export default function OrderDetailsModal({
  order: initialOrderData,
  onClose,
}: OrderDetailsModalProps) {
  // Fetch data from your endpoint
  const { orderItems: fetchedData, isLoading } = useOrderItems(
    initialOrderData?.orderNo
  );

  const { items, enrichedOrder } = useMemo(() => {
    // Handle case where fetchedData is an array (from store) or an object with data/items
    let apiData: any = {};
    let itemsList: any[] = [];

    if (Array.isArray(fetchedData)) {
      // If fetchedData is already an array, use it directly as items
      itemsList = fetchedData;
      apiData = {};
    } else if (fetchedData && typeof fetchedData === "object") {
      // If fetchedData is an object, check for .data or use it directly
      apiData = (fetchedData as any)?.data || fetchedData || {};

      // Check if we found a valid object containing 'items'
      const hasItems = apiData && "items" in apiData;

      // Extract the items array safely
      itemsList = hasItems && Array.isArray(apiData.items) ? apiData.items : [];
    }

    // Merge initial data (table) with detailed data (API)
    const mergedOrder = {
      ...initialOrderData,
      ...apiData,
    };

    return { items: itemsList, enrichedOrder: mergedOrder };
  }, [fetchedData, initialOrderData]);

  if (!initialOrderData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md h-[90vh] rounded-2xl overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-[#182F38]">
              {enrichedOrder.orderNo}
            </h2>
            <p className="text-xs text-gray-400">Order details</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          {/* Items Section */}
          <section>
            <h3 className="text-sm font-semibold text-[#182F38] mb-3">Items</h3>
            <div className="space-y-4">
              {isLoading ? (
                <p className="text-sm text-gray-400">Loading items...</p>
              ) : items.length === 0 ? (
                <p className="text-sm text-gray-400">No items found.</p>
              ) : (
                items.map((item: any, idx: number) => (
                  <div key={idx} className="flex gap-4 items-start">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden flex items-center justify-center">
                      <img
                        src={item.productImages[0] || "/placeholder.png"}
                        alt={item.productName}
                        className="w-full h-full object-cover opacity-80"
                        onError={(e) =>
                          (e.currentTarget.style.display = "none")
                        }
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h4 className="text-sm font-medium text-[#182F38]">
                          {item.productName || "Product Name"}
                        </h4>
                        <span className="text-sm font-bold text-[#182F38]">
                          ₦{Number(item.price).toLocaleString()}
                        </span>
                      </div>

                      <p className="text-xs text-gray-500 mt-1">
                        {item.category || "General"}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        {item.quantity}pcs
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Details Grid */}
          <section className="grid grid-cols-2 gap-y-4 text-sm">
            <div>
              <p className="text-gray-400 text-xs mb-1">Created at</p>
              <p className="font-medium text-[#182F38]">
                {enrichedOrder.createdAt || enrichedOrder.orderDate}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-xs mb-1">Payment method</p>
              <p className="font-medium text-[#182F38] capitalize">
                {enrichedOrder.paymentMethod || "Bank Transfer"}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-xs mb-1">Status</p>
              <p className="font-medium text-[#1E4700] capitalize">
                {enrichedOrder.status?.replace("_", " ") ||
                  enrichedOrder.orderStatus}
              </p>
            </div>
          </section>

          <hr className="border-gray-100" />

          {/* Customer Info */}
          <section className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Customer name</span>
              <span className="font-medium text-[#182F38]">
                {enrichedOrder.customerName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Email</span>
              <span className="font-medium text-[#182F38]">
                {enrichedOrder.customerEmail || enrichedOrder.email || "N/A"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Phone</span>
              <span className="font-medium text-[#182F38]">
                {enrichedOrder.customerPhone || enrichedOrder.phone || "N/A"}
              </span>
            </div>
          </section>

          <hr className="border-gray-100" />

          {/* Timeline */}
          <section>
            <h3 className="text-sm font-semibold text-[#182F38] mb-4">
              Timeline
            </h3>
            <Timeline
              status={enrichedOrder.status || enrichedOrder.orderStatus}
            />
          </section>
        </div>

        {/* Footer / Payment Totals */}
        <div className="p-6 bg-gray-50 border-t border-gray-100 mt-auto">
          <h3 className="text-xs font-bold text-gray-500 mb-3 uppercase">
            Payment
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-[#182F38]">
              <span>Subtotal</span>
              <span className="font-bold">
                ₦
                {Number(
                  enrichedOrder.vendorOrderTotal ||
                    enrichedOrder.subtotal ||
                    enrichedOrder.totalAmount ||
                    0
                ).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-[#182F38]">
              <span>Shipping fee</span>
              <span className="font-bold">
                ₦{Number(enrichedOrder.shippingFee || 0).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-[#1E4700] text-base mt-2 pt-2 border-t border-gray-200">
              <span className="font-bold">Total</span>
              <span className="font-bold">
                ₦
                {Number(
                  enrichedOrder.vendorOrderTotal ||
                    enrichedOrder.totalAmount ||
                    0
                ).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Timeline component remains unchanged
const Timeline = ({ status }: { status: string }) => {
  const steps = [
    { label: "Order Placed", id: "placed" },
    { label: "Order Confirmed", id: "confirmed" },
    { label: "Awaiting Pickup", id: "awaiting_pickup" },
    { label: "In Transit", id: "transit" },
    { label: "Order Delivered", id: "delivered" },
  ];

  const getStatusIndex = (s: string) => {
    if (!s) return 0;
    const lower = s.toLowerCase();
    if (lower.includes("delivered")) return 4;
    if (lower.includes("transit")) return 3;
    if (lower.includes("pickup") || lower.includes("processed")) return 2;
    if (lower.includes("confirmed") || lower.includes("pending")) return 1;
    return 0;
  };

  const activeIndex = getStatusIndex(status || "");

  return (
    <div className="relative pl-2">
      {steps.map((step, index) => {
        const isCompleted = index <= activeIndex;
        const isLast = index === steps.length - 1;

        return (
          <div
            key={step.id}
            className="relative flex items-start pb-6 last:pb-0"
          >
            {!isLast && (
              <div
                className={`absolute left-[11px] top-6 w-[2px] h-full -ml-[1px] ${
                  index < activeIndex ? "bg-[#1E4700]" : "bg-gray-200"
                }`}
              />
            )}

            <div
              className={`z-10 flex items-center justify-center w-6 h-6 rounded-full border-2 flex-shrink-0 ${
                isCompleted
                  ? "bg-[#1E4700] border-[#1E4700] text-white"
                  : "bg-white border-gray-300"
              }`}
            >
              {isCompleted && <Check className="w-3 h-3" />}
            </div>

            <div className="ml-4 pt-[1px]">
              <p
                className={`text-sm font-medium ${
                  isCompleted ? "text-[#182F38]" : "text-gray-400"
                }`}
              >
                {step.label}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
