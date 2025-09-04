export default function SkeletonGrid({ count = 12 }) {
  return (
    <ul className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <li key={i} className="rounded-2xl border border-cream bg-white card-shadow overflow-hidden">
          <div className="animate-pulse">
            <div className="h-44 bg-cream" />
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
  )
}
