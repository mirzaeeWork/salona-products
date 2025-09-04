import ProductCard from './ProductCard'


export default function ProductsGrid({ products}) {
    if (!products?.length) {
        return (
            <div className="text-center text-[24px] h-[75vh] text-gray-600 border border-wood/30 rounded-xl p-10 bg-white shadow-sm">No products</div>
        )
    }


    return (
        <ul className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((p) => (
                <li key={p.id}>
                    <ProductCard product={p} />
                </li>
            ))}
        </ul>
    )
}