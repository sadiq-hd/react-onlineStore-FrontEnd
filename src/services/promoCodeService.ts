import api from '../config/axios';
import { PromoCode, PromoCodeValidationResult } from '../types/promoCode';

class PromoCodeService {
  private readonly baseUrl = 'https://localhost:5000/api/PromoCodes';

  async getAllPromoCodes(): Promise<PromoCode[]> {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get<PromoCode[]>(this.baseUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching promo codes:', error);
      throw error;
    }
  }

  async getPromoCode(id: number): Promise<PromoCode> {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get<PromoCode>(`${this.baseUrl}/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching promo code ${id}:`, error);
      throw error;
    }
  }

  async createPromoCode(promoCode: PromoCode): Promise<PromoCode> {
    try {
      const token = localStorage.getItem('token');
      const response = await api.post<PromoCode>(this.baseUrl, promoCode, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error creating promo code:', error);
      throw error;
    }
  }

  async updatePromoCode(id: number, promoCode: PromoCode): Promise<PromoCode> {
    try {
      const token = localStorage.getItem('token');
      const response = await api.put<PromoCode>(`${this.baseUrl}/${id}`, promoCode, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating promo code ${id}:`, error);
      throw error;
    }
  }

  async deletePromoCode(id: number): Promise<void> {
    try {
      const token = localStorage.getItem('token');
      await api.delete(`${this.baseUrl}/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error(`Error deleting promo code ${id}:`, error);
      throw error;
    }
  }

  async validatePromoCode(code: string, orderTotal: number): Promise<PromoCodeValidationResult> {
    try {
      const token = localStorage.getItem('token');
      const response = await api.post<PromoCodeValidationResult>(
        `${this.baseUrl}/validate`,
        { code, orderTotal },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error validating promo code:', error);
      throw error;
    }
  }
}

export const promoCodeService = new PromoCodeService();