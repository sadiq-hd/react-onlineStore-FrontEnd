// src/types/dashboard.ts

export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  images: string[];
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: number;
  name: string;
  purchases: number;
  totalSpent: number;
  lastPurchase?: string;
  email?: string;
  phone?: string;
}

export interface TopProduct {
  name: string;
  sales: number;
  revenue?: number;
}

export interface SalesData {
  name?: string; // اجعلها اختيارية
  date: string;
  sales: number;
  revenue: number;
  subTotal: number;
  vat: number;
  deliveryFees: number;
}

export interface DashboardCalculations {
  totalProducts: number;
  totalStock: number;
  totalValue: number;
  activeCustomers: number;
}

export interface ProfitCalculations {
  totalProfit: number;
  netProfit: number;
  grossMargin?: number;
  profitMargin?: number;
}

export interface StockStatus {
  class: string;
  text: string;
}

export interface DashboardStats {
  daily: SalesData[];
  weekly: SalesData[];
  monthly: SalesData[];
  yearly: SalesData[];
}