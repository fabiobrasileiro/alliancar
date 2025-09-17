import axios from 'axios';
import qs from 'qs';

const suitpayApi = axios.create({
  baseURL: process.env.SUITPAY_BASE_URL,
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Authorization': `Bearer ${process.env.SUITPAY_API_KEY}`
  }
});

export class SuitPayService {
  static async createPayment(paymentData) {
    try {
      const data = qs.stringify({
        merchant_id: process.env.SUITPAY_MERCHANT_ID,
        amount: paymentData.amount,
        order_id: paymentData.orderId,
        customer_email: paymentData.customerEmail,
        customer_name: paymentData.customerName,
        customer_document: paymentData.customerDocument,
        payment_method: paymentData.paymentMethod || 'pix',
        callback_url: `${process.env.SUITPAY_BASE_URL}/webhook`,
        return_url: process.env.NEXT_PUBLIC_SUITPAY_RETURN_URL,
        ...paymentData
      });

      const response = await suitpayApi.post('/v1/payments', data);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar pagamento:', error);
      throw error;
    }
  }

  static async getPaymentStatus(paymentId) {
    try {
      const response = await suitpayApi.get(`/v1/payments/${paymentId}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar status do pagamento:', error);
      throw error;
    }
  }
}