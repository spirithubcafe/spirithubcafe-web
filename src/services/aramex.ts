import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';
import type {
  AramexSettings,
  ShippingRateRequest,
  ShippingRateResponse,
  CreateShipmentRequest,
  CreateShipmentResponse,
  GetLabelRequest,
  GetLabelResponse,
  SchedulePickupRequest,
  SchedulePickupResponse,
} from '@/types/aramex';

class AramexService {
  // Calculate shipping rate
  async calculateShippingRate(request: ShippingRateRequest): Promise<ShippingRateResponse> {
    try {
      const calculateRate = httpsCallable(functions, 'calculateAramexRate');
      const result = await calculateRate(request);
      return result.data as ShippingRateResponse;
    } catch (error) {
      console.error('Error calculating Aramex shipping rate:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to calculate shipping rate',
      };
    }
  }

  // Create shipment
  async createShipment(request: CreateShipmentRequest): Promise<CreateShipmentResponse> {
    try {
      const createShipment = httpsCallable(functions, 'createAramexShipment');
      const result = await createShipment(request);
      return result.data as CreateShipmentResponse;
    } catch (error) {
      console.error('Error creating Aramex shipment:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create shipment',
      };
    }
  }

  // Get shipping label
  async getShippingLabel(request: GetLabelRequest): Promise<GetLabelResponse> {
    try {
      const getLabel = httpsCallable(functions, 'getAramexLabel');
      const result = await getLabel(request);
      return result.data as GetLabelResponse;
    } catch (error) {
      console.error('Error getting Aramex label:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get shipping label',
      };
    }
  }

  // Schedule pickup
  async schedulePickup(request: SchedulePickupRequest): Promise<SchedulePickupResponse> {
    try {
      const schedulePickup = httpsCallable(functions, 'scheduleAramexPickup');
      const result = await schedulePickup(request);
      return result.data as SchedulePickupResponse;
    } catch (error) {
      console.error('Error scheduling Aramex pickup:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to schedule pickup',
      };
    }
  }

  // Generate PDF from base64 label data
  downloadLabelPDF(labelData: string, filename: string = 'aramex-label.pdf') {
    try {
      // Convert base64 to blob
      const byteCharacters = atob(labelData);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();

      // Cleanup
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading label PDF:', error);
      throw new Error('Failed to download label PDF');
    }
  }

  // Open label PDF in new window/tab
  viewLabelPDF(labelData: string) {
    try {
      // Convert base64 to blob
      const byteCharacters = atob(labelData);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });

      // Create URL and open in new window
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');

      // Cleanup after a delay
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 1000);
    } catch (error) {
      console.error('Error viewing label PDF:', error);
      throw new Error('Failed to view label PDF');
    }
  }

  // Validate shipping address
  validateShippingAddress(address: {
    city: string;
    country: string;
    addressLine: string;
  }): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!address.city || address.city.trim().length < 2) {
      errors.push('City is required and must be at least 2 characters');
    }

    if (!address.country || address.country.length !== 2) {
      errors.push('Country code is required and must be 2 characters');
    }

    if (!address.addressLine || address.addressLine.trim().length < 5) {
      errors.push('Address line is required and must be at least 5 characters');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Calculate total weight for cart items
  calculateTotalWeight(items: Array<{ weight?: number; quantity: number }>): number {
    return items.reduce((total, item) => {
      const itemWeight = item.weight || 0.5; // Default weight 0.5kg if not specified
      return total + (itemWeight * item.quantity);
    }, 0);
  }

  // Format AWB for display
  formatAWB(awb: string): string {
    if (!awb) return '';
    // Add spacing for better readability
    return awb.replace(/(\d{4})(\d{4})(\d{4})/g, '$1 $2 $3');
  }

  // Get shipping status text in Arabic/English
  getShippingStatusText(status: string, language: 'ar' | 'en' = 'en'): string {
    const statusTexts = {
      pending: { en: 'Pending', ar: 'في الانتظار' },
      created: { en: 'Created', ar: 'تم الإنشاء' },
      picked_up: { en: 'Picked Up', ar: 'تم الاستلام' },
      in_transit: { en: 'In Transit', ar: 'في الطريق' },
      delivered: { en: 'Delivered', ar: 'تم التسليم' },
      failed: { en: 'Failed', ar: 'فشل' },
    };

    return statusTexts[status as keyof typeof statusTexts]?.[language] || status;
  }
}

export const aramexService = new AramexService();