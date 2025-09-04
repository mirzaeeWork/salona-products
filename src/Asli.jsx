import { useEffect, useMemo, useState } from "react";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

// =============================
// Utilities
// =============================
const API_BASE = "https://dummyjson.com/products";
const CURRENCY = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function fetchProducts({ page, limit, signal }) {
  const skip = (page - 1) * limit;
  const url = `${API_BASE}?limit=${limit}&skip=${skip}`;
  return fetch(url, { signal }).then((r) => {
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json();
  });
}

// Create a single QueryClient for the app
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes cache
      retry: 2,
      refetchOnWindowFocus: false,
      keepPreviousData: true,
    },
  },
});

// =============================
// App Entrypoint (Default Export)
// =============================
export default function ProductsApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <Page />
    </QueryClientProvider>
  );
}

function Page() {
  // Local UI state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const queryKey = useMemo(() => ["products", { page, limit }], [page, limit]);

  const {
    data,
    isLoading,
    isError,
    error,
    isFetching,
  } = useQuery({
    queryKey,
    queryFn: ({ signal }) => fetchProducts({ page, limit, signal }),
  });

  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  // Prefetch next page for snappy UX
  const qc = useQueryClient();
  useEffect(() => {
    if (page < totalPages) {
      const nextPage = page + 1;
      qc.prefetchQuery({
        queryKey: ["products", { page: nextPage, limit }],
        queryFn: ({ signal }) => fetchProducts({ page: nextPage, limit, signal }),
      });
    }
  }, [page, limit, totalPages, qc]);

  // Handlers
  const goToPage = (p) => setPage(Math.min(Math.max(1, p), totalPages));
  const onLimitChange = (e) => {
    const value = Number(e.target.value);
    setLimit(value);
    setPage(1); // reset to first page when page-size changes
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="sticky top-0 z-10 backdrop-blur bg-white/70 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-black text-white font-bold">S</span>
            <div>
              <h1 className="text-xl md:text-2xl font-semibold">Salona Products</h1>
              <p className="text-xs text-gray-500">React + React Query + Tailwind — Paginated</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center rounded-xl border bg-white px-3 py-2 shadow-sm">
              <label htmlFor="limit" className="mr-2 text-sm text-gray-600">
                Per page
              </label>
              <select
                id="limit"
                value={limit}
                onChange={onLimitChange}
                className="outline-none bg-transparent text-sm font-medium"
              >
                {[5, 10, 20, 30, 50].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
            <StatusPill isFetching={isFetching} isError={isError} />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-end justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-semibold">Products</h2>
            <p className="text-sm text-gray-500">
              {isLoading ? "Loading…" : `${total} items found`} — page {page} of {totalPages}
            </p>
          </div>
          <Pagination page={page} totalPages={totalPages} onChange={goToPage} />
        </div>

        {isError ? (
          <ErrorBox error={error} onRetry={() => goToPage(page)} />
        ) : (
          <>
            {isLoading ? (
              <SkeletonGrid count={limit} />
            ) : (
              <ProductsGrid products={data.products} />
            )}
          </>
        )}

        <div className="mt-8">
          <Pagination page={page} totalPages={totalPages} onChange={goToPage} />
        </div>
      </main>

      <footer className="border-t py-6 text-center text-sm text-gray-500">
        <p>
          Data: <code className="bg-gray-100 px-1 py-0.5 rounded">{API_BASE}</code>
        </p>
      </footer>
    </div>
  );
}

// =============================
// UI Pieces
// =============================
function StatusPill({ isFetching, isError }) {
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium border shadow-sm ${
        isError
          ? "bg-red-50 text-red-700 border-red-200"
          : isFetching
          ? "bg-amber-50 text-amber-700 border-amber-200"
          : "bg-emerald-50 text-emerald-700 border-emerald-200"
      }`}
      aria-live="polite"
    >
      <span
        className={`inline-block h-2 w-2 rounded-full ${
          isError ? "bg-red-500" : isFetching ? "bg-amber-500" : "bg-emerald-500"
        }`}
      />
      {isError ? "Error" : isFetching ? "Updating…" : "Up to date"}
    </div>
  );
}

function ProductsGrid({ products }) {
  if (!products?.length) {
    return (
      <div className="text-center text-gray-600 border rounded-xl p-10 bg-white shadow-sm">
        No products
      </div>
    );
  }

  return (
    <ul className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((p) => (
        <li key={p.id}>
          <ProductCard product={p} />
        </li>
      ))}
    </ul>
  );
}

function ProductCard({ product }) {
  const {
    title,
    price,
    discountPercentage,
    category,
    brand,
    rating,
    thumbnail,
    images = [],
    shippingInformation,
  } = product;

  const cover = images[0] || thumbnail;
  const discounted = price * (1 - (discountPercentage || 0) / 100);

  return (
    <article className="group h-full rounded-2xl border bg-white shadow-sm overflow-hidden flex flex-col">
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        <img
          src={cover}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        {discountPercentage > 0 && (
          <div className="absolute left-2 top-2 rounded-full bg-black/80 text-white text-xs px-2 py-1">
            -{discountPercentage}%
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2 p-4 flex-1">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-sm font-semibold leading-snug line-clamp-2">{title}</h3>
          <span className="whitespace-nowrap rounded-full bg-gray-100 px-2 py-1 text-[10px] uppercase tracking-wide text-gray-600">
            {category}
          </span>
        </div>
        {brand && (
          <p className="text-xs text-gray-500">Brand: <span className="font-medium text-gray-700">{brand}</span></p>
        )}

        <div className="flex items-center gap-2">
          <Stars rating={rating} />
          <span className="text-xs text-gray-500">{rating?.toFixed?.(2) ?? "—"}</span>
        </div>

        <div className="mt-auto pt-2 flex items-end justify-between">
          <div>
            <div className="text-lg font-bold">{CURRENCY.format(discounted)}</div>
            {discountPercentage > 0 && (
              <div className="text-xs text-gray-500 line-through">{CURRENCY.format(price)}</div>
            )}
          </div>
          <button
            type="button"
            className="rounded-xl border px-3 py-2 text-sm font-medium bg-black text-white hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
            onClick={() => alert("Demo: add to cart")}
          >
            Add to cart
          </button>
        </div>

        {shippingInformation && (
          <p className="text-[11px] text-gray-500 mt-2">{shippingInformation}</p>
        )}
      </div>
    </article>
  );
}

function Stars({ rating = 0 }) {
  // Render 5 stars with partial fill via width clip
  const percentage = Math.max(0, Math.min(100, (rating / 5) * 100));
  return (
    <div className="relative inline-block" aria-label={`${rating} out of 5`}>
      <div className="flex">
        {[0, 1, 2, 3, 4].map((i) => (
          <Star key={i} className="h-4 w-4 text-gray-300" />
        ))}
      </div>
      <div className="absolute inset-0 overflow-hidden" style={{ width: `${percentage}%` }}>
        <div className="flex">
          {[0, 1, 2, 3, 4].map((i) => (
            <Star key={i} className="h-4 w-4 text-yellow-400" />
          ))}
        </div>
      </div>
    </div>
  );
}

function Star({ className = "" }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.802 2.035a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.802-2.035a1 1 0 00-1.175 0l-2.802 2.035c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.88 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

function SkeletonGrid({ count = 8 }) {
  return (
    <ul className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <li key={i} className="rounded-2xl border bg-white shadow-sm overflow-hidden">
          <div className="animate-pulse">
            <div className="h-44 bg-gray-200" />
            <div className="p-4 space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
              <div className="h-3 bg-gray-200 rounded w-2/3" />
              <div className="h-6 bg-gray-200 rounded w-24 ml-auto" />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

function ErrorBox({ error, onRetry }) {
  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-red-600">Something went wrong</h3>
      <p className="text-sm text-gray-600 mt-1">{error?.message ?? "Unknown error"}</p>
      <div className="mt-4 flex items-center gap-2">
        <button
          type="button"
          onClick={onRetry}
          className="rounded-xl border px-3 py-2 text-sm font-medium bg-black text-white hover:bg-gray-900"
        >
          Retry
        </button>
        <a
          href={API_BASE}
          target="_blank"
          rel="noreferrer"
          className="text-sm text-gray-600 hover:text-gray-900 underline"
        >
          Check API status
        </a>
      </div>
    </div>
  );
}

function Pagination({ page, totalPages, onChange }) {
  const pages = useMemo(() => paginate(page, totalPages), [page, totalPages]);

  return (
    <nav className="inline-flex items-center gap-1 select-none" aria-label="Pagination">
      <button
        className="px-3 py-2 rounded-xl border bg-white text-sm disabled:opacity-40"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
      >
        Prev
      </button>

      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`e-${i}`} className="px-2 text-gray-400">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={`px-3 py-2 rounded-xl border text-sm ${
              p === page ? "bg-black text-white border-black" : "bg-white"
            }`}
          >
            {p}
          </button>
        )
      )}

      <button
        className="px-3 py-2 rounded-xl border bg-white text-sm disabled:opacity-40"
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
      >
        Next
      </button>
    </nav>
  );
}

function paginate(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set([1, 2, total - 1, total, current, current - 1, current + 1]);
  const normalized = [...pages]
    .filter((p) => p >= 1 && p <= total)
    .sort((a, b) => a - b);
  const result = [];
  for (let i = 0; i < normalized.length; i++) {
    const p = normalized[i];
    if (i === 0) result.push(p);
    else {
      const prev = normalized[i - 1];
      if (p - prev === 1) result.push(p);
      else result.push("…", p);
    }
  }
  return result;
}
