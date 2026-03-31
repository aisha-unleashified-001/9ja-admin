import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Star,
  MapPin,
  Copy,
  CheckCircle,
  Search,
  ChevronDown,
  ArrowUpDown,
  Package,
} from "lucide-react";
import { apiService } from "../services/api";
import type { VendorProduct, VendorSignup } from "../types/api";
import { Button } from "../components/ui/Button";
import toast from "react-hot-toast";

// ─── helpers ────────────────────────────────────────────────────────────────

function normalizeProductImages(product: VendorProduct): string[] {
  if (product.images && product.images.length > 0) return product.images;
  if (product.productImages && product.productImages.length > 0)
    return product.productImages;
  if (product.image) return [product.image];
  return [];
}

function getProductPrice(product: VendorProduct): number {
  // API returns unitPrice as a flat number
  if (typeof product.unitPrice === "number") return product.unitPrice;
  if (typeof product.currentPrice === "number") return product.currentPrice;
  if (product.price !== undefined) {
    if (typeof product.price === "number") return product.price;
    if (typeof product.price === "object" && product.price !== null) {
      const p = product.price as { current?: number };
      if (typeof p.current === "number") return p.current;
    }
  }
  return 0;
}

function getProductName(product: VendorProduct): string {
  return product.productName ?? product.name ?? "";
}

function getProductId(product: VendorProduct): string {
  return product.productId ?? product.id ?? getProductName(product);
}

function getMainCategories(products: VendorProduct[]): string[] {
  const seen = new Set<string>();
  const cats: string[] = [];
  for (const p of products) {
    const cat = (p.categoryName ?? p.category) as string | undefined;
    if (cat && !seen.has(cat)) {
      seen.add(cat);
      cats.push(cat);
    }
  }
  return cats;
}

type SortMode = "default" | "price-low" | "price-high" | "name";
const SORT_LABELS: Record<SortMode, string> = {
  default: "Default",
  "price-low": "Price: Low → High",
  "price-high": "Price: High → Low",
  name: "Name (A–Z)",
};
const SORT_CYCLE: SortMode[] = ["default", "price-low", "price-high", "name"];

// ─── ProductCard ─────────────────────────────────────────────────────────────

function ProductCard({ product }: { product: VendorProduct }) {
  const images = normalizeProductImages(product);
  const price = getProductPrice(product);
  const name = getProductName(product);
  const [imgError, setImgError] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
      <div className="aspect-square bg-gray-50 relative overflow-hidden">
        {images.length > 0 && !imgError ? (
          <img
            src={images[0]}
            alt={name}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <Package className="w-10 h-10 text-gray-300" />
          </div>
        )}
      </div>
      <div className="p-3">
        <p className="text-sm font-medium text-[#182F38] line-clamp-2 leading-snug">
          {name}
        </p>
        {price > 0 && (
          <p className="text-sm font-bold mt-1" style={{ color: "#1E4700" }}>
            ₦{price.toLocaleString()}
          </p>
        )}
        {(product.categoryName ?? product.category) && (
          <p className="text-xs text-gray-400 mt-1 truncate">
            {(product.categoryName ?? product.category) as string}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Section heading ──────────────────────────────────────────────────────────

function SectionHeading({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-start gap-3 mb-6">
      <div className="w-4 h-10 rounded" style={{ backgroundColor: "#8DEB6E" }} />
      <div>
        <h2 className="text-xl font-bold text-[#182F38]">{title}</h2>
        <p className="text-sm text-gray-500">{subtitle}</p>
      </div>
    </div>
  );
}

// ─── ProductGrid ─────────────────────────────────────────────────────────────

function ProductGrid({ products }: { products: VendorProduct[] }) {
  if (products.length === 0) return null;
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {products.map((p) => (
        <ProductCard key={getProductId(p)} product={p} />
      ))}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function VendorProductsPage() {
  const { id: vendorId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [products, setProducts] = useState<VendorProduct[]>([]);
  const [vendorInfo, setVendorInfo] = useState<VendorSignup | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // filter / sort state
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("default");
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
  const categoryMenuRef = useRef<HTMLDivElement>(null);

  // close category dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        categoryMenuRef.current &&
        !categoryMenuRef.current.contains(e.target as Node)
      ) {
        setCategoryMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!vendorId) return;
    void fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vendorId]);

  const fetchData = async () => {
    if (!vendorId) return;
    setLoading(true);
    setError(null);
    try {
      // Fetch vendor info and products in parallel.
      const [vendorRes, productsRes] = await Promise.all([
        apiService.getVendorSignup(vendorId),
        apiService.getVendorProducts(vendorId, 1, 1000),
      ]);

      const vendor = vendorRes.data ?? null;
      setVendorInfo(vendor);

      const all = productsRes.data ?? [];

      // The URL :id param equals signup.vendorId, which is the same UUID stored
      // in product.vendorId. Filter strictly by that value so each vendor only
      // sees their own products regardless of what the endpoint returns.
      const vendorProducts = all.filter((p) => p.vendorId === vendorId);

      setProducts(vendorProducts);
    } catch (err) {
      console.error("Failed to fetch vendor products:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load vendor products"
      );
    } finally {
      setLoading(false);
    }
  };

  // ── derived data ────────────────────────────────────────────────────────────

  const firstProduct = products[0] ?? null;

  const vendorName =
    vendorInfo?.storeName ??
    vendorInfo?.businessName ??
    (firstProduct?.storeName as string | undefined) ??
    "Unknown Vendor";

  const vendorLogo =
    (firstProduct?.vendorLogo as string | undefined) ?? null;

  const categories = getMainCategories(products);

  const bestSellers: VendorProduct[] = (() => {
    const preferred = products.filter((p) => p.flags?.bestseller);
    return preferred.length > 0 ? preferred.slice(0, 4) : products.slice(0, 4);
  })();

  const sortedProducts = (list: VendorProduct[]): VendorProduct[] => {
    if (sortMode === "default") return list;
    const copy = [...list];
    if (sortMode === "price-low")
      return copy.sort((a, b) => getProductPrice(a) - getProductPrice(b));
    if (sortMode === "price-high")
      return copy.sort((a, b) => getProductPrice(b) - getProductPrice(a));
    if (sortMode === "name")
      return copy.sort((a, b) =>
        getProductName(a).localeCompare(getProductName(b))
      );
    return copy;
  };

  const filteredProducts = (() => {
    let list = [...products];
    if (selectedCategory) {
      list = list.filter(
        (p) =>
          (p.categoryName ?? p.category) === selectedCategory
      );
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((p) => p.name?.toLowerCase().includes(q));
    }
    return sortedProducts(list);
  })();

  const hasActiveFilter = Boolean(selectedCategory || searchQuery.trim());

  // ── copy store link ─────────────────────────────────────────────────────────

  const handleCopyStoreLink = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Store link copied to clipboard!");
    } catch {
      toast.error("Failed to copy link. Please try again.");
    }
  };

  // ── cycle sort mode ─────────────────────────────────────────────────────────

  const cycleSortMode = () => {
    const idx = SORT_CYCLE.indexOf(sortMode);
    setSortMode(SORT_CYCLE[(idx + 1) % SORT_CYCLE.length]);
  };

  // ── loading state ───────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-[#8DEB6E] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-500 text-sm">Loading vendor products…</p>
        </div>
      </div>
    );
  }

  // ── error state ─────────────────────────────────────────────────────────────

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/dashboard/vendor-signups/${vendorId}`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Vendor Products</h1>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-700 mb-4">{error}</p>
          <Button onClick={fetchData} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // ── no vendor ID ────────────────────────────────────────────────────────────

  if (!vendorId) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-2">
        <h2 className="text-xl font-bold text-[#182F38]">Vendor Not Found</h2>
        <p className="text-gray-500 text-sm">Invalid store link.</p>
      </div>
    );
  }

  // ── empty products ───────────────────────────────────────────────────────────

  if (products.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/dashboard/vendor-signups/${vendorId}`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Vendor Products</h1>
        </div>
        <div className="min-h-[40vh] flex flex-col items-center justify-center gap-2 text-center">
          <Package className="w-12 h-12 text-gray-300" />
          <p className="text-[#182F38] font-semibold">
            No products found for this vendor
          </p>
        </div>
      </div>
    );
  }

  // ── main render ──────────────────────────────────────────────────────────────

  return (
    <div className="bg-white font-sans pb-20">
      {/* Admin back-navigation bar */}
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`/dashboard/vendor-signups/${vendorId}`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Vendor Details
        </Button>
        <span className="text-gray-400 text-sm">/</span>
        <h1 className="text-lg font-semibold text-[#182F38]">
          Vendor Products
        </h1>
      </div>

      {/* Centered storefront container */}
      <div className="max-w-[960px] lg:max-w-7xl 2xl:max-w-[1550px] mx-auto px-4 md:px-6 pt-8">

        {/* ── Header Section ────────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between pb-8 mb-8 border-b border-gray-100 gap-6">
          {/* Left: vendor identity */}
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-100 bg-gray-200 flex-shrink-0 flex items-center justify-center">
              {vendorLogo ? (
                <img
                  src={vendorLogo}
                  alt={vendorName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = "none";
                    (e.currentTarget.nextSibling as HTMLElement | null)?.removeAttribute("style");
                  }}
                />
              ) : null}
              <span
                className="text-xl font-bold text-gray-500"
                style={vendorLogo ? { display: "none" } : {}}
              >
                {vendorName.charAt(0).toUpperCase()}
              </span>
            </div>

            {/* Text stack */}
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-[#182F38]">{vendorName}</h2>

              {/* Location */}
              <div className="flex items-center gap-1 text-gray-500">
                <MapPin className="w-3 h-3" />
                <span className="text-sm">Nigeria</span>
              </div>

              {/* Rating + verification */}
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium text-[#182F38]">5.0</span>
                  <span className="text-sm text-gray-400">144 Reviews</span>
                </div>
                <div className="flex items-center gap-1 text-xs font-medium" style={{ color: "#1E4700" }}>
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Verified</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Copy store link */}
          <button
            onClick={handleCopyStoreLink}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-90 self-start md:self-auto"
            style={{
              backgroundColor: "#8DEB6E",
              border: "1px solid #2ac12a",
              color: "#1E4700",
            }}
          >
            <Copy className="w-4 h-4" />
            Copy Store Link
          </button>
        </div>

        {/* ── Filter Bar ────────────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10">
          {/* Product count */}
          <div>
            <span className="font-semibold text-[#182F38]">Products </span>
            <span className="text-sm text-gray-400">{filteredProducts.length}</span>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Category dropdown */}
            <div className="relative" ref={categoryMenuRef}>
              <button
                onClick={() => setCategoryMenuOpen((o) => !o)}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm min-w-[160px] justify-between transition-colors"
                style={
                  selectedCategory
                    ? {
                        borderColor: "#2ac12a",
                        color: "#1E4700",
                        backgroundColor: "rgb(240 253 244)",
                      }
                    : { borderColor: "#d1d5db", color: "#6b7280" }
                }
              >
                <span>{selectedCategory ?? "All Categories"}</span>
                <ChevronDown className="w-4 h-4 flex-shrink-0" />
              </button>

              {categoryMenuOpen && (
                <div className="absolute top-full mt-1 left-0 z-20 bg-white rounded-lg shadow-lg border border-gray-100 min-w-[180px] max-h-56 overflow-y-auto">
                  <button
                    onClick={() => {
                      setSelectedCategory(null);
                      setCategoryMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 text-gray-700"
                  >
                    All Categories
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        setSelectedCategory(
                          selectedCategory === cat ? null : cat
                        );
                        setCategoryMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                      style={
                        selectedCategory === cat
                          ? { color: "#1E4700", fontWeight: 600 }
                          : { color: "#374151" }
                      }
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Search */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="pl-3 pr-9 py-2 text-sm rounded-lg border border-gray-200 outline-none transition-colors focus:border-[#1E4700]"
              />
              <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Sort */}
            <button
              onClick={cycleSortMode}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:border-[#1E4700] hover:text-[#1E4700] transition-colors"
            >
              <ArrowUpDown className="w-4 h-4" />
              <span>Sort by</span>
              {sortMode !== "default" && (
                <span className="text-xs font-medium" style={{ color: "#1E4700" }}>
                  · {SORT_LABELS[sortMode]}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* ── Content Sections ──────────────────────────────────────────────── */}

        {!hasActiveFilter && (
          <>
            {/* Fast Selling */}
            {bestSellers.length > 0 && (
              <section className="mb-10">
                <SectionHeading
                  title="Fast Selling"
                  subtitle="Popular items selling out quickly"
                />
                <ProductGrid products={bestSellers} />
              </section>
            )}

            {/* All Vendor Products */}
            {products.length > 0 && (
              <section className="mb-10">
                <SectionHeading
                  title="All Vendor Products"
                  subtitle={`Explore everything from ${vendorName} Store`}
                />
                <ProductGrid products={sortedProducts(products)} />
              </section>
            )}
          </>
        )}

        {/* Filtered Results */}
        {hasActiveFilter && (
          <section className="mb-10">
            {filteredProducts.length === 0 ? (
              <div className="border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 py-16 flex flex-col items-center gap-3 text-center">
                <Search className="w-10 h-10 text-gray-300" />
                <p className="text-[#182F38] font-semibold">
                  No products found
                </p>
                <p className="text-gray-400 text-sm">
                  Try adjusting your search or filters.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory(null);
                    setSearchQuery("");
                  }}
                  className="text-sm font-medium mt-2 underline underline-offset-2"
                  style={{ color: "#1E4700" }}
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <ProductGrid products={filteredProducts} />
            )}
          </section>
        )}
      </div>
    </div>
  );
}
