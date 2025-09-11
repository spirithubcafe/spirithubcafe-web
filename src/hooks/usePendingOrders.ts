import { useState, useEffect } from 'react'

export function usePendingOrders() {
  const [pendingCount, setPendingCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPendingOrdersCount = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // TODO: Get orders from Google Sheets API
      // For now, get from localStorage
      const orders = JSON.parse(localStorage.getItem('orders') || '[]')
      
      // Count orders that are paid but not yet shipped (ready for processing)
      const pendingOrders = orders.filter((order: any) => 
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
