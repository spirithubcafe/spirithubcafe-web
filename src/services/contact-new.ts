// Contact form service using Google Sheets and localStorage
import { contactSheetsService } from '@/services/googleSheetsService'

export interface ContactMessage {
  name: string
  email: string
  subject: string
  message: string
  phone?: string
}

export interface ContactInfo {
  business_name: string
  address: string
  phone: string
  email: string
  website: string
  working_hours: {
    [key: string]: string
  }
  social_media: {
    facebook?: string
    instagram?: string
    twitter?: string
    linkedin?: string
  }
}

class ContactService {
  private collectionName = 'contact_messages'

  async create(messageData: ContactMessage): Promise<{ id: string }> {
    try {
      // TODO: Save to Google Sheets
      const result = await contactSheetsService.submitMessage(messageData)
      
      // For now, also save to localStorage as backup
      const messages = JSON.parse(localStorage.getItem('contact_messages') || '[]')
      const newMessage = {
        ...messageData,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
        is_read: false,
        is_archived: false
      }
      messages.push(newMessage)
      localStorage.setItem('contact_messages', JSON.stringify(messages))
      
      return { id: newMessage.id }
    } catch (error) {
      console.error('Error creating contact message:', error)
      throw error
    }
  }

  async list(): Promise<{ items: any[] }> {
    try {
      // TODO: Get from Google Sheets
      const messages = JSON.parse(localStorage.getItem('contact_messages') || '[]')
      return { items: messages }
    } catch (error) {
      console.error('Error fetching contact messages:', error)
      return { items: [] }
    }
  }

  async getUnreadCount(): Promise<number> {
    try {
      const messages = JSON.parse(localStorage.getItem('contact_messages') || '[]')
      return messages.filter((msg: any) => !msg.is_read).length
    } catch (error) {
      console.error('Error getting unread count:', error)
      return 0
    }
  }

  async markAsRead(messageId: string): Promise<void> {
    try {
      // TODO: Update in Google Sheets
      const messages = JSON.parse(localStorage.getItem('contact_messages') || '[]')
      const messageIndex = messages.findIndex((msg: any) => msg.id === messageId)
      if (messageIndex !== -1) {
        messages[messageIndex].is_read = true
        localStorage.setItem('contact_messages', JSON.stringify(messages))
      }
    } catch (error) {
      console.error('Error marking message as read:', error)
      throw error
    }
  }

  async reply(messageId: string, replyData: { subject: string; message: string }): Promise<void> {
    try {
      // TODO: Send reply via Google Sheets integration
      console.log(`Reply to message ${messageId}:`, replyData)
    } catch (error) {
      console.error('Error sending reply:', error)
      throw error
    }
  }

  async archive(messageId: string): Promise<void> {
    try {
      // TODO: Archive in Google Sheets
      const messages = JSON.parse(localStorage.getItem('contact_messages') || '[]')
      const messageIndex = messages.findIndex((msg: any) => msg.id === messageId)
      if (messageIndex !== -1) {
        messages[messageIndex].is_archived = true
        localStorage.setItem('contact_messages', JSON.stringify(messages))
      }
    } catch (error) {
      console.error('Error archiving message:', error)
      throw error
    }
  }

  async getContactInfo(): Promise<ContactInfo | null> {
    try {
      // TODO: Get from Google Sheets
      // For now, return default contact info
      const contactInfo = JSON.parse(localStorage.getItem('contact_info') || 'null') || {
        business_name: 'Spirit Hub Cafe',
        address: 'Muscat, Oman',
        phone: '+968 1234 5678',
        email: 'info@spirithubcafe.com',
        website: 'https://spirithubcafe.com',
        working_hours: {
          sunday: '8:00 AM - 10:00 PM',
          monday: '8:00 AM - 10:00 PM',
          tuesday: '8:00 AM - 10:00 PM',
          wednesday: '8:00 AM - 10:00 PM',
          thursday: '8:00 AM - 10:00 PM',
          friday: '8:00 AM - 10:00 PM',
          saturday: '8:00 AM - 10:00 PM'
        },
        social_media: {
          facebook: 'https://facebook.com/spirithubcafe',
          instagram: 'https://instagram.com/spirithubcafe',
          twitter: 'https://twitter.com/spirithubcafe'
        }
      }
      
      return contactInfo
    } catch (error) {
      console.error('Error fetching contact info:', error)
      return null
    }
  }

  async updateContactInfo(settings: ContactInfo): Promise<void> {
    try {
      // TODO: Save to Google Sheets
      localStorage.setItem('contact_info', JSON.stringify(settings))
    } catch (error) {
      console.error('Error updating contact info:', error)
      throw error
    }
  }
}

export const contactService = new ContactService()
export default contactService
