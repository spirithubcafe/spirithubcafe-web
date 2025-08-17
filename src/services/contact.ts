import { firestoreService, db } from '@/lib/firebase'
import { collection, addDoc, getDocs, query, orderBy, where, doc, updateDoc, deleteDoc } from 'firebase/firestore'
import type { Database } from '@/types/database'

type ContactMessage = {
  id: string
  name: string
  email: string
  subject: string
  message: string
  phone?: string | null
  is_read: boolean
  replied_at?: string | null
  created_at: string
}
type ContactMessageInsert = Database['public']['Tables']['contact_messages']['Insert']

export interface ContactFormData {
  name: string
  email: string
  subject: string
  message: string
  phone?: string
}

class ContactService {
  private collectionName = 'contact_messages'

  // Create a new contact message
  async createMessage(data: ContactFormData): Promise<ContactMessage> {
    const messageData: ContactMessageInsert = {
      name: data.name,
      email: data.email,
      subject: data.subject,
      message: data.message,
      phone: data.phone,
      is_read: false,
      created_at: new Date().toISOString()
    }

    try {
      if (!db) throw new Error('Database not initialized')
      
      const docRef = await addDoc(collection(db, this.collectionName), messageData)
      return { id: docRef.id, ...messageData } as ContactMessage
    } catch (error) {
      console.error('Error creating contact message:', error)
      throw new Error('Failed to send message')
    }
  }

  // Get all contact messages
  async getMessages(): Promise<{ items: ContactMessage[]; total: number }> {
    try {
      if (!db) throw new Error('Database not initialized')
      
      const q = query(
        collection(db, this.collectionName),
        orderBy('created_at', 'desc')
      )
      
      const querySnapshot = await getDocs(q)
      const items = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ContactMessage[]

      return {
        items,
        total: items.length
      }
    } catch (error) {
      console.error('Error fetching contact messages:', error)
      throw new Error('Failed to load messages')
    }
  }

  // Get unread messages count
  async getUnreadCount(): Promise<number> {
    try {
      if (!db) throw new Error('Database not initialized')
      
      const q = query(
        collection(db, this.collectionName),
        where('is_read', '==', false)
      )
      
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.length
    } catch (error) {
      console.error('Error fetching unread count:', error)
      return 0
    }
  }

  // Mark message as read
  async markAsRead(messageId: string): Promise<void> {
    try {
      if (!db) throw new Error('Database not initialized')
      
      const messageRef = doc(db, this.collectionName, messageId)
      await updateDoc(messageRef, {
        is_read: true
      })
    } catch (error) {
      console.error('Error marking message as read:', error)
      throw new Error('Failed to mark message as read')
    }
  }

  // Mark message as replied
  async markAsReplied(messageId: string): Promise<void> {
    try {
      if (!db) throw new Error('Database not initialized')
      
      const messageRef = doc(db, this.collectionName, messageId)
      await updateDoc(messageRef, {
        is_read: true,
        replied_at: new Date().toISOString()
      })
    } catch (error) {
      console.error('Error marking message as replied:', error)
      throw new Error('Failed to mark message as replied')
    }
  }

  // Delete a message
  async deleteMessage(messageId: string): Promise<void> {
    try {
      if (!db) throw new Error('Database not initialized')
      
      const messageRef = doc(db, this.collectionName, messageId)
      await deleteDoc(messageRef)
    } catch (error) {
      console.error('Error deleting message:', error)
      throw new Error('Failed to delete message')
    }
  }

  // Get contact settings
  async getContactSettings(): Promise<any> {
    try {
      const result = await firestoreService.settings.get('contact_info')
      return result?.value || {}
    } catch (error) {
      console.error('Error fetching contact settings:', error)
      return {}
    }
  }

  // Update contact settings  
  async updateContactSettings(settings: any): Promise<void> {
    try {
      await firestoreService.settings.set('contact_info', { value: settings })
    } catch (error) {
      console.error('Error updating contact settings:', error)
      throw new Error('Failed to update contact settings')
    }
  }

  // Save contact settings (alias for updateContactSettings)
  async saveContactSettings(settings: any): Promise<void> {
    return this.updateContactSettings(settings)
  }
}

export const contactService = new ContactService()