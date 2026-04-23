import { useState, useRef } from "react";
import {
  Download,
  TrendingUp,
  ShoppingCart,
  BarChart2,
  Clock,
  RefreshCw,
  AlertCircle,
  Search,
  Store,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { useVendorAnalytics } from "../hooks/useVendorAnalytics";
import { getAnalyticsDefaults } from "../services/api";

// ─── Helpers ──────────────────────────────────────────────────────────────

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

const formatNumber = (value: number): string =>
  new Intl.NumberFormat("en-NG").format(value);

const getAccent = (index: number): string => {
  const opacities = [1, 0.82, 0.65, 0.5, 0.38, 0.28];
  return `rgba(34, 197, 94, ${opacities[index % opacities.length]})`;
};

// ─── Tiny reusable pieces ─────────────────────────────────────────────────

function EmptyState({ message }: { message: string }) {
  return (
    <p className="py-10 text-center text-sm text-muted-foreground">{message}</p>
  );
}

function SkeletonCard() {
  return (
    <Card className="animate-pulse">
      <CardContent className="p-6">
        <div className="h-3 bg-muted rounded w-2/3 mb-3" />
        <div className="h-7 bg-muted rounded w-1/2 mb-1" />
        <div className="h-3 bg-muted rounded w-1/3" />
      </CardContent>
    </Card>
  );
}

function SkeletonBlock({ height = "h-48" }: { height?: string }) {
  return (
    <Card className="animate-pulse">
      <CardContent className={`p-6 ${height}`}>
        <div className="h-4 bg-muted rounded w-1/3 mb-4" />
        <div className="h-full bg-muted rounded" />
      </CardContent>
    </Card>
  );
}

function KpiCard({
  label,
  value,
  sub,
  icon,
  iconBg,
}: {
  label: string;
  value: string;
  sub: string;
  icon: React.ReactNode;
  iconBg: string;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground mb-1 truncate">{label}</p>
            <p className="text-2xl font-bold tracking-tight truncate">{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{sub}</p>
          </div>
          <div className={`shrink-0 flex h-10 w-10 items-center justify-center rounded-lg ${iconBg}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function InsightMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-muted/30 p-3 text-center">
      <p className="text-lg font-bold tabular-nums">{value}</p>
      <p className="text-[11px] text-muted-foreground mt-0.5 leading-tight">{label}</p>
    </div>
  );
}

// ─── Vendor ID search bar ─────────────────────────────────────────────────

function VendorSearch({
  activeVendorId,
  onSearch,
}: {
  activeVendorId: string;
  onSearch: (id: string) => void;
}) {
  const [value, setValue] = useState(activeVendorId);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (trimmed) onSearch(trimmed);
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 w-full sm:max-w-lg">
      <div className="relative flex-1">
        <Store className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Paste vendor UUID here..."
          className="pl-9 font-mono text-sm"
        />
      </div>
      <Button
        type="submit"
        size="sm"
        className="gap-1.5 bg-green-600 hover:bg-green-700 text-white"
        disabled={!value.trim() || value.trim() === activeVendorId}
      >
        <Search className="h-4 w-4" />
        Load
      </Button>
    </form>
  );
}

// ─── Empty prompt ─────────────────────────────────────────────────────────

function NoVendorState() {
  return (
    <div className="flex flex-col items-center justify-center py-28 gap-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
        <Store className="h-8 w-8 text-muted-foreground" />
      </div>
      <div>
        <p className="font-semibold text-foreground">No vendor selected</p>
        <p className="text-sm text-muted-foreground mt-1">
          Enter a vendor ID above to load their analytics.
        </p>
      </div>
    </div>
  );
}

// ─── Analytics dashboard ──────────────────────────────────────────────────

function AnalyticsDashboard({ vendorId }: { vendorId: string }) {
  const { analyticsData, isLoading, error, refetch } = useVendorAnalytics(vendorId);
  const data = analyticsData ?? getAnalyticsDefaults();

  // Revenue chart uses "7d" series (mapped from weeklyRevenueOverview.dailyBreakdown)
  const revenueSeries = data.revenueSeries["7d"];
  const revenueValues = revenueSeries.map((s) => s.value);
  const highestRevenue = Math.max(...revenueValues, 1);
  const totalWeeklyRevenue = revenueValues.reduce((sum, v) => sum + v, 0);

  const insight = data.customerInsights["7d"];
  const topProducts = data.topSellingProducts["7d"];

  // ── Skeleton ──
  if (isLoading) {
    return (
      <div className="space-y-6 mt-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="xl:col-span-2"><SkeletonBlock height="h-64" /></div>
          <SkeletonBlock height="h-64" />
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <SkeletonBlock height="h-64" />
          <SkeletonBlock height="h-64" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-2">
      {/* Error banner */}
      {error && (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={refetch}
            className="flex items-center gap-1.5 text-xs font-medium hover:underline shrink-0"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </button>
        </div>
      )}

      {/* Active vendor badge */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Store className="h-3.5 w-3.5 shrink-0" />
        <span>Vendor</span>
        <code className="bg-muted px-1.5 py-0.5 rounded font-mono">{vendorId}</code>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          label="Total Revenue"
          value={formatCurrency(data.summaryCards.totalRevenue)}
          sub="All-time revenue"
          icon={<TrendingUp className="h-5 w-5 text-green-500" />}
          iconBg="bg-green-500/10"
        />
        <KpiCard
          label="Total Orders"
          value={formatNumber(data.summaryCards.totalOrders)}
          sub="All-time orders"
          icon={<ShoppingCart className="h-5 w-5 text-blue-500" />}
          iconBg="bg-blue-500/10"
        />
        <KpiCard
          label="Avg. Order Value"
          value={formatCurrency(data.summaryCards.avgOrderValue)}
          sub="Per transaction"
          icon={<BarChart2 className="h-5 w-5 text-purple-500" />}
          iconBg="bg-purple-500/10"
        />
        <KpiCard
          label="Pending Orders"
          value={formatNumber(data.inventorySnapshot.pendingOrders)}
          sub="Awaiting fulfillment"
          icon={<Clock className="h-5 w-5 text-orange-500" />}
          iconBg="bg-orange-500/10"
        />
      </div>

      {/* ── Revenue chart + Categories ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

        {/* Weekly revenue bar chart */}
        <Card className="xl:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <CardTitle className="text-base font-semibold">
                  Weekly Revenue Overview
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Daily revenue breakdown for the current week
                </p>
              </div>
              {totalWeeklyRevenue > 0 && (
                <span className="shrink-0 text-sm font-semibold text-green-600">
                  {formatCurrency(totalWeeklyRevenue)}
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {revenueSeries.length === 0 ? (
              <EmptyState message="No weekly revenue data available." />
            ) : (
              <div className="flex items-end gap-2 h-48 pt-4">
                {revenueSeries.map((point, i) => {
                  const heightPct = Math.max(
                    (point.value / highestRevenue) * 100,
                    8
                  );
                  return (
                    <div key={i} className="flex flex-col items-center gap-1 flex-1 group">
                      <span className="text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {point.value > 0 ? formatCurrency(point.value) : "—"}
                      </span>
                      <div
                        className="w-full rounded-t-sm transition-all duration-300"
                        style={{
                          height: `${heightPct}%`,
                          background:
                            point.value > 0
                              ? getAccent(i)
                              : "rgba(34,197,94,0.15)",
                        }}
                        title={`${point.label}: ${formatCurrency(point.value)}`}
                      />
                      <span className="text-[10px] text-muted-foreground truncate max-w-full">
                        {/* Show 3-letter abbreviation on small screens */}
                        {point.label.length > 3
                          ? point.label.slice(0, 3)
                          : point.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top categories */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              Sales by Category
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Top-performing product categories
            </p>
          </CardHeader>
          <CardContent>
            {data.salesByCategory.length === 0 ? (
              <EmptyState message="No category data available." />
            ) : (
              <div className="space-y-3.5">
                {data.salesByCategory.map((cat, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-foreground truncate max-w-[72%]">
                        {cat.category}
                      </span>
                      <span className="text-muted-foreground font-medium tabular-nums">
                        {cat.percentage.toFixed(0)}%
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(cat.percentage, 100)}%`,
                          background: getAccent(i),
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Top Products + Customer Insights ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">

        {/* Top selling products */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              Top Selling Products
            </CardTitle>
            <p className="text-xs text-muted-foreground">Ranked by units sold</p>
          </CardHeader>
          <CardContent>
            {topProducts.length === 0 ? (
              <EmptyState message="No product sales data available." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="pb-2.5 text-left font-medium text-muted-foreground text-xs uppercase tracking-wide">
                        Product
                      </th>
                      <th className="pb-2.5 text-right font-medium text-muted-foreground text-xs uppercase tracking-wide">
                        Sales
                      </th>
                      <th className="pb-2.5 text-right font-medium text-muted-foreground text-xs uppercase tracking-wide">
                        Revenue
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {topProducts.map((item, i) => (
                      <tr key={i} className="hover:bg-muted/30 transition-colors">
                        <td className="py-3 pr-4">
                          <span className="line-clamp-1 text-foreground">
                            {item.product}
                          </span>
                        </td>
                        <td className="py-3 text-right tabular-nums text-muted-foreground">
                          {formatNumber(item.sales)}
                        </td>
                        <td className="py-3 text-right tabular-nums font-medium">
                          {formatCurrency(item.revenue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Customer insights */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              Customer Insights
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Buyer behaviour &amp; location breakdown
            </p>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Metric mini-cards */}
            <div className="grid grid-cols-3 gap-3">
              <InsightMetric
                label="Total Customers"
                value={formatNumber(insight.totalCustomers)}
              />
              <InsightMetric
                label="New This Month"
                value={formatNumber(insight.newCustomers)}
              />
              <InsightMetric
                label="Repeat Buyers"
                value={formatNumber(insight.repeatBuyers)}
              />
            </div>

            {/* Customer locations */}
            {insight.locations.length > 0 ? (
              <div className="space-y-3">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Top Locations
                </p>
                {insight.locations.slice(0, 6).map((loc, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-foreground truncate max-w-[72%]">
                        {loc.state}
                      </span>
                      <span className="text-muted-foreground tabular-nums">
                        {loc.percentage.toFixed(0)}%
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(loc.percentage, 100)}%`,
                          background: getAccent(i),
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState message="No location data available." />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────

export function AnalyticsPage() {
  const [activeVendorId, setActiveVendorId] = useState("");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Enter a vendor ID to view their store analytics
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="border-green-500/50 text-green-600 hover:opacity-80 gap-2 self-start"
          onClick={() => {/* export placeholder */}}
        >
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Vendor ID search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Vendor ID</label>
            <p className="text-xs text-muted-foreground -mt-1">
              Paste a vendor's ID to load their performance data
            </p>
            <VendorSearch
              activeVendorId={activeVendorId}
              onSearch={setActiveVendorId}
            />
          </div>
        </CardContent>
      </Card>

      {/* Dashboard or empty prompt */}
      {activeVendorId ? (
        <AnalyticsDashboard key={activeVendorId} vendorId={activeVendorId} />
      ) : (
        <NoVendorState />
      )}
    </div>
  );
}
