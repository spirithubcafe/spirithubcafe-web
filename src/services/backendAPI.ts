// Backend API service for saving JSON files
// This will simulate saving data through API calls

export interface SaveDataRequest {
  filename: string
  data: any
}

export interface SaveDataResponse {
  success: boolean
  message: string
  error?: string
}

class BackendAPIService {
  private baseUrl = '/api'

  // Save JSON data through API
  async saveJSONData(filename: string, data: any): Promise<SaveDataResponse> {
    try {
      console.log(`Saving ${filename} to server:`, data)
      
      // Store in localStorage as backup
      localStorage.setItem(`backup_${filename}`, JSON.stringify(data))
      
      // Try to save to actual file via API endpoint
      const response = await fetch(`${this.baseUrl}/save-json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          filename, 
          data,
          timestamp: new Date().toISOString()
        })
      })
      
      if (!response.ok) {
        // If API is not available, save locally via download
        await this.saveFileLocally(filename, data)
        return {
          success: true,
          message: `✅ تم حفظ الملف ${filename} محلياً!\n✅ File ${filename} saved locally!`
        }
      }
      
      const result = await response.json()
      return result
      
      return {
        success: true,
        message: `✅ تم حفظ الملف ${filename} بنجاح!\n✅ File ${filename} saved successfully!`
      }
    } catch (error) {
      console.error(`Error saving ${filename}:`, error)
      
      // Fallback: save locally via download
      try {
        await this.saveFileLocally(filename, data)
        return {
          success: true,
          message: `✅ تم حفظ الملف ${filename} محلياً (وضع الطوارئ)!\n✅ File ${filename} saved locally (fallback mode)!`
        }
      } catch (fallbackError) {
        return {
          success: false,
          message: `❌ خطأ في حفظ الملف ${filename}\n❌ Error saving file ${filename}`,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    }
  }

  // Save file locally via browser download
  private async saveFileLocally(filename: string, data: any): Promise<void> {
    const jsonString = JSON.stringify(data, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = filename.endsWith('.json') ? filename : `${filename}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    // Also try to update the public file if we can access it
    await this.updatePublicFile(filename, data)
  }

  // Try to update the file in public directory (for development)
  private async updatePublicFile(filename: string, data: any): Promise<void> {
    try {
      // In development mode, try to save to the public/data directory
      const publicPath = `/data/${filename.endsWith('.json') ? filename : `${filename}.json`}`
      
      // This will only work if we have a development server endpoint
      await fetch(`/api/save-public-file`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          path: publicPath, 
          data,
          timestamp: new Date().toISOString()
        })
      })
    } catch (error) {
      console.log('Could not update public file (this is normal in production):', error)
    }
  }

  // Load backup data from localStorage
  loadBackupData(filename: string): any | null {
    try {
      const data = localStorage.getItem(`backup_${filename}`)
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error(`Error loading backup for ${filename}:`, error)
      return null
    }
  }

  // Check if backup exists
  hasBackup(filename: string): boolean {
    return localStorage.getItem(`backup_${filename}`) !== null
  }
}

export const backendAPI = new BackendAPIService()
