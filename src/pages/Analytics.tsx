import { useState, useRef, useEffect, useMemo } from "react";
import {
  Download,
  TrendingUp,
  ShoppingCart,
  BarChart2,
  LineChart,
  RotateCcw,
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
import { apiService } from "../services/api";
import type { VendorSignup, WeeklyRevenuePoint } from "../types/api";

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

// Primary brand colour: #1E4700 → rgb(30, 71, 0)
const getAccent = (index: number): string => {
  const opacities = [1, 0.82, 0.65, 0.5, 0.38, 0.28];
  return `rgba(30, 71, 0, ${opacities[index % opacities.length]})`;
};

const WEEK_DAYS_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

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

interface VendorOption {
  vendorId: string;
  fullName: string;
  emailAddress: string;
  storeName: string;
}

// ─── Vendor search bar ────────────────────────────────────────────────────

function VendorSearch({
  activeSearch,
  vendorOptions,
  optionsLoading,
  onSearch,
}: {
  activeSearch: string;
  vendorOptions: VendorOption[];
  optionsLoading: boolean;
  onSearch: (value: string, vendor?: VendorOption) => void;
}) {
  const [value, setValue] = useState(activeSearch);
  const inputRef = useRef<HTMLInputElement>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<VendorOption | null>(null);

  useEffect(() => {
    setValue(activeSearch);
    if (!activeSearch) {
      setSelectedVendor(null);
    }
  }, [activeSearch]);

  const normalizedQuery = value.trim().toLowerCase();
  const suggestions = useMemo(() => {
    if (!normalizedQuery) return [];
    return vendorOptions
      .filter((vendor) => {
        const name = vendor.fullName?.toLowerCase() ?? "";
        const email = vendor.emailAddress?.toLowerCase() ?? "";
        const store = vendor.storeName?.toLowerCase() ?? "";
        return (
          name.includes(normalizedQuery) ||
          email.includes(normalizedQuery) ||
          store.includes(normalizedQuery)
        );
      })
      .slice(0, 8);
  }, [normalizedQuery, vendorOptions]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    if (selectedVendor) {
      onSearch(selectedVendor.emailAddress, selectedVendor);
      setShowSuggestions(false);
      return;
    }

    const exactMatch = vendorOptions.find((vendor) => {
      const t = trimmed.toLowerCase();
      return (
        vendor.fullName?.trim().toLowerCase() === t ||
        vendor.emailAddress?.trim().toLowerCase() === t ||
        (vendor.storeName?.trim().toLowerCase() ?? "") === t
      );
    });

    if (exactMatch) {
      setSelectedVendor(exactMatch);
      setValue(exactMatch.fullName || exactMatch.emailAddress);
      onSearch(exactMatch.emailAddress, exactMatch);
      setShowSuggestions(false);
      return;
    }

    onSearch(trimmed);
    setShowSuggestions(false);
  };

  const handleSuggestionSelect = (vendor: VendorOption) => {
    setSelectedVendor(vendor);
    setValue(vendor.fullName || vendor.emailAddress);
    onSearch(vendor.emailAddress, vendor);
    setShowSuggestions(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 w-full sm:max-w-lg">
      <div className="relative flex-1">
        <Store className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          ref={inputRef}
          value={value}
          onChange={(e) => {
            const next = e.target.value;
            setValue(next);
            setSelectedVendor(null);
            if (next === "") {
              onSearch("");
              setShowSuggestions(false);
            } else {
              setShowSuggestions(true);
            }
          }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => {
            setTimeout(() => setShowSuggestions(false), 120);
          }}
          placeholder="Search by name, store name or email..."
          className="pl-9 text-sm"
        />
        {showSuggestions && normalizedQuery ? (
          <div className="absolute z-20 mt-1 w-full rounded-md border border-border bg-popover shadow-md">
            {optionsLoading ? (
              <p className="px-3 py-2 text-xs text-muted-foreground">
                Loading vendors...
              </p>
            ) : suggestions.length === 0 ? (
              <p className="px-3 py-2 text-xs text-muted-foreground">
                No matching vendors found
              </p>
            ) : (
              <ul className="max-h-64 overflow-auto py-1">
                {suggestions.map((vendor) => (
                  <li key={vendor.vendorId || vendor.emailAddress}>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleSuggestionSelect(vendor)}
                      className="w-full px-3 py-2 text-left hover:bg-muted/60 transition-colors"
                    >
                      <p className="text-sm font-medium text-foreground truncate">
                        {vendor.fullName || "Unnamed Vendor"}
                        {vendor.storeName && (
                          <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                            · {vendor.storeName}
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {vendor.emailAddress}
                      </p>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : null}
      </div>
      <Button
        type="submit"
        size="sm"
        className="gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground"
        disabled={!value.trim()}
      >
        <Search className="h-4 w-4" />
        Load
      </Button>
    </form>
  );
}

// ─── Weekly comparison line chart ─────────────────────────────────────────

function WeeklyComparisonChart({
  thisWeek,
  lastWeek,
}: {
  thisWeek: WeeklyRevenuePoint[];
  lastWeek: WeeklyRevenuePoint[];
}) {
  const [hovered, setHovered] = useState<number | null>(null);

  const allRevenues = [
    ...thisWeek.map((p) => p.revenue),
    ...lastWeek.map((p) => p.revenue),
  ];
  const maxVal = Math.max(...allRevenues, 1);

  const VW = 560, VH = 180;
  const pl = 8, pr = 12, pt = 10, pb = 32;
  const chartW = VW - pl - pr;
  const chartH = VH - pt - pb;
  const n = 7;

  const toX = (i: number) => pl + (i / (n - 1)) * chartW;
  const toY = (val: number) => pt + chartH - (val / maxVal) * chartH;

  const thisWeekPts = thisWeek
    .slice(0, n)
    .map((p, i): [number, number] => [toX(i), toY(p.revenue)]);
  const lastWeekPts = lastWeek
    .slice(0, n)
    .map((p, i): [number, number] => [toX(i), toY(p.revenue)]);

  const pathD = (pts: [number, number][]) =>
    pts
      .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`)
      .join(" ");

  const hasThisWeek = thisWeek.some((p) => p.revenue > 0);
  const hasLastWeek = lastWeek.some((p) => p.revenue > 0);


  return (
    <div>
      {/* Legend + hover readout */}
      <div className="flex flex-wrap items-center gap-4 mb-3">
        <div className="flex items-center gap-1.5">
          <div className="h-0.5 w-5 rounded-full bg-primary" />
          <span className="text-[11px] text-muted-foreground">This Week</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-0.5 w-5 rounded-full bg-blue-400" />
          <span className="text-[11px] text-muted-foreground">Last Week</span>
        </div>
        {hovered !== null && (
          <div className="ml-auto flex items-center gap-3 text-[11px] font-medium">
            <span className="text-muted-foreground">{WEEK_DAYS_LABELS[hovered]}</span>
            <span className="text-primary">
              {formatCurrency(thisWeek[hovered]?.revenue ?? 0)}
            </span>
            <span className="text-blue-500">
              {formatCurrency(lastWeek[hovered]?.revenue ?? 0)}
            </span>
          </div>
        )}
      </div>

      <svg viewBox={`0 0 ${VW} ${VH}`} width="100%" style={{ height: "180px" }}>
        {/* Horizontal grid lines */}
        {([0.25, 0.5, 0.75, 1] as const).map((pct) => {
          const y = toY(maxVal * pct);
          return (
            <line
              key={pct}
              x1={pl} y1={y}
              x2={pl + chartW} y2={y}
              stroke="#e5e7eb"
              strokeWidth="0.8"
              strokeDasharray="4,4"
            />
          );
        })}

        {/* Last week line */}
        {hasLastWeek && (
          <path
            d={pathD(lastWeekPts)}
            fill="none"
            stroke="rgba(96,165,250,0.75)"
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        )}

        {/* This week line */}
        {hasThisWeek && (
          <path
            d={pathD(thisWeekPts)}
            fill="none"
            stroke="var(--primary)"
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        )}

        {/* Points + labels + hit areas */}
        {WEEK_DAYS_LABELS.map((day, i) => (
          <g key={day}>
            {hovered === i && (
              <line
                x1={toX(i)} y1={pt}
                x2={toX(i)} y2={pt + chartH}
                stroke="#d1d5db"
                strokeWidth="1"
                strokeDasharray="4,2"
              />
            )}
            {hasLastWeek && (
              <circle
                cx={lastWeekPts[i][0]}
                cy={lastWeekPts[i][1]}
                r={hovered === i ? 5 : 3.5}
                fill="rgba(96,165,250,0.9)"
                stroke="white"
                strokeWidth="1.5"
                style={{ pointerEvents: "none" }}
              />
            )}
            {hasThisWeek && (
              <circle
                cx={thisWeekPts[i][0]}
                cy={thisWeekPts[i][1]}
                r={hovered === i ? 5 : 3.5}
                fill="var(--primary)"
                stroke="white"
                strokeWidth="1.5"
                style={{ pointerEvents: "none" }}
              />
            )}
            <text
              x={toX(i)}
              y={VH - 8}
              textAnchor="middle"
              fontSize="13"
              fill="#9ca3af"
            >
              {day}
            </text>
            {/* Invisible hit area for hover */}
            <rect
              x={toX(i) - 35}
              y={pt}
              width="70"
              height={chartH + 4}
              fill="transparent"
              style={{ cursor: "crosshair" }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            />
          </g>
        ))}
      </svg>
    </div>
  );
}

// ─── Analytics dashboard ──────────────────────────────────────────────────

function AnalyticsDashboard({
  searchValue,
  searchRequestKey,
  selectedVendor,
}: {
  searchValue: string;
  searchRequestKey: number;
  selectedVendor: VendorOption | null;
}) {
  const { analyticsData, isLoading, error, refetch } = useVendorAnalytics(
    searchValue,
    searchRequestKey
  );
  const data = analyticsData ?? getAnalyticsDefaults();

  const [chartMode, setChartMode] = useState<"bar" | "compare">("bar");

  // Revenue chart — always show 7 bars (Mon–Sun).
  // Fall back to zero-value placeholders when the API returns nothing.
  const revenueSeries = data.revenueSeries["7d"] ?? [];
  const chartSeries =
    revenueSeries.length > 0
      ? revenueSeries
      : (WEEK_DAYS_LABELS as readonly string[]).map((day) => ({ label: day, value: 0 }));
  // Safe divisor: always ≥ 1 so bar heights never produce NaN/Infinity.
  const chartPeak = chartSeries.reduce((max, s) => Math.max(max, s.value), 1);
  const isChartEmpty = !chartSeries.some((s) => s.value > 0);
  const totalWeeklyRevenue = chartSeries.reduce((sum, s) => sum + s.value, 0);

  // Defensive fallback so the component never crashes if older API data
  // doesn't include weeklyRevenueComparison yet.
  const weeklyComparison = data.weeklyRevenueComparison ?? {
    thisWeek: (WEEK_DAYS_LABELS as readonly string[]).map((day) => ({ day, revenue: 0 })),
    lastWeek: (WEEK_DAYS_LABELS as readonly string[]).map((day) => ({ day, revenue: 0 })),
  };
  const thisWeekTotal = weeklyComparison.thisWeek.reduce((sum, p) => sum + p.revenue, 0);
  const lastWeekTotal = weeklyComparison.lastWeek.reduce((sum, p) => sum + p.revenue, 0);

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

      {searchValue ? (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Store className="h-3.5 w-3.5 shrink-0" />
          <span>Filtered by</span>
          {selectedVendor ? (
            <code className="bg-muted px-1.5 py-0.5 rounded">
              {selectedVendor.fullName}
              {selectedVendor.storeName ? ` · ${selectedVendor.storeName}` : ""}
              {" "}({selectedVendor.emailAddress})
            </code>
          ) : (
            <code className="bg-muted px-1.5 py-0.5 rounded">{searchValue}</code>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Store className="h-3.5 w-3.5 shrink-0" />
          <span>Showing general analytics for all vendors</span>
        </div>
      )}

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          label="Total Revenue"
          value={formatCurrency(data.summaryCards.totalRevenue)}
          sub="All-time revenue"
          icon={<TrendingUp className="h-5 w-5 text-primary" />}
          iconBg="bg-primary/10"
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

        {/* Weekly revenue bar chart / comparison */}
        <Card className="xl:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <CardTitle className="text-base font-semibold">
                  Weekly Revenue Overview
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {chartMode === "bar"
                    ? "Daily revenue breakdown for the current week"
                    : "This week vs last week comparison"}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {/* Running totals */}
                {chartMode === "bar" && totalWeeklyRevenue > 0 && (
                  <span className="text-sm font-semibold text-primary">
                    {formatCurrency(totalWeeklyRevenue)}
                  </span>
                )}
                {chartMode === "compare" && (
                  <div className="hidden sm:flex items-center gap-1.5 text-xs">
                    <span className="font-semibold text-primary">
                      {formatCurrency(thisWeekTotal)}
                    </span>
                    <span className="text-muted-foreground">/</span>
                    <span className="font-semibold text-blue-500">
                      {formatCurrency(lastWeekTotal)}
                    </span>
                  </div>
                )}
                {/* Chart mode toggle */}
                <div className="flex rounded-md border border-border overflow-hidden text-xs">
                  <button
                    onClick={() => setChartMode("bar")}
                    className={`flex items-center gap-1 px-2.5 py-1.5 transition-colors ${
                      chartMode === "bar"
                        ? "bg-primary text-primary-foreground"
                        : "bg-transparent text-muted-foreground hover:bg-muted"
                    }`}
                    title="This week bar chart"
                  >
                    <BarChart2 className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">This Week</span>
                  </button>
                  <button
                    onClick={() => setChartMode("compare")}
                    className={`flex items-center gap-1 px-2.5 py-1.5 transition-colors border-l border-border ${
                      chartMode === "compare"
                        ? "bg-primary text-primary-foreground"
                        : "bg-transparent text-muted-foreground hover:bg-muted"
                    }`}
                    title="Compare with last week"
                  >
                    <LineChart className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Compare</span>
                  </button>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {chartMode === "bar" ? (
              /* BAR_MAX_PX: h-48 (192px) minus pt-4 (16px) top padding, minus
                 ~18px for the value label and ~18px for the day label = 140px
                 usable bar area. Pixel heights are used instead of % because
                 the column div has no explicit height to resolve against. */
              <div className="flex items-end gap-2 h-48 pt-2">
                {chartSeries.map((point, i) => {
                  const BAR_MAX_PX = 130;
                  const barHeightPx = isChartEmpty
                    ? 44
                    : Math.max(Math.round((point.value / chartPeak) * BAR_MAX_PX), 10);
                  const barBg = isChartEmpty
                    ? `rgba(30, 71, 0, 0.40)`
                    : point.value > 0
                    ? getAccent(i)
                    : `rgba(30, 71, 0, 0.18)`;
                  return (
                    <div key={i} className="flex flex-col items-center gap-1 flex-1">
                      <span className="text-[10px] font-medium text-foreground whitespace-nowrap tabular-nums">
                        {point.value > 0 ? formatCurrency(point.value) : "—"}
                      </span>
                      <div
                        className="w-full rounded-t-sm transition-all duration-300"
                        style={{
                          height: `${barHeightPx}px`,
                          background: barBg,
                        }}
                        title={
                          point.value > 0
                            ? `${point.label}: ${formatCurrency(point.value)}`
                            : point.label
                        }
                      />
                      <span className="text-[10px] text-muted-foreground truncate max-w-full">
                        {point.label.slice(0, 3)}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <WeeklyComparisonChart
                thisWeek={weeklyComparison.thisWeek}
                lastWeek={weeklyComparison.lastWeek}
              />
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
  const [activeSearch, setActiveSearch] = useState("");
  const [searchRequestKey, setSearchRequestKey] = useState(0);
  const [selectedVendor, setSelectedVendor] = useState<VendorOption | null>(null);
  const [vendorOptions, setVendorOptions] = useState<VendorOption[]>([]);
  const [optionsLoading, setOptionsLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const fetchVendors = async () => {
      setOptionsLoading(true);
      try {
        const response = await apiService.getAllVendorSignups();
        const vendors = Array.isArray(response?.data)
          ? (response.data as VendorSignup[])
              .map((vendor) => ({
                vendorId: vendor.vendorId,
                fullName: vendor.fullName || "",
                emailAddress: vendor.emailAddress || "",
                storeName: vendor.storeName || "",
              }))
              .filter((vendor) => vendor.emailAddress)
          : [];

        if (!cancelled) {
          setVendorOptions(vendors);
        }
      } catch (error) {
        console.error("Failed to load vendor search options:", error);
        if (!cancelled) {
          setVendorOptions([]);
        }
      } finally {
        if (!cancelled) {
          setOptionsLoading(false);
        }
      }
    };

    fetchVendors();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleSearch = (value: string, vendor?: VendorOption) => {
    setActiveSearch(value);
    setSelectedVendor(vendor ?? null);
    setSearchRequestKey((k) => k + 1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">
            View general analytics and filter by vendor name or email
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="border-primary/50 text-primary hover:opacity-80 gap-2 self-start"
          onClick={() => {/* export placeholder */}}
        >
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Vendor search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <label className="text-sm font-medium">Vendor Search</label>
              {activeSearch && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveSearch("");
                    setSelectedVendor(null);
                    setSearchRequestKey((k) => k + 1);
                  }}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Back to general analytics
                </button>
              )}
            </div>
            <p className="text-xs text-muted-foreground -mt-1">
              Search a vendor by name, store name or email to filter analytics
            </p>
            <VendorSearch
              activeSearch={activeSearch}
              vendorOptions={vendorOptions}
              optionsLoading={optionsLoading}
              onSearch={handleSearch}
            />
          </div>
        </CardContent>
      </Card>

      <AnalyticsDashboard
        key={activeSearch || "general"}
        searchValue={activeSearch}
        searchRequestKey={searchRequestKey}
        selectedVendor={selectedVendor}
      />
    </div>
  );
}
