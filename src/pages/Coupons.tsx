import { useState, useEffect, useRef } from "react";
import {
  Plus,
  Search,
  Pencil,
  ToggleLeft,
  ToggleRight,
  ChevronLeft,
  ChevronRight,
  X,
  Ticket,
  Filter,
  ChevronDown,
} from "lucide-react";
import { apiService } from "../services/api";
import type { Coupon, CouponPayload } from "../types/api";
import toast from "react-hot-toast";
import { cn } from "../lib/utils";

const DISCOUNT_TYPES = ["", "PERCENTAGE", "FIXED"] as const;
const LIMIT = 20;

const emptyForm: CouponPayload = {
  code: "",
  discountType: "PERCENTAGE",
  discountValue: 0,
  validFrom: "",
  validUntil: "",
};

export function Coupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [discountTypeFilter, setDiscountTypeFilter] = useState("");
  const [page, setPage] = useState(1);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [form, setForm] = useState<CouponPayload>(emptyForm);
  const [formErrors, setFormErrors] = useState<Partial<CouponPayload>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [togglingCode, setTogglingCode] = useState<string | null>(null);

  // Debounce search
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchCoupons = async (pg = page, q = search, dt = discountTypeFilter) => {
    setIsLoading(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res: any = await apiService.getCoupons({
        page: pg,
        limit: LIMIT,
        ...(q ? { search: q } : {}),
        ...(dt ? { discountType: dt } : {}),
      });

      // Response shape: { data: { coupons: [...], pagination: {...} } }
      const inner = res?.data;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rawList: any[] = Array.isArray(inner?.coupons)
        ? inner.coupons
        : Array.isArray(inner)
        ? inner
        : [];

      // Attempt to resolve a numeric id from any common field name
      const list: Coupon[] = rawList.map((c) => ({
        ...c,
        id: c.id ?? c.couponId ?? c.coupon_id ?? c.ID ?? undefined,
      }));

      setCoupons(list);

      const pag = inner?.pagination ?? res?.pagination;
      setPagination({
        currentPage: Number(pag?.currentPage ?? pg),
        totalPages: Number(pag?.totalPages ?? 1),
        totalItems: Number(pag?.total ?? pag?.totalItems ?? list.length),
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load coupons";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons(page, search, discountTypeFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, discountTypeFilter]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setPage(1);
      fetchCoupons(1, value, discountTypeFilter);
    }, 400);
  };

  // Close filter menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setShowFilterMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const openCreateModal = () => {
    setEditingCoupon(null);
    setForm(emptyForm);
    setFormErrors({});
    setModalOpen(true);
  };

  const openEditModal = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setForm({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      validFrom: coupon.validFrom?.slice(0, 10) ?? "",
      validUntil: coupon.validUntil?.slice(0, 10) ?? "",
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingCoupon(null);
    setForm(emptyForm);
    setFormErrors({});
  };

  const validateForm = (): boolean => {
    const errors: Partial<CouponPayload> = {};
    if (!form.code.trim()) errors.code = "Code is required";
    if (!form.discountValue || form.discountValue <= 0)
      errors.discountValue = 0; // Marker for error — handled in JSX
    if (!form.validFrom) errors.validFrom = "Valid from date is required";
    if (!form.validUntil) errors.validUntil = "Valid until date is required";
    if (form.validFrom && form.validUntil && form.validFrom >= form.validUntil)
      errors.validUntil = "Valid until must be after valid from";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      if (editingCoupon) {
        const identifier = editingCoupon.id ?? editingCoupon.code;
        await apiService.updateCoupon(identifier, form);
        toast.success("Coupon updated successfully");
      } else {
        await apiService.createCoupon(form);
        toast.success("Coupon created successfully");
      }
      closeModal();
      fetchCoupons(page, search, discountTypeFilter);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Operation failed";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggle = async (coupon: Coupon) => {
    const identifier = coupon.id ?? coupon.code;
    setTogglingCode(coupon.code);
    try {
      await apiService.toggleCouponStatus(identifier);
      toast.success(
        `Coupon ${coupon.isActive ? "deactivated" : "activated"} successfully`
      );
      fetchCoupons(page, search, discountTypeFilter);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to toggle coupon";
      toast.error(msg);
    } finally {
      setTogglingCode(null);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-NG", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDiscount = (coupon: Coupon) => {
    if (coupon.discountType === "PERCENTAGE") return `${coupon.discountValue}%`;
    return `₦${Number(coupon.discountValue).toLocaleString()}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Coupons</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage discount coupons for your platform
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Create Coupon
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by coupon code..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-input rounded-md text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="relative" ref={filterRef}>
          <button
            onClick={() => setShowFilterMenu((v) => !v)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 border rounded-md text-sm transition-colors",
              discountTypeFilter
                ? "bg-primary text-primary-foreground border-primary"
                : "border-input bg-background hover:bg-accent"
            )}
          >
            <Filter className="h-4 w-4" />
            {discountTypeFilter || "Discount Type"}
            <ChevronDown className="h-3 w-3" />
          </button>

          {showFilterMenu && (
            <div className="absolute top-full left-0 mt-1 w-44 bg-popover border border-border rounded-md shadow-lg z-10">
              {DISCOUNT_TYPES.map((type) => (
                <button
                  key={type || "all"}
                  onClick={() => {
                    setDiscountTypeFilter(type);
                    setPage(1);
                    setShowFilterMenu(false);
                  }}
                  className={cn(
                    "w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors",
                    discountTypeFilter === type && "bg-accent font-medium"
                  )}
                >
                  {type || "All Types"}
                </button>
              ))}
            </div>
          )}
        </div>

        {(search || discountTypeFilter) && (
          <button
            onClick={() => {
              setSearch("");
              setDiscountTypeFilter("");
              setPage(1);
              fetchCoupons(1, "", "");
            }}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
            Clear filters
          </button>
        )}

        <span className="ml-auto text-sm text-muted-foreground">
          {pagination.totalItems} coupon{pagination.totalItems !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Table */}
      <div className="border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Code
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Type
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Discount
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Valid From
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Valid Until
                </th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                  Status
                </th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-muted animate-pulse rounded" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : coupons.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-muted-foreground">
                      <Ticket className="h-10 w-10 opacity-30" />
                      <p className="font-medium">No coupons found</p>
                      <p className="text-xs">
                        {search || discountTypeFilter
                          ? "Try adjusting your filters"
                          : "Create your first coupon to get started"}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                coupons.map((coupon) => (
                  <tr
                    key={coupon.id}
                    className="border-b border-border hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3 font-mono font-medium">
                      {coupon.code}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                          coupon.discountType === "PERCENTAGE"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-purple-100 text-purple-700"
                        )}
                      >
                        {coupon.discountType === "PERCENTAGE"
                          ? "Percentage"
                          : "Fixed"}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {formatDiscount(coupon)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDate(coupon.validFrom)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatDate(coupon.validUntil)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                          coupon.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        )}
                      >
                        {coupon.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(coupon)}
                          className="p-1.5 rounded hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
                          title="Edit coupon"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleToggle(coupon)}
                          disabled={togglingCode === coupon.code}
                          className={cn(
                            "p-1.5 rounded transition-colors",
                            coupon.isActive
                              ? "text-green-600 hover:bg-green-50"
                              : "text-muted-foreground hover:bg-accent",
                            togglingCode === coupon.code && "opacity-50 cursor-not-allowed"
                          )}
                          title={coupon.isActive ? "Deactivate coupon" : "Activate coupon"}
                        >
                          {coupon.isActive ? (
                            <ToggleRight className="h-5 w-5" />
                          ) : (
                            <ToggleLeft className="h-5 w-5" />
                          )}
                        </button>
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
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {pagination.currentPage} of {pagination.totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || isLoading}
              className="flex items-center gap-1 px-3 py-1.5 border border-input rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>
            <button
              onClick={() =>
                setPage((p) => Math.min(pagination.totalPages, p + 1))
              }
              disabled={page >= pagination.totalPages || isLoading}
              className="flex items-center gap-1 px-3 py-1.5 border border-input rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent transition-colors"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background rounded-lg shadow-xl w-full max-w-lg mx-4 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">
                {editingCoupon ? "Edit Coupon" : "Create Coupon"}
              </h2>
              <button
                onClick={closeModal}
                className="p-1.5 rounded hover:bg-accent transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Code */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Coupon Code <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={form.code}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      code: e.target.value.toUpperCase(),
                    }))
                  }
                  placeholder="e.g. SAVE25"
                  className={cn(
                    "w-full px-3 py-2 border rounded-md text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring font-mono",
                    formErrors.code
                      ? "border-destructive"
                      : "border-input"
                  )}
                />
                {formErrors.code && (
                  <p className="text-xs text-destructive mt-1">
                    {formErrors.code}
                  </p>
                )}
              </div>

              {/* Discount Type */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Discount Type <span className="text-destructive">*</span>
                </label>
                <select
                  value={form.discountType}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      discountType: e.target.value as "PERCENTAGE" | "FIXED",
                    }))
                  }
                  className="w-full px-3 py-2 border border-input rounded-md text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="PERCENTAGE">Percentage (%)</option>
                  <option value="FIXED">Fixed Amount (₦)</option>
                </select>
              </div>

              {/* Discount Value */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Discount Value <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                    {form.discountType === "PERCENTAGE" ? "%" : "₦"}
                  </span>
                  <input
                    type="number"
                    min="1"
                    step={form.discountType === "PERCENTAGE" ? "0.01" : "1"}
                    max={form.discountType === "PERCENTAGE" ? "100" : undefined}
                    value={form.discountValue || ""}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        discountValue: parseFloat(e.target.value) || 0,
                      }))
                    }
                    placeholder={
                      form.discountType === "PERCENTAGE" ? "e.g. 25" : "e.g. 2500"
                    }
                    className={cn(
                      "w-full pl-7 pr-3 py-2 border rounded-md text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring",
                      formErrors.discountValue !== undefined
                        ? "border-destructive"
                        : "border-input"
                    )}
                  />
                </div>
                {formErrors.discountValue !== undefined && (
                  <p className="text-xs text-destructive mt-1">
                    Enter a valid discount value greater than 0
                  </p>
                )}
                {form.discountType === "PERCENTAGE" && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Enter a value between 1 and 100
                  </p>
                )}
              </div>

              {/* Date range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Valid From <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="date"
                    value={form.validFrom}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, validFrom: e.target.value }))
                    }
                    className={cn(
                      "w-full px-3 py-2 border rounded-md text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring",
                      formErrors.validFrom
                        ? "border-destructive"
                        : "border-input"
                    )}
                  />
                  {formErrors.validFrom && (
                    <p className="text-xs text-destructive mt-1">
                      {formErrors.validFrom}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Valid Until <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="date"
                    value={form.validUntil}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, validUntil: e.target.value }))
                    }
                    className={cn(
                      "w-full px-3 py-2 border rounded-md text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring",
                      formErrors.validUntil
                        ? "border-destructive"
                        : "border-input"
                    )}
                  />
                  {formErrors.validUntil && (
                    <p className="text-xs text-destructive mt-1">
                      {formErrors.validUntil}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-input rounded-md text-sm hover:bg-accent transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting
                    ? editingCoupon
                      ? "Updating..."
                      : "Creating..."
                    : editingCoupon
                    ? "Update Coupon"
                    : "Create Coupon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
