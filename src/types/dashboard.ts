export interface Product {
    id: number;
    category: string;
    name: string;
    price: number;
    stock: number;
    images: string[];
    description: string;
  }
  
  export interface Customer {
    id: number;
    name: string;
    purchases: number;
    totalSpent: number;
  }
  
  export interface TopProduct {
    name: string;
    sales: number;
  }
  
  export interface SalesData {
    name: string;
    sales: number;
  }