// components/ProductCard.jsx
import { CURRENCY } from '../utils/format'
import Stars from './Stars'

export default function ProductCard ({ product }) {
  const {
    title,
    price,
    discountPercentage,
    category,
    brand,
    rating,
    thumbnail,
    images = [],
    shippingInformation
  } = product

  const cover = images[0] || thumbnail

  const rawDiscount = Number(discountPercentage) || 0
  const discounted = (Number(price) || 0) * (1 - rawDiscount / 100)

  const discountBadge = Math.round(rawDiscount)

  const ratingLabel = (Math.min(Math.max(Number(rating) || 0, 0), 5)).toFixed(1)

  return (
    <article
      className='group h-full rounded-[10px] border border-wood/30 bg-white
             card-shadow card-shadow-hover overflow-hidden flex flex-col'
    >
      <div className='relative aspect-[4/3] overflow-hidden bg-cream'>
        <img
          src={cover}
          alt={title}
          className='h-full w-full transition-transform duration-300 group-hover:scale-105'
          loading='lazy'
        />
        {rawDiscount > 0 && (
          <div className='absolute left-2 top-2 rounded-full bg-midnight/90 text-cream text-xs px-2 py-1'>
            {discountBadge}%
          </div>
        )}
      </div>

      <div className='flex flex-col gap-2 p-4 flex-1'>
        <div className='flex items-start justify-between gap-3'>
          <h3 className='text-sm font-semibold leading-snug line-clamp-2'>
            {title}
          </h3>
          <span className='whitespace-nowrap rounded-full bg-clay/30 px-2 py-1 text-[10px] uppercase tracking-wide text-mocha'>
            {category}
          </span>
        </div>

        {brand && (
          <p className='text-xs text-muted'>
            Brand: <span className='font-medium text-midnight'>{brand}</span>
          </p>
        )}

        <div className='flex items-center gap-2'>
          <Stars rating={rating} />
          <span className='text-sm text-muted'>{ratingLabel}</span>
        </div>

        <div className='mt-auto pt-2 flex items-end justify-between'>
          <div>
            <div className='text-lg font-bold text-mustard'>
              {CURRENCY.format(discounted)}
            </div>
            {rawDiscount > 0 && (
              <div className='text-xs text-muted line-through'>
                {CURRENCY.format(price)}
              </div>
            )}
          </div>
          <button
            type='button'
            className='rounded-xl border px-3 py-2 text-sm font-medium bg-accent text-white
                   hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent/40'
          >
            Add to cart
          </button>
        </div>

        {shippingInformation && (
          <p className='text-[11px] text-muted mt-2'>{shippingInformation}</p>
        )}
      </div>
    </article>
  )
}
