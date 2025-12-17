import { useState, useEffect, useRef } from "react";
import OrdersIcon from "@/assets/Orders.png";
import deliveredIcon from "@/assets/package.png";
import returnsIcon from "@/assets/truck.png";
import canceledIcon from "@/assets/x.png";
import OrderDetailsModal from "./OrderDetailsModal";
import {
  Ellipsis,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Filter,
  ChevronDown,
} from "lucide-react";
import { useOrders } from "@/hooks/useOrders";
import toast from "react-hot-toast/headless";

const statusColors: Record<string, string> = {
  awaiting_pickup: "bg-yellow-100 text-yellow-700",
  completed: "bg-green-100 text-green-700",
  canceled: "bg-red-100 text-red-700",
  pending: "bg-blue-100 text-blue-700",
  order_confirmed: "bg-purple-100 text-purple-700",
  confirmed: "bg-purple-100 text-purple-700",
  returned: "bg-orange-100 text-orange-700",
  // Uppercase variants for API compatibility
  PENDING: "bg-blue-100 text-blue-700",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELED: "bg-red-100 text-red-700",
  CONFIRMED: "bg-purple-100 text-purple-700",
  RETURNED: "bg-orange-100 text-orange-700",
};

const paymentStatusColors: Record<string, string> = {
  paid: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  failed: "bg-red-100 text-red-700",
  refunded: "bg-blue-100 text-blue-700",
};

export default function OrdersPage() {
  // Destructure metrics and fetchMetrics from the hook
  const {
    orders,
    metrics,
    pagination,
    query,
    isLoading,
    fetchOrders,
    fetchMetrics,
    setQuery,
    updateOrderStatus,
  } = useOrders();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  const [activeActionId, setActiveActionId] = useState<string | null>(null);
  const [activeStatusDropdownId, setActiveStatusDropdownId] = useState<
    string | null
  >(null);
  const [statusDropdownPosition, setStatusDropdownPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);

  const [updatingStatus, setUpdatingStatus] = useState<{
    orderNo: string;
    status: string;
  } | null>(null);

  // -- UI State for Dropdowns --
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // -- Local Filter State (for the Filter Menu inputs) --
  const [filterValues, setFilterValues] = useState({
    startDate: query.startDate || "",
    endDate: query.endDate || "",
    paymentMethod: query.paymentMethod || "",
  });

  // Local UI state for Search
  const [search, setSearch] = useState(
    query.customerName || query.orderNo || ""
  );
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [status, setStatus] = useState(query.status?.toLowerCase() ?? "");

  const currentPage = query.page || 1;
  const totalPages = pagination?.totalPages || 1;

  // Refs for click-outside detection
  const sortRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);
  const statusDropdownRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
      if (
        filterRef.current &&
        !filterRef.current.contains(event.target as Node)
      ) {
        setIsFilterOpen(false);
      }
      // Close status dropdowns
      const clickedInsideStatusDropdown = Object.values(
        statusDropdownRefs.current
      ).some((ref) => ref && ref.contains(event.target as Node));
      if (!clickedInsideStatusDropdown) {
        setActiveStatusDropdownId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sync local filter state when query changes (e.g. clear filters)
  useEffect(() => {
    setFilterValues({
      startDate: query.startDate || "",
      endDate: query.endDate || "",
      paymentMethod: query.paymentMethod || "",
    });
  }, [query.startDate, query.endDate, query.paymentMethod]);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  // Sync local state if query changes externally
  useEffect(() => {
    const storeSearch = query.orderNo || query.customerName || "";
    if (storeSearch !== debouncedSearch) {
      setSearch(storeSearch);
      setDebouncedSearch(storeSearch);
    }

    const currentStatus = query.status?.toLowerCase() || "";
    if (currentStatus !== status) setStatus(currentStatus);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.orderNo, query.customerName, query.status]);

  useEffect(() => {
    const mappedStatus = status ? status.toUpperCase() : "";
    const cleanSearch = debouncedSearch.trim();
    const isOrderNo = cleanSearch.toUpperCase().startsWith("ORD");

    setQuery({
      page: 1,
      status: mappedStatus,
      orderNo: isOrderNo ? cleanSearch : "",
      customerName: !isOrderNo ? cleanSearch : "",
    });
  }, [debouncedSearch, status, setQuery]);

  useEffect(() => {
    const payload = {
      page: query.page,
      perPage: query.perPage,
      status: query.status,
      customerName: query.customerName,
      orderNo: query.orderNo,
      startDate: query.startDate,
      endDate: query.endDate,
      paymentMethod: query.paymentMethod,
      sortBy: query.sortBy,
    };
    fetchOrders(payload);
  }, [
    query.page,
    query.perPage,
    query.status,
    query.customerName,
    query.orderNo,
    query.startDate,
    query.endDate,
    query.paymentMethod,
    query.sortBy,
    fetchOrders,
  ]);

  useEffect(() => {
    if (fetchMetrics) {
      fetchMetrics();
    }
  }, [fetchMetrics]);

  const handleApplyFilter = () => {
    setQuery({
      page: 1,
      startDate: filterValues.startDate,
      endDate: filterValues.endDate,
      paymentMethod: filterValues.paymentMethod,
    });
    setIsFilterOpen(false);
  };

  const handleResetFilter = () => {
    setQuery({
      startDate: "",
      endDate: "",
      paymentMethod: "",
    });
    setFilterValues({ startDate: "", endDate: "", paymentMethod: "" });
    setIsFilterOpen(false);
  };

  const handleSort = (sortBy: string) => {
    setQuery({ sortBy });
    setIsSortOpen(false);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setQuery({ page: currentPage + 1 });
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setQuery({ page: currentPage - 1 });
  };

  const handlePageClick = (pageNumber: number) => {
    setQuery({ page: pageNumber });
  };

  const formatMoney = (value: unknown) =>
    `₦${Number(value ?? 0).toLocaleString()}`;

  const formatLabel = (value: unknown) =>
    value
      ? String(value)
          .replace(/_/g, " ")
          .replace(/\b\w/g, (char) => char.toUpperCase())
      : "N/A";

  return (
    <div className="p-6 text-white min-h-screen">
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}

      <h1 className="text-2xl font-bold mb-2 text-[#182F38]">Orders</h1>
      <p className="text-sm mb-6 text-[#182F38]">
        Organize all ordered products
      </p>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <MetricCard
          icon={OrdersIcon}
          title="Total orders"
          value={metrics?.totalOrders ?? 0}
        />
        <MetricCard
          icon={deliveredIcon}
          title="Delivered over time"
          value={metrics?.deliveredOrders ?? 0}
        />
        <MetricCard
          icon={returnsIcon}
          title="Returns"
          value={metrics?.returnedOrders ?? 0}
        />
        <MetricCard
          icon={canceledIcon}
          title="Canceled orders"
          value={metrics?.cancelledOrders ?? 0}
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-6 mb-6 text-sm text-black">
        {[
          { label: "All", value: "" },
          { label: "Pending", value: "pending" },
          { label: "Confirmed", value: "confirmed" },
          { label: "Completed", value: "completed" },
          { label: "Returned", value: "returned" },
        ].map((tab) => (
          <button
            key={tab.value || "all"}
            className={
              status === tab.value
                ? "text-[#1E4700] font-semibold"
                : "text-gray-500"
            }
            onClick={() => setStatus(tab.value)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search + Actions */}
      <div className="flex justify-between mb-4">
        <input
          type="text"
          placeholder="Find Order (Name or ORD-xxx)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-[#1E4700] text-[#1E4700] rounded px-3 py-2 text-sm w-60 focus:outline-none focus:ring-1 focus:ring-[#1E4700]"
        />

        <div className="flex gap-3">
          {/* SORT BUTTON */}
          <div className="relative" ref={sortRef}>
            <button
              onClick={() => setIsSortOpen(!isSortOpen)}
              className="flex items-center gap-2 border border-[#1E4700] text-[#1E4700] px-3 py-2 rounded text-sm hover:bg-[#F9FFF5]"
            >
              Sort By
              <ArrowUpDown className="w-3 h-3" />
            </button>
            {isSortOpen && (
              <div className="absolute right-0 top-full mt-2 w-40 bg-white border border-gray-100 rounded-lg shadow-xl z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                <button
                  onClick={() => handleSort("recent")}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                    query.sortBy === "recent"
                      ? "text-[#1E4700] font-semibold"
                      : "text-gray-600"
                  }`}
                >
                  Newest First
                </button>
                <button
                  onClick={() => handleSort("oldest")}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                    query.sortBy === "oldest"
                      ? "text-[#1E4700] font-semibold"
                      : "text-gray-600"
                  }`}
                >
                  Oldest First
                </button>
              </div>
            )}
          </div>

          {/* FILTER BUTTON */}
          <div className="relative" ref={filterRef}>
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center gap-2 border border-[#1E4700] text-[#1E4700] px-3 py-2 rounded text-sm hover:bg-[#F9FFF5]"
            >
              Filter
              <Filter className="w-3 h-3" />
            </button>
            {isFilterOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-gray-100 rounded-lg shadow-xl z-20 p-4 animate-in fade-in zoom-in-95 duration-100 text-[#182F38]">
                <div className="space-y-4">
                  {/* Date Range */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">
                      Date Range
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          type="date"
                          value={filterValues.startDate}
                          onChange={(e) =>
                            setFilterValues((prev) => ({
                              ...prev,
                              startDate: e.target.value,
                            }))
                          }
                          className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs focus:border-[#1E4700] outline-none"
                        />
                      </div>
                      <div className="relative flex-1">
                        <input
                          type="date"
                          value={filterValues.endDate}
                          onChange={(e) =>
                            setFilterValues((prev) => ({
                              ...prev,
                              endDate: e.target.value,
                            }))
                          }
                          className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs focus:border-[#1E4700] outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">
                      Payment Method
                    </label>
                    <select
                      value={filterValues.paymentMethod}
                      onChange={(e) =>
                        setFilterValues((prev) => ({
                          ...prev,
                          paymentMethod: e.target.value,
                        }))
                      }
                      className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs focus:border-[#1E4700] outline-none"
                    >
                      <option value="">All Methods</option>
                      <option value="card">Card</option>
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="cash">Cash</option>
                    </select>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={handleResetFilter}
                      className="flex-1 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-50 rounded border border-gray-200"
                    >
                      Reset
                    </button>
                    <button
                      onClick={handleApplyFilter}
                      className="flex-1 py-1.5 text-xs font-medium text-white bg-[#1E4700] hover:bg-[#163600] rounded"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <button className="border border-[#1E4700] text-[#1E4700] px-3 py-2 rounded text-sm hover:bg-[#F9FFF5]">
            Export
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto min-h-[400px] w-full overflow-y-visible">
        <div className="inline-block min-w-full align-middle">
          <table className="min-w-[2400px] w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-[#1E4700] text-white bg-[#1E4700]">
                <th className="px-4 py-3 text-left font-semibold w-12">
                  <input type="checkbox" />
                </th>
                <th className="px-4 py-3 text-left font-semibold min-w-[180px]">
                  Order ID
                </th>
                <th className="px-4 py-3 text-left font-semibold min-w-[160px]">
                  Date
                </th>
                <th className="px-4 py-3 text-left font-semibold min-w-[150px]">
                  Customer
                </th>
                <th className="px-4 py-3 text-left font-semibold min-w-[180px]">
                  Customer Email
                </th>
                <th className="px-4 py-3 text-left font-semibold min-w-[150px]">
                  Customer Phone
                </th>
                <th className="px-4 py-3 text-left font-semibold min-w-[120px]">
                  Total
                </th>
                <th className="px-4 py-3 text-left font-semibold min-w-[140px]">
                  Payment Status
                </th>
                <th className="px-4 py-3 text-left font-semibold min-w-[130px]">
                  Order Status
                </th>
                <th className="px-4 py-3 text-left font-semibold min-w-[140px]">
                  Payment Method
                </th>
                <th className="px-4 py-3 text-left font-semibold min-w-[140px]">
                  Vendor Earnings
                </th>
                <th className="px-4 py-3 text-left font-semibold min-w-[140px]">
                  Unique Vendors Count
                </th>
                <th className="px-4 py-3 text-left font-semibold min-w-[140px]">
                  Vendors Fees
                </th>
                <th className="px-4 py-3 text-left font-semibold min-w-[120px]">
                  Commission
                </th>
                <th className="px-4 py-3 text-left font-semibold min-w-[200px]">
                  Paystack Reference
                </th>
                <th className="px-4 py-3 text-left font-semibold min-w-[120px]">
                  Split Type
                </th>
                <th className="px-4 py-3 text-left font-semibold min-w-[180px]">
                  Split Code
                </th>
                <th className="px-4 py-3 text-left font-semibold min-w-[150px]">
                  Split Name
                </th>
                <th className="px-4 py-3 text-left font-semibold min-w-[130px]">
                  Shipment Fee
                </th>
                <th className="px-4 py-3 text-left font-semibold min-w-[100px]">
                  Items
                </th>
                <th className="px-4 py-3 text-center font-semibold w-16">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={21}
                    className="px-4 py-10 text-center text-[#182F38]"
                  >
                    Loading orders...
                  </td>
                </tr>
              ) : orders?.length === 0 ? (
                <tr>
                  <td
                    colSpan={21}
                    className="px-4 py-10 text-center text-[#182F38]"
                  >
                    No orders found.
                  </td>
                </tr>
              ) : (
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                orders.map((order: any) => (
                  <tr
                    key={order.orderNo}
                    className="border-b border-gray-200 text-[#333333] hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      <input type="checkbox" />
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap text-[#182F38] font-medium">
                      {order.orderNo}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-[#182F38]">
                      {order.createdAt}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-[#182F38]">
                      {order.customerName}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-[#182F38]">
                      {order.customerEmail || "N/A"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-[#182F38]">
                      {order.customerPhone || "N/A"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-[#182F38] font-medium">
                      {formatMoney(order.totalAmount)}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`inline-block px-3 py-1 rounded-lg text-xs font-medium capitalize ${
                          paymentStatusColors[
                            order.paymentStatus?.toLowerCase?.() || ""
                          ] || "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {order.paymentStatus ? order.paymentStatus : "N/A"}
                      </span>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap relative">
                      <div
                        className="relative inline-block"
                        ref={(el) => {
                          if (order.orderNo) {
                            statusDropdownRefs.current[order.orderNo] = el;
                          }
                        }}
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const button = e.currentTarget;
                            const rect = button.getBoundingClientRect();
                            setStatusDropdownPosition({
                              top: rect.bottom + 4,
                              left: rect.left,
                            });
                            setActiveStatusDropdownId(
                              activeStatusDropdownId === order.orderNo
                                ? null
                                : order.orderNo
                            );
                          }}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium ${
                            statusColors[order.status] ||
                            statusColors[order.status?.toLowerCase()] ||
                            "bg-gray-200 text-gray-700"
                          } hover:opacity-80 transition-opacity`}
                        >
                          {order.status}
                          <ChevronDown className="w-3 h-3" />
                        </button>

                        {/* Status Dropdown Menu */}
                        {activeStatusDropdownId === order.orderNo && (
                          <>
                            {/* Click outside overlay */}
                            <div
                              className="fixed inset-0 z-40"
                              onClick={() => {
                                setActiveStatusDropdownId(null);
                                setUpdatingStatus(null);
                              }}
                            />

                            {/* Dropdown */}
                            <div
                              className="fixed mt-2 w-36 bg-white rounded-lg shadow-xl border border-gray-100 py-1 z-50 flex flex-col animate-in fade-in zoom-in-95 duration-100 origin-top-left"
                              style={
                                statusDropdownPosition
                                  ? {
                                      top: statusDropdownPosition.top,
                                      left: statusDropdownPosition.left,
                                    }
                                  : undefined
                              }
                              onClick={(e) => e.stopPropagation()}
                            >
                              {[
                                "Pending",
                                "Confirmed",
                                // "Shipped",
                                "Completed",
                                "Returned",
                              ].map((statusOption, index) => {
                                const isCurrentStatus =
                                  order.status?.toUpperCase() ===
                                  statusOption.toUpperCase();

                                const isUpdating =
                                  updatingStatus?.orderNo === order.orderNo &&
                                  updatingStatus?.status === statusOption;

                                return (
                                  <button
                                    key={statusOption}
                                    disabled={isCurrentStatus || isUpdating}
                                    onClick={async () => {
                                      if (isCurrentStatus) return;

                                      setUpdatingStatus({
                                        orderNo: order.orderNo,
                                        status: statusOption,
                                      });

                                      const statusMap: Record<string, string> =
                                        {
                                          Pending: "PENDING",
                                          Confirmed: "CONFIRMED",
                                          // Shipped: "SHIPPED",
                                          Completed: "COMPLETED",
                                          Returned: "RETURNED",
                                        };

                                      const apiStatus = statusMap[statusOption];

                                      const result = await updateOrderStatus(
                                        order.orderNo,
                                        apiStatus
                                      );

                                      setUpdatingStatus(null);

                                      if (result?.success) {
                                        setActiveStatusDropdownId(null);
                                      } else {
                                        toast.error(
                                          result?.error ||
                                            "Failed to update order status"
                                        );
                                      }
                                    }}
                                    className={`w-full text-left px-4 py-2 text-sm transition-colors
              ${index < 4 ? "border-b border-gray-100" : ""}
              ${
                isCurrentStatus
                  ? "text-[#1E4700] font-semibold bg-gray-50 cursor-default"
                  : isUpdating
                  ? "text-gray-400 cursor-wait"
                  : "text-gray-600 hover:bg-gray-50 cursor-pointer"
              }`}
                                  >
                                    {isUpdating ? "Updating..." : statusOption}
                                  </button>
                                );
                              })}
                            </div>
                          </>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap text-[#182F38]">
                      {formatLabel(order.paymentMethod)}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap text-[#182F38] font-medium">
                      {formatMoney(
                        order.vendorEarnings ?? order.vendorOrderTotal
                      )}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap text-[#182F38]">
                      {(order.uniqueVendorsCount ??
                        (Array.isArray(order.vendors)
                          ? order.vendors.length
                          : 0)) ||
                        "N/A"}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap text-[#182F38] font-medium">
                      {formatMoney(order.vendorsFees ?? order.vendorFees)}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap text-[#182F38] font-medium">
                      {formatMoney(
                        order.commission ??
                          (order.totalAmount != null &&
                          order.vendorEarnings != null
                            ? Number(order.totalAmount) -
                              Number(order.vendorEarnings)
                            : undefined)
                      )}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap text-[#182F38] text-xs font-mono">
                      {order.paymentReference || "N/A"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-[#182F38]">
                      {formatLabel(
                        order.splitConfig?.type || order.splitPayment
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-[#182F38] text-xs font-mono">
                      {order.splitConfig?.subaccounts?.[0]?.subaccount ||
                        order.splitConfig?.bearer_type ||
                        order.splitCode ||
                        "N/A"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-[#182F38]">
                      {order.splitName ||
                        order.splitConfig?.bearer_type ||
                        formatLabel(order.splitConfig?.type) ||
                        "N/A"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-[#182F38] font-medium">
                      {formatMoney(order.shippingFee)}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap text-[#182F38]">
                      {order.totalItemsCount} items
                    </td>

                    {/* ACTION COLUMN WITH DROPDOWN */}
                    <td className="px-4 py-3 whitespace-nowrap text-center relative">
                      <div className="relative inline-block">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveActionId(
                              activeActionId === order.orderNo
                                ? null
                                : order.orderNo
                            );
                          }}
                          className={`p-1.5 rounded-full transition-colors ${
                            activeActionId === order.orderNo
                              ? "bg-gray-200 text-[#1E4700]"
                              : "hover:bg-gray-100 hover:text-[#1E4700]"
                          }`}
                        >
                          <Ellipsis className="w-5 h-5" />
                        </button>

                        {/* Dropdown Menu */}
                        {activeActionId === order.orderNo && (
                          <>
                            {/* Invisible Backdrop to close menu when clicking outside */}
                            <div
                              className="fixed inset-0 z-10 cursor-default"
                              onClick={() => setActiveActionId(null)}
                            />

                            {/* Menu Items */}
                            <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-lg shadow-xl z-20 border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-100 origin-top-right">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedOrder(order);
                                  setActiveActionId(null);
                                }}
                                className="w-full text-left px-4 py-3 text-sm text-[#182F38] hover:bg-gray-50 hover:text-[#1E4700] font-medium transition-colors"
                              >
                                View Details
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex justify-end mt-6 gap-2">
        <button
          onClick={handlePrevPage}
          disabled={currentPage === 1}
          className="w-9 h-9 flex items-center justify-center rounded-md border border-gray-300 bg-white text-[#182F38] hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {Array.from({ length: totalPages }).map((_, i) => {
          const pageNum = i + 1;
          const isActive = currentPage === pageNum;

          return (
            <button
              key={pageNum}
              onClick={() => handlePageClick(pageNum)}
              className={`w-9 h-9 flex items-center justify-center rounded-md text-sm font-medium transition-colors border
                ${
                  isActive
                    ? "bg-[#1E4700] text-white border-[#1E4700]"
                    : "bg-white text-[#182F38] border-gray-300 hover:bg-gray-50"
                }`}
            >
              {pageNum}
            </button>
          );
        })}

        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          className="w-9 h-9 flex items-center justify-center rounded-md border border-gray-300 bg-white text-[#182F38] hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function MetricCard({
  icon,
  title,
  value,
}: {
  icon: string;
  title: string;
  value: number;
}) {
  return (
    <div className="border border-[#1E4700] p-4 rounded-2xl bg-[#F9FFF5] flex items-center gap-3">
      <img
        src={icon}
        alt={title}
        className="w-12 h-12 bg-[#1E4700] p-2 rounded-full"
      />
      <div>
        <p className="text-sm text-[#182F38]">{title}</p>
        <p className="text-2xl font-bold text-[#1E4700]">{value}</p>
      </div>
    </div>
  );
}
