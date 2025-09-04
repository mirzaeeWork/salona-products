import { useState, useRef, useEffect } from 'react'
import { useProductsQuery } from '../hooks/useProductsQuery'
import { API_BASE } from '../api/products'
import ProductsGrid from '../components/ProductsGrid'
import Pagination from '../components/Pagination'
import SkeletonGrid from '../components/SkeletonGrid'
import ErrorBox from '../components/ErrorBox'
import StatusPill from '../components/StatusPill'

export default function ProductsPage () {
  // UI state for current page and page size
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const limits = [5, 10, 20, 30, 50]

  // dropdown (per-page) open/close state + ref for outside-click handling
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Fetch products with pagination via TanStack Query
  // NOTE: `useProductsQuery` should return `data`, `isLoading`, `isError`, `error`,
  // `isFetching` (background refetch), and metadata like `total` and `totalPages`.
  const { data, isLoading, isError, error, isFetching, total, totalPages } =
    useProductsQuery({ page, limit })

  // Keep last known-good (OK) meta to keep UI stable during errors
  // This avoids pagination jumping when the latest request fails.
  const [lastOkMeta, setLastOkMeta] = useState({ total: 0, totalPages: 1 })

  // When request succeeds and meta numbers are valid, cache them
  useEffect(() => {
    if (!isError && typeof total === 'number' && typeof totalPages === 'number') {
      setLastOkMeta({ total, totalPages })
    }
  }, [isError, total, totalPages])

  // Use stale (last OK) meta in error state; otherwise use fresh meta
  const effectiveTotalPages = isError ? lastOkMeta.totalPages : (totalPages || 1)
  const effectiveTotal = isError ? lastOkMeta.total : (total ?? 0)

  // Clamp page changes to valid range (1..effectiveTotalPages)
  const goToPage = (p) => {
    const clamped = Math.min(Math.max(1, p), effectiveTotalPages)
    setPage(clamped)
  }

  // Change page size; reset to page 1 to avoid out-of-range pages
  const onLimitChange = (e) => {
    const value = Number(e.target.value)
    setLimit(value)
    setPage(1)
  }

  // Close the per-page dropdown when clicking outside of it
  useEffect(() => {
    function handleClickOutside (event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Disable interactive controls while loading/fetching or on error
  // Prevents user from interacting with stale/invalid state.
  const controlsDisabled = isLoading || isFetching || isError

  return (
    <div className='min-h-screen bg-cream text-midnight'>
      {/* Sticky header with title + per-page dropdown */}
      <header className='sticky top-0 z-10 backdrop-blur bg-mocha/85 border-b border-cream text-white'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
          <div className='flex items-center gap-3'>
            <span className='inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-midnight text-cream font-bold'>
              S
            </span>
            <div>
              <h1 className='text-xl md:text-2xl font-semibold'>Salona Products</h1>
              <p className='text-xs text-cream/90'>React + React Query + Tailwind — Paginated</p>
            </div>
          </div>

          <div className='flex items-center gap-3'>
            {/* Per-page dropdown with disabled state tied to network status */}
            <div className='relative w-40' ref={dropdownRef}>
              <button
                type='button'
                onClick={() => !controlsDisabled && setOpen(!open)}
                disabled={controlsDisabled}
                className={`flex items-center justify-between w-full rounded-xl border border-mocha bg-white px-3 py-2 text-sm font-medium text-midnight shadow-sm hover:shadow-md transition ${
                  controlsDisabled ? 'opacity-60 cursor-not-allowed' : ''
                }`}
                aria-disabled={controlsDisabled}
              >
                <span>{limit} per page</span>
                <span className='text-midnight/70'>▼</span>
              </button>

              {/* Dropdown menu; clicking an item updates limit and resets page */}
              {open && (
                <ul className='absolute left-0 mt-1 w-full rounded-xl border border-mocha bg-white shadow-lg z-10 overflow-hidden'>
                  {limits.map(n => (
                    <li
                      key={n}
                      onClick={() => {
                        onLimitChange({ target: { value: n } })
                        setOpen(false)
                      }}
                      className='cursor-pointer px-3 py-2 text-sm text-midnight/80 hover:bg-mocha hover:text-white'
                    >
                      {n}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Small pill indicating background fetching/error */}
            <StatusPill isFetching={isFetching} isError={isError} />
          </div>
        </div>
      </header>

      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6'>
        {/* Top summary + (optional) pagination could go here */}
        <div className='flex flex-col sm:flex-row items-start justify-between gap-4 mb-4'>
          <div>
            <h2 className='text-lg font-semibold'>Products</h2>
            {/* Show total count (fallback to last OK meta on error), page indicator,
                and 'stale' hint while showing cached meta in error state */}
            <p className='text-sm text-muted'>
              {isLoading ? 'Loading…' : `${effectiveTotal} items found`}
              {' — '}page {page} of {effectiveTotalPages}
              {isError && ' (stale)'}
            </p>
          </div>
        </div>

        {/* Main content states: error -> error box; loading -> skeleton; success -> grid */}
        {isError ? (
          // Error state: keep pagination visible (below) but disable controls;
          // allow retry action inside ErrorBox if you implement it
          <ErrorBox error={error} onRetry={() => goToPage(page)} />
        ) : isLoading ? (
          // Loading state: show skeletons sized by current `limit`
          <SkeletonGrid count={limit} />
        ) : (
          // Success state: render products
          <ProductsGrid products={data?.products} />
        )}

        {/* Bottom pagination: uses effectiveTotalPages and respects `disabled` */}
        <div className='w-fit mt-8 mx-auto'>
          <Pagination
            page={page}
            totalPages={effectiveTotalPages}
            onChange={goToPage}
            disabled={controlsDisabled}
          />
        </div>
      </main>

      {/* Footer shows which API base is used (useful for debugging) */}
      <footer className='border-t py-6 text-center text-sm text-muted'>
        <p>Data: <code className='bg-white px-1 py-0.5 rounded'>{API_BASE}</code></p>
      </footer>
    </div>
  )
}
