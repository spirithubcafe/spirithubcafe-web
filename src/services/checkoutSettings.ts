import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore/lite'
import { db } from '../lib/firebase'

const safeFirestoreOperation = async (operation: () => Promise<any>, defaultValue: any = null, operationName: string = 'operation') => {
  try {
    return await operation()
  } catch (error) {
    console.error(`❌ Firestore operation failed (${operationName}):`, error)
    return defaultValue
  }
}

export const checkoutSettingsService = {
  // Get checkout settings
  get: async () => {
    return await safeFirestoreOperation(
      async () => {
        const settingsDoc = await getDoc(doc(db, 'settings', 'checkout'))
        if (settingsDoc.exists()) {
          return {
            id: settingsDoc.id,
            ...settingsDoc.data(),
            created_at: settingsDoc.data().created_at?.toDate() || new Date(),
            updated_at: settingsDoc.data().updated_at?.toDate() || new Date()
          }
        }
        
        // Return default settings if none exist
        return {
          tax_rate: 0.1, // 10% tax
          enabled_countries: ['OM', 'AE', 'SA', 'KW', 'IQ'],
          shipping_methods: [
            {
              id: 'pickup',
              name: 'Pickup from our Cafe',
              name_ar: 'الاستلام من المقهى',
              enabled: true,
              is_free: true,
              pricing_type: 'flat',
              base_cost_omr: 0,
              base_cost_usd: 0,
              base_cost_sar: 0,
              estimated_delivery_days: 'Same day',
              description: 'Free pickup from our cafe',
              description_ar: 'استلام مجاني من المقهى'
            },
            {
              id: 'nool_oman',
              name: 'NOOL OMAN',
              name_ar: 'نول عمان',
              enabled: true,
              is_free: false,
              pricing_type: 'flat',
              base_cost_omr: 2,
              base_cost_usd: 5.2,
              base_cost_sar: 19.5,
              estimated_delivery_days: '1-2 days',
              description: 'Fast delivery within Oman',
              description_ar: 'توصيل سريع داخل عمان',
              api_settings: {
                provider: 'nool_oman',
                api_url: 'https://api.nool.om',
                account_number: '71925275'
              }
            }
          ],
          payment_gateway: {
            provider: 'stripe',
            enabled: true,
            test_mode: false,
            merchant_id: '224',
            access_code: 'AVDP00LA16BE47PDEB',
            working_key: '841FEAE32609C3E892C4D0B1393A7ACC',
            supported_currencies: ['OMR', 'USD', 'SAR'],
            additional_settings: {
              return_url: 'https://spirithubcafe.com/checkout/success',
              cancel_url: 'https://spirithubcafe.com/checkout/cancel',
              webhook_url: 'https://spirithubcafe.com/api/payment/webhook'
            }
          },
          created_at: new Date(),
          updated_at: new Date()
        }
      },
      null,
      'getCheckoutSettings'
    )
  },

  // Update checkout settings
  update: async (settingsData: any) => {
    return await safeFirestoreOperation(
      async () => {
        const settingsRef = doc(db, 'settings', 'checkout')
        
        // Check if document exists first
        const docSnapshot = await getDoc(settingsRef)
        
        if (docSnapshot.exists()) {
          // Document exists, update it
          await updateDoc(settingsRef, {
            ...settingsData,
            updated_at: serverTimestamp()
          })
        } else {
          // Document doesn't exist, create it
          await setDoc(settingsRef, {
            ...settingsData,
            created_at: serverTimestamp(),
            updated_at: serverTimestamp()
          })
        }
        
        console.log('✅ Checkout settings updated successfully')
        return true
      },
      false,
      'updateCheckoutSettings'
    )
  },

  // Initialize default checkout settings
  initialize: async () => {
    return await safeFirestoreOperation(
      async () => {
        const settingsDoc = await getDoc(doc(db, 'settings', 'checkout'))
        
        if (!settingsDoc.exists()) {
          const defaultSettings = {
            tax_rate: 0.1, // 10% tax
            enabled_countries: ['OM', 'AE', 'SA', 'KW', 'IQ'],
            shipping_methods: [
              {
                id: 'pickup',
                name: 'Pickup from our Cafe',
                name_ar: 'الاستلام من المقهى',
                enabled: true,
                is_free: true,
                pricing_type: 'flat',
                base_cost_omr: 0,
                base_cost_usd: 0,
                base_cost_sar: 0,
                estimated_delivery_days: 'Same day',
                description: 'Free pickup from our cafe',
                description_ar: 'استلام مجاني من المقهى'
              },
              {
                id: 'nool_oman',
                name: 'NOOL OMAN',
                name_ar: 'نول عمان',
                enabled: true,
                is_free: false,
                pricing_type: 'flat',
                base_cost_omr: 2,
                base_cost_usd: 5.2,
                base_cost_sar: 19.5,
                estimated_delivery_days: '1-2 days',
                description: 'Fast delivery within Oman',
                description_ar: 'توصيل سريع داخل عمان',
                api_settings: {
                  provider: 'nool_oman',
                  api_url: 'https://api.nool.om',
                  account_number: '71925275'
                }
              }
            ],
            created_at: serverTimestamp(),
            updated_at: serverTimestamp()
          }
          
          await setDoc(doc(db, 'settings', 'checkout'), defaultSettings)
          console.log('✅ Default checkout settings initialized')
        }
        return true
      },
      false,
      'initializeCheckoutSettings'
    )
  }
}
