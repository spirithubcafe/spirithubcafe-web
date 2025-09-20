// Aramex API Types
export interface AramexCredentials {
  username: string
  password: string
  accountNumber: string
  accountPin: string
  accountEntity: string
  accountCountryCode: string
  apiVersion: string
  source: string
}

// SOAP/WSDL Rate Calculator Types
export interface AramexClientInfo {
  UserName: string
  Password: string
  Version: string
  AccountNumber: string
  AccountPin: string
  AccountEntity: string
  AccountCountryCode: string
}

export interface AramexTransaction {
  Reference1: string
  Reference2?: string
  Reference3?: string
  Reference4?: string
  Reference5?: string
}

export interface AramexAddress {
  Line1: string
  Line2?: string
  Line3?: string
  City: string
  StateOrProvinceCode?: string
  PostCode: string
  CountryCode: string
}

export interface AramexDimensions {
  Length: number
  Width: number
  Height: number
  Unit: string
}

export interface AramexWeight {
  Unit: string
  Value: number
}

export interface AramexMoney {
  CurrencyCode: string
  Value: number
}

export interface AramexShipmentItem {
  PackageType: string
  Quantity: number
  Weight: AramexWeight
  Comments?: string
  Reference?: string
}

export interface AramexShipmentDetails {
  Dimensions: AramexDimensions
  ActualWeight: AramexWeight
  ChargeableWeight: AramexWeight
  DescriptionOfGoods: string
  GoodsOriginCountry: string
  NumberOfPieces: number
  ProductGroup: string
  ProductType: string
  PaymentType: string
  PaymentOptions: string
  CustomsValueAmount?: AramexMoney
  CashOnDeliveryAmount?: AramexMoney
  InsuranceAmount?: AramexMoney
  CashAdditionalAmount?: AramexMoney
  CollectAmount?: AramexMoney
  Services?: string
  Items?: AramexShipmentItem[]
}

export interface AramexRateCalculatorRequest {
  ClientInfo: AramexClientInfo
  Transaction: AramexTransaction
  OriginAddress: AramexAddress
  DestinationAddress: AramexAddress
  ShipmentDetails: AramexShipmentDetails
}

export interface AramexNotification {
  Code: string
  Message: string
}

export interface AramexRateCalculatorResponse {
  Transaction: AramexTransaction
  Notifications: AramexNotification[]
  HasErrors: boolean
  TotalAmount: AramexMoney
}

export interface AramexShipperInfo {
  companyName: string
  contactName: string
  phoneNumber: string
  addressLine1: string
  addressLine2?: string
  city: string
  stateProvince: string
  postalCode: string
  countryCode: string
}

export interface AramexService {
  id: string
  name: string
  customLabel: string
  type: 'domestic' | 'international'
  enabled: boolean
}

export interface AramexSettings {
  credentials: AramexCredentials
  shipperInfo: AramexShipperInfo
  services: AramexService[]
  autoCreateShipment: boolean
  enabled: boolean
  testMode?: boolean
  enableLogging?: boolean
}

export interface AramexRateRequest {
  originAddress: {
    line1: string
    city: string
    stateOrProvinceCode: string
    postalCode: string
    countryCode: string
  }
  destinationAddress: {
    line1: string
    city: string
    stateOrProvinceCode: string
    postalCode: string
    countryCode: string
  }
  shipmentDetails: {
    dimensions: {
      length: number
      width: number
      height: number
      unit: 'CM' | 'IN'
    }
    actualWeight: {
      value: number
      unit: 'KG' | 'LB'
    }
    productGroup: string
    productType: string
    paymentType: string
    paymentOptions: string
    services: string
    descriptionOfGoods: string
    goodsOriginCountry: string
  }
}

export interface AramexRateResponse {
  hasErrors: boolean
  notifications: any[]
  totalAmount: {
    currencyCode: string
    value: number
  }
  services: {
    serviceType: string
    serviceName: string
    amount: {
      currencyCode: string
      value: number
    }
  }[]
}

export interface AramexShipmentRequest {
  shipments: {
    shipper: {
      reference1: string
      reference2?: string
      accountNumber: string
      partyAddress: {
        line1: string
        line2?: string
        line3?: string
        city: string
        stateOrProvinceCode: string
        postalCode: string
        countryCode: string
      }
      contact: {
        department: string
        personName: string
        title: string
        companyName: string
        phoneNumber1: string
        phoneNumber1Ext?: string
        phoneNumber2?: string
        phoneNumber2Ext?: string
        faxNumber?: string
        cellPhone: string
        emailAddress: string
        type: string
      }
    }
    consignee: {
      reference1: string
      reference2?: string
      accountNumber: string
      partyAddress: {
        line1: string
        line2?: string
        line3?: string
        city: string
        stateOrProvinceCode: string
        postalCode: string
        countryCode: string
      }
      contact: {
        department: string
        personName: string
        title: string
        companyName: string
        phoneNumber1: string
        phoneNumber1Ext?: string
        phoneNumber2?: string
        phoneNumber2Ext?: string
        faxNumber?: string
        cellPhone: string
        emailAddress: string
        type: string
      }
    }
    thirdParty?: any
    reference1: string
    reference2?: string
    reference3?: string
    foreignHAWB?: string
    transportType: number
    shippingDateTime: string
    dueDate: string
    pickupLocation?: string
    pickupGUID?: string
    comments?: string
    accountingInstrcutions?: string
    operationsInstructions?: string
    details: {
      dimensions: {
        length: number
        width: number
        height: number
        unit: string
      }
      actualWeight: {
        value: number
        unit: string
      }
      chargeableWeight?: {
        value: number
        unit: string
      }
      descriptionOfGoods: string
      goodsOriginCountry: string
      numberOfPieces: number
      productGroup: string
      productType: string
      paymentType: string
      paymentOptions: string
      customsValueAmount?: {
        currencyCode: string
        value: number
      }
      customsValueCurrency?: string
      items?: any[]
    }
    services: string
  }[]
  labelInfo?: {
    reportID: number
    reportType: string
  }
}

export interface AramexShipmentResponse {
  hasErrors: boolean
  notifications: any[]
  shipments: {
    id: string
    reference1: string
    reference2?: string
    reference3?: string
    foreignHAWB?: string
    hasErrors: boolean
    notifications: any[]
    awbNumber?: string
    shipmentLabel?: {
      labelURL: string
      labelFileContents: string
    }
  }[]
}

export interface AramexTrackingRequest {
  shipments: string[]
  getLastTrackingUpdateOnly: boolean
}

export interface AramexTrackingResponse {
  hasErrors: boolean
  notifications: any[]
  shipmentTrackingResults: {
    waybillNumber: string
    updateCode: string
    updateDescription: string
    updateDateTime: string
    updateLocation: string
    comments: string
    problemCode: string
    grossWeight: string
    chargeableWeight: string
    weightUnit: string
  }[]
}
