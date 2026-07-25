export interface LineItem {
  id?: string;
  name: string;
  amount: number;
}

export interface Confidence {
  merchant?: number;
  date?: number;
  total?: number;
  subtotal?: number;
  tax?: number;
  tip?: number;
  discount?: number;
  currency?: number;
  lineItems?: number;
}

export interface ParsedReceipt {
  merchant: string | null;
  date: string | null;
  currency: string | null;
  subtotal: number | null;
  tax: number | null;
  tip: number | null;
  discount: number | null;
  total: number | null;
  lineItems: LineItem[];
  confidence: Confidence;
}

export interface Receipt {
  id: string;
  merchant: string | null;
  date: string | null;
  currency: string | null;
  subtotal: number | null;
  tax: number | null;
  tip: number | null;
  discount: number | null;
  total: number | null;
  lineItems: LineItem[];
  createdAt: string;
  updatedAt: string;
}

export interface ReceiptFormData {
  merchant: string;
  date: string;
  currency: string;
  subtotal: string;
  tax: string;
  tip: string;
  discount: string;
  total: string;
  lineItems: { name: string; amount: string }[];
}
