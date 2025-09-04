import { useMemo, useEffect, useState } from 'react'

export default function Pagination({ page, totalPages, onChange, disabled = false }) {
  const isSmDown = useMediaQuery('(max-width: 639px)')
  const pages = useMemo(
    () => paginate(page, totalPages, isSmDown ? 'mobile' : 'desktop'),
    [page, totalPages, isSmDown]
  )

  return (
    <nav
      className="inline-flex items-center gap-1 select-none"
      aria-label="Pagination"
      aria-disabled={disabled || undefined}
    >
      <ArrowButton
        direction="prev"
        onClick={() => onChange(page - 1)}
        disabled={disabled || page <= 1}
      />

      {pages.map((p, i) =>
        p === '…' ? (
          <Ellipsis key={`e-${i}`} />
        ) : (
          <PageButton
            key={p}
            page={p}
            isActive={p === page}
            onClick={() => onChange(p)}
            disabled={disabled}
          />
        )
      )}

      <ArrowButton
        direction="next"
        onClick={() => onChange(page + 1)}
        disabled={disabled || page >= totalPages}
      />
    </nav>
  )
}

/* ===== Components ===== */

function PageButton({ page, isActive, onClick, disabled }) {
  const base =
    'px-3 py-2 rounded-xl border text-sm focus:outline-none transition-colors'
  const active =
    'bg-mocha text-white border-mocha cursor-default'
  const normal =
    'bg-white border-wood/40 hover:bg-cream/70 hover:border-wood/60 focus:ring-2 focus:ring-midnight/20 cursor-pointer'
  const disabledCls = 'opacity-40 cursor-not-allowed'

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-current={isActive ? 'page' : undefined}
      className={`${base} ${disabled ? disabledCls : isActive ? active : normal}`}
    >
      {page}
    </button>
  )
}

function ArrowButton({ direction, onClick, disabled }) {
  const icon =
    direction === 'prev'
      ? 'M15 19l-7-7 7-7'
      : 'M9 5l7 7-7 7'

  return (
    <button
      aria-label={direction === 'prev' ? 'Previous page' : 'Next page'}
      onClick={onClick}
      disabled={disabled}
      className={`px-3 py-2 rounded-xl border border-wood/40 bg-white text-sm
        hover:border-wood/60 disabled:opacity-40 disabled:cursor-not-allowed
        focus:outline-none focus:ring-2 focus:ring-midnight/20 flex items-center justify-center`}
    >
      <svg
        className="h-4 w-4 text-wood"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
      </svg>
    </button>
  )
}

function Ellipsis() {
  return <span className="px-2 text-wood/60">…</span>
}

/* ===== Helpers ===== */

function useMediaQuery(query) {
  const [matches, setMatches] = useState(false)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const mql = window.matchMedia(query)
    const onChange = () => setMatches(mql.matches)
    onChange()
    mql.addEventListener?.('change', onChange) ?? mql.addListener(onChange)
    return () => {
      mql.removeEventListener?.('change', onChange) ?? mql.removeListener(onChange)
    }
  }, [query])
  return matches
}

function paginate(current, total, mode = 'desktop') {
  if (mode === 'mobile') {
    if (total <= 3) return Array.from({ length: total }, (_, i) => i + 1)
    if (current <= 2) return [1, 2, 3, '…']
    if (current >= total - 1) return ['…', total - 2, total - 1, total]
    return [1, '…', current, '…', total]
  }

  // desktop
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1)
  if (current <= 3) return [1, 2, 3, 4, '…', total]
  if (current >= total - 2) return [1, '…', total - 3, total - 2, total - 1, total]
  return [1, '…', current - 1, current, current + 1, '…', total]
}
