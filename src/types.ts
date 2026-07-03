export interface SenderProfile {
  id: number;
  businessName: string;
  address: string;
  phone: string;
  logo?: string; // base64
}

export interface LabelField {
  name: string;
  phone: string;
  address: string;
}

export interface LabelRecord {
  id?: number;
  recipient: LabelField;
  productDetails: string;
  timestamp: number;
  orderId?: string;
  courierPartner?: string;
}
