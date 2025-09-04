import { useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchProducts } from '../api/products'


export function useProductsQuery({ page, limit }) {
    const queryKey = ['products', { page, limit }]
    const query = useQuery({
        queryKey,
        queryFn: ({ signal }) => fetchProducts({ page, limit, signal }),
        keepPreviousData: true,
    })


    const qc = useQueryClient()
    const total = query.data?.total ?? 0
    const totalPages = Math.max(1, Math.ceil(total / limit))


    // Prefetch next page for smoother UX
    useEffect(() => {
        if (page < totalPages) {
            const nextPage = page + 1
            qc.prefetchQuery({
                queryKey: ['products', { page: nextPage, limit }],
                queryFn: ({ signal }) => fetchProducts({ page: nextPage, limit, signal }),
            })
        }
    }, [page, limit, totalPages, qc])


    return { ...query, total, totalPages }
}