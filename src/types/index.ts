export type ProductCategory = 'blocks' | 'bricks' | 'mesh' | 'cement' | 'rebar' | 'other'
export type StrengthGrade = 'M50' | 'M75' | 'M100' | 'M125' | 'M150' | 'M200' | 'M500'
export type ProductPurpose = 'partition' | 'wall' | 'universal'

export interface Product {
  id: string
  name: string
  category: ProductCategory
  price_cash: number
  price_cashless: number
  unit: string
  weight_kg: number
  dimensions: string
  strength_grade?: StrengthGrade
  purpose?: ProductPurpose
  in_stock: boolean
  is_popular: boolean
  sort_order: number
  image_url?: string
  description?: string
}

export interface CartItem {
  product: Product
  quantity: number
}

export type PaymentMethod = 'cash' | 'cashless'
export type DeliveryMethod = 'manipulator' | 'pickup'
