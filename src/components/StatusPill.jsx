export default function StatusPill({ isFetching, isError }) {
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium border shadow-sm ${
        isError
          ? 'bg-accent/10 text-accent border-accent/30'
          : isFetching
          ? 'bg-mustard/20 text-mustard border-mustard/40'
          : 'bg-trueblue/10 text-trueblue border-trueblue/30'
      }`}
      aria-live="polite"
    >
      <span
        className={`inline-block h-2 w-2 rounded-full ${
          isError ? 'bg-accent' : isFetching ? 'bg-mustard' : 'bg-trueblue'
        }`}
      />
      {isError ? 'Error' : isFetching ? 'Updating…' : 'Up to date'}
    </div>
  )
}
