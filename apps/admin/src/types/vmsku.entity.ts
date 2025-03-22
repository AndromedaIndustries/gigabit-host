export interface VmSku {
  id: string;
  name: string;
  description: string;
  price: string;
  features: [number, string][];
  popular: boolean;
  available: boolean;
  quantity: number;
}
