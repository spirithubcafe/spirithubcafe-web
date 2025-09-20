import { useState, useEffect } from 'react';
import { doc, getDoc, collection, addDoc, updateDoc, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { aramexService } from '@/services/aramex';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { calculateTotalCartWeight, getShippingWeight, validateWeightForShipping } from '@/utils/weight-calculator';
import { isValidAramexDestination } from '@/data/aramex-countries';
import type { 
  AramexSettings, 
  ShippingRateRequest,
  CreateShipmentRequest,
  AramexShipment 
} from '@/types/aramex';
import type { CartItem, Product } from '@/lib/firebase';

export const useAramexShipping = () => {
  const { t } = useTranslation();
  const [settings, setSettings] = useState<AramexSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);

  // Load Aramex settings
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settingsDoc = await getDoc(doc(db, 'settings', 'aramex'));
      if (settingsDoc.exists()) {
        setSettings(settingsDoc.data() as AramexSettings);
      }
    } catch (error) {
      console.error('Error loading Aramex settings:', error);
    } finally {
      setLoading(false);
    }
  };

  // Check if Aramex is available for shipping
  const isAvailable = (): boolean => {
    return !!(settings?.enabled && 
             settings?.accountNumber && 
             settings?.username && 
             settings?.password &&
             settings?.senderInfo?.city &&
             settings?.senderInfo?.countryCode);
  };

  // Calculate shipping rate with validation
  const calculateShippingRate = async (
    cartItems: CartItem[],
    products: Product[],
    destination: {
      city: string;
      country: string;
    }
  ): Promise<{ success: boolean; rate?: number; currency?: string; error?: string }> => {
    if (!isAvailable()) {
      return { success: false, error: t('aramex.errors.serviceNotAvailable') || 'Aramex service is not available' };
    }

    // Validate destination
    if (!isValidAramexDestination(destination.country, destination.city)) {
      return { 
        success: false, 
        error: t('checkout.validation.invalidDestination') || 'Invalid destination for Aramex delivery' 
      };
    }

    setCalculating(true);

    try {
      // Calculate total weight using weight calculator
      const totalWeight = calculateTotalCartWeight(cartItems, products);
      
      // Validate weight for shipping
      const weightValidation = validateWeightForShipping(totalWeight);
      if (!weightValidation.isValid) {
        return { success: false, error: weightValidation.error };
      }

      // Get shipping weight (with minimum requirements)
      const shippingWeight = getShippingWeight(totalWeight);

      const request: ShippingRateRequest = {
        originCity: settings?.senderInfo?.city || 'Muscat',
        originCountry: settings?.senderInfo?.countryCode || 'OM',
        destCity: destination.city,
        destCountry: destination.country,
        weight: shippingWeight,
      };

      const result = await aramexService.calculateShippingRate(request);
      return result;
    } catch (error) {
      console.error('Error calculating Aramex shipping rate:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to calculate shipping rate'
      };
    } finally {
      setCalculating(false);
    }
  };

  // Create shipment for order
  const createShipment = async (
    orderId: string,
    customerInfo: {
      name: string;
      phone: string;
      email: string;
      address: string;
      city: string;
      country: string;
    },
    cartItems: CartItem[],
    products: Product[]
  ): Promise<{ success: boolean; awb?: string; error?: string }> => {
    if (!isAvailable()) {
      return { success: false, error: t('aramex.errors.serviceNotAvailable') || 'Aramex service is not available' };
    }

    // Validate destination
    if (!isValidAramexDestination(customerInfo.country, customerInfo.city)) {
      return { 
        success: false, 
        error: t('checkout.validation.invalidDestination') || 'Invalid destination for Aramex delivery' 
      };
    }

    try {
      // Calculate total weight using weight calculator
      const totalWeight = calculateTotalCartWeight(cartItems, products);
      
      // Validate weight for shipping
      const weightValidation = validateWeightForShipping(totalWeight);
      if (!weightValidation.isValid) {
        return { success: false, error: weightValidation.error };
      }

      // Get shipping weight (with minimum requirements)
      const shippingWeight = getShippingWeight(totalWeight);

      // Create description of goods
      const description = cartItems
        .map(item => {
          const product = products.find(p => p.id === item.product_id);
          const productName = product?.name || 'Coffee Product';
          return `${productName} x${item.quantity}`;
        })
        .join(', ')
        .substring(0, 100); // Limit length

      const request: CreateShipmentRequest = {
        orderId,
        weight: shippingWeight,
        originCity: settings?.senderInfo?.city || 'Muscat',
        originCountry: settings?.senderInfo?.countryCode || 'OM',
        customerName: customerInfo.name,
        customerPhone: customerInfo.phone,
        customerEmail: customerInfo.email,
        customerAddressLine: customerInfo.address,
        customerCity: customerInfo.city,
        customerCountry: customerInfo.country,
        descriptionOfGoods: description,
      };

      const result = await aramexService.createShipment(request);

      if (result.success && result.awb) {
        // Save shipment info to database
        await addDoc(collection(db, 'aramex_shipments'), {
          id: crypto.randomUUID(),
          orderId,
          awb: result.awb,
          status: 'created',
          customerName: customerInfo.name,
          customerAddress: `${customerInfo.address}, ${customerInfo.city}, ${customerInfo.country}`,
          weight: totalWeight,
          createdAt: new Date(),
          updatedAt: new Date(),
          labelURL: result.labelURL,
        });

        // Update order with AWB
        await updateDoc(doc(db, 'orders', orderId), {
          aramexAWB: result.awb,
          shippingStatus: 'created',
          updatedAt: new Date(),
        });

        toast.success(t('aramex.messages.shipmentCreated', { awb: result.awb }) || `Aramex shipment created: ${result.awb}`);
      }

      return result;
    } catch (error) {
      console.error('Error creating Aramex shipment:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create shipment'
      };
    }
  };

  // Get shipping label
  const getShippingLabel = async (awb: string): Promise<{ success: boolean; label?: string; error?: string }> => {
    try {
      const result = await aramexService.getShippingLabel({ awb });
      return result;
    } catch (error) {
      console.error('Error getting Aramex label:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get shipping label'
      };
    }
  };

  // Schedule pickup
  const schedulePickup = async (awb: string, weight: number): Promise<{ success: boolean; pickupReference?: string; error?: string }> => {
    try {
      const result = await aramexService.schedulePickup({ awb, weight });
      
      if (result.success) {
        // Update shipment status
        const shipmentsQuery = query(
          collection(db, 'aramex_shipments'),
          where('awb', '==', awb)
        );
        const shipments = await getDocs(shipmentsQuery);
        
        if (!shipments.empty) {
          const shipmentDoc = shipments.docs[0];
          await updateDoc(shipmentDoc.ref, {
            status: 'pickup_scheduled',
            pickupReference: result.pickupReference,
            updatedAt: new Date(),
          });
        }

        toast.success(t('aramex.messages.pickupScheduled') || 'Pickup scheduled successfully');
      }

      return result;
    } catch (error) {
      console.error('Error scheduling Aramex pickup:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to schedule pickup'
      };
    }
  };

  // Get shipments for orders
  const getShipments = async (orderId?: string): Promise<AramexShipment[]> => {
    try {
      let shipmentsQuery;
      
      if (orderId) {
        shipmentsQuery = query(
          collection(db, 'aramex_shipments'),
          where('orderId', '==', orderId),
          orderBy('createdAt', 'desc')
        );
      } else {
        shipmentsQuery = query(
          collection(db, 'aramex_shipments'),
          orderBy('createdAt', 'desc')
        );
      }

      const snapshots = await getDocs(shipmentsQuery);
      return snapshots.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as AramexShipment[];
    } catch (error) {
      console.error('Error getting Aramex shipments:', error);
      return [];
    }
  };

  // Download/view label
  const downloadLabel = async (awb: string) => {
    try {
      const result = await getShippingLabel(awb);
      if (result.success && result.label) {
        aramexService.downloadLabelPDF(result.label, `aramex-label-${awb}.pdf`);
      } else {
        toast.error(result.error || t('aramex.errors.gettingLabel') || 'Error getting label');
      }
    } catch (error) {
      console.error('Error downloading label:', error);
      toast.error(t('aramex.errors.downloadingLabel') || 'Error downloading label');
    }
  };

  const viewLabel = async (awb: string) => {
    try {
      const result = await getShippingLabel(awb);
      if (result.success && result.label) {
        aramexService.viewLabelPDF(result.label);
      } else {
        toast.error(result.error || t('aramex.errors.viewingLabel') || 'Error viewing label');
      }
    } catch (error) {
      console.error('Error viewing label:', error);
      toast.error(t('aramex.errors.viewingLabel') || 'Error viewing label');
    }
  };

  return {
    settings,
    loading,
    calculating,
    isAvailable,
    calculateShippingRate,
    createShipment,
    getShippingLabel,
    schedulePickup,
    getShipments,
    downloadLabel,
    viewLabel,
    refreshSettings: loadSettings,
  };
};