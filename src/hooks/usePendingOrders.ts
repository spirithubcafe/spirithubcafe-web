import { useState, useEffect } from 'react'
import { firestoreService } from '@/lib/firebase'

export function usePendingOrders() {
  const [pendingCount, setPendingCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPendingOrdersCount = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Get orders that are paid but not yet shipped
      const orders = await firestoreService.orders.list()
      
      // Count orders that are paid but not yet shipped (ready for processing)
      const pendingOrders = orders.items.filter(order => 
        (order.payment_status === 'paid' || order.payment_status === 'partially_paid') &&
        (order.status === 'confirmed' || order.status === 'preparing')
      )
      
      setPendingCount(pendingOrders.length)
    } catch (err) {
      console.error('Error fetching pending orders:', err)
      setError('Failed to fetch pending orders')
      setPendingCount(0)
    } finally {
      setLoading(false)
    }
  }

  // Refresh function to update count manually
  const refreshCount = () => {
    fetchPendingOrdersCount()
  }

  useEffect(() => {
    fetchPendingOrdersCount()
    
    // Refresh count every 30 seconds for real-time updates
    const interval = setInterval(fetchPendingOrdersCount, 30000)
    
    return () => clearInterval(interval)
  }, [])

  return {
    pendingCount,
    loading,
    error,
    refreshCount
  }
}
