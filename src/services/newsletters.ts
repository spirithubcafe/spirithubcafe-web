import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore/lite'
import { db } from '../lib/firebase'

export interface NewsletterSubscriber {
  id?: string
  email: string
  subscribed_at: string | Date | { toDate(): Date } | number
  status?: string
}

// Subscribe to newsletter
export const subscribeToNewsletter = async (email: string): Promise<void> => {
  try {
    await addDoc(collection(db, 'newsletters'), {
      email,
      subscribed_at: new Date().toISOString(),
      status: 'active'
    })
  } catch (error) {
    console.error('Error subscribing to newsletter:', error)
    throw error
  }
}

// Get all newsletter subscribers
export const getNewsletterSubscribers = async (): Promise<NewsletterSubscriber[]> => {
  try {
    const q = query(collection(db, 'newsletters'), orderBy('subscribed_at', 'desc'))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as NewsletterSubscriber))
  } catch (error) {
    console.error('Error fetching newsletter subscribers:', error)
    throw error
  }
}

// Unsubscribe from newsletter
export const unsubscribeFromNewsletter = async (subscriberId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'newsletters', subscriberId))
  } catch (error) {
    console.error('Error unsubscribing from newsletter:', error)
    throw error
  }
}
