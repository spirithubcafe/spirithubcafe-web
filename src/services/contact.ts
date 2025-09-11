// Contact form service using localStorage
// TODO: Integrate with Google Sheets later

export interface ContactMessage {
  name: string
  email: string
  subject: string
  message: string
  phone?: string
}

// Alias for compatibility
export type ContactFormData = ContactMessage

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

// Contact settings interface for admin panel
export interface ContactSettings {
  phone1: string
  phone2: string
  whatsapp: string
  email: string
  instagram: string
  address: string
  address_ar: string
  hours: string
  hours_ar: string
  coordinates: {
    lat: number
    lng: number
  }
}

class ContactService {
  async create(messageData: ContactMessage): Promise<{ id: string }> {
    try {
      // TODO: Save to Google Sheets
      // await contactSheetsService.submitMessage(messageData)
      
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

  // Additional methods for ContactManagement component
  async getMessages(): Promise<{ items: any[] }> {
    return this.list()
  }

  async getContactSettings(): Promise<ContactSettings | Record<string, any>> {
    try {
      const settings = JSON.parse(localStorage.getItem('contact_settings') || 'null') || {
        phone1: '+968 9123 4567',
        phone2: '+968 9876 5432',
        whatsapp: '+968 9123 4567',
        email: 'info@spirithubcafe.com',
        instagram: '@spirithubcafe',
        address: 'Al Mouj Street, Muscat, Oman',
        address_ar: 'شارع الموج، مسقط، عمان',
        hours: 'Daily: 7:00 AM - 11:00 PM',
        hours_ar: 'يوميا: 7:00 ص - 11:00 م',
        coordinates: {
          lat: 23.5880,
          lng: 58.3829
        }
      }
      return settings
    } catch (error) {
      console.error('Error fetching contact settings:', error)
      return {}
    }
  }

  async saveContactSettings(settings: ContactSettings): Promise<void> {
    try {
      localStorage.setItem('contact_settings', JSON.stringify(settings))
    } catch (error) {
      console.error('Error saving contact settings:', error)
      throw error
    }
  }

  async createMessage(messageData: ContactMessage): Promise<{ id: string }> {
    return this.create(messageData)
  }
}

export const contactService = new ContactService()
export default contactService
