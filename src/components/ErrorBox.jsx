import { API_BASE } from '../api/products'

export default function ErrorBox({ error, onRetry }) {
  return (
    <div className="rounded-2xl border border-accent/20 bg-white p-6 card-shadow mb-[25rem]">
      <h3 className="text-lg font-semibold text-accent">Something went wrong</h3>
      <p className="text-sm text-muted mt-1">{error?.message ?? 'Unknown error'}</p>
      <div className="mt-4 flex items-center gap-2">
        <button
          type="button"
          onClick={onRetry}
          className="rounded-xl border px-3 py-2 text-sm font-medium bg-accent text-white hover:bg-accent/90"
        >
          Retry
        </button>
        <a
          href={API_BASE}
          target="_blank"
          rel="noreferrer"
          className="text-sm text-muted hover:text-midnight underline"
        >
          Check API status
        </a>
      </div>
    </div>
  )
}
