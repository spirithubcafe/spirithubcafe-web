// Types for Aramex shipping service integration

export interface AramexClientInfo {
  username: string;
  password: string;
  version: string;
  accountNumber: string;
  accountPin: string;
  accountEntity: string;
  accountCountryCode: string;
}

export interface AramexSettings {
  enabled: boolean;
  environment: 'test' | 'production';
  accountNumber: string;
  accountPin: string;
  accountEntity: string;
  accountCountryCode: string;
  username: string;
  password: string;
  senderInfo: {
    companyName: string;
    contactPerson: string;
    addressLine: string;
    city: string;
    countryCode: string;
    phoneNumber: string;
    emailAddress: string;
  };
  pickupInfo: {
    readyTime: string;
    lastPickupTime: string;
    closingTime: string;
  };
}

export interface ShippingRateRequest {
  originCity: string;
  originCountry: string;
  destCity: string;
  destCountry: string;
  weight: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
}

export interface ShippingRateResponse {
  success: boolean;
  rate?: number;
  currency?: string;
  error?: string;
}

export interface CreateShipmentRequest {
  orderId: string;
  weight: number;
  originCity: string;
  originCountry: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerAddressLine: string;
  customerCity: string;
  customerCountry: string;
  descriptionOfGoods: string;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
}

export interface CreateShipmentResponse {
  success: boolean;
  awb?: string;
  labelURL?: string;
  error?: string;
}

export interface GetLabelRequest {
  awb: string;
}

export interface GetLabelResponse {
  success: boolean;
  label?: string;
  error?: string;
}

export interface SchedulePickupRequest {
  awb: string;
  weight: number;
  pickupCity?: string;
  pickupCountry?: string;
  pickupDate?: string;
}

export interface SchedulePickupResponse {
  success: boolean;
  pickupReference?: string;
  error?: string;
}

export interface AramexPartyAddress {
  Line1: string;
  City: string;
  CountryCode: string;
}

export interface AramexContact {
  PersonName: string;
  CompanyName?: string;
  PhoneNumber1: string;
  CellPhone?: string;
  EmailAddress: string;
}

export interface AramexShipmentDetails {
  Dimensions: {
    Length: number;
    Width: number;
    Height: number;
    Unit: string;
  };
  ActualWeight: {
    Value: number;
    Unit: string;
  };
  ProductGroup: string;
  ProductType: string;
  PaymentType: string;
  PaymentOptions: string;
  NumberOfPieces: number;
  DescriptionOfGoods: string;
  GoodsOriginCountry: string;
}

export interface AramexShipment {
  Reference1: string;
  Shipper: {
    Reference1: string;
    PartyAddress: AramexPartyAddress;
    Contact: AramexContact;
  };
  Consignee: {
    Reference1: string;
    PartyAddress: AramexPartyAddress;
    Contact: AramexContact;
  };
  ShippingDateTime: string;
  Details: AramexShipmentDetails;
}

export interface AramexPickup {
  PickupAddress: AramexPartyAddress;
  PickupContact: AramexContact;
  ReadyTime: string;
  LastPickupTime: string;
  ClosingTime: string;
  PickupDate: string;
  PackageCount: number;
  Weight: {
    Value: number;
    Unit: string;
  };
  Comments: string;
  Reference1: string;
}