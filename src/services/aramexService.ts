import type { 
  AramexCredentials, 
  AramexRateRequest, 
  AramexRateResponse,
  AramexShipmentRequest,
  AramexShipmentResponse,
  AramexTrackingRequest,
  AramexTrackingResponse 
} from '@/types/aramex'

class AramexService {
  private baseURL = 'https://ws.aramex.net/ShippingAPI.V2'
  private testURL = 'https://ws.dev.aramex.net/ShippingAPI.V2'
  private isProduction = process.env.NODE_ENV === 'production'

  private getAPIUrl(): string {
    return this.isProduction ? this.baseURL : this.testURL
  }

  private async makeRequest<T>(endpoint: string, data: any, credentials: AramexCredentials): Promise<T> {
    const response = await fetch(`${this.getAPIUrl()}/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        ClientInfo: {
          UserName: credentials.username,
          Password: credentials.password,
          Version: credentials.apiVersion,
          AccountNumber: credentials.accountNumber,
          AccountPin: credentials.accountPin,
          AccountEntity: credentials.accountEntity,
          AccountCountryCode: credentials.accountCountryCode,
          Source: credentials.source
        },
        ...data
      })
    })

    if (!response.ok) {
      throw new Error(`Aramex API Error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  async calculateShippingRate(request: AramexRateRequest, credentials: AramexCredentials): Promise<AramexRateResponse> {
    try {
      const response = await this.makeRequest<AramexRateResponse>('CalculateRate', {
        OriginAddress: request.originAddress,
        DestinationAddress: request.destinationAddress,
        ShipmentDetails: request.shipmentDetails
      }, credentials)

      return response
    } catch (error) {
      console.error('Error calculating Aramex shipping rate:', error)
      throw error
    }
  }

  async createShipment(request: AramexShipmentRequest, credentials: AramexCredentials): Promise<AramexShipmentResponse> {
    try {
      const response = await this.makeRequest<AramexShipmentResponse>('CreateShipments', {
        Shipments: request.shipments,
        LabelInfo: request.labelInfo
      }, credentials)

      return response
    } catch (error) {
      console.error('Error creating Aramex shipment:', error)
      throw error
    }
  }

  async trackShipment(request: AramexTrackingRequest, credentials: AramexCredentials): Promise<AramexTrackingResponse> {
    try {
      const response = await this.makeRequest<AramexTrackingResponse>('TrackShipments', {
        Shipments: request.shipments,
        GetLastTrackingUpdateOnly: request.getLastTrackingUpdateOnly
      }, credentials)

      return response
    } catch (error) {
      console.error('Error tracking Aramex shipment:', error)
      throw error
    }
  }

  // Helper method to get available services for a destination
  async getAvailableServices(
    originCountry: string, 
    destinationCountry: string
  ): Promise<string[]> {
    const isDomestic = originCountry === destinationCountry
    
    if (isDomestic) {
      return ['OND', 'CDS'] // Domestic services
    } else {
      return ['EPX', 'PPX', 'GRD'] // International services
    }
  }

  // Helper to format tracking status
  formatTrackingStatus(updateCode: string): { status: string, description: string, color: string } {
    const statusMap: Record<string, { status: string, description: string, color: string }> = {
      'SH001': { status: 'Shipped', description: 'Shipment has been dispatched', color: 'blue' },
      'SH002': { status: 'Collected', description: 'Shipment collected from origin', color: 'orange' },
      'SH003': { status: 'Received', description: 'Shipment received at facility', color: 'yellow' },
      'SH004': { status: 'On Vehicle', description: 'Out for delivery', color: 'purple' },
      'SH005': { status: 'Delivered', description: 'Successfully delivered', color: 'green' },
      'SH006': { status: 'Exception', description: 'Delivery exception occurred', color: 'red' },
      'SH007': { status: 'Returned', description: 'Shipment returned to sender', color: 'gray' }
    }

    return statusMap[updateCode] || { 
      status: 'Unknown', 
      description: 'Status unknown', 
      color: 'gray' 
    }
  }
}

export const aramexService = new AramexService()
