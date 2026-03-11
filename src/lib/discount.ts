export function calcDiscount(completedCount: number): number {
  if (completedCount >= 20) return 10
  if (completedCount >= 10) return 5
  if (completedCount >= 5) return 3
  if (completedCount >= 1) return 1
  return 0
}

export function nextDiscountInfo(
  completedCount: number,
): { target: number; discount: number } | null {
  if (completedCount >= 20) return null
  if (completedCount >= 10) return { target: 20, discount: 10 }
  if (completedCount >= 5) return { target: 10, discount: 5 }
  if (completedCount >= 1) return { target: 5, discount: 3 }
  return { target: 1, discount: 1 }
}

export function applyDiscount(amount: number, discountPercent: number): number {
  if (discountPercent <= 0) return amount
  return Math.round(amount * (1 - discountPercent / 100))
}

/** Generates a collision-resistant order number using timestamp in base36 */
export function generateOrderNumber(): string {
  const now = new Date()
  const ym = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`
  const ts = Date.now().toString(36).toUpperCase()
  return `SCK-${ym}-${ts}`
}
