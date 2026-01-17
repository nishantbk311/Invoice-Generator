
export interface LineItem {
  id: string;
  name: string;
  description: string;
  price: number;
  qty: number;
}

export interface AddressInfo {
  name: string;
  address: string;
  cityStateZip: string;
  email: string;
}

export interface InvoiceData {
  invoiceNo: string;
  date: string;
  logo?: string;
  companyName: string;
  client: AddressInfo;
  payor: AddressInfo;
  items: LineItem[];
  paymentMethod: string;
  taxRate: number;
  terms: string[];
}
