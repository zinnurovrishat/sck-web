import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { PRODUCTS } from '../data/products'
import type { Product } from '../types'

export function useProducts() {
  return useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('sort_order')
      if (error) {
        console.warn('[useProducts] Supabase error, using static data:', error.message)
        return PRODUCTS
      }
      return (data ?? PRODUCTS) as Product[]
    },
    placeholderData: PRODUCTS,
    staleTime: 5 * 60 * 1000,
  })
}
